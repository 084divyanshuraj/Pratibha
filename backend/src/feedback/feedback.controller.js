import feedbackService from './feedback.service.js';

/**
 * Handle POST /api/v1/feedback
 */
export async function submitFeedbackHandler(req, res, next) {
  try {
    const result = await feedbackService.submitFeedback(req.body, req.user);

    res.status(201).json({
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

/**
 * Handle GET /api/v1/feedback/summary
 */
export async function getFeedbackSummaryHandler(req, res, next) {
  try {
    const filters = {
      feedbackType: req.query.feedbackType,
      studentId: req.query.studentId,
      visibility: req.query.visibility,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const summary = await feedbackService.getFeedbackSummary(filters, req.user);

    res.status(200).json({
      success: true,
      data: summary,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle GET /api/v1/feedback
 */
export async function listFeedbackHandler(req, res, next) {
  try {
    const filters = {
      feedbackType: req.query.feedbackType,
      studentId: req.query.studentId,
      visibility: req.query.visibility,
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await feedbackService.listFeedback(filters, req.user);

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
  submitFeedbackHandler,
  getFeedbackSummaryHandler,
  listFeedbackHandler,
};
