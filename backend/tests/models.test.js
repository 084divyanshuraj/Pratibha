import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  User,
  Student,
  AcademicRecord,
  AttendanceRecord,
  LmsActivity,
  EngagementRecord,
  PlacementAssessment,
  SkillAssessment,
  FeedbackRecord,
  StudentScore,
  RiskPrediction,
} from '../src/models/index.js';
import { toUserDTO, toStudentDTO, toCleanDTO } from '../src/serializers/index.js';

describe('Phase 2 — Mongoose Models & Validation Constraints', () => {
  describe('User Model Validation', () => {
    it('should validate a complete and valid user', async () => {
      const user = new User({
        email: 'faculty@example.edu',
        passwordHash: '$2a$10$xyz...',
        displayName: 'Dr. Jane Doe',
        role: 'faculty',
      });
      await user.validate();
      assert.equal(user.role, 'faculty');
    });

    it('should fail validation when role is invalid', async () => {
      const user = new User({
        email: 'badrole@example.edu',
        passwordHash: 'secret',
        displayName: 'Bad Role',
        role: 'superuser',
      });
      await assert.rejects(async () => user.validate(), (err) => {
        assert.ok(err.errors.role);
        return true;
      });
    });

    it('should fail validation when email format is invalid', async () => {
      const user = new User({
        email: 'invalid-email-string',
        passwordHash: 'secret',
        displayName: 'No At',
        role: 'admin',
      });
      await assert.rejects(async () => user.validate(), (err) => {
        assert.ok(err.errors.email);
        return true;
      });
    });

    it('should fail validation when required fields are missing', async () => {
      const user = new User({});
      await assert.rejects(async () => user.validate(), (err) => {
        assert.ok(err.errors.email);
        assert.ok(err.errors.passwordHash);
        assert.ok(err.errors.displayName);
        assert.ok(err.errors.role);
        return true;
      });
    });
  });

  describe('Student Model Validation', () => {
    it('should validate a complete and valid student', async () => {
      const student = new Student({
        studentId: 'STU_0010',
        firstName: 'Priya',
        lastName: 'Sharma',
        department: 'CSE',
        program: 'B.Tech',
        semester: 4,
        enrollmentYear: 2024,
      });
      await student.validate();
      assert.equal(student.status, 'active');
      assert.equal(student.studentId, 'STU_0010');
    });

    it('should reject semester outside of 1..12 range', async () => {
      const student = new Student({
        studentId: 'STU_0011',
        firstName: 'Bad',
        lastName: 'Sem',
        department: 'CSE',
        program: 'B.Tech',
        semester: 15,
        enrollmentYear: 2024,
      });
      await assert.rejects(async () => student.validate(), (err) => {
        assert.ok(err.errors.semester);
        return true;
      });
    });

    it('should reject invalid student status', async () => {
      const student = new Student({
        studentId: 'STU_0012',
        firstName: 'Status',
        lastName: 'Invalid',
        department: 'ECE',
        program: 'B.Tech',
        semester: 2,
        enrollmentYear: 2025,
        status: 'dropped_out_unknown',
      });
      await assert.rejects(async () => student.validate(), (err) => {
        assert.ok(err.errors.status);
        return true;
      });
    });
  });

  describe('AcademicRecord Validation', () => {
    it('should validate valid marks where marksObtained <= maxMarks', async () => {
      const record = new AcademicRecord({
        studentId: 'STU_0001',
        term: '2026-S1',
        subjectCode: 'CS101',
        marksObtained: 85,
        maxMarks: 100,
      });
      await record.validate();
      assert.equal(record.marksObtained, 85);
    });

    it('should reject when marksObtained > maxMarks', async () => {
      const record = new AcademicRecord({
        studentId: 'STU_0001',
        term: '2026-S1',
        marksObtained: 105,
        maxMarks: 100,
      });
      await assert.rejects(async () => record.validate(), (err) => {
        assert.ok(err.errors.marksObtained);
        return true;
      });
    });

    it('should reject negative marksObtained', async () => {
      const record = new AcademicRecord({
        studentId: 'STU_0001',
        term: '2026-S1',
        marksObtained: -5,
        maxMarks: 100,
      });
      await assert.rejects(async () => record.validate(), (err) => {
        assert.ok(err.errors.marksObtained);
        return true;
      });
    });
  });

  describe('AttendanceRecord Validation', () => {
    it('should validate and automatically compute attendancePercentage', async () => {
      const record = new AttendanceRecord({
        studentId: 'STU_0001',
        term: '2026-S1',
        classesAttended: 40,
        classesHeld: 50,
      });
      await record.validate();
      assert.equal(record.attendancePercentage, 80);
    });

    it('should reject when classesAttended > classesHeld', async () => {
      const record = new AttendanceRecord({
        studentId: 'STU_0001',
        term: '2026-S1',
        classesAttended: 55,
        classesHeld: 50,
      });
      await assert.rejects(async () => record.validate(), (err) => {
        assert.ok(err.errors.classesAttended);
        return true;
      });
    });
  });

  describe('LmsActivity Validation', () => {
    it('should reject when assignmentsCompleted > assignmentsAssigned', async () => {
      const activity = new LmsActivity({
        studentId: 'STU_0001',
        periodStart: new Date('2026-08-01'),
        periodEnd: new Date('2026-09-01'),
        assignmentsAssigned: 5,
        assignmentsCompleted: 6,
      });
      await assert.rejects(async () => activity.validate(), (err) => {
        assert.ok(err.errors.assignmentsCompleted);
        return true;
      });
    });
  });

  describe('PlacementAssessment & SkillAssessment Validation', () => {
    it('should reject placement score exceeding maxScore', async () => {
      const assessment = new PlacementAssessment({
        studentId: 'STU_0001',
        assessmentType: 'coding',
        score: 120,
        maxScore: 100,
      });
      await assert.rejects(async () => assessment.validate(), (err) => {
        assert.ok(err.errors.score);
        return true;
      });
    });

    it('should reject skill assessment with invalid skillCategory', async () => {
      const skill = new SkillAssessment({
        studentId: 'STU_0001',
        skillCategory: 'gaming',
        skillName: 'Esports',
        score: 90,
      });
      let caughtErr;
      try {
        await skill.validate();
      } catch (e) {
        caughtErr = e;
      }
      assert.ok(caughtErr);
      assert.ok(caughtErr.errors?.skillCategory);
    });
  });

  describe('FeedbackRecord Validation', () => {
    it('should reject rating outside 1..5 range', async () => {
      const feedback = new FeedbackRecord({
        studentId: 'STU_0001',
        feedbackType: 'student_satisfaction',
        rating: 6,
      });
      await assert.rejects(async () => feedback.validate(), (err) => {
        assert.ok(err.errors.rating);
        return true;
      });
    });
  });

  describe('StudentScore & RiskPrediction Validation', () => {
    it('should reject StudentScore score outside 0..100 range', async () => {
      const score = new StudentScore({
        studentId: 'STU_0001',
        period: '2026-S1',
        score: 105,
      });
      await assert.rejects(async () => score.validate(), (err) => {
        assert.ok(err.errors.score);
        return true;
      });
    });

    it('should reject RiskPrediction with probability outside 0..1 range', async () => {
      const prediction = new RiskPrediction({
        studentId: 'STU_0001',
        target: 'academic_risk',
        riskLevel: 'high',
        probability: 1.5,
        modelVersion: 'v1.0',
        featureSetVersion: 'v1.0',
      });
      await assert.rejects(async () => prediction.validate(), (err) => {
        assert.ok(err.errors.probability);
        return true;
      });
    });
  });

  describe('DTO Serialization Boundaries', () => {
    it('toUserDTO should strip passwordHash and __v', () => {
      const rawUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'admin@example.edu',
        passwordHash: '$2a$10$secretHash123456789',
        displayName: 'Admin User',
        role: 'admin',
        isActive: true,
        __v: 0,
      };

      const dto = toUserDTO(rawUser);
      assert.equal(dto.email, 'admin@example.edu');
      assert.equal(dto.displayName, 'Admin User');
      assert.equal(dto.passwordHash, undefined);
      assert.equal(dto.__v, undefined);
      assert.equal(dto.id, '507f1f77bcf86cd799439011');
    });

    it('toStudentDTO should provide formatted student profile', () => {
      const rawStudent = {
        _id: '507f1f77bcf86cd799439012',
        studentId: 'STU_0001',
        firstName: 'Aarav',
        lastName: 'Sharma',
        department: 'CSE',
        program: 'B.Tech',
        semester: 5,
        enrollmentYear: 2023,
      };

      const dto = toStudentDTO(rawStudent);
      assert.equal(dto.studentId, 'STU_0001');
      assert.equal(dto.fullName, 'Aarav Sharma');
      assert.equal(dto.id, '507f1f77bcf86cd799439012');
    });

    it('toCleanDTO should strip __v and passwordHash from arbitrary documents', () => {
      const raw = {
        _id: '123',
        passwordHash: 'hidden',
        __v: 2,
        customField: 'value',
      };
      const clean = toCleanDTO(raw);
      assert.equal(clean.id, '123');
      assert.equal(clean.passwordHash, undefined);
      assert.equal(clean.__v, undefined);
      assert.equal(clean.customField, 'value');
    });
  });
});
