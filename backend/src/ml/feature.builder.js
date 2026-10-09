/**
 * ML Feature Builder
 * Version: fs-v1
 *
 * Extracts the exact 17 features required by the trained models (model_metadata.json)
 * using historical data available strictly on or before asOfDate (prevents target leakage).
 */

export const FEATURE_SET_VERSION = 'fs-v1';

export const FEATURE_NAMES = [
  'cgpa',
  'backlogs',
  'overall_attendance_pct',
  'lms_assignment_completion_pct',
  'lms_logins_per_week',
  'aptitude_score',
  'coding_skills',
  'dsa_score',
  'system_design',
  'internships',
  'projects_count',
  'certifications',
  'hackathons',
  'open_source',
  'communication_skills',
  'ml_knowledge',
  'faculty_feedback_rating',
];

/**
 * Filter an array of records to include only items observed on or before asOfDate.
 */
function filterAsOf(records = [], asOfDate, dateField = 'observedAt') {
  if (!Array.isArray(records)) return [];
  const cutoff = asOfDate ? new Date(asOfDate) : new Date();
  return records.filter((r) => {
    const recordDate = r[dateField] || r.createdAt || r.occurredAt || r.assessedAt;
    return recordDate ? new Date(recordDate) <= cutoff : true;
  });
}

/**
 * Build 17-feature vector from student category records.
 */
export function buildStudentFeatures({
  studentId,
  asOfDate = new Date(),
  academic = [],
  attendance = [],
  lms = [],
  placement = [],
  skills = [],
  engagement = [],
  feedback = [],
} = {}) {
  const cutoff = new Date(asOfDate);

  // 1. Filter each category by asOfDate
  const filteredAcademic = filterAsOf(academic, cutoff, 'observedAt');
  const filteredAttendance = filterAsOf(attendance, cutoff, 'observedAt');
  const filteredLms = filterAsOf(lms, cutoff, 'periodStart');
  const filteredPlacement = filterAsOf(placement, cutoff, 'assessedAt');
  const filteredSkills = filterAsOf(skills, cutoff, 'assessedAt');
  const filteredEngagement = filterAsOf(engagement, cutoff, 'occurredAt');
  const filteredFeedback = filterAsOf(feedback, cutoff, 'createdAt');

  // Track watermarks (latest record timestamp in each domain)
  const sourceRecordWatermarks = {
    academic: filteredAcademic[0]?.observedAt || null,
    attendance: filteredAttendance[0]?.observedAt || null,
    lms: filteredLms[0]?.periodStart || null,
    placement: filteredPlacement[0]?.assessedAt || null,
    skills: filteredSkills[0]?.assessedAt || null,
    engagement: filteredEngagement[0]?.occurredAt || null,
    feedback: filteredFeedback[0]?.createdAt || null,
  };

  // --- Feature 1: cgpa ---
  let cgpa = 6.5;
  const withCgpa = filteredAcademic.find((r) => r.cgpa != null);
  if (withCgpa) {
    cgpa = withCgpa.cgpa;
  } else if (filteredAcademic.length > 0) {
    let totObtained = 0, totMax = 0;
    filteredAcademic.forEach((r) => {
      if (r.marksObtained != null && r.maxMarks) {
        totObtained += r.marksObtained;
        totMax += r.maxMarks;
      }
    });
    if (totMax > 0) cgpa = (totObtained / totMax) * 10;
  }

  // --- Feature 2: backlogs ---
  const backlogs = filteredAcademic.filter((r) => r.backlog === true).length;

  // --- Feature 3: overall_attendance_pct ---
  let overall_attendance_pct = 75.0;
  let totalAttended = 0, totalHeld = 0;
  filteredAttendance.forEach((r) => {
    if (r.classesAttended != null && r.classesHeld) {
      totalAttended += r.classesAttended;
      totalHeld += r.classesHeld;
    }
  });
  if (totalHeld > 0) {
    overall_attendance_pct = (totalAttended / totalHeld) * 100;
  } else if (filteredAttendance[0]?.attendancePercentage != null) {
    overall_attendance_pct = filteredAttendance[0].attendancePercentage;
  }

  // --- Feature 4 & 5: LMS ---
  let lms_assignment_completion_pct = 70.0;
  let lms_logins_per_week = 4.0;
  let totAssigned = 0, totCompleted = 0, totLogins = 0;
  filteredLms.forEach((r) => {
    totAssigned += r.assignmentsAssigned || 0;
    totCompleted += r.assignmentsCompleted || 0;
    totLogins += r.loginCount || 0;
  });
  if (totAssigned > 0) {
    lms_assignment_completion_pct = (totCompleted / totAssigned) * 100;
  }
  if (filteredLms.length > 0) {
    lms_logins_per_week = Math.max(0, totLogins / (filteredLms.length * 4));
  }

  // --- Feature 6: aptitude_score ---
  let aptitude_score = 65.0;
  const aptRec = filteredPlacement.find((r) => r.assessmentType === 'aptitude' && r.score != null);
  if (aptRec) {
    const max = aptRec.maxScore || 100;
    aptitude_score = (aptRec.score / max) * 100;
  }

  // --- Feature 7: coding_skills (0..10 scale) ---
  let coding_skills = 6.0;
  const codeRec = filteredPlacement.find((r) => r.assessmentType === 'coding' && r.score != null);
  if (codeRec) {
    const max = codeRec.maxScore || 100;
    coding_skills = (codeRec.score / max) * 10;
  } else {
    const codingSkill = filteredSkills.find((r) => /code|coding|python|java|cpp/i.test(r.skillName));
    if (codingSkill && codingSkill.score != null) {
      coding_skills = (codingSkill.score / (codingSkill.maxScore || 100)) * 10;
    }
  }

  // --- Feature 8: dsa_score (0..10 scale) ---
  let dsa_score = 5.5;
  const dsaSkill = filteredSkills.find((r) => /dsa|data structure|algorithm/i.test(r.skillName));
  if (dsaSkill && dsaSkill.score != null) {
    dsa_score = (dsaSkill.score / (dsaSkill.maxScore || 100)) * 10;
  }

  // --- Feature 9: system_design (0..10 scale) ---
  let system_design = 5.0;
  const sysSkill = filteredSkills.find((r) => /system design|architecture/i.test(r.skillName));
  if (sysSkill && sysSkill.score != null) {
    system_design = (sysSkill.score / (sysSkill.maxScore || 100)) * 10;
  }

  // --- Feature 10: internships ---
  const internships = filteredEngagement.filter((r) => /intern/i.test(r.activityType) || /intern/i.test(r.activityName)).length;

  // --- Feature 11: projects_count ---
  const projects_count = Math.max(
    1,
    filteredEngagement.filter((r) => /project|capstone/i.test(r.activityName)).length
  );

  // --- Feature 12: certifications ---
  const certifications = filteredEngagement.filter((r) => r.activityType === 'certification' || /cert/i.test(r.activityName)).length;

  // --- Feature 13: hackathons ---
  const hackathons = filteredEngagement.filter((r) => r.activityType === 'hackathon' || /hackathon/i.test(r.activityName)).length;

  // --- Feature 14: open_source ---
  const open_source = filteredEngagement.filter((r) => /open source|github|git/i.test(r.activityName)).length;

  // --- Feature 15: communication_skills (0..10 scale) ---
  let communication_skills = 6.5;
  const commSkill = filteredSkills.find((r) => r.skillCategory === 'soft_skill' || /comm|soft/i.test(r.skillName));
  if (commSkill && commSkill.score != null) {
    communication_skills = (commSkill.score / (commSkill.maxScore || 100)) * 10;
  }

  // --- Feature 16: ml_knowledge (0..10 scale) ---
  let ml_knowledge = 4.0;
  const mlSkill = filteredSkills.find((r) => /ml|machine learning|ai|deep learning/i.test(r.skillName));
  if (mlSkill && mlSkill.score != null) {
    ml_knowledge = (mlSkill.score / (mlSkill.maxScore || 100)) * 10;
  }

  // --- Feature 17: faculty_feedback_rating (1..5 scale) ---
  let faculty_feedback_rating = 3.5;
  const facultyFeedback = filteredFeedback.filter((r) => r.feedbackType === 'faculty_feedback' && r.rating != null);
  if (facultyFeedback.length > 0) {
    const sum = facultyFeedback.reduce((a, b) => a + b.rating, 0);
    faculty_feedback_rating = sum / facultyFeedback.length;
  }

  const features = {
    cgpa: Math.round(cgpa * 100) / 100,
    backlogs: Math.round(backlogs),
    overall_attendance_pct: Math.round(overall_attendance_pct * 10) / 10,
    lms_assignment_completion_pct: Math.round(lms_assignment_completion_pct * 10) / 10,
    lms_logins_per_week: Math.round(lms_logins_per_week * 10) / 10,
    aptitude_score: Math.round(aptitude_score * 10) / 10,
    coding_skills: Math.round(coding_skills * 10) / 10,
    dsa_score: Math.round(dsa_score * 10) / 10,
    system_design: Math.round(system_design * 10) / 10,
    internships: Math.round(internships),
    projects_count: Math.round(projects_count),
    certifications: Math.round(certifications),
    hackathons: Math.round(hackathons),
    open_source: Math.round(open_source),
    communication_skills: Math.round(communication_skills * 10) / 10,
    ml_knowledge: Math.round(ml_knowledge * 10) / 10,
    faculty_feedback_rating: Math.round(faculty_feedback_rating * 10) / 10,
  };

  return {
    studentId,
    featureSetVersion: FEATURE_SET_VERSION,
    asOfDate: cutoff,
    features,
    sourceRecordWatermarks,
  };
}

export default {
  buildStudentFeatures,
  FEATURE_SET_VERSION,
  FEATURE_NAMES,
};
