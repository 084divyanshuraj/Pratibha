import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { StudentScore } from '../models/StudentScore.js';
import { RiskPrediction } from '../models/RiskPrediction.js';

/**
 * Build standard query filter for Student collection
 *
 * @param {Object} filters
 * @returns {Object} MongoDB query
 */
function buildStudentQuery(filters = {}) {
  const query = {};
  if (filters.department && typeof filters.department === 'string' && filters.department.trim()) {
    query.department = new RegExp(`^${filters.department.trim()}$`, 'i');
  }
  if (filters.semester != null && filters.semester !== '') {
    const sem = Number(filters.semester);
    if (!Number.isNaN(sem)) {
      query.$or = [{ semester: sem }, { currentSemester: sem }];
    }
  }
  if (filters.cohort && typeof filters.cohort === 'string' && filters.cohort.trim()) {
    query.cohort = filters.cohort.trim();
  }
  return query;
}

/**
 * Retrieve high-level institutional KPIs, decoupled risk distribution,
 * and 7-category data coverage metrics.
 *
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getOverviewKpis(filters = {}) {
  const query = buildStudentQuery(filters);
  const students = await Student.find(query, {
    studentId: 1,
    status: 1,
    department: 1,
    semester: 1,
    currentSemester: 1,
  }).lean();

  const totalStudents = students.length;

  if (totalStudents === 0) {
    return {
      filters: {
        department: filters.department || null,
        semester: filters.semester ? Number(filters.semester) : null,
        cohort: filters.cohort || null,
      },
      students: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      successScore: {
        average: null,
        median: null,
        min: null,
        max: null,
        scoredCount: 0,
        unscoredCount: 0,
        distribution: {
          critical: 0,
          moderate: 0,
          good: 0,
          excellent: 0,
        },
      },
      academicRisk: {
        low: 0,
        medium: 0,
        high: 0,
        unknown: 0,
        unassessed: 0,
      },
      placementRisk: {
        low: 0,
        medium: 0,
        high: 0,
        unknown: 0,
        unassessed: 0,
      },
      dataCoverage: {
        categories: {
          academic: { count: 0, percentage: 0 },
          attendance: { count: 0, percentage: 0 },
          lms: { count: 0, percentage: 0 },
          placement: { count: 0, percentage: 0 },
          skills: { count: 0, percentage: 0 },
          engagement: { count: 0, percentage: 0 },
          feedback: { count: 0, percentage: 0 },
        },
        overallCompletenessAverage: 0,
      },
      coverageNotes: [
        'No students found matching the specified filters.',
      ],
      totalStudents: 0,
      departmentCount: 0,
      averageSuccessScore: 0,
      scoreDistribution: { critical: 0, moderate: 0, good: 0, excellent: 0 },
      decoupledDivergence: { count: 0, percentage: 0, explanation: 'No divergence.' },
      overallCompletenessAverage: 0,
      categoryCoverage: { academic: 0, attendance: 0, lms: 0, placement: 0, skills: 0, engagement: 0, feedback: 0 },
    };
  }

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const inactiveStudents = totalStudents - activeStudents;
  const studentIds = students.map((s) => s.studentId);

  // 1. Success Scores Summary
  const latestScoresAgg = await StudentScore.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, calculatedAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        score: { $first: '$score' },
        calculatedAt: { $first: '$calculatedAt' },
      },
    },
  ]);

  const scoreMap = new Map();
  for (const item of latestScoresAgg) {
    scoreMap.set(item._id, item.score);
  }

  const scoredValues = [];
  for (const s of students) {
    if (scoreMap.has(s.studentId)) {
      scoredValues.push(scoreMap.get(s.studentId));
    }
  }

  scoredValues.sort((a, b) => a - b);
  const scoredCount = scoredValues.length;
  const unscoredCount = totalStudents - scoredCount;

  let scoreAvg = null;
  let scoreMedian = null;
  let scoreMin = null;
  let scoreMax = null;
  const distribution = { critical: 0, moderate: 0, good: 0, excellent: 0 };

  if (scoredCount > 0) {
    const sum = scoredValues.reduce((acc, v) => acc + v, 0);
    scoreAvg = Math.round((sum / scoredCount) * 10) / 10;
    scoreMin = scoredValues[0];
    scoreMax = scoredValues[scoredCount - 1];

    const mid = Math.floor(scoredCount / 2);
    scoreMedian =
      scoredCount % 2 !== 0
        ? scoredValues[mid]
        : Math.round(((scoredValues[mid - 1] + scoredValues[mid]) / 2) * 10) / 10;

    for (const val of scoredValues) {
      if (val < 60) distribution.critical += 1;
      else if (val < 75) distribution.moderate += 1;
      else if (val < 85) distribution.good += 1;
      else distribution.excellent += 1;
    }
  }

  // 2. Decoupled Risk Distributions
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

  const academicRisk = { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 };
  const placementRisk = { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 };

  let academicAssessed = 0;
  let placementAssessed = 0;

  for (const item of riskAgg) {
    const target = item._id.target;
    const level = item.riskLevel;

    if (target === 'academic_risk') {
      academicAssessed += 1;
      if (academicRisk[level] !== undefined) {
        academicRisk[level] += 1;
      } else {
        academicRisk.unknown += 1;
      }
    } else if (target === 'placement_risk') {
      placementAssessed += 1;
      if (placementRisk[level] !== undefined) {
        placementRisk[level] += 1;
      } else {
        placementRisk.unknown += 1;
      }
    }
  }

  academicRisk.unassessed = totalStudents - academicAssessed;
  placementRisk.unassessed = totalStudents - placementAssessed;

  // 3. Category Data Coverage (7 categories)
  const [
    academicStudents,
    attendanceStudents,
    lmsStudents,
    placementStudents,
    skillsStudents,
    engagementStudents,
    feedbackStudents,
  ] = await Promise.all([
    AcademicRecord.distinct('studentId', { studentId: { $in: studentIds } }),
    AttendanceRecord.distinct('studentId', { studentId: { $in: studentIds } }),
    LmsActivity.distinct('studentId', { studentId: { $in: studentIds } }),
    PlacementAssessment.distinct('studentId', { studentId: { $in: studentIds } }),
    SkillAssessment.distinct('studentId', { studentId: { $in: studentIds } }),
    EngagementRecord.distinct('studentId', { studentId: { $in: studentIds } }),
    FeedbackRecord.distinct('studentId', { studentId: { $in: studentIds } }),
  ]);

  const categories = {
    academic: {
      count: academicStudents.length,
      percentage: Math.round((academicStudents.length / totalStudents) * 1000) / 10,
    },
    attendance: {
      count: attendanceStudents.length,
      percentage: Math.round((attendanceStudents.length / totalStudents) * 1000) / 10,
    },
    lms: {
      count: lmsStudents.length,
      percentage: Math.round((lmsStudents.length / totalStudents) * 1000) / 10,
    },
    placement: {
      count: placementStudents.length,
      percentage: Math.round((placementStudents.length / totalStudents) * 1000) / 10,
    },
    skills: {
      count: skillsStudents.length,
      percentage: Math.round((skillsStudents.length / totalStudents) * 1000) / 10,
    },
    engagement: {
      count: engagementStudents.length,
      percentage: Math.round((engagementStudents.length / totalStudents) * 1000) / 10,
    },
    feedback: {
      count: feedbackStudents.length,
      percentage: Math.round((feedbackStudents.length / totalStudents) * 1000) / 10,
    },
  };

  const studentCategoryCount = new Map();
  for (const id of studentIds) studentCategoryCount.set(id, 0);
  for (const id of academicStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of attendanceStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of lmsStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of placementStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of skillsStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of engagementStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);
  for (const id of feedbackStudents) studentCategoryCount.set(id, (studentCategoryCount.get(id) || 0) + 1);

  let totalObservedPoints = 0;
  for (const count of studentCategoryCount.values()) {
    totalObservedPoints += count;
  }
  const overallCompletenessAverage =
    Math.round((totalObservedPoints / (totalStudents * 7)) * 1000) / 10;

  // 4. Coverage Notes
  const coverageNotes = [];
  for (const [catName, data] of Object.entries(categories)) {
    if (data.percentage === 0) {
      coverageNotes.push(`No ${catName} records observed. Analytics and scores operate without this pillar.`);
    } else if (data.percentage < 60) {
      coverageNotes.push(`Partial coverage in ${catName} (${data.percentage}%). Unobserved records are not coerced to zero.`);
    }
  }
  if (academicRisk.unassessed > 0) {
    coverageNotes.push(`${academicRisk.unassessed} of ${totalStudents} students are unassessed for academic risk.`);
  }
  if (placementRisk.unassessed > 0) {
    coverageNotes.push(`${placementRisk.unassessed} of ${totalStudents} students are unassessed for placement risk.`);
  }
  if (coverageNotes.length === 0) {
    coverageNotes.push('Comprehensive data coverage observed across all 7 categories and risk models.');
  }

  const uniqueDepts = new Set(students.map((s) => s.department).filter(Boolean));
  const departmentCount = uniqueDepts.size || 1;

  // Decoupled Risk Divergence (High CGPA >= 7.5 but High Placement Risk)
  const academicsAgg = await AcademicRecord.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    { $sort: { studentId: 1, observedAt: -1 } },
    {
      $group: {
        _id: '$studentId',
        cgpa: { $first: '$cgpa' },
      },
    },
  ]);
  const cgpaByStudent = new Map();
  for (const item of academicsAgg) {
    if (item.cgpa != null) cgpaByStudent.set(item._id, item.cgpa);
  }

  const placementRiskMap = new Map();
  for (const item of riskAgg) {
    if (item._id.target === 'placement_risk') {
      placementRiskMap.set(item._id.studentId, item.riskLevel);
    }
  }

  let divergenceCount = 0;
  for (const s of students) {
    const cgpa = cgpaByStudent.get(s.studentId);
    const pRisk = placementRiskMap.get(s.studentId);
    if (cgpa != null && cgpa >= 7.5 && pRisk === 'high') {
      divergenceCount += 1;
    }
  }

  const divergencePercentage =
    totalStudents > 0
      ? Math.round((divergenceCount / totalStudents) * 1000) / 10
      : 0;

  return {
    filters: {
      department: filters.department || null,
      semester: filters.semester ? Number(filters.semester) : null,
      cohort: filters.cohort || null,
    },
    students: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
    },
    successScore: {
      average: scoreAvg,
      median: scoreMedian,
      min: scoreMin,
      max: scoreMax,
      scoredCount,
      unscoredCount,
      distribution,
    },
    academicRisk,
    placementRisk,
    dataCoverage: {
      categories,
      overallCompletenessAverage,
    },
    coverageNotes,

    // Dynamic top-level properties for UI fidelity
    totalStudents,
    departmentCount,
    averageSuccessScore: scoreAvg ?? 0,
    scoreDistribution: distribution,
    decoupledDivergence: {
      count: divergenceCount,
      percentage: divergencePercentage,
      explanation: `${divergenceCount} students have strong academic standing (CGPA >= 7.5) but high placement risk due to soft-skills/mock interview gaps.`,
    },
    overallCompletenessAverage,
    categoryCoverage: {
      academic: categories.academic?.percentage ?? 0,
      attendance: categories.attendance?.percentage ?? 0,
      lms: categories.lms?.percentage ?? 0,
      placement: categories.placement?.percentage ?? 0,
      skills: categories.skills?.percentage ?? 0,
      engagement: categories.engagement?.percentage ?? 0,
      feedback: categories.feedback?.percentage ?? 0,
    },
  };
}

/**
 * Retrieve time-series trends across historical periods for scores and attendance.
 *
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getTrends(filters = {}) {
  const query = buildStudentQuery(filters);
  const students = await Student.find(query, { studentId: 1 }).lean();
  const studentIds = students.map((s) => s.studentId);

  if (studentIds.length === 0) {
    return {
      filters: {
        department: filters.department || null,
        semester: filters.semester ? Number(filters.semester) : null,
        cohort: filters.cohort || null,
      },
      trend: [],
    };
  }

  // Group scores by period
  const scoreTrends = await StudentScore.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    {
      $group: {
        _id: '$period',
        studentSet: { $addToSet: '$studentId' },
        avgScore: { $avg: '$score' },
        minScore: { $min: '$score' },
        maxScore: { $max: '$score' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Group attendance by term
  const attendanceTrends = await AttendanceRecord.aggregate([
    { $match: { studentId: { $in: studentIds } } },
    {
      $group: {
        _id: '$term',
        studentSet: { $addToSet: '$studentId' },
        avgAttendance: {
          $avg: {
            $ifNull: [
              '$attendancePercentage',
              {
                $cond: [
                  { $gt: ['$classesHeld', 0] },
                  { $multiply: [{ $divide: ['$classesAttended', '$classesHeld'] }, 100] },
                  null,
                ],
              },
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trendMap = new Map();

  for (const item of scoreTrends) {
    trendMap.set(item._id, {
      period: item._id,
      studentCount: item.studentSet.length,
      averageSuccessScore: Math.round(item.avgScore * 10) / 10,
      minSuccessScore: Math.round(item.minScore * 10) / 10,
      maxSuccessScore: Math.round(item.maxScore * 10) / 10,
      averageAttendance: null,
    });
  }

  for (const item of attendanceTrends) {
    const existing = trendMap.get(item._id) || {
      period: item._id,
      studentCount: item.studentSet.length,
      averageSuccessScore: null,
      minSuccessScore: null,
      maxSuccessScore: null,
    };
    existing.averageAttendance = Math.round(item.avgAttendance * 10) / 10;
    if (!trendMap.has(item._id)) {
      trendMap.set(item._id, existing);
    }
  }

  const trendList = Array.from(trendMap.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  return {
    filters: {
      department: filters.department || null,
      semester: filters.semester ? Number(filters.semester) : null,
      cohort: filters.cohort || null,
    },
    trend: trendList,
  };
}

/**
 * Retrieve comprehensive risk breakdown grouped by department and semester,
 * including top cohort risk drivers and decoupled risk divergence insights.
 *
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getRiskSummary(filters = {}) {
  const query = buildStudentQuery(filters);
  const students = await Student.find(query, {
    studentId: 1,
    department: 1,
    semester: 1,
    currentSemester: 1,
    status: 1,
  }).lean();

  if (students.length === 0) {
    return {
      filters: {
        department: filters.department || null,
        semester: filters.semester ? Number(filters.semester) : null,
        cohort: filters.cohort || null,
      },
      departmentBreakdown: [],
      semesterBreakdown: [],
      topRiskDrivers: [],
      decoupledDivergence: {
        count: 0,
        percentage: 0,
        explanation: 'No students found.',
      },
    };
  }

  const studentIds = students.map((s) => s.studentId);

  // Fetch latest scores and predictions
  const [scoresAgg, riskAgg, academicsAgg] = await Promise.all([
    StudentScore.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { studentId: 1, calculatedAt: -1 } },
      {
        $group: {
          _id: '$studentId',
          score: { $first: '$score' },
        },
      },
    ]),
    RiskPrediction.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'valid' } },
      { $sort: { studentId: 1, target: 1, predictedAt: -1 } },
      {
        $group: {
          _id: { studentId: '$studentId', target: '$target' },
          riskLevel: { $first: '$riskLevel' },
          drivers: { $first: '$drivers' },
        },
      },
    ]),
    AcademicRecord.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
      {
        $group: {
          _id: '$studentId',
          cgpa: { $first: '$cgpa' },
        },
      },
    ]),
  ]);

  const scoreByStudent = new Map(scoresAgg.map((s) => [s._id, s.score]));
  const cgpaByStudent = new Map(academicsAgg.map((a) => [a._id, a.cgpa]));

  const riskByStudent = new Map();
  const driverCounts = new Map();

  for (const r of riskAgg) {
    const sId = r._id.studentId;
    const target = r._id.target;
    if (!riskByStudent.has(sId)) {
      riskByStudent.set(sId, { academic: null, placement: null });
    }
    const studentRisk = riskByStudent.get(sId);
    if (target === 'academic_risk') studentRisk.academic = r.riskLevel;
    if (target === 'placement_risk') studentRisk.placement = r.riskLevel;

    // Collect drivers for high and medium risks
    if ((r.riskLevel === 'high' || r.riskLevel === 'medium') && Array.isArray(r.drivers)) {
      for (const d of r.drivers) {
        if (!driverCounts.has(d.name)) {
          driverCounts.set(d.name, {
            name: d.name,
            count: 0,
            sampleExplanation: d.explanation,
          });
        }
        driverCounts.get(d.name).count += 1;
      }
    }
  }

  // 1. Department Breakdown
  const deptMap = new Map();
  for (const s of students) {
    const dept = s.department || 'Unassigned';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, {
        department: dept,
        total: 0,
        scoreSum: 0,
        scoreCount: 0,
        academicRisk: { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 },
        placementRisk: { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 },
      });
    }
    const dObj = deptMap.get(dept);
    dObj.total += 1;

    const sc = scoreByStudent.get(s.studentId);
    if (sc != null) {
      dObj.scoreSum += sc;
      dObj.scoreCount += 1;
    }

    const r = riskByStudent.get(s.studentId);
    if (r?.academic) {
      dObj.academicRisk[r.academic] = (dObj.academicRisk[r.academic] || 0) + 1;
    } else {
      dObj.academicRisk.unassessed += 1;
    }

    if (r?.placement) {
      dObj.placementRisk[r.placement] = (dObj.placementRisk[r.placement] || 0) + 1;
    } else {
      dObj.placementRisk.unassessed += 1;
    }
  }

  const departmentBreakdown = Array.from(deptMap.values()).map((d) => ({
    department: d.department,
    total: d.total,
    averageSuccessScore:
      d.scoreCount > 0 ? Math.round((d.scoreSum / d.scoreCount) * 10) / 10 : null,
    academicRisk: d.academicRisk,
    placementRisk: d.placementRisk,
  }));

  // 2. Semester Breakdown
  const semMap = new Map();
  for (const s of students) {
    const sem = s.semester ?? s.currentSemester ?? 0;
    if (!semMap.has(sem)) {
      semMap.set(sem, {
        semester: sem,
        total: 0,
        scoreSum: 0,
        scoreCount: 0,
        academicRisk: { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 },
        placementRisk: { low: 0, medium: 0, high: 0, unknown: 0, unassessed: 0 },
      });
    }
    const sObj = semMap.get(sem);
    sObj.total += 1;

    const sc = scoreByStudent.get(s.studentId);
    if (sc != null) {
      sObj.scoreSum += sc;
      sObj.scoreCount += 1;
    }

    const r = riskByStudent.get(s.studentId);
    if (r?.academic) {
      sObj.academicRisk[r.academic] = (sObj.academicRisk[r.academic] || 0) + 1;
    } else {
      sObj.academicRisk.unassessed += 1;
    }

    if (r?.placement) {
      sObj.placementRisk[r.placement] = (sObj.placementRisk[r.placement] || 0) + 1;
    } else {
      sObj.placementRisk.unassessed += 1;
    }
  }

  const semesterBreakdown = Array.from(semMap.values())
    .sort((a, b) => a.semester - b.semester)
    .map((s) => ({
      semester: s.semester,
      total: s.total,
      averageSuccessScore:
        s.scoreCount > 0 ? Math.round((s.scoreSum / s.scoreCount) * 10) / 10 : null,
      academicRisk: s.academicRisk,
      placementRisk: s.placementRisk,
    }));

  // 3. Top Cohort Risk Drivers
  const topRiskDrivers = Array.from(driverCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => ({
      name: item.name,
      affectedStudents: item.count,
      percentage: Math.round((item.count / students.length) * 1000) / 10,
      sampleExplanation: item.sampleExplanation,
    }));

  // 4. Decoupled Risk Divergence (High Academic but High Placement Risk)
  let divergenceCount = 0;
  for (const s of students) {
    const cgpa = cgpaByStudent.get(s.studentId);
    const r = riskByStudent.get(s.studentId);
    if (cgpa != null && cgpa >= 7.5 && r?.placement === 'high') {
      divergenceCount += 1;
    }
  }

  const divergencePercentage =
    students.length > 0
      ? Math.round((divergenceCount / students.length) * 1000) / 10
      : 0;

  return {
    filters: {
      department: filters.department || null,
      semester: filters.semester ? Number(filters.semester) : null,
      cohort: filters.cohort || null,
    },
    departmentBreakdown,
    semesterBreakdown,
    topRiskDrivers,
    decoupledDivergence: {
      count: divergenceCount,
      percentage: divergencePercentage,
      explanation: `${divergenceCount} students exhibit strong academic standing (CGPA >= 7.5) but high placement risk, confirming independent risk dynamics.`,
    },
  };
}
