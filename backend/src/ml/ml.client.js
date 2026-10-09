import { config } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

let mockPredictHandler = null;

/**
 * Configure a mock prediction handler for testing without a running Python server.
 */
export function setMockPredictHandler(handler) {
  mockPredictHandler = handler;
}

/**
 * Reset mock prediction handler to default production behavior.
 */
export function resetMockPredictHandler() {
  mockPredictHandler = null;
}

/**
 * Validates ML inference response structure.
 */
function validateMlResponse(res) {
  if (!res || typeof res !== 'object') {
    throw new AppError('ML response must be an object.', 502, 'ML_INVALID_RESPONSE');
  }

  const allowedLevels = ['low', 'medium', 'high', 'unknown'];
  if (!allowedLevels.includes(res.riskLevel)) {
    throw new AppError(
      `ML response has invalid riskLevel "${res.riskLevel}". Must be one of: ${allowedLevels.join(', ')}`,
      502,
      'ML_INVALID_RESPONSE'
    );
  }

  if (res.probability !== undefined && res.probability !== null) {
    if (typeof res.probability !== 'number' || res.probability < 0 || res.probability > 1) {
      throw new AppError('ML probability must be a float between 0 and 1.', 502, 'ML_INVALID_RESPONSE');
    }
  }

  return {
    target: res.target,
    riskLevel: res.riskLevel,
    probability: res.probability != null ? Math.round(res.probability * 100) / 100 : null,
    modelVersion: res.modelVersion || 'v1.0',
    drivers: Array.isArray(res.drivers) ? res.drivers : [],
    limitations: Array.isArray(res.limitations) ? res.limitations : [],
  };
}

/**
 * Sends features to external ML inference service and returns standardized prediction.
 *
 * @param {Object} params
 * @param {string} params.studentId
 * @param {string} params.target - 'academic_risk' | 'placement_risk'
 * @param {Object} params.features - 17 feature dictionary
 * @param {Date} params.asOfDate
 * @returns {Promise<Object>} Standardized prediction
 */
export async function callMlInference({
  studentId,
  target,
  features,
  asOfDate = new Date(),
}) {
  try {
    // If a mock handler is registered (e.g. during test mode), invoke it directly
    if (typeof mockPredictHandler === 'function') {
      const rawResult = await mockPredictHandler({ studentId, target, features, asOfDate });
      return validateMlResponse(rawResult);
    }

    const mlUrl = config.mlService.url;
    const timeoutMs = config.mlService.timeoutMs || 5000;

    const response = await fetch(`${mlUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.mlService.token ? { Authorization: `Bearer ${config.mlService.token}` } : {}),
      },
      body: JSON.stringify({
        studentId,
        target,
        features,
        asOfDate: asOfDate.toISOString(),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        `ML inference service returned HTTP ${response.status}: ${errorText}`,
        502,
        'ML_BAD_GATEWAY'
      );
    }

    const json = await response.json();
    return validateMlResponse(json);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new AppError(
        `ML inference service timed out after ${timeoutMs}ms.`,
        504,
        'ML_SERVICE_TIMEOUT'
      );
    }

    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      throw new AppError(
        'ML inference service is currently offline or unreachable.',
        503,
        'ML_SERVICE_UNAVAILABLE'
      );
    }

    throw new AppError(`ML service integration error: ${err.message}`, 502, 'ML_BAD_GATEWAY');
  }
}

export default {
  callMlInference,
  setMockPredictHandler,
  resetMockPredictHandler,
};
