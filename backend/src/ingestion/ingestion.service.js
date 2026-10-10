import { parse as parseCsv } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
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
  let str = val;
  if (typeof val === 'string') {
    str = val.replace(/[%$,]/g, '').trim();
  }
  const num = Number(str);
  if (isNaN(num)) {
    return null;
  }
  return num;
}

function toRequiredNumber(val, fieldName, fallback = 0) {
  const num = toOptionalNumber(val, fieldName);
  return num !== null ? num : fallback;
}

function toOptionalDate(val, fieldName, defaultToNow = false) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return defaultToNow ? new Date() : null;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    if (typeof val === 'string') {
      const parts = val.trim().split(/[-/]/);
      if (parts.length === 3 && parts[2].length === 4) {
        const parsed = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return defaultToNow ? new Date() : null;
  }
  return d;
}

function toRequiredDate(val, fieldName) {
  const d = toOptionalDate(val, fieldName, true);
  return d || new Date();
}

function toBoolean(val, defaultVal = false) {
  if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
    return defaultVal;
  }
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  if (s === 'true' || s === '1' || s === 'yes' || s === 'y') return true;
  if (s === 'false' || s === '0' || s === 'no' || s === 'n') return false;
  return defaultVal;
}

/**
 * Normalizes case, spacing, and field synonyms in raw CSV/JSON records so that
 * departmental ERP exports map seamlessly into canonical system properties.
 */
export function normalizeRecordKeys(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const normalized = { ...raw };

  const cleanKeyMap = {};
  for (const k of Object.keys(raw)) {
    const simpleKey = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    cleanKeyMap[simpleKey] = raw[k];
  }

  const getVal = (...keys) => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null && String(raw[key]).trim() !== '') return raw[key];
      const simple = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanKeyMap[simple] !== undefined && cleanKeyMap[simple] !== null && String(cleanKeyMap[simple]).trim() !== '') {
        return cleanKeyMap[simple];
      }
    }
    return undefined;
  };

  // Student Identifier
  const sId = getVal('studentId', 'student_id', 'studentID', 'rollNo', 'rollNumber', 'usn', 'registrationNo', 'id');
  if (sId !== undefined) normalized.studentId = sId;

  // Academic Examinations
  const term = getVal('term', 'semesterTerm', 'academicTerm', 'session');
  if (term !== undefined) normalized.term = term;

  const subjectCode = getVal('subjectCode', 'subject_code', 'courseCode', 'course_code', 'subCode');
  if (subjectCode !== undefined) normalized.subjectCode = subjectCode;

  const subjectName = getVal('subjectName', 'subject_name', 'courseName', 'course_name', 'subject');
  if (subjectName !== undefined) normalized.subjectName = subjectName;

  const assessmentType = getVal('assessmentType', 'assessment_type', 'examType', 'exam_type', 'testType');
  if (assessmentType !== undefined) normalized.assessmentType = assessmentType;

  const marksObtained = getVal('marksObtained', 'marks_obtained', 'marks', 'score', 'marksScored');
  if (marksObtained !== undefined) normalized.marksObtained = marksObtained;

  const maxMarks = getVal('maxMarks', 'max_marks', 'maximumMarks', 'totalMarks', 'outOf');
  if (maxMarks !== undefined) normalized.maxMarks = maxMarks;

  const grade = getVal('grade', 'letterGrade');
  if (grade !== undefined) normalized.grade = grade;

  const cgpa = getVal('cgpa', 'sgpa', 'gpa');
  if (cgpa !== undefined) normalized.cgpa = cgpa;

  const backlog = getVal('backlog', 'hasBacklog', 'isBacklog', 'arrear');
  if (backlog !== undefined) normalized.backlog = backlog;

  // Attendance Telemetry
  const classesHeld = getVal('classesHeld', 'classes_held', 'totalClasses', 'sessionsHeld', 'totalLectures');
  if (classesHeld !== undefined) normalized.classesHeld = classesHeld;

  const classesAttended = getVal('classesAttended', 'classes_attended', 'lecturesAttended', 'attended');
  if (classesAttended !== undefined) normalized.classesAttended = classesAttended;

  const attendancePercentage = getVal('attendancePercentage', 'attendance_percentage', 'attendance', 'percentage', 'attendancePct');
  if (attendancePercentage !== undefined) normalized.attendancePercentage = attendancePercentage;

  // LMS Digital Learning
  const periodStart = getVal('periodStart', 'period_start', 'startDate', 'from');
  if (periodStart !== undefined) normalized.periodStart = periodStart;

  const periodEnd = getVal('periodEnd', 'period_end', 'endDate', 'to');
  if (periodEnd !== undefined) normalized.periodEnd = periodEnd;

  const loginCount = getVal('loginCount', 'login_count', 'logins', 'visits');
  if (loginCount !== undefined) normalized.loginCount = loginCount;

  const activeDays = getVal('activeDays', 'active_days', 'daysActive');
  if (activeDays !== undefined) normalized.activeDays = activeDays;

  const assignmentsAssigned = getVal('assignmentsAssigned', 'assignments_assigned', 'totalAssignments');
  if (assignmentsAssigned !== undefined) normalized.assignmentsAssigned = assignmentsAssigned;

  const assignmentsCompleted = getVal('assignmentsCompleted', 'assignments_completed', 'submittedAssignments', 'completedAssignments');
  if (assignmentsCompleted !== undefined) normalized.assignmentsCompleted = assignmentsCompleted;

  const engagementMinutes = getVal('engagementMinutes', 'engagement_minutes', 'timeSpentMinutes', 'minutesSpent', 'timeSpent');
  if (engagementMinutes !== undefined) normalized.engagementMinutes = engagementMinutes;

  // Placement Drives & Tests
  const score = getVal('score', 'marks', 'rating', 'points');
  if (score !== undefined) normalized.score = score;

  const maxScore = getVal('maxScore', 'max_score', 'totalScore', 'maximumScore');
  if (maxScore !== undefined) normalized.maxScore = maxScore;

  const outcomeLabel = getVal('outcomeLabel', 'outcome_label', 'outcome', 'result', 'status');
  if (outcomeLabel !== undefined) normalized.outcomeLabel = outcomeLabel;

  const employerOrProgram = getVal('employerOrProgram', 'employer_or_program', 'company', 'employer', 'programName');
  if (employerOrProgram !== undefined) normalized.employerOrProgram = employerOrProgram;

  // Skill & Lab Assessments
  const skillCategory = getVal('skillCategory', 'skill_category', 'category', 'type');
  if (skillCategory !== undefined) normalized.skillCategory = skillCategory;

  const skillName = getVal('skillName', 'skill_name', 'skill', 'topic');
  if (skillName !== undefined) normalized.skillName = skillName;

  // Co-Curricular Engagement
  const activityType = getVal('activityType', 'activity_type', 'category', 'eventType');
  if (activityType !== undefined) normalized.activityType = activityType;

  const activityName = getVal('activityName', 'activity_name', 'activity', 'eventName', 'title');
  if (activityName !== undefined) normalized.activityName = activityName;

  const hours = getVal('hours', 'hoursSpent', 'durationHours', 'duration');
  if (hours !== undefined) normalized.hours = hours;

  const result = getVal('result', 'position', 'achievement', 'outcome');
  if (result !== undefined) normalized.result = result;

  // Feedback & Course Ratings
  const feedbackType = getVal('feedbackType', 'feedback_type', 'surveyType');
  if (feedbackType !== undefined) normalized.feedbackType = feedbackType;

  const rating = getVal('rating', 'score', 'stars');
  if (rating !== undefined) normalized.rating = rating;

  const comment = getVal('comment', 'feedback', 'remarks', 'review');
  if (comment !== undefined) normalized.comment = comment;

  const visibility = getVal('visibility', 'access');
  if (visibility !== undefined) normalized.visibility = visibility;

  // Student Roster Onboarding
  const firstName = getVal('firstName', 'first_name', 'fname');
  if (firstName !== undefined) normalized.firstName = firstName;

  const lastName = getVal('lastName', 'last_name', 'lname');
  if (lastName !== undefined) normalized.lastName = lastName;

  const fullName = getVal('name', 'fullName', 'full_name', 'studentName', 'student_name');
  if (fullName !== undefined) normalized.fullName = fullName;

  const department = getVal('department', 'dept', 'branch');
  if (department !== undefined) normalized.department = department;

  const program = getVal('program', 'degree', 'course');
  if (program !== undefined) normalized.program = program;

  const semester = getVal('semester', 'sem', 'currentSemester');
  if (semester !== undefined) normalized.semester = semester;

  const enrollmentYear = getVal('enrollmentYear', 'enrollment_year', 'batch', 'year', 'admissionYear');
  if (enrollmentYear !== undefined) normalized.enrollmentYear = enrollmentYear;

  const cohort = getVal('cohort', 'batchName', 'section');
  if (cohort !== undefined) normalized.cohort = cohort;

  const email = getVal('email', 'emailId', 'studentEmail');
  if (email !== undefined) normalized.email = email;

  return normalized;
}

/**
 * Parses raw input from request into an array of raw record objects.
 * Supports:
 * - JSON: { records: [...] } or direct array [...]
 * - CSV: Buffer/String via multer file upload or { csv: "..." }
 */
export function extractRawRecords(req) {
  try {
    // Case 1: Multer file uploaded (Excel or CSV)
    if (req.file && req.file.buffer) {
      const origName = req.file.originalname || 'upload.csv';
      const isExcel = /\.(xlsx|xls)$/i.test(origName);

      if (isExcel) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
          throw new AppError('Uploaded Excel file contains no readable sheets.', 400, 'MALFORMED_EXCEL');
        }
        const records = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: null });
        return { records, fileName: origName };
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const records = parseCsv(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });
      return { records, fileName: origName };
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
    if (err instanceof AppError) throw err;
    throw new AppError(`Malformed file payload: ${err.message}`, 400, 'MALFORMED_FILE');
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
function validateRecord(datasetType, raw, rowNum, existingStudentIds, options = {}) {
  const errors = [];

  const rawStudentId = toTrimmedString(raw.studentId);
  if (!rawStudentId) {
    errors.push({ field: 'studentId', message: 'studentId is required.' });
  }

  const studentId = rawStudentId ? rawStudentId.toUpperCase() : null;

  // Student existence check (except when importing students themselves)
  if (studentId && datasetType !== 'students') {
    if (!existingStudentIds.has(studentId)) {
      if (options.autoProvision === false) {
        errors.push({
          field: 'studentId',
          message: `Student with ID "${studentId}" does not exist in the system.`,
        });
      }
    }
  }

  const cleaned = { studentId };

  try {
    switch (datasetType) {
      case 'academic': {
        cleaned.term = toTrimmedString(raw.term) || '2025-S1';
        cleaned.subjectCode = toTrimmedString(raw.subjectCode) || 'GEN101';
        cleaned.subjectName = toTrimmedString(raw.subjectName) || cleaned.subjectCode;

        let rawAssessment = toTrimmedString(raw.assessmentType)?.toLowerCase() || '';
        let assessmentType = 'final';
        if (rawAssessment) {
          if (rawAssessment.includes('mid')) {
            assessmentType = 'midterm';
          } else if (rawAssessment.includes('fin') || rawAssessment.includes('end') || rawAssessment.includes('sem') || rawAssessment.includes('exam')) {
            assessmentType = 'final';
          } else if (rawAssessment.includes('int') || rawAssessment.includes('cia') || rawAssessment.includes('unit')) {
            assessmentType = 'internal';
          } else if (rawAssessment.includes('quiz') || rawAssessment.includes('test')) {
            assessmentType = 'quiz';
          } else if (rawAssessment.includes('assign')) {
            assessmentType = 'assignment';
          } else if (rawAssessment.includes('prac') || rawAssessment.includes('lab')) {
            assessmentType = 'practical';
          } else if (['internal', 'midterm', 'final', 'quiz', 'assignment', 'practical', 'other'].includes(rawAssessment)) {
            assessmentType = rawAssessment;
          } else {
            assessmentType = 'other';
          }
        }
        cleaned.assessmentType = assessmentType;

        let marksObtained = toOptionalNumber(raw.marksObtained, 'marksObtained') ?? 0;
        if (marksObtained < 0) marksObtained = 0;
        cleaned.marksObtained = marksObtained;

        let maxMarks = toOptionalNumber(raw.maxMarks, 'maxMarks') ?? 100;
        if (maxMarks < 1) maxMarks = 100;
        if (marksObtained > maxMarks) {
          maxMarks = marksObtained > 100 ? marksObtained : 100;
        }
        cleaned.maxMarks = maxMarks;

        let grade = toTrimmedString(raw.grade);
        if (!grade) {
          const pct = (marksObtained / maxMarks) * 100;
          if (pct >= 90) grade = 'A+';
          else if (pct >= 80) grade = 'A';
          else if (pct >= 70) grade = 'B+';
          else if (pct >= 60) grade = 'B';
          else if (pct >= 50) grade = 'C';
          else grade = 'F';
        }
        cleaned.grade = grade;

        let cgpa = toOptionalNumber(raw.cgpa, 'cgpa');
        if (cgpa === null || cgpa < 0 || cgpa > 10) {
          cgpa = parseFloat(((marksObtained / maxMarks) * 10).toFixed(2));
        }
        cleaned.cgpa = cgpa;

        cleaned.backlog = toBoolean(raw.backlog, marksObtained < maxMarks * 0.4);
        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'attendance': {
        cleaned.term = toTrimmedString(raw.term) || '2025-S1';
        cleaned.subjectCode = toTrimmedString(raw.subjectCode) || 'GEN101';

        let classesHeld = toOptionalNumber(raw.classesHeld, 'classesHeld') ?? 50;
        if (classesHeld < 1) classesHeld = 50;

        let rawPct = raw.attendancePercentage;
        if (typeof rawPct === 'string') rawPct = rawPct.replace('%', '').trim();
        let attendancePercentage = toOptionalNumber(rawPct, 'attendancePercentage');

        let classesAttended = toOptionalNumber(raw.classesAttended, 'classesAttended');
        if (classesAttended === null) {
          if (attendancePercentage !== null) {
            classesAttended = Math.round((Math.min(100, attendancePercentage) / 100) * classesHeld);
          } else {
            classesAttended = Math.round(classesHeld * 0.85);
          }
        }
        if (classesAttended < 0) classesAttended = 0;
        if (classesAttended > classesHeld) classesHeld = classesAttended;

        if (attendancePercentage === null) {
          attendancePercentage = parseFloat(((classesAttended / classesHeld) * 100).toFixed(2));
        } else if (attendancePercentage <= 1 && attendancePercentage > 0) {
          attendancePercentage = parseFloat((attendancePercentage * 100).toFixed(2));
        } else if (attendancePercentage > 100) {
          attendancePercentage = 100;
        }

        cleaned.classesHeld = classesHeld;
        cleaned.classesAttended = classesAttended;
        cleaned.attendancePercentage = attendancePercentage;
        cleaned.periodStart = toOptionalDate(raw.periodStart, 'periodStart');
        cleaned.periodEnd = toOptionalDate(raw.periodEnd, 'periodEnd');
        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'lms': {
        let periodStart = toOptionalDate(raw.periodStart, 'periodStart');
        let periodEnd = toOptionalDate(raw.periodEnd, 'periodEnd');
        if (!periodStart) {
          periodStart = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        }
        if (!periodEnd) {
          periodEnd = new Date();
        }
        if (periodEnd < periodStart) {
          const tmp = periodStart;
          periodStart = periodEnd;
          periodEnd = tmp;
        }
        cleaned.periodStart = periodStart;
        cleaned.periodEnd = periodEnd;

        let loginCount = toOptionalNumber(raw.loginCount, 'loginCount') ?? 25;
        if (loginCount < 0) loginCount = 0;
        cleaned.loginCount = loginCount;

        let activeDays = toOptionalNumber(raw.activeDays, 'activeDays') ?? Math.min(loginCount, 20);
        if (activeDays < 0) activeDays = 0;
        cleaned.activeDays = activeDays;

        let assignmentsAssigned = toOptionalNumber(raw.assignmentsAssigned, 'assignmentsAssigned') ?? 10;
        if (assignmentsAssigned < 0) assignmentsAssigned = 0;

        let assignmentsCompleted = toOptionalNumber(raw.assignmentsCompleted, 'assignmentsCompleted') ?? 8;
        if (assignmentsCompleted < 0) assignmentsCompleted = 0;
        if (assignmentsCompleted > assignmentsAssigned) {
          assignmentsAssigned = assignmentsCompleted;
        }
        cleaned.assignmentsAssigned = assignmentsAssigned;
        cleaned.assignmentsCompleted = assignmentsCompleted;

        let engagementMinutes = toOptionalNumber(raw.engagementMinutes, 'engagementMinutes') ?? 600;
        if (engagementMinutes < 0) engagementMinutes = 0;
        cleaned.engagementMinutes = engagementMinutes;

        cleaned.observedAt = toOptionalDate(raw.observedAt, 'observedAt', true);
        break;
      }

      case 'placement': {
        const rawAssessment = toTrimmedString(raw.assessmentType)?.toLowerCase() || '';
        let assessmentType = 'aptitude';
        if (rawAssessment) {
          if (rawAssessment.includes('apt') || rawAssessment.includes('quant') || rawAssessment.includes('logic') || rawAssessment.includes('reason')) {
            assessmentType = 'aptitude';
          } else if (rawAssessment.includes('cod') || rawAssessment.includes('hack') || rawAssessment.includes('dsa') || rawAssessment.includes('leet') || rawAssessment.includes('prog')) {
            assessmentType = 'coding';
          } else if (rawAssessment.includes('mock') || rawAssessment.includes('interv') || rawAssessment.includes('tech') || rawAssessment.includes('hr')) {
            assessmentType = 'mock_interview';
          } else if (rawAssessment.includes('gd') || rawAssessment.includes('group') || rawAssessment.includes('discuss')) {
            assessmentType = 'group_discussion';
          } else if (rawAssessment.includes('outcome') || rawAssessment.includes('placed') || rawAssessment.includes('offer') || rawAssessment.includes('select')) {
            assessmentType = 'placement_outcome';
          } else if (rawAssessment.includes('read') || rawAssessment.includes('prep') || rawAssessment.includes('eval')) {
            assessmentType = 'readiness';
          } else if (['aptitude', 'coding', 'mock_interview', 'placement_outcome', 'readiness', 'group_discussion', 'other'].includes(rawAssessment)) {
            assessmentType = rawAssessment;
          } else {
            assessmentType = 'other';
          }
        }
        cleaned.assessmentType = assessmentType;

        let maxScore = toOptionalNumber(raw.maxScore, 'maxScore') ?? 100;
        if (maxScore < 1) maxScore = 100;

        let score = toOptionalNumber(raw.score, 'score');
        if (score === null) score = 75;
        if (score < 0) score = 0;
        if (score > maxScore) {
          maxScore = score > 100 ? score : 100;
        }
        cleaned.maxScore = maxScore;
        cleaned.score = score;

        let outcomeLabel = toTrimmedString(raw.outcomeLabel);
        if (!outcomeLabel) {
          outcomeLabel = score >= (maxScore * 0.6) ? 'Cleared' : 'Needs Preparation';
        }
        cleaned.outcomeLabel = outcomeLabel;

        cleaned.employerOrProgram = toTrimmedString(raw.employerOrProgram) || 'Campus Placement Drive';
        cleaned.assessedAt = toOptionalDate(raw.assessedAt, 'assessedAt', true);
        break;
      }

      case 'skills': {
        const rawCategory = toTrimmedString(raw.skillCategory)?.toLowerCase() || '';
        let skillCategory = 'technical';
        if (rawCategory) {
          if (rawCategory.includes('soft') || rawCategory.includes('comm') || rawCategory.includes('lead') || rawCategory.includes('behav') || rawCategory.includes('pres')) {
            skillCategory = 'soft_skill';
          } else if (rawCategory.includes('tech') || rawCategory.includes('code') || rawCategory.includes('prog') || rawCategory.includes('dev') || rawCategory.includes('lab') || rawCategory.includes('dsa') || rawCategory.includes('hard') || rawCategory.includes('eng')) {
            skillCategory = 'technical';
          } else if (['technical', 'soft_skill'].includes(rawCategory)) {
            skillCategory = rawCategory;
          } else {
            skillCategory = 'technical';
          }
        }
        cleaned.skillCategory = skillCategory;

        cleaned.skillName = toTrimmedString(raw.skillName) || 'Core Technical Competency';

        let maxScore = toOptionalNumber(raw.maxScore, 'maxScore') ?? 100;
        if (maxScore < 1) maxScore = 100;

        let score = toOptionalNumber(raw.score, 'score') ?? 70;
        if (score < 0) score = 0;
        if (score > maxScore) {
          maxScore = score > 100 ? score : 100;
        }
        cleaned.maxScore = maxScore;
        cleaned.score = score;

        cleaned.assessedAt = toOptionalDate(raw.assessedAt, 'assessedAt', true);
        break;
      }

      case 'engagement': {
        const rawActivity = toTrimmedString(raw.activityType)?.toLowerCase() || '';
        let activityType = 'event';
        if (rawActivity) {
          if (rawActivity.includes('hack')) {
            activityType = 'hackathon';
          } else if (rawActivity.includes('sport') || rawActivity.includes('game') || rawActivity.includes('ath') || rawActivity.includes('cricket') || rawActivity.includes('football')) {
            activityType = 'sports';
          } else if (rawActivity.includes('work') || rawActivity.includes('seminar') || rawActivity.includes('train') || rawActivity.includes('bootcamp')) {
            activityType = 'workshop';
          } else if (rawActivity.includes('cert') || rawActivity.includes('course') || rawActivity.includes('license')) {
            activityType = 'certification';
          } else if (rawActivity.includes('club') || rawActivity.includes('soc') || rawActivity.includes('chap') || rawActivity.includes('council')) {
            activityType = 'club';
          } else if (rawActivity.includes('event') || rawActivity.includes('fest') || rawActivity.includes('cult')) {
            activityType = 'event';
          } else if (['event', 'club', 'hackathon', 'certification', 'workshop', 'sports', 'other'].includes(rawActivity)) {
            activityType = rawActivity;
          } else {
            activityType = 'other';
          }
        }
        cleaned.activityType = activityType;

        cleaned.activityName = toTrimmedString(raw.activityName) || 'Campus Co-Curricular Activity';

        let hours = toOptionalNumber(raw.hours, 'hours') ?? 10;
        if (hours < 0) hours = 0;
        cleaned.hours = hours;

        cleaned.result = toTrimmedString(raw.result) || 'Completed';
        cleaned.occurredAt = toOptionalDate(raw.occurredAt, 'occurredAt', true);
        break;
      }

      case 'feedback': {
        const rawFeedback = toTrimmedString(raw.feedbackType)?.toLowerCase() || '';
        let feedbackType = 'course_feedback';
        if (rawFeedback) {
          if (rawFeedback.includes('fac') || rawFeedback.includes('teach') || rawFeedback.includes('prof') || rawFeedback.includes('mentor')) {
            feedbackType = 'faculty_feedback';
          } else if (rawFeedback.includes('course') || rawFeedback.includes('subj') || rawFeedback.includes('curr') || rawFeedback.includes('class')) {
            feedbackType = 'course_feedback';
          } else if (rawFeedback.includes('satis') || rawFeedback.includes('stud') || rawFeedback.includes('eval') || rawFeedback.includes('campus')) {
            feedbackType = 'student_satisfaction';
          } else if (['student_satisfaction', 'faculty_feedback', 'course_feedback', 'other'].includes(rawFeedback)) {
            feedbackType = rawFeedback;
          } else {
            feedbackType = 'other';
          }
        }
        cleaned.feedbackType = feedbackType;

        let rating = toOptionalNumber(raw.rating, 'rating');
        if (rating === null) rating = 4;
        if (rating > 5) {
          if (rating <= 10) rating = Math.round(rating / 2);
          else if (rating <= 100) rating = Math.round((rating / 100) * 5);
          else rating = 5;
        }
        if (rating < 1) rating = 1;
        cleaned.rating = Math.round(rating);

        cleaned.comment = toTrimmedString(raw.comment) || 'Constructive academic feedback.';

        const rawVis = toTrimmedString(raw.visibility)?.toLowerCase() || '';
        let visibility = 'staff_only';
        if (rawVis.includes('priv')) visibility = 'private';
        else if (rawVis.includes('agg')) visibility = 'aggregated';
        else if (['private', 'staff_only', 'aggregated'].includes(rawVis)) visibility = rawVis;
        cleaned.visibility = visibility;
        break;
      }

      case 'students': {
        let firstName = toTrimmedString(raw.firstName);
        let lastName = toTrimmedString(raw.lastName);

        if (!firstName && raw.fullName) {
          const parts = toTrimmedString(raw.fullName).split(/\s+/);
          firstName = parts[0] || 'Student';
          lastName = parts.slice(1).join(' ') || '-';
        } else if (!firstName) {
          firstName = 'Student';
        }
        if (!lastName) {
          lastName = '-';
        }
        cleaned.firstName = firstName;
        cleaned.lastName = lastName;

        cleaned.department = toTrimmedString(raw.department) || 'Computer Science';
        cleaned.program = toTrimmedString(raw.program) || 'B.Tech';

        let semester = toOptionalNumber(raw.semester, 'semester') ?? 1;
        if (semester < 1 || semester > 12) semester = Math.min(12, Math.max(1, semester));
        cleaned.semester = semester;

        let enrollmentYear = toOptionalNumber(raw.enrollmentYear, 'enrollmentYear') ?? new Date().getFullYear();
        if (enrollmentYear < 2000 || enrollmentYear > 2100) enrollmentYear = new Date().getFullYear();
        cleaned.enrollmentYear = enrollmentYear;

        cleaned.cohort = toTrimmedString(raw.cohort) || `Cohort-${enrollmentYear}-${cleaned.department.substring(0, 3).toUpperCase()}`;
        cleaned.institutionId = toTrimmedString(raw.institutionId) || 'INST_MAIN';
        cleaned.status = toTrimmedString(raw.status) || 'active';
        cleaned.email = toTrimmedString(raw.email) || `${cleaned.studentId.toLowerCase()}@campus.edu`;
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
  autoProvision = true,
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

  // Pre-normalize all record keys to canonical camelCase schemas
  const normalizedRecords = rawRecords.map(normalizeRecordKeys);

  // 1. Pre-fetch student IDs for relational integrity check
  const candidateStudentIds = new Set();
  normalizedRecords.forEach((r) => {
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

  normalizedRecords.forEach((raw, idx) => {
    const rowNum = idx + 2; // Row 1 is typically header in CSV
    const result = validateRecord(datasetType, raw, rowNum, existingStudentIds, { autoProvision });

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
      // Auto-provision any students that don't yet exist in the Student collection
      if (autoProvision) {
        const affectedStudentIds = [...new Set(acceptedRecords.map((r) => r.studentId).filter(Boolean))];
        const existingDocs = await Student.find({ studentId: { $in: affectedStudentIds } }, 'studentId').lean();
        const existingSet = new Set(existingDocs.map((s) => s.studentId));
        const missing = affectedStudentIds.filter((id) => !existingSet.has(id));

        if (missing.length > 0) {
          const autoDocs = missing.map((sId) => ({
            studentId: sId,
            firstName: 'Student',
            lastName: sId,
            department: 'Computer Science',
            program: 'B.Tech',
            semester: 5,
            enrollmentYear: 2023,
            cohort: '2023-2027',
            institutionId: 'INST_MAIN',
            status: 'active',
            sourceImportId: importId,
          }));
          await Student.insertMany(autoDocs, { ordered: false }).catch(() => {});
        }
      }

      const documentsToInsert = acceptedRecords.map((r) => ({
        ...r,
        sourceImportId: importId,
      }));
      await TargetModel.insertMany(documentsToInsert, { ordered: false });
    }

    // Recalculate Student Success Scores for affected students synchronously
    try {
      const affectedStudentIds = [...new Set(acceptedRecords.map((r) => r.studentId).filter(Boolean))];
      await Promise.all(
        affectedStudentIds.map((sId) => recalculateStudentScore(sId).catch(() => {}))
      );
    } catch {
      // Non-blocking background recalculation fallback
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
