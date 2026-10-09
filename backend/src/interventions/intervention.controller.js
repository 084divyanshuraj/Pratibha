import {
  listInterventions,
  getInterventionById,
  updateInterventionStatus,
  recordOutcomes,
} from './intervention.service.js';
import auditService from '../audit/audit.service.js';

export async function listInterventionsHandler(req, res, next) {
  try {
    const params = {
      user: req.user,
      studentId: req.query.studentId,
      status: req.query.status,
      interventionType: req.query.interventionType,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await listInterventions(params);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInterventionByIdHandler(req, res, next) {
  try {
    const intervention = await getInterventionById(req.params.interventionId, req.user);

    res.status(200).json({
      success: true,
      data: intervention,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateInterventionStatusHandler(req, res, next) {
  try {
    const updated = await updateInterventionStatus(
      req.params.interventionId,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      data: updated,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function recordOutcomesHandler(req, res, next) {
  try {
    const updated = await recordOutcomes(
      req.params.interventionId,
      req.body,
      req.user
    );

    await auditService.logAuditEvent({
      actorUserId: req.user?.id || req.user?.email || 'SYSTEM',
      action: 'INTERVENTION_OUTCOME_RECORDED',
      resourceType: 'intervention',
      resourceId: req.params.interventionId,
      requestId: req.id,
      metadata: {
        studentId: updated.studentId,
        observedOutcomesCount: updated.observedOutcomes?.length,
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}
