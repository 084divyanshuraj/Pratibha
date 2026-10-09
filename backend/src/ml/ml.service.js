import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { StudentFeature } from '../models/StudentFeature.js';
import { RiskPrediction } from '../models/RiskPrediction.js';
import { buildStudentFeatures } from './feature.builder.js';
import { callMlInference } from './ml.client.js';
import { AppError } from '../middleware/errorHandler.js';
import { toCleanDTO } from '../serializers/index.js';

export const SUPPORTED_TARGETS = ['academic_risk', 'placement_risk'];

/**
 * Orchestrates feature building and calls external ML inference for a student.
 */
export async function generatePrediction(studentId, target = 'academic_risk', asOfDate = new Date()) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();

  if (!SUPPORTED_TARGETS.includes(target) && target !== 'all') {
    throw new AppError(
      `Unsupported ML target "${target}". Allowed targets: ${SUPPORTED_TARGETS.join(', ')} or "all".`,
      400,
      'INVALID_TARGET'
    );
  }

  // 1. Verify student exists
  const student = await Student.findOne({ studentId: cleanId });
  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  // 2. Query all category records for feature construction
  const [academic, attendance, lms, placement, skills, engagement, feedback] = await Promise.all([
    AcademicRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    AttendanceRecord.find({ studentId: cleanId }).sort({ observedAt: -1 }).lean(),
    LmsActivity.find({ studentId: cleanId }).sort({ periodStart: -1 }).lean(),
    PlacementAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    SkillAssessment.find({ studentId: cleanId }).sort({ assessedAt: -1 }).lean(),
    EngagementRecord.find({ studentId: cleanId }).sort({ occurredAt: -1 }).lean(),
    FeedbackRecord.find({ studentId: cleanId }).sort({ createdAt: -1 }).lean(),
  ]);

  // 3. Build 17-feature vector
  const cutoff = asOfDate ? new Date(asOfDate) : new Date();
  const featureData = buildStudentFeatures({
    studentId: cleanId,
    asOfDate: cutoff,
    academic,
    attendance,
    lms,
    placement,
    skills,
    engagement,
    feedback,
  });

  // 4. Save/update StudentFeature snapshot
  await StudentFeature.create({
    studentId: cleanId,
    featureSetVersion: featureData.featureSetVersion,
    asOfDate: featureData.asOfDate,
    features: featureData.features,
    sourceRecordWatermarks: featureData.sourceRecordWatermarks,
  });

  // Targets to evaluate
  const targetsToRun = target === 'all' ? SUPPORTED_TARGETS : [target];
  const results = [];

  for (const t of targetsToRun) {
    // 5. Call external ML service (Never fabricates predictions on failure)
    const inferenceResult = await callMlInference({
      studentId: cleanId,
      target: t,
      features: featureData.features,
      asOfDate: cutoff,
    });

    // 6. Supersede previous valid predictions for the same target
    await RiskPrediction.updateMany(
      { studentId: cleanId, target: t, status: 'valid' },
      { $set: { status: 'superseded' } }
    );

    // 7. Persist accepted prediction
    const predictionDoc = new RiskPrediction({
      studentId: cleanId,
      target: t,
      riskLevel: inferenceResult.riskLevel,
      probability: inferenceResult.probability,
      modelVersion: inferenceResult.modelVersion,
      featureSetVersion: featureData.featureSetVersion,
      drivers: inferenceResult.drivers,
      limitations: inferenceResult.limitations,
      predictedAt: new Date(),
      status: 'valid',
    });

    await predictionDoc.save();
    results.push(toCleanDTO(predictionDoc));
  }

  return target === 'all' ? results : results[0];
}

/**
 * Retrieve latest active risk predictions for a student across all targets.
 */
export async function getLatestPredictions(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    throw new AppError('A valid studentId is required.', 400, 'VALIDATION_ERROR');
  }

  const cleanId = studentId.trim().toUpperCase();

  const student = await Student.findOne({ studentId: cleanId });
  if (!student) {
    throw new AppError(`Student with ID "${cleanId}" not found.`, 404, 'NOT_FOUND');
  }

  const predictions = await RiskPrediction.find({
    studentId: cleanId,
    status: 'valid',
  })
    .sort({ predictedAt: -1 })
    .lean();

  const grouped = {};
  SUPPORTED_TARGETS.forEach((t) => {
    grouped[t] = null;
  });

  predictions.forEach((p) => {
    if (!grouped[p.target]) {
      grouped[p.target] = toCleanDTO(p);
    }
  });

  return {
    studentId: cleanId,
    predictions: predictions.map(toCleanDTO),
    targets: grouped,
  };
}

export default {
  generatePrediction,
  getLatestPredictions,
  SUPPORTED_TARGETS,
};
