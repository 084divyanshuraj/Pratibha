import { Intervention } from '../models/Intervention.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * List interventions with pagination and filters
 *
 * @param {Object} params
 * @param {Object} params.user - Current authenticated user
 * @param {string} [params.studentId]
 * @param {string} [params.status]
 * @param {string} [params.interventionType]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @returns {Promise<Object>}
 */
export async function listInterventions({
  user,
  studentId,
  status,
  interventionType,
  page = 1,
  limit = 20,
}) {
  const query = {};

  // Object-level student scope restriction
  if (user?.role === 'student') {
    query.studentId = user.studentId;
  } else if (studentId && typeof studentId === 'string' && studentId.trim()) {
    query.studentId = studentId.trim().toUpperCase();
  }

  if (status && typeof status === 'string' && status.trim()) {
    query.status = status.trim().toLowerCase();
  }

  if (interventionType && typeof interventionType === 'string' && interventionType.trim()) {
    query.interventionType = interventionType.trim().toLowerCase();
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, interventions] = await Promise.all([
    Intervention.countDocuments(query),
    Intervention.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  return {
    interventions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Get intervention by interventionId
 *
 * @param {string} interventionId
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function getInterventionById(interventionId, user) {
  if (!interventionId || typeof interventionId !== 'string') {
    throw new AppError('interventionId is required.', 400, 'VALIDATION_ERROR');
  }

  const intervention = await Intervention.findOne({
    interventionId: interventionId.trim(),
  }).lean();

  if (!intervention) {
    throw new AppError(`Intervention '${interventionId}' not found.`, 404, 'NOT_FOUND');
  }

  // Object-level student authorization gate
  if (user?.role === 'student' && intervention.studentId !== user.studentId) {
    throw new AppError(
      'Forbidden: You are not authorized to view another student intervention.',
      403,
      'FORBIDDEN'
    );
  }

  return intervention;
}

/**
 * Update intervention status and participation progress
 *
 * @param {string} interventionId
 * @param {Object} updateData
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function updateInterventionStatus(interventionId, updateData = {}, user) {
  if (!interventionId || typeof interventionId !== 'string') {
    throw new AppError('interventionId is required.', 400, 'VALIDATION_ERROR');
  }

  const intervention = await Intervention.findOne({
    interventionId: interventionId.trim(),
  });

  if (!intervention) {
    throw new AppError(`Intervention '${interventionId}' not found.`, 404, 'NOT_FOUND');
  }

  if (updateData.status) {
    const validStatuses = ['planned', 'assigned', 'in_progress', 'completed', 'cancelled'];
    const newStatus = updateData.status.trim().toLowerCase();
    if (!validStatuses.includes(newStatus)) {
      throw new AppError(
        `Invalid status '${newStatus}'. Allowed: ${validStatuses.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }
    intervention.status = newStatus;
  }

  if (updateData.notes !== undefined) {
    intervention.notes = updateData.notes;
  }

  if (updateData.participation && typeof updateData.participation === 'object') {
    if (updateData.participation.attendanceCount != null) {
      intervention.participation.attendanceCount = Math.max(
        0,
        Number(updateData.participation.attendanceCount)
      );
    }
    if (updateData.participation.completedModules != null) {
      intervention.participation.completedModules = Math.max(
        0,
        Number(updateData.participation.completedModules)
      );
    }
    intervention.participation.lastEngagedAt = new Date();
  }

  await intervention.save();
  return intervention.toObject();
}

/**
 * Record an observed outcome for an intervention
 *
 * @param {string} interventionId
 * @param {Object} outcomeData
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function recordOutcomes(interventionId, outcomeData = {}, user) {
  if (!interventionId || typeof interventionId !== 'string') {
    throw new AppError('interventionId is required.', 400, 'VALIDATION_ERROR');
  }
  if (!outcomeData.metric || typeof outcomeData.metric !== 'string') {
    throw new AppError('metric is required to record outcome.', 400, 'VALIDATION_ERROR');
  }
  if (outcomeData.value === undefined || outcomeData.value === null) {
    throw new AppError('value is required to record outcome.', 400, 'VALIDATION_ERROR');
  }

  const intervention = await Intervention.findOne({
    interventionId: interventionId.trim(),
  });

  if (!intervention) {
    throw new AppError(`Intervention '${interventionId}' not found.`, 404, 'NOT_FOUND');
  }

  const newOutcome = {
    metric: outcomeData.metric.trim(),
    value: outcomeData.value,
    observedAt: outcomeData.observedAt ? new Date(outcomeData.observedAt) : new Date(),
  };

  intervention.observedOutcomes.push(newOutcome);
  await intervention.save();

  return intervention.toObject();
}
