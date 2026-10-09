import {
  getOverviewKpis,
  getTrends,
  getRiskSummary,
} from './analytics.service.js';

/**
 * Controller to retrieve high-level institutional KPIs and 7-category coverage
 */
export async function getOverviewKpisHandler(req, res, next) {
  try {
    const filters = {
      department: req.query.department,
      semester: req.query.semester,
      cohort: req.query.cohort,
    };

    const kpis = await getOverviewKpis(filters);

    res.status(200).json({
      success: true,
      data: kpis,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to retrieve time-series trends across semesters/periods
 */
export async function getTrendsHandler(req, res, next) {
  try {
    const filters = {
      department: req.query.department,
      semester: req.query.semester,
      cohort: req.query.cohort,
      metric: req.query.metric,
    };

    const trends = await getTrends(filters);

    res.status(200).json({
      success: true,
      data: trends,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to retrieve cohort risk summaries and decoupled divergence insights
 */
export async function getRiskSummaryHandler(req, res, next) {
  try {
    const filters = {
      department: req.query.department,
      semester: req.query.semester,
      cohort: req.query.cohort,
      target: req.query.target,
    };

    const summary = await getRiskSummary(filters);

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
