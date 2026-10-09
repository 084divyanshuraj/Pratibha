import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStudentSuccessScore,
  evaluateAcademic,
  evaluateAttendance,
  evaluateLms,
  evaluatePlacementSkills,
  evaluateEngagement,
  FORMULA_VERSION,
  BASE_WEIGHTS,
} from '../src/scores/score.calculator.js';

describe('Phase 5 — Success Score Formula Engine (Unit Tests)', () => {
  describe('Domain Evaluators & Normalization', () => {
    it('evaluateAcademic should normalize CGPA 8.5 to 85.0 with zero backlogs', () => {
      const res = evaluateAcademic([{ cgpa: 8.5, backlog: false }]);
      assert.ok(res);
      assert.equal(res.normalizedValue, 85.0);
      assert.ok(res.explanation.includes('Zero active backlogs'));
    });

    it('evaluateAcademic should apply 5 points penalty per active backlog', () => {
      const res = evaluateAcademic([{ cgpa: 8.0, backlog: true }, { backlog: true }]);
      assert.ok(res);
      // 80 - (2 * 5) = 70.0
      assert.equal(res.normalizedValue, 70.0);
      assert.ok(res.explanation.includes('2 active backlog(s) (-10 pts)'));
    });

    it('evaluateAcademic should fallback to marks percentage if CGPA is absent', () => {
      const res = evaluateAcademic([
        { marksObtained: 80, maxMarks: 100 },
        { marksObtained: 70, maxMarks: 100 },
      ]);
      assert.ok(res);
      assert.equal(res.normalizedValue, 75.0);
    });

    it('evaluateAcademic should return null if records are empty', () => {
      assert.equal(evaluateAcademic([]), null);
      assert.equal(evaluateAcademic(null), null);
    });

    it('evaluateAttendance should compute percentage and generate risk warning if < 75%', () => {
      const good = evaluateAttendance([{ classesAttended: 40, classesHeld: 45 }]);
      assert.ok(good);
      assert.equal(good.normalizedValue, 88.9);
      assert.ok(good.explanation.includes('above institutional thresholds'));

      const poor = evaluateAttendance([{ classesAttended: 25, classesHeld: 45 }]);
      assert.ok(poor);
      assert.equal(poor.normalizedValue, 55.6);
      assert.ok(poor.explanation.includes('below the 75% mandatory threshold'));
    });

    it('evaluateLms should combine assignment completion and login activity', () => {
      const res = evaluateLms([
        { assignmentsAssigned: 10, assignmentsCompleted: 9, loginCount: 20 },
      ]);
      assert.ok(res);
      // 0.7 * 90 + 0.3 * 100 = 63 + 30 = 93.0
      assert.equal(res.normalizedValue, 93.0);
      assert.ok(res.explanation.includes('90% assignments completed'));
    });

    it('evaluatePlacementSkills should average placement and skill scores', () => {
      const placement = [{ score: 80, maxScore: 100 }];
      const skills = [{ score: 90, maxScore: 100 }];
      const res = evaluatePlacementSkills(placement, skills);
      assert.ok(res);
      assert.equal(res.normalizedValue, 85.0);
    });

    it('evaluateEngagement should award points for activities and hours', () => {
      const res = evaluateEngagement([
        { activityType: 'hackathon', hours: 24 },
        { activityType: 'club', hours: 10 },
      ]);
      assert.ok(res);
      // 2 * 25 = 50 + 25 (bonus for >=20 hrs) = 75
      assert.equal(res.normalizedValue, 75.0);
      assert.ok(res.explanation.includes('2 co-curricular activities'));
    });
  });

  describe('Full Success Score Composite Calculation', () => {
    it('should compute deterministic score with all 5 components available (100% completeness)', () => {
      const data = {
        academic: [{ cgpa: 8.5 }], // 85.0 (wt 0.35) -> 29.75
        attendance: [{ classesAttended: 40, classesHeld: 45 }], // 88.9 (wt 0.20) -> 17.78
        lms: [{ assignmentsAssigned: 10, assignmentsCompleted: 10, loginCount: 20 }], // 100.0 (wt 0.15) -> 15.00
        placement: [{ score: 90, maxScore: 100 }], // 90.0 (wt 0.20) -> 18.00
        skills: [{ score: 90, maxScore: 100 }],
        engagement: [{ activityType: 'hackathon', hours: 25 }, { activityType: 'club', hours: 5 }], // 75.0 (wt 0.10) -> 7.50
      };

      const result1 = calculateStudentSuccessScore(data);
      const result2 = calculateStudentSuccessScore(data);

      assert.equal(result1.formulaVersion, FORMULA_VERSION);
      assert.equal(result1.dataCompleteness, 100);
      assert.equal(result1.missingFields.length, 0);
      assert.equal(result1.components.length, 5);
      assert.equal(result1.drivers.length, 5);

      // Repeatability gate: identical input produces identical score
      assert.equal(result1.score, result2.score);
      assert.ok(result1.score >= 0 && result1.score <= 100);

      // Check sum of component weights equals 1.0
      const totalWeights = result1.components.reduce((acc, c) => acc + c.weight, 0);
      assert.ok(Math.abs(totalWeights - 1.0) < 0.001);
    });

    it('should renormalize weights dynamically when domains are missing without penalizing with zero', () => {
      // Semester 2 student with only academic and attendance data
      const data = {
        academic: [{ cgpa: 9.0 }], // 90.0
        attendance: [{ classesAttended: 45, classesHeld: 45 }], // 100.0
        lms: [],
        placement: [],
        skills: [],
        engagement: [],
      };

      const result = calculateStudentSuccessScore(data);

      assert.equal(result.dataCompleteness, 40); // 2 out of 5
      assert.deepEqual(result.missingFields.sort(), ['engagement', 'lms', 'placement_skills'].sort());
      assert.equal(result.components.length, 2);

      // Available weights: academic 0.35 + attendance 0.20 = 0.55
      // Renormalized: academic = 0.35/0.55 (~0.636), attendance = 0.20/0.55 (~0.364)
      // Score = 90 * (0.35/0.55) + 100 * (0.20/0.55) = 57.27 + 36.36 = 93.6
      assert.equal(result.score, 93.6);

      // Weights must sum to 1.0
      const totalWeights = result.components.reduce((acc, c) => acc + c.weight, 0);
      assert.ok(Math.abs(totalWeights - 1.0) < 0.001);
    });

    it('should handle completely missing data gracefully with 0 completeness', () => {
      const result = calculateStudentSuccessScore({});
      assert.equal(result.score, null);
      assert.equal(result.dataCompleteness, 0);
      assert.equal(result.missingFields.length, 5);
      assert.ok(result.drivers[0].explanation.includes('Insufficient data available'));
    });

    it('should clamp scores strictly within 0..100 boundary', () => {
      // Extreme negative backlogs attempt
      const data = {
        academic: [{ cgpa: 2.0, backlog: true }, { backlog: true }, { backlog: true }, { backlog: true }, { backlog: true }],
      };
      const result = calculateStudentSuccessScore(data);
      assert.ok(result.score >= 0);
    });
  });
});
