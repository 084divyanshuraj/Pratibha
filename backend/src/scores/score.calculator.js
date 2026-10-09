/**
 * Student Success Score (SSS) - Formula Engine
 * Version: sss-v1
 *
 * Rules:
 * - Deterministic, transparent composite indicator (0.0 - 100.0).
 * - NOT a probability.
 * - Never silently zero missing data. If a domain is missing, weights renormalize
 *   across available components, and missingFields tracks omissions explicitly.
 * - Computes explainable contribution drivers for institution and student views.
 */

export const FORMULA_VERSION = 'sss-v1';

export const BASE_WEIGHTS = {
  academic: 0.35,
  attendance: 0.20,
  lms: 0.15,
  placement_skills: 0.20,
  engagement: 0.10,
};

/**
 * Normalize Academic performance into 0..100.
 * Priority: CGPA (out of 10) or marks percentage, adjusted for active backlogs.
 */
export function evaluateAcademic(academicRecords = []) {
  if (!Array.isArray(academicRecords) || academicRecords.length === 0) {
    return null;
  }

  // 1. Check for CGPA
  const recordsWithCgpa = academicRecords.filter((r) => r.cgpa != null && !isNaN(r.cgpa));
  let baseScore = null;
  let rawDisplay = '';

  if (recordsWithCgpa.length > 0) {
    // Latest observed CGPA
    const latestCgpa = recordsWithCgpa[0].cgpa;
    baseScore = (latestCgpa / 10.0) * 100;
    rawDisplay = `CGPA ${latestCgpa.toFixed(2)}/10`;
  } else {
    // Fallback: Marks percentage across subjects
    let totalObtained = 0;
    let totalMax = 0;
    academicRecords.forEach((r) => {
      if (r.marksObtained != null && r.maxMarks != null && r.maxMarks > 0) {
        totalObtained += r.marksObtained;
        totalMax += r.maxMarks;
      }
    });

    if (totalMax > 0) {
      baseScore = (totalObtained / totalMax) * 100;
      rawDisplay = `${((totalObtained / totalMax) * 100).toFixed(1)}% marks`;
    }
  }

  if (baseScore === null) {
    return null;
  }

  // Count active backlogs
  const backlogs = academicRecords.filter((r) => r.backlog === true).length;
  const backlogPenalty = backlogs * 5.0; // 5 points deduction per backlog
  const normalizedValue = Math.max(0, Math.min(100, baseScore - backlogPenalty));

  let explanation = `Academic performance based on ${rawDisplay}.`;
  if (backlogs > 0) {
    explanation += ` Adjusted for ${backlogs} active backlog(s) (-${backlogPenalty} pts).`;
  } else {
    explanation += ' Zero active backlogs.';
  }

  return {
    key: 'academic',
    rawValue: baseScore,
    normalizedValue: Math.round(normalizedValue * 10) / 10,
    observedValue: rawDisplay,
    explanation,
  };
}

/**
 * Normalize Attendance consistency into 0..100.
 */
export function evaluateAttendance(attendanceRecords = []) {
  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return null;
  }

  let totalAttended = 0;
  let totalHeld = 0;
  let explicitPcts = [];

  attendanceRecords.forEach((r) => {
    if (r.classesAttended != null && r.classesHeld != null && r.classesHeld > 0) {
      totalAttended += r.classesAttended;
      totalHeld += r.classesHeld;
    } else if (r.attendancePercentage != null) {
      explicitPcts.push(r.attendancePercentage);
    }
  });

  let attendancePct = null;
  if (totalHeld > 0) {
    attendancePct = (totalAttended / totalHeld) * 100;
  } else if (explicitPcts.length > 0) {
    attendancePct = explicitPcts.reduce((a, b) => a + b, 0) / explicitPcts.length;
  }

  if (attendancePct === null) {
    return null;
  }

  const normalizedValue = Math.max(0, Math.min(100, attendancePct));
  const rawDisplay = `${normalizedValue.toFixed(1)}%`;

  let explanation = '';
  if (normalizedValue >= 85) {
    explanation = `Outstanding attendance at ${rawDisplay}, well above institutional thresholds.`;
  } else if (normalizedValue >= 75) {
    explanation = `Satisfactory attendance at ${rawDisplay}, meeting the 75% institutional requirement.`;
  } else {
    explanation = `Attendance at ${rawDisplay} is below the 75% mandatory threshold, posing academic risk.`;
  }

  return {
    key: 'attendance',
    rawValue: attendancePct,
    normalizedValue: Math.round(normalizedValue * 10) / 10,
    observedValue: rawDisplay,
    explanation,
  };
}

/**
 * Normalize LMS Portal Engagement into 0..100.
 */
export function evaluateLms(lmsRecords = []) {
  if (!Array.isArray(lmsRecords) || lmsRecords.length === 0) {
    return null;
  }

  let totalAssigned = 0;
  let totalCompleted = 0;
  let totalLogins = 0;
  let totalActiveDays = 0;

  lmsRecords.forEach((r) => {
    totalAssigned += r.assignmentsAssigned || 0;
    totalCompleted += r.assignmentsCompleted || 0;
    totalLogins += r.loginCount || 0;
    totalActiveDays += r.activeDays || 0;
  });

  const assignmentRate =
    totalAssigned > 0 ? Math.min(100, (totalCompleted / totalAssigned) * 100) : null;

  // Active portal presence indicator (target: ~20 logins/active days per month)
  const loginRate = Math.min(100, (Math.max(totalLogins, totalActiveDays * 2) / 20) * 100);

  let normalizedValue = null;
  if (assignmentRate !== null) {
    normalizedValue = 0.7 * assignmentRate + 0.3 * loginRate;
  } else if (totalLogins > 0 || totalActiveDays > 0) {
    normalizedValue = loginRate;
  }

  if (normalizedValue === null) {
    return null;
  }

  normalizedValue = Math.max(0, Math.min(100, normalizedValue));
  const rawDisplay = assignmentRate !== null ? `${assignmentRate.toFixed(0)}% assignments completed` : `${totalLogins} logins`;

  const explanation =
    normalizedValue >= 75
      ? `Strong digital campus engagement: ${rawDisplay} across active study periods.`
      : `Suboptimal LMS engagement: ${rawDisplay}. Recommended for study group interventions.`;

  return {
    key: 'lms',
    rawValue: normalizedValue,
    normalizedValue: Math.round(normalizedValue * 10) / 10,
    observedValue: rawDisplay,
    explanation,
  };
}

/**
 * Normalize Placement Readiness & Skills Assessment into 0..100.
 */
export function evaluatePlacementSkills(placementRecords = [], skillRecords = []) {
  const scores = [];

  if (Array.isArray(placementRecords)) {
    placementRecords.forEach((r) => {
      if (r.score != null && r.maxScore != null && r.maxScore > 0) {
        scores.push((r.score / r.maxScore) * 100);
      }
    });
  }

  if (Array.isArray(skillRecords)) {
    skillRecords.forEach((r) => {
      if (r.score != null && r.maxScore != null && r.maxScore > 0) {
        scores.push((r.score / r.maxScore) * 100);
      }
    });
  }

  if (scores.length === 0) {
    return null;
  }

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const normalizedValue = Math.max(0, Math.min(100, avgScore));
  const rawDisplay = `${normalizedValue.toFixed(1)}/100 avg`;

  const explanation =
    normalizedValue >= 75
      ? `High career readiness score (${rawDisplay}) across aptitude, coding, and technical assessments.`
      : `Assessment score at ${rawDisplay}. Targeted placement prep and skill workshops recommended.`;

  return {
    key: 'placement_skills',
    rawValue: avgScore,
    normalizedValue: Math.round(normalizedValue * 10) / 10,
    observedValue: rawDisplay,
    explanation,
  };
}

/**
 * Normalize Co-curricular & Event Engagement into 0..100.
 */
export function evaluateEngagement(engagementRecords = []) {
  if (!Array.isArray(engagementRecords) || engagementRecords.length === 0) {
    return null;
  }

  const count = engagementRecords.length;
  let totalHours = 0;
  engagementRecords.forEach((r) => {
    if (r.hours != null && r.hours > 0) totalHours += r.hours;
  });

  // Base 25 points per activity + bonus for high hours
  const basePoints = count * 25;
  const hoursBonus = totalHours >= 20 ? 25 : totalHours > 0 ? 10 : 0;
  const normalizedValue = Math.max(0, Math.min(100, basePoints + hoursBonus));
  const rawDisplay = `${count} activities (${totalHours} hrs)`;

  const explanation = `Active participant in ${count} co-curricular activities, hackathons, or clubs.`;

  return {
    key: 'engagement',
    rawValue: normalizedValue,
    normalizedValue: Math.round(normalizedValue * 10) / 10,
    observedValue: rawDisplay,
    explanation,
  };
}

/**
 * Calculate Student Success Score with dynamic weight renormalization and explainability.
 *
 * @param {Object} data - Category records for a student
 * @returns {Object} Score evaluation result
 */
export function calculateStudentSuccessScore({
  academic = [],
  attendance = [],
  lms = [],
  placement = [],
  skills = [],
  engagement = [],
} = {}) {
  const evaluatedComponents = [];
  const missingFields = [];

  // 1. Evaluate individual pillars
  const academicEval = evaluateAcademic(academic);
  if (academicEval) evaluatedComponents.push(academicEval);
  else missingFields.push('academic');

  const attendanceEval = evaluateAttendance(attendance);
  if (attendanceEval) evaluatedComponents.push(attendanceEval);
  else missingFields.push('attendance');

  const lmsEval = evaluateLms(lms);
  if (lmsEval) evaluatedComponents.push(lmsEval);
  else missingFields.push('lms');

  const placementSkillsEval = evaluatePlacementSkills(placement, skills);
  if (placementSkillsEval) evaluatedComponents.push(placementSkillsEval);
  else missingFields.push('placement_skills');

  const engagementEval = evaluateEngagement(engagement);
  if (engagementEval) evaluatedComponents.push(engagementEval);
  else missingFields.push('engagement');

  const totalPossibleComponents = 5;
  const availableCount = evaluatedComponents.length;
  const dataCompleteness = Math.round((availableCount / totalPossibleComponents) * 100);

  // If no data exists across all 5 pillars
  if (availableCount === 0) {
    return {
      score: null,
      formulaVersion: FORMULA_VERSION,
      dataCompleteness: 0,
      components: [],
      drivers: [
        {
          name: 'Data Availability',
          observedValue: 'No records',
          contribution: 0,
          explanation: 'Insufficient data available across all categories to calculate Student Success Score.',
        },
      ],
      missingFields,
    };
  }

  // 2. Renormalize weights across available components
  const sumAvailableWeights = evaluatedComponents.reduce(
    (acc, comp) => acc + (BASE_WEIGHTS[comp.key] || 0),
    0
  );

  let totalScore = 0;
  const finalComponents = [];
  const drivers = [];

  evaluatedComponents.forEach((comp) => {
    const rawWeight = BASE_WEIGHTS[comp.key] || 0;
    // Renormalized weight so sum of weights equals 1.0
    const reweightedWeight = sumAvailableWeights > 0 ? rawWeight / sumAvailableWeights : 0;
    const contribution = comp.normalizedValue * reweightedWeight;
    totalScore += contribution;

    finalComponents.push({
      key: comp.key,
      rawValue: comp.rawValue != null ? Math.round(comp.rawValue * 10) / 10 : null,
      normalizedValue: comp.normalizedValue,
      weight: Math.round(reweightedWeight * 1000) / 1000,
    });

    drivers.push({
      name: formatComponentName(comp.key),
      observedValue: comp.observedValue,
      contribution: Math.round(contribution * 10) / 10,
      explanation: comp.explanation,
    });
  });

  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore * 10) / 10));

  // Sort drivers by contribution descending
  drivers.sort((a, b) => b.contribution - a.contribution);

  return {
    score: finalScore,
    formulaVersion: FORMULA_VERSION,
    dataCompleteness,
    components: finalComponents,
    drivers,
    missingFields,
  };
}

function formatComponentName(key) {
  switch (key) {
    case 'academic':
      return 'Academic Performance';
    case 'attendance':
      return 'Attendance Consistency';
    case 'lms':
      return 'LMS Engagement';
    case 'placement_skills':
      return 'Placement & Skills Readiness';
    case 'engagement':
      return 'Co-Curricular Engagement';
    default:
      return key;
  }
}

export default {
  FORMULA_VERSION,
  BASE_WEIGHTS,
  evaluateAcademic,
  evaluateAttendance,
  evaluateLms,
  evaluatePlacementSkills,
  evaluateEngagement,
  calculateStudentSuccessScore,
};
