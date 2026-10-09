import auditService from './audit.service.js';

/**
 * Handle GET /api/v1/audit/events (admin only)
 */
export async function listAuditEventsHandler(req, res, next) {
  try {
    const filters = {
      action: req.query.action,
      resourceType: req.query.resourceType,
      actorUserId: req.query.actorUserId,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await auditService.listAuditEvents(filters);

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

export default {
  listAuditEventsHandler,
};
