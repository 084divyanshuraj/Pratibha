import { getStudentScore, recalculateStudentScore } from './score.service.js';

export async function getStudentScoreHandler(req, res, next) {
  try {
    const period = req.query.period || 'current';
    const scoreData = await getStudentScore(req.params.studentId, period);

    res.status(200).json({
      success: true,
      data: scoreData,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function recalculateStudentScoreHandler(req, res, next) {
  try {
    const period = req.body?.period || req.query.period || 'current';
    const scoreData = await recalculateStudentScore(req.params.studentId, period);

    res.status(200).json({
      success: true,
      data: scoreData,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getStudentScoreHandler,
  recalculateStudentScoreHandler,
};
