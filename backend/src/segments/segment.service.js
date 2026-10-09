import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { StudentScore } from '../models/StudentScore.js';
import { RiskPrediction } from '../models/RiskPrediction.js';
import { StudentSegment } from '../models/StudentSegment.js';
import { SEGMENT_DEFINITIONS } from './segment.definitions.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Gather latest record snapshots for a given list of student IDs
 * across all contributing performance domains.
 *
 * @param {string[]} studentIds
 * @returns {Promise<Map<string, Object>>}
 */
async function gatherStudentSnapshots(studentIds) {
  const snapshotMap = new Map();
  for (const id of studentIds) {
    snapshotMap.set(id, {
      studentId: id,
      cgpa: null,
      academicScore: null,
      backlogs: 0,
      attendancePercentage: null,
      lmsAssignmentCompletion: null,
      lmsLoginsPerWeek: null,
      placementScore: null,
      successScore: null,
      academicRisk: null,
      placementRisk: null,
    });
  }

  if (studentIds.length === 0) {
    return snapshotMap;
  }

  // 1. Latest Academic records
  const academicAgg = await AcademicRecord.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        cgpa: { $first: '$cgpa' },
        backlog: { $first: '$backlog' },
        backlogsCount: { $first: '$backlogsCount' },
        marksObtained: { $first: '$marksObtained' },
        maxMarks: { $first: '$maxMarks' },
        overallPercentage: { $first: '$overallPercentage' },
      },
    },
  ]);
  for (const r of academicAgg) {
    const s = snapshotMap.get(r._id);
    if (s) {
      s.cgpa = r.cgpa ?? null;
      s.backlogs = r.backlogsCount ?? (r.backlog === true ? 1 : 0);
      if (r.overallPercentage != null) {
        s.academicScore = r.overallPercentage;
      } else if (r.maxMarks != null && r.maxMarks > 0 && r.marksObtained != null) {
        s.academicScore = Math.round((r.marksObtained / r.maxMarks) * 100);
      }
    }
  }

  // 2. Latest Attendance records
  const attendanceAgg = await AttendanceRecord.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        attendancePercentage: { $first: '$attendancePercentage' },
        overallPercentage: { $first: '$overallPercentage' },
        classesAttended: { $first: '$classesAttended' },
        classesHeld: { $first: '$classesHeld' },
      },
    },
  ]);
  for (const r of attendanceAgg) {
    const s = snapshotMap.get(r._id);
    if (s) {
      if (r.attendancePercentage != null) {
        s.attendancePercentage = r.attendancePercentage;
      } else if (r.overallPercentage != null) {
        s.attendancePercentage = r.overallPercentage;
      } else if (r.classesHeld != null && r.classesHeld > 0 && r.classesAttended != null) {
        s.attendancePercentage = Math.round((r.classesAttended / r.classesHeld) * 100);
      }
    }
  }

  // 3. Latest LMS Activity
  const lmsAgg = await LmsActivity.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        assignmentsCompleted: { $first: '$assignmentsCompleted' },
        assignmentsAssigned: { $first: '$assignmentsAssigned' },
        assignmentsSubmitted: { $first: '$assignmentsSubmitted' },
        assignmentsTotal: { $first: '$assignmentsTotal' },
        loginCount: { $first: '$loginCount' },
        loginsCount: { $first: '$loginsCount' },
      },
    },
  ]);
  for (const r of lmsAgg) {
    const s = snapshotMap.get(r._id);
    if (s) {
      const completed = r.assignmentsCompleted ?? r.assignmentsSubmitted;
      const assigned = r.assignmentsAssigned ?? r.assignmentsTotal;
      if (assigned != null && assigned > 0 && completed != null) {
        s.lmsAssignmentCompletion = Math.round((completed / assigned) * 100);
      }
      const logins = r.loginCount ?? r.loginsCount;
      if (logins != null) {
        s.lmsLoginsPerWeek = Math.round((logins / 4) * 10) / 10;
      }
    }
  }

  // 4. Latest Placement Assessment
  const placementAgg = await PlacementAssessment.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, assessmentDate: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        score: { $first: '$score' },
        maxScore: { $first: '$maxScore' },
        overallScore: { $first: '$overallScore' },
        aptitudeScore: { $first: '$aptitudeScore' },
      },
    },
  ]);
  for (const r of placementAgg) {
    const s = snapshotMap.get(r._id);
    if (s) {
      if (r.maxScore != null && r.maxScore > 0 && r.score != null) {
        s.placementScore = Math.round((r.score / r.maxScore) * 100);
      } else {
        s.placementScore = r.score ?? r.overallScore ?? r.aptitudeScore ?? null;
      }
    }
  }

  // 5. Latest Student Success Score
  const scoreAgg = await StudentScore.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, calculatedAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        score: { $first: '$score' },
      },
    },
  ]);
  for (const r of scoreAgg) {
    const s = snapshotMap.get(r._id);
    if (s) {
      s.successScore = r.score ?? null;
    }
  }

  // 6. Latest Risk Predictions (Decoupled targets)
  const riskAgg = await RiskPrediction.aggregate([
    { $match: { studentId: { $in: studentIds }, status: 'valid' } },
    { $sort: { studentId: 1, target: 1, predictedAt: -1 } },
    {
      $group: {
        _id: { studentId: '$studentId', target: '$target' },
        riskLevel: { $first: '$riskLevel' },
      },
    },
  ]);
  for (const r of riskAgg) {
    const s = snapshotMap.get(r._id.studentId);
    if (s) {
      if (r._id.target === 'academic_risk') {
        s.academicRisk = r.riskLevel;
      } else if (r._id.target === 'placement_risk') {
        s.placementRisk = r.riskLevel;
      }
    }
  }

  return snapshotMap;
}

/**
 * Rebuild student segment memberships against defined versioned criteria.
 *
 * @param {Object} options
 * @param {string} [options.department]
 * @param {number|string} [options.semester]
 * @param {string} [options.cohort]
 * @returns {Promise<Object>}
 */
export async function rebuildSegments(options = {}) {
  const studentQuery = { status: 'active' };
  if (options.department && typeof options.department === 'string' && options.department.trim()) {
    studentQuery.department = new RegExp(`^${options.department.trim()}$`, 'i');
  }
  if (options.semester != null && options.semester !== '') {
    const sem = Number(options.semester);
    if (!Number.isNaN(sem)) {
      studentQuery.currentSemester = sem;
    }
  }
  if (options.cohort && typeof options.cohort === 'string' && options.cohort.trim()) {
    studentQuery.cohort = options.cohort.trim();
  }

  const students = await Student.find(studentQuery, { studentId: 1, status: 1 }).lean();
  const studentIds = students.map((s) => s.studentId);
  const snapshotMap = await gatherStudentSnapshots(studentIds);

  const rebuiltSummaries = [];

  for (const def of SEGMENT_DEFINITIONS) {
    const matchedIds = [];
    let cgpaSum = 0;
    let cgpaCount = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    for (const id of studentIds) {
      const data = snapshotMap.get(id);
      if (data && def.evaluator(data)) {
        matchedIds.push(id);
        if (data.cgpa != null) {
          cgpaSum += data.cgpa;
          cgpaCount += 1;
        }
        if (data.successScore != null) {
          scoreSum += data.successScore;
          scoreCount += 1;
        }
      }
    }

    const percentage =
      students.length > 0
        ? Math.round((matchedIds.length / students.length) * 1000) / 10
        : 0;

    const avgCgpa =
      cgpaCount > 0 ? Math.round((cgpaSum / cgpaCount) * 100) / 100 : null;
    const avgScore =
      scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null;

    const indicators = {
      totalMatched: matchedIds.length,
      cohortTotal: students.length,
      percentage,
      averageCgpa: avgCgpa,
      averageSuccessScore: avgScore,
    };

    const updated = await StudentSegment.findOneAndUpdate(
      { segmentKey: def.segmentKey },
      {
        $set: {
          segmentKey: def.segmentKey,
          name: def.name,
          description: def.description,
          criteriaVersion: def.criteriaVersion,
          studentIds: matchedIds,
          indicators,
          generatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    rebuiltSummaries.push({
      segmentKey: updated.segmentKey,
      name: updated.name,
      description: updated.description,
      criteriaVersion: updated.criteriaVersion,
      studentCount: updated.studentIds.length,
      indicators: updated.indicators,
      generatedAt: updated.generatedAt,
    });
  }

  return {
    rebuiltCount: rebuiltSummaries.length,
    cohortTotal: students.length,
    generatedAt: new Date(),
    segments: rebuiltSummaries,
  };
}

/**
 * List all defined student segments with aggregate indicators.
 *
 * @param {Object} options
 * @param {boolean} [options.includeStudents=false]
 * @returns {Promise<Array>}
 */
export async function listSegments({ includeStudents = false } = {}) {
  // Check if segments are initialized in DB; if not, initialize them
  const count = await StudentSegment.countDocuments();
  if (count === 0) {
    await rebuildSegments();
  }

  const segments = await StudentSegment.find().sort({ segmentKey: 1 }).lean();

  return segments.map((seg) => {
    const item = {
      segmentKey: seg.segmentKey,
      name: seg.name,
      description: seg.description,
      criteriaVersion: seg.criteriaVersion,
      studentCount: seg.studentIds ? seg.studentIds.length : 0,
      indicators: seg.indicators,
      generatedAt: seg.generatedAt,
    };
    if (includeStudents) {
      item.studentIds = seg.studentIds || [];
    }
    return item;
  });
}

/**
 * Retrieve a specific segment definition and member list by segmentKey.
 *
 * @param {string} segmentKey
 * @returns {Promise<Object>}
 */
export async function getSegmentByKey(segmentKey) {
  if (!segmentKey || typeof segmentKey !== 'string') {
    throw new AppError('segmentKey is required.', 400, 'VALIDATION_ERROR');
  }

  const segment = await StudentSegment.findOne({ segmentKey: segmentKey.trim() }).lean();
  if (!segment) {
    throw new AppError(`Student segment '${segmentKey}' not found.`, 404, 'NOT_FOUND');
  }

  return {
    segmentKey: segment.segmentKey,
    name: segment.name,
    description: segment.description,
    criteriaVersion: segment.criteriaVersion,
    studentCount: segment.studentIds ? segment.studentIds.length : 0,
    studentIds: segment.studentIds || [],
    indicators: segment.indicators,
    generatedAt: segment.generatedAt,
  };
}
