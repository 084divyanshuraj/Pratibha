import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { Student } from '../models/Student.js';
import { toCleanDTO } from '../serializers/index.js';
import { AppError } from '../middleware/errorHandler.js';

const ALLOWED_FEEDBACK_TYPES = ['student_satisfaction', 'faculty_feedback', 'course_feedback', 'other'];
const ALLOWED_VISIBILITIES = ['private', 'staff_only', 'aggregated'];

/**
 * Submit feedback with strict role-scoping and payload validation.
 */
export async function submitFeedback(payload, user) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('Invalid request payload.', 400, 'VALIDATION_ERROR');
  }

  let studentId;
  if (user.role === 'student') {
    if (!user.studentId) {
      throw new AppError('Authenticated student account is missing a linked studentId.', 403, 'FORBIDDEN');
    }
    if (payload.studentId && payload.studentId.trim().toUpperCase() !== user.studentId.toUpperCase()) {
      throw new AppError('Students may only submit feedback for their own student profile.', 403, 'FORBIDDEN');
    }
    studentId = user.studentId.toUpperCase();
  } else {
    if (!payload.studentId || typeof payload.studentId !== 'string') {
      throw new AppError('studentId is required for feedback submission.', 400, 'VALIDATION_ERROR');
    }
    studentId = payload.studentId.trim().toUpperCase();
  }

  // Verify that the student exists in the system
  const student = await Student.findOne({ studentId });
  if (!student) {
    throw new AppError(`Student ${studentId} not found in directory.`, 404, 'NOT_FOUND');
  }

  // Validate feedbackType
  if (!payload.feedbackType || !ALLOWED_FEEDBACK_TYPES.includes(payload.feedbackType)) {
    throw new AppError(
      `Invalid feedbackType. Must be one of: ${ALLOWED_FEEDBACK_TYPES.join(', ')}.`,
      400,
      'VALIDATION_ERROR'
    );
  }

  // Validate rating (optional, but if provided must be integer 1-5)
  let rating = null;
  if (payload.rating !== undefined && payload.rating !== null && payload.rating !== '') {
    const parsedRating = Number(payload.rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      throw new AppError('Rating must be an integer between 1 and 5.', 400, 'VALIDATION_ERROR');
    }
    rating = parsedRating;
  }

  // Validate comment (optional, max 1000 characters)
  let comment = null;
  if (payload.comment !== undefined && payload.comment !== null) {
    if (typeof payload.comment !== 'string') {
      throw new AppError('Comment must be a text string.', 400, 'VALIDATION_ERROR');
    }
    const trimmed = payload.comment.trim();
    if (trimmed.length > 1000) {
      throw new AppError('Comment cannot exceed 1000 characters.', 400, 'VALIDATION_ERROR');
    }
    comment = trimmed.length > 0 ? trimmed : null;
  }

  // Validate visibility (optional, default staff_only)
  const visibility = payload.visibility || 'staff_only';
  if (!ALLOWED_VISIBILITIES.includes(visibility)) {
    throw new AppError(
      `Invalid visibility. Must be one of: ${ALLOWED_VISIBILITIES.join(', ')}.`,
      400,
      'VALIDATION_ERROR'
    );
  }

  const record = await FeedbackRecord.create({
    studentId,
    feedbackType: payload.feedbackType,
    rating,
    comment,
    visibility,
  });

  return toCleanDTO(record);
}

/**
 * Get aggregated institutional feedback summary.
 * Restricted to staff roles; student comments are withheld for privacy.
 */
export async function getFeedbackSummary(filters = {}, user) {
  if (user.role === 'student') {
    throw new AppError('Access forbidden. Students cannot access institutional feedback summaries.', 403, 'FORBIDDEN');
  }

  const match = {};

  if (filters.feedbackType) {
    if (!ALLOWED_FEEDBACK_TYPES.includes(filters.feedbackType)) {
      throw new AppError(`Invalid feedbackType filter: ${filters.feedbackType}`, 400, 'VALIDATION_ERROR');
    }
    match.feedbackType = filters.feedbackType;
  }

  if (filters.studentId) {
    match.studentId = filters.studentId.trim().toUpperCase();
  }

  if (filters.visibility) {
    match.visibility = filters.visibility;
  }

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      if (isNaN(start.getTime())) throw new AppError('Invalid startDate format.', 400, 'VALIDATION_ERROR');
      match.createdAt.$gte = start;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      if (isNaN(end.getTime())) throw new AppError('Invalid endDate format.', 400, 'VALIDATION_ERROR');
      match.createdAt.$lte = end;
    }
  }

  const records = await FeedbackRecord.find(match).lean();

  const totalResponses = records.length;
  let ratedResponses = 0;
  let ratingSum = 0;
  let commentsCount = 0;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const typeMap = {};

  for (const type of ALLOWED_FEEDBACK_TYPES) {
    typeMap[type] = { feedbackType: type, count: 0, ratedCount: 0, ratingSum: 0 };
  }

  for (const r of records) {
    if (r.rating !== null && r.rating !== undefined) {
      ratedResponses += 1;
      ratingSum += r.rating;
      if (ratingDistribution[r.rating] !== undefined) {
        ratingDistribution[r.rating] += 1;
      }
    }

    if (r.comment && r.comment.trim().length > 0) {
      commentsCount += 1;
    }

    const t = typeMap[r.feedbackType] || { feedbackType: r.feedbackType, count: 0, ratedCount: 0, ratingSum: 0 };
    t.count += 1;
    if (r.rating !== null && r.rating !== undefined) {
      t.ratedCount += 1;
      t.ratingSum += r.rating;
    }
    typeMap[r.feedbackType] = t;
  }

  const averageRating = ratedResponses > 0 ? Number((ratingSum / ratedResponses).toFixed(2)) : null;

  const byType = Object.values(typeMap).map((t) => ({
    feedbackType: t.feedbackType,
    count: t.count,
    averageRating: t.ratedCount > 0 ? Number((t.ratingSum / t.ratedCount).toFixed(2)) : null,
  }));

  return {
    totalResponses,
    ratedResponses,
    averageRating,
    ratingDistribution,
    byType,
    commentsCount,
    commentPrivacyNote:
      'Raw student comments are withheld from aggregate summaries to protect student privacy and prevent ungrounded feature ingestion.',
  };
}

/**
 * List feedback records with role-based scoping and privacy masking for private comments.
 */
export async function listFeedback(filters = {}, user) {
  const match = {};

  if (user.role === 'student') {
    match.studentId = user.studentId ? user.studentId.toUpperCase() : '__NONE__';
  } else {
    if (filters.studentId) {
      match.studentId = filters.studentId.trim().toUpperCase();
    }
    if (filters.feedbackType) {
      match.feedbackType = filters.feedbackType;
    }
    if (filters.visibility) {
      match.visibility = filters.visibility;
    }
  }

  const page = Math.max(1, parseInt(filters.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '20', 10) || 20));
  const skip = (page - 1) * limit;

  const [total, records] = await Promise.all([
    FeedbackRecord.countDocuments(match),
    FeedbackRecord.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  const sanitized = records.map((record) => {
    const dto = toCleanDTO(record);
    // Non-admin staff cannot view private comments of students
    if (user.role !== 'admin' && dto.visibility === 'private' && user.studentId !== dto.studentId) {
      dto.comment = '[REDACTED: PRIVATE FEEDBACK]';
    }
    return dto;
  });

  return {
    feedback: sanitized,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export default {
  submitFeedback,
  getFeedbackSummary,
  listFeedback,
};
