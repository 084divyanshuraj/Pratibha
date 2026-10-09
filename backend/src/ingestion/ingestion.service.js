import { parse as parseCsv } from 'csv-parse/sync';
import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { LmsActivity } from '../models/LmsActivity.js';
import { EngagementRecord } from '../models/EngagementRecord.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { SkillAssessment } from '../models/SkillAssessment.js';
import { FeedbackRecord } from '../models/FeedbackRecord.js';
import { Import } from '../models/Import.js';
import { recalculateStudentScore } from '../scores/score.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { toCleanDTO } from '../serializers/index.js';

export const SUPPORTED_DATASET_TYPES = [
  'academic',
  'attendance',
  'lms',
  'engagement',
  'placement',
  'skills',
  'feedback',
  'students',
];

const MODEL_MAP = {
  academic: AcademicRecord,
  attendance: AttendanceRecord,
  lms: LmsActivity,
  engagement: EngagementRecord,
  placement: PlacementAssessment,
  skills: SkillAssessment,
  feedback: FeedbackRecord,
  students: Student,
};

const MAX_ROW_ERRORS_STORED = 100;

// Helper parsing utilities preserving nulls (no silent coercion to zero)
function toTrimmedString(val) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

function toOptionalNumber(val, fieldName) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return null;
  }
  const num = Number(val);
  if (isNaN(num)) {
    throw new Error(`Field '${fieldName}' must be a valid number, got '${val}'.`);
  }
  return num;
}

function toRequiredNumber(val, fieldName) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    throw new Error(`Field '${fieldName}' is required.`);
  }
  const num = Number(val);
  if (isNaN(num)) {
    throw new Error(`Field '${fieldName}' must be a valid number, got '${val}'.`);
  }
  return num;
}

function toOptionalDate(val, fieldName, defaultToNow = false) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return defaultToNow ? new Date() : null;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    throw new Error(`Field '${fieldName}' must be a valid ISO/date string, got '${val}'.`);
  }
  return d;
}

function toRequiredDate(val, fieldName) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    throw new Error(`Field '${fieldName}' is required.`);
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    throw new Error(`Field '${fieldName}' must be a valid ISO/date string, got '${val}'.`);
  }
  return d;
}

function toBoolean(val, defaultVal = false) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return defaultVal;
  }
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes') return true;
  if (s === 'false' || s === '0' || s === 'no') return false;
  return defaultVal;
}

/**
 * Parses raw input from request into an array of raw record objects.
 * Supports:
 * - JSON: { records: [...] } or direct array [...]
 * - CSV: Buffer/String via multer file upload or { csv: "..." }
 */
export function extractRawRecords(req) {
  try {
    // Case 1: Multer file uploaded
    if (req.file && req.file.buffer) {
      const fileContent = req.file.buffer.toString('utf-8');
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
      return { records, fileName: req.file.originalname || 'upload.csv' };
    }

    // Case 2: Raw CSV string in req.body.csv or plain text body
    if (req.body && typeof req.body.csv === 'string') {
      const records = parseCsv(req.body.csv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
      return { records, fileName: req.body.fileName || 'inline.csv' };
    }
  } catch (err) {
    throw new AppError(`Malformed CSV payload: ${err.message}`, 400, 'MALFORMED_CSV');
  }

  // Case 3: JSON array in req.body.records
  if (req.body && Array.isArray(req.body.records)) {
    return { records: req.body.records, fileName: req.body.fileName || 'payload.json' };
  }

  // Case 4: JSON root is array
  if (Array.isArray(req.body)) {
    return { records: req.body, fileName: 'payload.json' };
  }

  throw new AppError(
    'No valid dataset records provided. Provide a CSV file upload or JSON payload with "records" array.',
    400,
    'INVALID_PAYLOAD'
  );
}

/**
 * Validates and normalizes an individual record for the specified datasetType.
 */
function validateRecord(datasetType, raw, rowNum, existingStudentIds) {
  const errors = [];

  const rawStudentId = toTrimmedString(raw.studentId);
  if (!rawStudentId) {
    errors.push({ field: 'studentId', message: 'studentId is required.' });
  }

  const studentId = rawStudentId ? rawStudentId.toUpperCase() : null;

  // Student existence check (except when importing students themselves)
  if (studentId && datasetType !== 'students') {
    if (!existingStudentIds.has(studentId)) {
      errors.push({
        field: 'studentId',
        message: `Student with ID "${studentId}" does not exist in the system.`,
      });
    }
  }

  const cleaned = { studentId };

  try {
    switch (datasetType) {
      case 'academic': {
        const term = toTrimmedString(raw.term);
        if (!term) errors.push({ field: 'term', message: 'term is required.' });
        cleaned.term = term;

        cleaned.subjectCode = toTrimmedString(raw.subjectCode);
        cleaned.subjectName = toTrimmedString(raw.subjectName);

        const assessmentType = toTrimmedString(raw.assessmentType) || 'final';
        const allowedAssessments = ['internal', 'midterm', 'final', 'quiz', 'assignment', 'practical', 'other'];
        if (!allowedAssessments.includes(assessmentType)) {
          errors.push({
            field: 'assessmentType',
            message: `assessmentType must be one of: ${allowedAssessments.join(', ')}`,
          });
        }
        cleaned.assessmentType = assessmentType;

        const marksObtained = toRequiredNumber(raw.marksObtained, 'marksObtained');
        if (marksObtained < 0) {
          errors.push({ field: 'marksObtained', message: 'marksObtained cannot be negative.' });
        }
        cleaned.marksObtained = marksObtained;

        const maxMarks = toRequiredNumber(raw.maxMarks, 'maxMarks');
        if (maxMarks < 1) {
          errors.push({ field: 'maxMarks', message: 'maxMarks must be at least 1.' });
        }
        cleaned.maxMarks = maxMarks;

        if (marksObtained > maxMarks) {
          errors.push({
            field: 'marksObtained',
            message: `marksObtained (${marksObtained}) cannot be greater than maxMarks (${maxMarks}).`,
          });
        }

        cleaned.grade = toTrimmedString(raw.grade);

        const cgpa = toOptionalNumber(raw.cgpa, 'cgpa');
        if (cgpa !== null && (cgpa < 0 || cgpa > 10)) {
          errors.push({ field: 'cgpa', message: 'cgpa must be between 0.0 and 10.0.' });
        }
        cleaned.cgpa = cgpa;

        cleaned.backlog = toBoolean(raw.backlog, false);
        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'attendance': {
        const term = toTrimmedString(raw.term);
        if (!term) errors.push({ field: 'term', message: 'term is required.' });
        cleaned.term = term;

        cleaned.subjectCode = toTrimmedString(raw.subjectCode);

        const classesAttended = toRequiredNumber(raw.classesAttended, 'classesAttended');
        if (classesAttended < 0) {
          errors.push({ field: 'classesAttended', message: 'classesAttended cannot be negative.' });
        }
        cleaned.classesAttended = classesAttended;

        const classesHeld = toRequiredNumber(raw.classesHeld, 'classesHeld');
        if (classesHeld < 0) {
          errors.push({ field: 'classesHeld', message: 'classesHeld cannot be negative.' });
        }
        cleaned.classesHeld = classesHeld;

        if (classesAttended > classesHeld) {
          errors.push({
            field: 'classesAttended',
            message: `classesAttended (${classesAttended}) cannot exceed classesHeld (${classesHeld}).`,
          });
        }

        let attendancePercentage = toOptionalNumber(raw.attendancePercentage, 'attendancePercentage');
        if (attendancePercentage === null && classesHeld > 0) {
          attendancePercentage = parseFloat(((classesAttended / classesHeld) * 100).toFixed(2));
        } else if (attendancePercentage !== null && (attendancePercentage < 0 || attendancePercentage > 100)) {
          errors.push({
            field: 'attendancePercentage',
            message: 'attendancePercentage must be between 0 and 100.',
          });
        }
        cleaned.attendancePercentage = attendancePercentage;

        cleaned.periodStart = toOptionalDate(raw.periodStart, 'periodStart');
        cleaned.periodEnd = toOptionalDate(raw.periodEnd, 'periodEnd');
        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'lms': {
        cleaned.periodStart = toRequiredDate(raw.periodStart, 'periodStart');
        cleaned.periodEnd = toRequiredDate(raw.periodEnd, 'periodEnd');

        if (cleaned.periodStart && cleaned.periodEnd && cleaned.periodEnd < cleaned.periodStart) {
          errors.push({ field: 'periodEnd', message: 'periodEnd cannot be earlier than periodStart.' });
        }

        const loginCount = toOptionalNumber(raw.loginCount, 'loginCount') ?? 0;
        if (loginCount < 0) errors.push({ field: 'loginCount', message: 'loginCount cannot be negative.' });
        cleaned.loginCount = loginCount;

        const activeDays = toOptionalNumber(raw.activeDays, 'activeDays') ?? 0;
        if (activeDays < 0) errors.push({ field: 'activeDays', message: 'activeDays cannot be negative.' });
        cleaned.activeDays = activeDays;

        const assignmentsAssigned = toOptionalNumber(raw.assignmentsAssigned, 'assignmentsAssigned') ?? 0;
        if (assignmentsAssigned < 0) errors.push({ field: 'assignmentsAssigned', message: 'assignmentsAssigned cannot be negative.' });
        cleaned.assignmentsAssigned = assignmentsAssigned;

        const assignmentsCompleted = toOptionalNumber(raw.assignmentsCompleted, 'assignmentsCompleted') ?? 0;
        if (assignmentsCompleted < 0) errors.push({ field: 'assignmentsCompleted', message: 'assignmentsCompleted cannot be negative.' });
        cleaned.assignmentsCompleted = assignmentsCompleted;

        if (assignmentsCompleted > assignmentsAssigned) {
          errors.push({
            field: 'assignmentsCompleted',
            message: `assignmentsCompleted (${assignmentsCompleted}) cannot exceed assignmentsAssigned (${assignmentsAssigned}).`,
          });
        }

        const engagementMinutes = toOptionalNumber(raw.engagementMinutes, 'engagementMinutes');
        if (engagementMinutes !== null && engagementMinutes < 0) {
          errors.push({ field: 'engagementMinutes', message: 'engagementMinutes cannot be negative.' });
        }
        cleaned.engagementMinutes = engagementMinutes;

        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'engagement': {
        const activityType = toTrimmedString(raw.activityType);
        const allowedTypes = ['event', 'club', 'hackathon', 'certification', 'workshop', 'sports', 'other'];
        if (!activityType || !allowedTypes.includes(activityType)) {
          errors.push({
            field: 'activityType',
            message: `activityType is required and must be one of: ${allowedTypes.join(', ')}`,
          });
        }
        cleaned.activityType = activityType;

        const activityName = toTrimmedString(raw.activityName);
        if (!activityName) {
          errors.push({ field: 'activityName', message: 'activityName is required.' });
        }
        cleaned.activityName = activityName;

        const hours = toOptionalNumber(raw.hours, 'hours');
        if (hours !== null && hours < 0) {
          errors.push({ field: 'hours', message: 'hours cannot be negative.' });
        }
        cleaned.hours = hours;

        cleaned.result = toTrimmedString(raw.result);
        cleaned.occurredAt = toOptionalDate(raw.occurredAt, 'occurredAt', true);
        break;
      }

      case 'placement': {
        const assessmentType = toTrimmedString(raw.assessmentType);
        const allowedAssessments = [
          'aptitude',
          'coding',
          'mock_interview',
          'placement_outcome',
          'readiness',
          'group_discussion',
          'other',
        ];
        if (!assessmentType || !allowedAssessments.includes(assessmentType)) {
          errors.push({
            field: 'assessmentType',
            message: `assessmentType is required and must be one of: ${allowedAssessments.join(', ')}`,
          });
        }
        cleaned.assessmentType = assessmentType;

        const maxScore = toOptionalNumber(raw.maxScore, 'maxScore');
        if (maxScore !== null && maxScore < 1) {
          errors.push({ field: 'maxScore', message: 'maxScore must be at least 1.' });
        }
        cleaned.maxScore = maxScore;

        const score = toOptionalNumber(raw.score, 'score');
        if (score !== null) {
          if (score < 0) errors.push({ field: 'score', message: 'score cannot be negative.' });
          if (maxScore !== null && score > maxScore) {
            errors.push({
              field: 'score',
              message: `score (${score}) cannot exceed maxScore (${maxScore}).`,
            });
          }
        }
        cleaned.score = score;

        cleaned.outcomeLabel = toTrimmedString(raw.outcomeLabel);
        cleaned.employerOrProgram = toTrimmedString(raw.employerOrProgram);
        cleaned.assessedAt = toOptionalDate(raw.assessedAt, 'assessedAt', true);
        break;
      }

      case 'skills': {
        const skillCategory = toTrimmedString(raw.skillCategory);
        const allowedCategories = ['technical', 'soft_skill'];
        if (!skillCategory || !allowedCategories.includes(skillCategory)) {
          errors.push({
            field: 'skillCategory',
            message: `skillCategory is required and must be one of: ${allowedCategories.join(', ')}`,
          });
        }
        cleaned.skillCategory = skillCategory;

        const skillName = toTrimmedString(raw.skillName);
        if (!skillName) {
          errors.push({ field: 'skillName', message: 'skillName is required.' });
        }
        cleaned.skillName = skillName;

        const maxScore = toOptionalNumber(raw.maxScore, 'maxScore') ?? 100;
        if (maxScore < 1) {
          errors.push({ field: 'maxScore', message: 'maxScore must be at least 1.' });
        }
        cleaned.maxScore = maxScore;

        const score = toRequiredNumber(raw.score, 'score');
        if (score < 0) errors.push({ field: 'score', message: 'score cannot be negative.' });
        if (score > maxScore) {
          errors.push({
            field: 'score',
            message: `score (${score}) cannot exceed maxScore (${maxScore}).`,
          });
        }
        cleaned.score = score;

        cleaned.assessedAt = toOptionalDate(raw.assessedAt, 'assessedAt', true);
        break;
      }

      case 'feedback': {
        const feedbackType = toTrimmedString(raw.feedbackType);
        const allowedTypes = ['student_satisfaction', 'faculty_feedback', 'course_feedback', 'other'];
        if (!feedbackType || !allowedTypes.includes(feedbackType)) {
          errors.push({
            field: 'feedbackType',
            message: `feedbackType is required and must be one of: ${allowedTypes.join(', ')}`,
          });
        }
        cleaned.feedbackType = feedbackType;

        const rating = toOptionalNumber(raw.rating, 'rating');
        if (rating !== null && (rating < 1 || rating > 5)) {
          errors.push({ field: 'rating', message: 'rating must be an integer between 1 and 5.' });
        }
        cleaned.rating = rating;

        cleaned.comment = toTrimmedString(raw.comment);

        const visibility = toTrimmedString(raw.visibility) || 'staff_only';
        const allowedVis = ['private', 'staff_only', 'aggregated'];
        if (!allowedVis.includes(visibility)) {
          errors.push({ field: 'visibility', message: `visibility must be one of: ${allowedVis.join(', ')}` });
        }
        cleaned.visibility = visibility;
        break;
      }

      case 'students': {
        const firstName = toTrimmedString(raw.firstName);
        if (!firstName) errors.push({ field: 'firstName', message: 'firstName is required.' });
        cleaned.firstName = firstName;

        const lastName = toTrimmedString(raw.lastName);
        if (!lastName) errors.push({ field: 'lastName', message: 'lastName is required.' });
        cleaned.lastName = lastName;

        const department = toTrimmedString(raw.department);
        if (!department) errors.push({ field: 'department', message: 'department is required.' });
        cleaned.department = department;

        const program = toTrimmedString(raw.program);
        if (!program) errors.push({ field: 'program', message: 'program is required.' });
        cleaned.program = program;

        const semester = toRequiredNumber(raw.semester, 'semester');
        if (semester < 1 || semester > 12) {
          errors.push({ field: 'semester', message: 'semester must be between 1 and 12.' });
        }
        cleaned.semester = semester;

        const enrollmentYear = toRequiredNumber(raw.enrollmentYear, 'enrollmentYear');
        if (enrollmentYear < 2000 || enrollmentYear > 2100) {
          errors.push({ field: 'enrollmentYear', message: 'enrollmentYear must be between 2000 and 2100.' });
        }
        cleaned.enrollmentYear = enrollmentYear;

        cleaned.cohort = toTrimmedString(raw.cohort);
        cleaned.institutionId = toTrimmedString(raw.institutionId) || 'INST_MAIN';
        cleaned.status = toTrimmedString(raw.status) || 'active';
        cleaned.email = toTrimmedString(raw.email);
        break;
      }
    }
  } catch (err) {
    errors.push({ field: null, message: err.message });
  }

  return {
    valid: errors.length === 0,
    cleanedRecord: errors.length === 0 ? cleaned : null,
    errors: errors.map((e) => ({
      row: rowNum,
      field: e.field,
      message: e.message,
      value: e.field && raw[e.field] !== undefined ? raw[e.field] : null,
    })),
  };
}

/**
 * Process a dataset import in dryRun (preview) or commit mode.
 */
export async function processImport({
  datasetType,
  rawRecords,
  fileName,
  uploadedBy,
  dryRun = false,
}) {
  if (!SUPPORTED_DATASET_TYPES.includes(datasetType)) {
    throw new AppError(
      `Unsupported datasetType "${datasetType}". Allowed types: ${SUPPORTED_DATASET_TYPES.join(', ')}`,
      400,
      'INVALID_DATASET_TYPE'
    );
  }

  const TargetModel = MODEL_MAP[datasetType];
  const received = rawRecords.length;

  if (received === 0) {
    return {
      importId: null,
      datasetType,
      status: 'failed',
      dryRun,
      fileName,
      counts: { received: 0, accepted: 0, rejected: 0, warnings: 0 },
      rowErrors: [{ row: 1, field: null, message: 'Dataset is empty. Zero rows received.', value: null }],
    };
  }

  // 1. Pre-fetch student IDs for relational integrity check
  const candidateStudentIds = new Set();
  rawRecords.forEach((r) => {
    const sId = toTrimmedString(r.studentId);
    if (sId) candidateStudentIds.add(sId.toUpperCase());
  });

  const existingStudentDocs =
    candidateStudentIds.size > 0
      ? await Student.find({ studentId: { $in: Array.from(candidateStudentIds) } }, 'studentId').lean()
      : [];

  const existingStudentIds = new Set(existingStudentDocs.map((s) => s.studentId));

  // 2. Validate all rows
  const acceptedRecords = [];
  const rowErrors = [];
  let rejectedCount = 0;

  rawRecords.forEach((raw, idx) => {
    const rowNum = idx + 2; // Row 1 is typically header in CSV
    const result = validateRecord(datasetType, raw, rowNum, existingStudentIds);

    if (result.valid) {
      acceptedRecords.push(result.cleanedRecord);
    } else {
      rejectedCount++;
      if (rowErrors.length < MAX_ROW_ERRORS_STORED) {
        rowErrors.push(...result.errors.slice(0, MAX_ROW_ERRORS_STORED - rowErrors.length));
      }
    }
  });

  const acceptedCount = acceptedRecords.length;
  const status =
    rejectedCount === 0
      ? 'completed'
      : acceptedCount > 0
      ? 'partially_imported'
      : 'failed';

  // 3. Dry-run branch: do not mutate database
  if (dryRun) {
    return {
      importId: `PREV_${Date.now()}`,
      datasetType,
      dryRun: true,
      fileName,
      status: rejectedCount === 0 ? 'validated' : 'validation_failed',
      counts: {
        received,
        accepted: acceptedCount,
        rejected: rejectedCount,
        warnings: 0,
      },
      acceptedCount,
      rejectedCount,
      totalRows: received,
      rowErrors,
      sampleValidRecords: acceptedRecords.slice(0, 3),
    };
  }

  // 4. Commit branch: persist records & create Import log
  const importId = `IMP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (acceptedRecords.length > 0) {
    if (datasetType === 'students') {
      const ops = acceptedRecords.map((r) => ({
        updateOne: {
          filter: { studentId: r.studentId },
          update: { $set: { ...r, sourceImportId: importId } },
          upsert: true,
        },
      }));
      await TargetModel.bulkWrite(ops);
    } else {
      const documentsToInsert = acceptedRecords.map((r) => ({
        ...r,
        sourceImportId: importId,
      }));
      await TargetModel.insertMany(documentsToInsert, { ordered: false });
    }

    // Recalculate Student Success Scores for affected students
    try {
      const affectedStudentIds = [...new Set(acceptedRecords.map((r) => r.studentId).filter(Boolean))];
      for (const sId of affectedStudentIds) {
        recalculateStudentScore(sId).catch(() => {});
      }
    } catch {
      // Non-blocking background recalculation
    }
  }

  const importDoc = new Import({
    importId,
    datasetType,
    status,
    uploadedBy,
    counts: {
      received,
      accepted: acceptedCount,
      rejected: rejectedCount,
      warnings: 0,
    },
    rowErrors,
    fileName,
    dryRun: false,
    completedAt: new Date(),
  });

  await importDoc.save();

  return {
    importId,
    datasetType,
    status,
    dryRun: false,
    fileName,
    counts: {
      received,
      accepted: acceptedCount,
      rejected: rejectedCount,
      warnings: 0,
    },
    acceptedCount,
    rejectedCount,
    totalRows: received,
    rowErrors,
    completedAt: importDoc.completedAt,
  };
}

/**
 * Retrieve import job record by importId.
 */
export async function getImportById(importId) {
  if (!importId || typeof importId !== 'string') {
    throw new AppError('A valid importId is required.', 400, 'VALIDATION_ERROR');
  }

  const importDoc = await Import.findOne({ importId: importId.trim() });
  if (!importDoc) {
    throw new AppError(`Import with ID "${importId}" not found.`, 404, 'NOT_FOUND');
  }

  return toCleanDTO(importDoc);
}

export default {
  processImport,
  getImportById,
  extractRawRecords,
  SUPPORTED_DATASET_TYPES,
};
