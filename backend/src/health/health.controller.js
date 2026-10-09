import { checkLiveness, checkReadiness } from './health.service.js';

/**
 * Handle GET /health/live
 * Public liveness probe indicating process is active.
 */
export function getLiveness(req, res) {
  const result = checkLiveness();
  return res.status(200).json({
    success: true,
    data: result,
    meta: {
      requestId: req.id,
    },
  });
}

/**
 * Handle GET /health/ready
 * Public readiness probe indicating required dependency availability.
 * Returns HTTP 200 when ready, HTTP 503 when required dependencies are unavailable.
 */
export async function getReadiness(req, res) {
  const result = await checkReadiness();
  const statusCode = result.ready ? 200 : 503;

  return res.status(statusCode).json({
    success: result.ready,
    data: result,
    meta: {
      requestId: req.id,
    },
  });
}
