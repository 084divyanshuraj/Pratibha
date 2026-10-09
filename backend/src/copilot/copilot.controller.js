import copilotService from './copilot.service.js';

/**
 * Handle POST /api/v1/copilot/query
 */
export async function handleCopilotQuery(req, res, next) {
  try {
    const result = await copilotService.processQuery(req.body, req.user);

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
  handleCopilotQuery,
};
