import { generatePrediction, getLatestPredictions } from './ml.service.js';

export async function getPredictionsHandler(req, res, next) {
  try {
    const result = await getLatestPredictions(req.params.studentId);
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

export async function generatePredictionHandler(req, res, next) {
  try {
    const target = req.body?.target || req.query.target || 'academic_risk';
    const asOfDate = req.body?.asOfDate ? new Date(req.body.asOfDate) : new Date();

    const prediction = await generatePrediction(req.params.studentId, target, asOfDate);

    res.status(201).json({
      success: true,
      data: prediction,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getPredictionsHandler,
  generatePredictionHandler,
};
