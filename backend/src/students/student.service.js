import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { toStudentDTO, toCleanDTO } from '../serializers/index.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Escapes special regex characters in a string for safe query execution.
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Retrieve paginated and filtered list of students.
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

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    students: students.map(toStudentDTO),
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
 * Create a new student profile.
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

  const student = new Student({
    ...data,
    studentId,
  });

  await student.validate();
  await student.save();

  return toStudentDTO(student);
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
 * Update an existing student profile.
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

  return toStudentDTO(student);
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
  getStudentRecords,
};
