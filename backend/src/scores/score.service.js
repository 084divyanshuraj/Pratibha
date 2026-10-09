import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { StudentScore } from '../models/StudentScore.js';
import { calculateStudentSuccessScore } from './score.calculator.js';
import { AppError } from '../middleware/errorHandler.js';
import { toCleanDTO } from '../serializers/index.js';

/**
 * Format score document for public API response.
 */
function toScoreDTO(scoreDoc, dataCompleteness) {
  if (!scoreDoc) return null;
  const clean = toCleanDTO(scoreDoc);

  // Compute dataCompleteness if not directly on doc
  const completeness =
    dataCompleteness !== undefined
      ? dataCompleteness
      : Math.round(((5 - (clean.missingFields?.length || 0)) / 5) * 100);

  return {
    studentId: clean.studentId,
    period: clean.period,
    score: clean.score,
    formulaVersion: clean.formulaVersion,
    dataCompleteness: completeness,
    components: clean.components || [],
    drivers: clean.drivers || [],
    missingFields: clean.missingFields || [],
    calculatedAt: clean.calculatedAt,
  };
}

/**
 * Recalculate and persist Student Success Score for a given student and period.
 */
export async function recalculateStudentScore(studentId, period = 'current') {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const cleanPeriod = (period || 'current').trim();

  // 1. Verify student exists
  const student = await Student.findOne({ studentId: cleanId });
  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  // 2. Query category records
  const [academic, attendance, lms, placement, skills, engagement] = await Promise.all([
    AcademicRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    AttendanceRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    LmsActivity.find({ studentId: cleanId }).sort({ periodStart: -1 }).lean(),
    PlacementAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    SkillAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    EngagementRecord.find({ studentId: cleanId }).sort({ occurredAt: -1 }).lean(),
  ]);

  // 3. Compute score
  const calculation = calculateStudentSuccessScore({
    academic,
    attendance,
    lms,
    placement,
    skills,
    engagement,
  });

  // If score is null (all data missing), handle explicitly
  const numericScore = calculation.score !== null ? calculation.score : 0;

  // 4. Persist versioned snapshot
  const scoreDoc = await StudentScore.findOneAndUpdate(
    { studentId: cleanId, period: cleanPeriod },
    {
      studentId: cleanId,
      period: cleanPeriod,
      score: numericScore,
      formulaVersion: calculation.formulaVersion,
      components: calculation.components,
      drivers: calculation.drivers,
      missingFields: calculation.missingFields,
      calculatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  return toScoreDTO(scoreDoc, calculation.dataCompleteness);
}

/**
 * Retrieve current score snapshot or calculate automatically if not yet computed.
 */
export async function getStudentScore(studentId, period = 'current') {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();
  const cleanPeriod = (period || 'current').trim();

  // 1. Verify student exists
  const student = await Student.findOne({ studentId: cleanId });
  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  // 2. Check if a persisted score snapshot exists
  const existingScore = await StudentScore.findOne({
    studentId: cleanId,
    period: cleanPeriod,
  }).lean();

  if (existingScore) {
    return toScoreDTO(existingScore);
  }

  // 3. If no score snapshot exists, calculate and persist
  return recalculateStudentScore(cleanId, cleanPeriod);
}

export default {
  getStudentScore,
  recalculateStudentScore,
};
