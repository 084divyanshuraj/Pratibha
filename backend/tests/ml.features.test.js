import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStudentFeatures,
  FEATURE_NAMES,
  FEATURE_SET_VERSION,
} from '../src/ml/feature.builder.js';

describe('Phase 6 — ML Feature Builder (Unit Tests)', () => {
  it('should construct all 17 exact model features matching model_metadata.json', () => {
    const data = {
      studentId: 'STU_FEAT_001',
      asOfDate: new Date('2025-05-01'),
      academic: [
        { cgpa: 8.4, backlog: false, observedAt: new Date('2025-04-15') },
        { backlog: true, observedAt: new Date('2025-04-10') },
      ],
      attendance: [
        { classesAttended: 38, classesHeld: 40, observedAt: new Date('2025-04-20') },
      ],
      lms: [
        {
          periodStart: new Date('2025-04-01'),
          assignmentsAssigned: 8,
          assignmentsCompleted: 7,
          loginCount: 24,
        },
      ],
      placement: [
        { assessmentType: 'aptitude', score: 85, maxScore: 100, assessedAt: new Date('2025-04-12') },
        { assessmentType: 'coding', score: 90, maxScore: 100, assessedAt: new Date('2025-04-14') },
      ],
      skills: [
        { skillName: 'DSA', score: 80, maxScore: 100, assessedAt: new Date('2025-04-10') },
        { skillName: 'System Design', score: 70, maxScore: 100, assessedAt: new Date('2025-04-10') },
        { skillCategory: 'soft_skill', skillName: 'Communication', score: 85, maxScore: 100, assessedAt: new Date('2025-04-10') },
        { skillName: 'Machine Learning', score: 75, maxScore: 100, assessedAt: new Date('2025-04-10') },
      ],
      engagement: [
        { activityType: 'internship', activityName: 'Summer Internship', occurredAt: new Date('2025-03-01') },
        { activityType: 'project', activityName: 'Capstone Project', occurredAt: new Date('2025-03-15') },
        { activityType: 'certification', activityName: 'AWS Cloud', occurredAt: new Date('2025-03-20') },
        { activityType: 'hackathon', activityName: 'SIH Hackathon', occurredAt: new Date('2025-04-01') },
        { activityType: 'open_source', activityName: 'GitHub Contributions', occurredAt: new Date('2025-04-05') },
      ],
      feedback: [
        { feedbackType: 'faculty_feedback', rating: 4.5, createdAt: new Date('2025-04-25') },
      ],
    };

    const res = buildStudentFeatures(data);

    assert.equal(res.studentId, 'STU_FEAT_001');
    assert.equal(res.featureSetVersion, FEATURE_SET_VERSION);
    assert.ok(res.features);

    // Verify all 17 feature keys exist
    for (const feat of FEATURE_NAMES) {
      assert.ok(
        res.features[feat] !== undefined,
        `Feature "${feat}" must be present in feature output.`
      );
      assert.equal(typeof res.features[feat], 'number');
    }

    assert.equal(res.features.cgpa, 8.4);
    assert.equal(res.features.backlogs, 1);
    assert.equal(res.features.overall_attendance_pct, 95.0);
    assert.equal(res.features.internships, 1);
    assert.equal(res.features.certifications, 1);
    assert.equal(res.features.hackathons, 1);
    assert.equal(res.features.open_source, 1);
    assert.equal(res.features.faculty_feedback_rating, 4.5);
  });

  it('should strictly exclude future records past asOfDate to prevent target leakage', () => {
    const asOfDate = new Date('2025-03-01');
    const data = {
      studentId: 'STU_LEAK_001',
      asOfDate,
      academic: [
        // Past record: 0 backlogs
        { cgpa: 8.0, backlog: false, observedAt: new Date('2025-02-15') },
        // FUTURE record: 3 backlogs (must NOT leak into features!)
        { cgpa: 5.0, backlog: true, observedAt: new Date('2025-04-01') },
        { cgpa: 5.0, backlog: true, observedAt: new Date('2025-04-02') },
        { cgpa: 5.0, backlog: true, observedAt: new Date('2025-04-03') },
      ],
    };

    const res = buildStudentFeatures(data);

    // Verified: future backlogs were excluded; backlogs count is 0
    assert.equal(res.features.backlogs, 0);
    assert.equal(res.features.cgpa, 8.0);
  });

  it('should provide safe default features when student has empty category records', () => {
    const res = buildStudentFeatures({ studentId: 'STU_EMPTY_001' });

    assert.equal(res.features.backlogs, 0);
    assert.equal(res.features.cgpa, 6.5);
    assert.equal(res.features.overall_attendance_pct, 75.0);
    assert.equal(res.features.internships, 0);
    assert.equal(res.features.hackathons, 0);
  });
});
