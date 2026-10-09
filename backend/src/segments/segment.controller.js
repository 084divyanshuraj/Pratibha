import {
  listSegments,
  getSegmentByKey,
  rebuildSegments,
} from './segment.service.js';

/**
 * Controller to list all student segments with summary metrics
 */
export async function listSegmentsHandler(req, res, next) {
  try {
    const includeStudents = req.query.includeStudents === 'true';
    const segments = await listSegments({ includeStudents });

    res.status(200).json({
      success: true,
      data: {
        segments,
        totalSegments: segments.length,
      },
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to get a specific student segment by key
 */
export async function getSegmentByKeyHandler(req, res, next) {
  try {
    const segment = await getSegmentByKey(req.params.segmentKey);

    res.status(200).json({
      success: true,
      data: segment,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to trigger a rebuild of student segment memberships
 */
export async function rebuildSegmentsHandler(req, res, next) {
  try {
    const options = {
      department: req.body?.department,
      semester: req.body?.semester,
      cohort: req.body?.cohort,
    };

    const result = await rebuildSegments(options);

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
