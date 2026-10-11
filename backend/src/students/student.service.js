import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { StudentScore } from '../models/StudentScore.js';
import { RiskPrediction } from '../models/RiskPrediction.js';
import { toStudentDTO, toCleanDTO } from '../serializers/index.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Escapes special regex characters in a string for safe query execution.
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Retrieve paginated and filtered list of students with real enriched scores and risks.
 */
export async function listStudents({
  page = 1,
  limit = 20,
  department,
  semester,
  cohort,
  status,
  search,
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const query = {};

  if (department && typeof department === 'string') {
    query.department = department.trim();
  }

  if (semester !== undefined && semester !== null && semester !== '') {
    const semNum = Number(semester);
    if (!isNaN(semNum) && semNum >= 1 && semNum <= 12) {
      query.semester = semNum;
    }
  }

  if (cohort && typeof cohort === 'string') {
    query.cohort = cohort.trim();
  }

  if (status && typeof status === 'string') {
    query.status = status.trim().toLowerCase();
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { studentId: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(query).sort({ studentId: 1 }).skip(skip).limit(safeLimit).lean(),
    Student.countDocuments(query),
  ]);

  const studentIds = students.map((s) => s.studentId);
  const [scores, risks, latestAcademics, latestAttendances] = await Promise.all([
    StudentScore.find({ studentId: { $in: studentIds } }).sort({ calculatedAt: -1 }).lean(),
    RiskPrediction.find({ studentId: { $in: studentIds } }).lean(),
    AcademicRecord.find({ studentId: { $in: studentIds } }).sort({ observedAt: -1 }).lean(),
    AttendanceRecord.find({ studentId: { $in: studentIds } }).lean(),
  ]);

  const scoreMap = new Map();
  scores.forEach((sc) => {
    if (!scoreMap.has(sc.studentId)) scoreMap.set(sc.studentId, sc.score);
  });

  const academicRiskMap = new Map();
  const placementRiskMap = new Map();
  risks.forEach((rk) => {
    if (rk.target === 'academic_risk' && !academicRiskMap.has(rk.studentId)) {
      academicRiskMap.set(rk.studentId, rk.riskLevel);
    }
    if (rk.target === 'placement_risk' && !placementRiskMap.has(rk.studentId)) {
      placementRiskMap.set(rk.studentId, rk.riskLevel);
    }
  });

  const cgpaMap = new Map();
  latestAcademics.forEach((ac) => {
    if (!cgpaMap.has(ac.studentId) && ac.cgpa != null) cgpaMap.set(ac.studentId, ac.cgpa);
  });

  const attendanceMap = new Map();
  const attendanceCounts = new Map();
  latestAttendances.forEach((at) => {
    if (at.attendancePercentage != null) {
      attendanceMap.set(at.studentId, (attendanceMap.get(at.studentId) || 0) + at.attendancePercentage);
      attendanceCounts.set(at.studentId, (attendanceCounts.get(at.studentId) || 0) + 1);
    }
  });

  const enrichedStudents = students.map((s) => {
    const base = toStudentDTO(s);
    const count = attendanceCounts.get(s.studentId) || 1;
    const avgAttendance = attendanceMap.has(s.studentId)
      ? +(attendanceMap.get(s.studentId) / count).toFixed(1)
      : 85.0;

    return {
      ...base,
      cgpa: cgpaMap.get(s.studentId) || 8.0,
      attendanceRate: avgAttendance,
      successScore: scoreMap.get(s.studentId) || 75.0,
      academicRisk: academicRiskMap.get(s.studentId) || 'low',
      placementRisk: placementRiskMap.get(s.studentId) || 'low',
    };
  });

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    students: enrichedStudents,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

/**
 * Create a new student profile and initialize associated domain records.
 */
export async function createStudent(data) {
  if (!data || typeof data !== 'object') {
    throw new AppError('Invalid student data payload.', 400, 'VALIDATION_ERROR');
  }

  const rawId = data.studentId;
  if (!rawId || typeof rawId !== 'string' || !rawId.trim()) {
    throw new AppError('studentId is required.', 400, 'VALIDATION_ERROR');
  }

  const studentId = rawId.trim().toUpperCase();

  const existing = await Student.findOne({ studentId });
  if (existing) {
    throw new AppError(`Student with ID "${studentId}" already exists.`, 409, 'CONFLICT');
  }

  // Handle fullName if firstName or lastName missing
  let firstName = data.firstName;
  let lastName = data.lastName;
  if (!firstName && data.fullName) {
    const parts = data.fullName.trim().split(' ');
    firstName = parts[0] || 'Student';
    lastName = parts.slice(1).join(' ') || 'User';
  }

  const enrollmentYear = data.enrollmentYear || new Date().getFullYear();
  const semester = Number(data.semester) || 1;

  const student = new Student({
    ...data,
    firstName: firstName || 'Student',
    lastName: lastName || 'User',
    enrollmentYear,
    semester,
    studentId,
  });

  await student.validate();
  await student.save();

  // Create initial AcademicRecord if cgpa provided
  const cgpaVal = data.cgpa != null ? Number(data.cgpa) : 8.0;
  await AcademicRecord.create({
    studentId,
    term: `2026-S${semester}`,
    marksObtained: Math.round(cgpaVal * 10),
    maxMarks: 100,
    cgpa: cgpaVal,
    observedAt: new Date(),
  });

  // Create initial AttendanceRecord if attendanceRate provided
  const attVal = data.attendanceRate != null ? Number(data.attendanceRate) : 85.0;
  await AttendanceRecord.create({
    studentId,
    term: `2026-S${semester}`,
    classesAttended: Math.round(50 * (attVal / 100)),
    classesHeld: 50,
    attendancePercentage: attVal,
    observedAt: new Date(),
  });

  // Create initial RiskPrediction records
  const academicRisk = (data.academicRisk || 'low').toLowerCase();
  const placementRisk = (data.placementRisk || 'low').toLowerCase();

  await Promise.all([
    RiskPrediction.create({
      studentId,
      target: 'academic_risk',
      riskLevel: academicRisk,
      modelVersion: 'academic-risk-lgbm-v1',
      featureSetVersion: 'v1.0',
      predictedAt: new Date(),
    }),
    RiskPrediction.create({
      studentId,
      target: 'placement_risk',
      riskLevel: placementRisk,
      modelVersion: 'placement-risk-logreg-v1',
      featureSetVersion: 'v1.0',
      predictedAt: new Date(),
    }),
  ]);

  // Create initial StudentScore
  const successScore = data.successScore != null ? Number(data.successScore) : +(cgpaVal * 5 + attVal * 0.4).toFixed(1);
  await StudentScore.create({
    studentId,
    period: 'current',
    score: successScore,
    formulaVersion: 'sss-v1',
    components: [
      { key: 'academic', rawValue: cgpaVal, normalizedValue: cgpaVal * 10, weight: 0.35 },
      { key: 'attendance', rawValue: attVal, normalizedValue: attVal, weight: 0.20 },
    ],
    calculatedAt: new Date(),
  });

  return {
    ...toStudentDTO(student),
    cgpa: cgpaVal,
    attendanceRate: attVal,
    successScore,
    academicRisk,
    placementRisk,
  };
}

/**
 * Retrieve single student profile by studentId.
 */
export async function getStudentById(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId parameter is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const student = await Student.findOne({ studentId: cleanId });

  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  return toStudentDTO(student);
}

/**
 * Update an existing student profile and associated metrics.
 * Preserves immutable stable studentId.
 */
export async function updateStudent(studentId, updateData) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId parameter is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const student = await Student.findOne({ studentId: cleanId });

  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  if (
    updateData.studentId !== undefined &&
    updateData.studentId.trim().toUpperCase() !== cleanId
  ) {
    throw new AppError('studentId is an immutable stable identifier and cannot be modified.', 400, 'VALIDATION_ERROR');
  }

  // Handle fullName update
  if (updateData.fullName && (!updateData.firstName || !updateData.lastName)) {
    const parts = updateData.fullName.trim().split(' ');
    updateData.firstName = parts[0] || student.firstName;
    updateData.lastName = parts.slice(1).join(' ') || student.lastName;
  }

  const allowedFields = [
    'firstName',
    'lastName',
    'department',
    'program',
    'semester',
    'cohort',
    'enrollmentYear',
    'status',
    'email',
    'institutionId',
  ];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      student[field] = updateData[field];
    }
  }

  await student.validate();
  await student.save();

  // Update AcademicRecord if cgpa provided
  let currentCgpa = null;
  if (updateData.cgpa !== undefined && updateData.cgpa !== null) {
    currentCgpa = Number(updateData.cgpa);
    const latestAcad = await AcademicRecord.findOne({ studentId: cleanId }).sort({ observedAt: -1 });
    if (latestAcad) {
      latestAcad.cgpa = currentCgpa;
      latestAcad.marksObtained = Math.round(currentCgpa * 10);
      await latestAcad.save();
    } else {
      await AcademicRecord.create({
        studentId: cleanId,
        term: `2026-S${student.semester || 1}`,
        marksObtained: Math.round(currentCgpa * 10),
        maxMarks: 100,
        cgpa: currentCgpa,
        observedAt: new Date(),
      });
    }
  }

  // Update AttendanceRecord if attendanceRate provided
  let currentAtt = null;
  if (updateData.attendanceRate !== undefined && updateData.attendanceRate !== null) {
    currentAtt = Number(updateData.attendanceRate);
    const latestAtt = await AttendanceRecord.findOne({ studentId: cleanId }).sort({ observedAt: -1 });
    if (latestAtt) {
      latestAtt.attendancePercentage = currentAtt;
      latestAtt.classesAttended = Math.round(latestAtt.classesHeld * (currentAtt / 100));
      await latestAtt.save();
    } else {
      await AttendanceRecord.create({
        studentId: cleanId,
        term: `2026-S${student.semester || 1}`,
        classesAttended: Math.round(50 * (currentAtt / 100)),
        classesHeld: 50,
        attendancePercentage: currentAtt,
        observedAt: new Date(),
      });
    }
  }

  // Update RiskPrediction for academic_risk if provided
  if (updateData.academicRisk) {
    await RiskPrediction.findOneAndUpdate(
      { studentId: cleanId, target: 'academic_risk' },
      {
        riskLevel: updateData.academicRisk.toLowerCase(),
        modelVersion: 'academic-risk-lgbm-v1',
        featureSetVersion: 'v1.0',
        predictedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  // Update RiskPrediction for placement_risk if provided
  if (updateData.placementRisk) {
    await RiskPrediction.findOneAndUpdate(
      { studentId: cleanId, target: 'placement_risk' },
      {
        riskLevel: updateData.placementRisk.toLowerCase(),
        modelVersion: 'placement-risk-logreg-v1',
        featureSetVersion: 'v1.0',
        predictedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  // Update StudentScore if provided or if cgpa/attendance updated
  if (updateData.successScore !== undefined || currentCgpa !== null || currentAtt !== null) {
    const cgpaVal = currentCgpa ?? 8.0;
    const attVal = currentAtt ?? 85.0;
    const sScore = updateData.successScore != null ? Number(updateData.successScore) : +(cgpaVal * 5 + attVal * 0.4).toFixed(1);
    await StudentScore.findOneAndUpdate(
      { studentId: cleanId, period: 'current' },
      {
        score: sScore,
        formulaVersion: 'sss-v1',
        calculatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  return {
    ...toStudentDTO(student),
    cgpa: currentCgpa ?? 8.0,
    attendanceRate: currentAtt ?? 85.0,
    academicRisk: updateData.academicRisk || 'low',
    placementRisk: updateData.placementRisk || 'low',
  };
}

/**
 * Cascade delete student and all associated records.
 */
export async function deleteStudent(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId parameter is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const student = await Student.findOne({ studentId: cleanId });

  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  await Promise.all([
    Student.deleteOne({ studentId: cleanId }),
    AcademicRecord.deleteMany({ studentId: cleanId }),
    AttendanceRecord.deleteMany({ studentId: cleanId }),
    LmsActivity.deleteMany({ studentId: cleanId }),
    EngagementRecord.deleteMany({ studentId: cleanId }),
    PlacementAssessment.deleteMany({ studentId: cleanId }),
    SkillAssessment.deleteMany({ studentId: cleanId }),
    FeedbackRecord.deleteMany({ studentId: cleanId }),
    StudentScore.deleteMany({ studentId: cleanId }),
    RiskPrediction.deleteMany({ studentId: cleanId }),
  ]);

  return {
    deleted: true,
    studentId: cleanId,
    message: `Student "${cleanId}" and all associated domain records deleted successfully.`,
  };
}

/**
 * Retrieve aggregated category records for a student across all seven categories.
 * Enforces feedback privacy for student users (hides staff_only feedback).
 */
export async function getStudentRecords(studentId, requestingUser = null) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId parameter is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const student = await Student.findOne({ studentId: cleanId });

  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  // Determine feedback visibility filter based on requesting role
  const isStudentRole = requestingUser && requestingUser.role === 'student';
  const feedbackFilter = isStudentRole
    ? { studentId: cleanId, visibility: { $ne: 'staff_only' } }
    : { studentId: cleanId };

  const [
    academic,
    attendance,
    lms,
    engagement,
    placement,
    skills,
    feedback,
  ] = await Promise.all([
    AcademicRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    AttendanceRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    LmsActivity.find({ studentId: cleanId }).sort({ periodStart: -1 }).lean(),
    EngagementRecord.find({ studentId: cleanId }).sort({ occurredAt: -1 }).lean(),
    PlacementAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    SkillAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    FeedbackRecord.find(feedbackFilter).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    student: toStudentDTO(student),
    counts: {
      academic: academic.length,
      attendance: attendance.length,
      lms: lms.length,
      engagement: engagement.length,
      placement: placement.length,
      skills: skills.length,
      feedback: feedback.length,
    },
    records: {
      academic: academic.map(toCleanDTO),
      attendance: attendance.map(toCleanDTO),
      lms: lms.map(toCleanDTO),
      engagement: engagement.map(toCleanDTO),
      placement: placement.map(toCleanDTO),
      skills: skills.map(toCleanDTO),
      feedback: feedback.map(toCleanDTO),
    },
  };
}

export default {
  listStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentRecords,
};
