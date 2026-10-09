/**
 * Segment Definitions and Rule Criteria (v1)
 *
 * Implements explainable, rule-based student segment definitions
 * reflecting KPMG Problem Statement archetypes:
 * 1. High Academic, Low Placement Readiness
 * 2. Critical Attendance Shortfall (< 75%)
 * 3. Digital & LMS Disengagement
 * 4. High Potential / Top Achievers
 * 5. Comprehensive Academic Support Needed
 */

export const SEGMENT_DEFINITIONS = [
  {
    segmentKey: 'high_academic_low_placement',
    name: 'High Academic, Low Placement Readiness',
    description: 'Students maintaining strong academic standing (CGPA >= 7.5 or Academic score >= 75%) but facing placement deficits (Placement score < 60% or High Placement Risk).',
    criteriaVersion: 'v1',
    evaluator: (data) => {
      const hasHighAcademics =
        (data.cgpa != null && data.cgpa >= 7.5) ||
        (data.academicScore != null && data.academicScore >= 75);
      const hasPlacementDeficit =
        (data.placementScore != null && data.placementScore < 60) ||
        data.placementRisk === 'high';
      return Boolean(hasHighAcademics && hasPlacementDeficit);
    },
  },
  {
    segmentKey: 'attendance_critical_risk',
    name: 'Critical Attendance Shortfall',
    description: 'Students with overall attendance below 75%, requiring immediate intervention to prevent exam debarment.',
    criteriaVersion: 'v1',
    evaluator: (data) => {
      return data.attendancePercentage != null && data.attendancePercentage < 75;
    },
  },
  {
    segmentKey: 'lms_disengaged',
    name: 'Digital & LMS Disengagement',
    description: 'Students demonstrating low portal engagement with assignment completion rate below 50% or fewer than 2 logins per week.',
    criteriaVersion: 'v1',
    evaluator: (data) => {
      const lowAssignments =
        data.lmsAssignmentCompletion != null && data.lmsAssignmentCompletion < 50;
      const lowLogins =
        data.lmsLoginsPerWeek != null && data.lmsLoginsPerWeek < 2;
      return Boolean(lowAssignments || lowLogins);
    },
  },
  {
    segmentKey: 'high_potential_achievers',
    name: 'High Potential / Top Achievers',
    description: 'Top-tier students with Student Success Score >= 85 and CGPA >= 8.5 ready for leadership and advanced corporate opportunities.',
    criteriaVersion: 'v1',
    evaluator: (data) => {
      const highSuccess = data.successScore != null && data.successScore >= 85;
      const highCgpa = data.cgpa != null && data.cgpa >= 8.5;
      return Boolean(highSuccess && highCgpa);
    },
  },
  {
    segmentKey: 'holistic_support_needed',
    name: 'Comprehensive Academic Support',
    description: 'Students experiencing multi-domain distress: Success Score < 60, 2 or more active backlogs, or High Academic Risk.',
    criteriaVersion: 'v1',
    evaluator: (data) => {
      const lowSuccess = data.successScore != null && data.successScore < 60;
      const multipleBacklogs = data.backlogs != null && data.backlogs >= 2;
      const highAcademicRisk = data.academicRisk === 'high';
      return Boolean(lowSuccess || multipleBacklogs || highAcademicRisk);
    },
  },
];
