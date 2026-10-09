/**
 * Simulation and Allocation Engine
 *
 * Deterministic, repeatable resource-aware allocation engine for
 * the Intervention Sandbox. Strictly respects capacity constraints,
 * returns explicit reasons for selected and excluded students,
 * and maintains zero outcome fabrication.
 */

/**
 * Check whether a student meets the defined eligibility rules of an intervention
 *
 * @param {Object} student
 * @param {Object} rules
 * @returns {{ eligible: boolean, reason?: string }}
 */
export function checkEligibility(student, rules = {}) {
  if (!rules || Object.keys(rules).length === 0) {
    return { eligible: true };
  }

  if (
    rules.minAttendance != null &&
    (student.attendancePercentage == null || student.attendancePercentage < rules.minAttendance)
  ) {
    return {
      eligible: false,
      reason: `Attendance (${student.attendancePercentage ?? 'N/A'}%) is below minimum threshold of ${rules.minAttendance}%.`,
    };
  }

  if (
    rules.maxAttendance != null &&
    student.attendancePercentage != null &&
    student.attendancePercentage > rules.maxAttendance
  ) {
    return {
      eligible: false,
      reason: `Attendance (${student.attendancePercentage}%) exceeds maximum eligibility cutoff of ${rules.maxAttendance}%.`,
    };
  }

  if (
    rules.maxCgpa != null &&
    student.cgpa != null &&
    student.cgpa > rules.maxCgpa
  ) {
    return {
      eligible: false,
      reason: `CGPA (${student.cgpa}) exceeds maximum eligibility cutoff of ${rules.maxCgpa}.`,
    };
  }

  if (
    rules.minCgpa != null &&
    (student.cgpa == null || student.cgpa < rules.minCgpa)
  ) {
    return {
      eligible: false,
      reason: `CGPA (${student.cgpa ?? 'N/A'}) is below minimum requirement of ${rules.minCgpa}.`,
    };
  }

  if (
    rules.backlogCount != null &&
    (student.backlogs == null || student.backlogs < rules.backlogCount)
  ) {
    return {
      eligible: false,
      reason: `Active backlogs (${student.backlogs ?? 0}) is below required minimum of ${rules.backlogCount}.`,
    };
  }

  if (
    rules.semesterMin != null &&
    (student.semester == null || student.semester < rules.semesterMin)
  ) {
    return {
      eligible: false,
      reason: `Current semester (${student.semester ?? 'N/A'}) is below requirement of semester ${rules.semesterMin}.`,
    };
  }

  if (
    rules.semesterMax != null &&
    (student.semester == null || student.semester > rules.semesterMax)
  ) {
    return {
      eligible: false,
      reason: `Current semester (${student.semester ?? 'N/A'}) exceeds maximum of semester ${rules.semesterMax}.`,
    };
  }

  if (
    rules.maxPlacementScore != null &&
    student.placementScore != null &&
    student.placementScore > rules.maxPlacementScore
  ) {
    return {
      eligible: false,
      reason: `Placement assessment score (${student.placementScore}) exceeds maximum threshold of ${rules.maxPlacementScore}.`,
    };
  }

  if (rules.riskTarget === 'academic_risk' && student.academicRisk !== 'high') {
    return {
      eligible: false,
      reason: `Academic risk level is '${student.academicRisk || 'unassessed'}'; requires high academic risk.`,
    };
  }

  if (rules.riskTarget === 'placement_risk' && student.placementRisk !== 'high') {
    return {
      eligible: false,
      reason: `Placement risk level is '${student.placementRisk || 'unassessed'}'; requires high placement risk.`,
    };
  }

  return { eligible: true };
}

/**
 * Calculate deterministic priority score for a student given an intervention type and strategy
 *
 * @param {Object} student
 * @param {string} interventionType
 * @param {string} strategy
 * @returns {number}
 */
export function calculatePriorityScore(student, interventionType, strategy = 'targeted') {
  if (strategy === 'uniform') {
    return 50;
  }

  let priority = 0;

  // Domain-specific deficit weights
  if (
    interventionType.includes('academic') ||
    interventionType.includes('remedial') ||
    interventionType.includes('tutoring')
  ) {
    const cgpaDeficit = student.cgpa != null ? (10 - student.cgpa) * 10 : 30;
    priority += cgpaDeficit * 1.5;
    priority += (student.backlogs || 0) * 20;
    if (student.academicRisk === 'high') priority += 40;
    else if (student.academicRisk === 'medium') priority += 20;
  } else if (
    interventionType.includes('placement') ||
    interventionType.includes('career') ||
    interventionType.includes('bootcamp')
  ) {
    const placementDeficit =
      student.placementScore != null ? 100 - student.placementScore : 40;
    priority += placementDeficit * 1.5;
    if (student.placementRisk === 'high') priority += 40;
    else if (student.placementRisk === 'medium') priority += 20;
  } else if (interventionType.includes('attendance')) {
    const attDeficit =
      student.attendancePercentage != null ? 100 - student.attendancePercentage : 30;
    priority += attDeficit * 2.0;
  }

  // Composite Success Score deficit
  const scoreDeficit =
    student.successScore != null ? 100 - student.successScore : 40;
  priority += scoreDeficit;

  if (strategy === 'mixed') {
    priority = (priority + 50) / 2;
  }

  return Math.round(priority * 10) / 10;
}

/**
 * Run deterministic allocation simulation across a student cohort
 *
 * @param {Object} params
 * @param {Array} params.cohortStudents
 * @param {Set<string>} params.activeAssignments - Set of "studentId:interventionType"
 * @param {Map<string, Object>} params.catalogMap
 * @param {Array<string>} params.interventionTypes
 * @param {Object} params.capacityConstraints - Map of { [type]: maxCapacity }
 * @param {string} [params.strategy='targeted']
 * @returns {Object}
 */
export function runAllocationSimulation({
  cohortStudents,
  activeAssignments = new Set(),
  catalogMap,
  interventionTypes = [],
  capacityConstraints = {},
  strategy = 'targeted',
}) {
  const allocationResults = [];
  const excludedResults = [];
  const resourceSummary = {
    totalCohort: cohortStudents.length,
    totalAllocated: 0,
    totalCapacity: 0,
    overallUtilizationPercentage: 0,
    byIntervention: {},
  };

  const assumptions = [
    `Deterministic student prioritization calculated under '${strategy}' allocation strategy.`,
    'Ties resolved deterministically by lexicographical studentId order.',
    'Strict enforcement of defined capacity limits; zero overflow allowed.',
    'Assumes 100% student acceptance and participation in allocated programs.',
    'No causal outcome uplift claimed without longitudinal observational evidence.',
  ];

  for (const type of interventionTypes) {
    const catalog = catalogMap.get(type);
    if (!catalog) {
      continue;
    }

    const capacityLimit =
      capacityConstraints[type] != null
        ? Number(capacityConstraints[type])
        : 50;

    resourceSummary.totalCapacity += capacityLimit;

    // Filter and score eligible students
    const eligibleList = [];

    for (const student of cohortStudents) {
      const assignmentKey = `${student.studentId}:${type}`;
      if (activeAssignments.has(assignmentKey)) {
        excludedResults.push({
          studentId: student.studentId,
          reason: `Already actively assigned to '${catalog.name || type}'.`,
        });
        continue;
      }

      const eligibility = checkEligibility(student, catalog.eligibilityRules);
      if (!eligibility.eligible) {
        excludedResults.push({
          studentId: student.studentId,
          reason: eligibility.reason,
        });
        continue;
      }

      const priorityScore = calculatePriorityScore(student, type, strategy);
      eligibleList.push({
        studentId: student.studentId,
        priorityScore,
      });
    }

    // Sort eligible candidates deterministically
    eligibleList.sort((a, b) => {
      if (strategy === 'uniform') {
        return a.studentId.localeCompare(b.studentId);
      }
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return a.studentId.localeCompare(b.studentId);
    });

    // Allocate up to capacityLimit
    const allocatedStudents = eligibleList.slice(0, capacityLimit);
    const capacityExcludedStudents = eligibleList.slice(capacityLimit);

    for (const alloc of allocatedStudents) {
      allocationResults.push({
        studentId: alloc.studentId,
        interventionType: type,
        reason: `Eligible and prioritized (Score: ${alloc.priorityScore}) within capacity of ${capacityLimit} ${catalog.capacityUnit || 'seats'}.`,
        priorityScore: alloc.priorityScore,
      });
    }

    for (const exc of capacityExcludedStudents) {
      excludedResults.push({
        studentId: exc.studentId,
        reason: `Eligible (Score: ${exc.priorityScore}) but excluded due to capacity limit of ${capacityLimit} ${catalog.capacityUnit || 'seats'}.`,
      });
    }

    const allocatedCount = allocatedStudents.length;
    resourceSummary.totalAllocated += allocatedCount;
    const utilization =
      capacityLimit > 0
        ? Math.round((allocatedCount / capacityLimit) * 1000) / 10
        : 0;

    resourceSummary.byIntervention[type] = {
      name: catalog.name,
      allocatedCount,
      capacityLimit,
      remainingCapacity: Math.max(0, capacityLimit - allocatedCount),
      capacityUnit: catalog.capacityUnit || 'seats',
      utilizationPercentage: utilization,
    };
  }

  resourceSummary.overallUtilizationPercentage =
    resourceSummary.totalCapacity > 0
      ? Math.round(
          (resourceSummary.totalAllocated / resourceSummary.totalCapacity) * 1000
        ) / 10
      : 0;

  return {
    allocationResults,
    excludedResults,
    resourceSummary,
    assumptions,
    outcomeEstimates: null, // Strictly absent per Zero-Fabrication rule
    estimateMethod: 'none',
  };
}
