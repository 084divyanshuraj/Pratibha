import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { User } from '../src/models/User.js';
import { Student } from '../src/models/Student.js';
import { AcademicRecord } from '../src/models/AcademicRecord.js';
import { AttendanceRecord } from '../src/models/AttendanceRecord.js';
import { LmsActivity } from '../src/models/LmsActivity.js';
import { PlacementAssessment } from '../src/models/PlacementAssessment.js';
import { SkillAssessment } from '../src/models/SkillAssessment.js';
import { StudentScore } from '../src/models/StudentScore.js';

describe('Phase 5 — Student Success Score Endpoints & Persistence', () => {
  const TEST_PASSWORD = 'TestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let student1Token = '';
  let student2Token = '';

  const STU_SCORE_1 = 'STU_SCR_001';
  const STU_SCORE_2 = 'STU_SCR_002';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts & records
    await User.deleteMany({ email: { $regex: /^scr\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await StudentScore.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'scr.admin@example.edu', passwordHash, displayName: 'Scr Admin', role: 'admin', isActive: true },
      { email: 'scr.faculty@example.edu', passwordHash, displayName: 'Scr Faculty', role: 'faculty', isActive: true },
      { email: 'scr.student1@example.edu', passwordHash, displayName: 'Scr Student1', role: 'student', studentId: STU_SCORE_1, isActive: true },
      { email: 'scr.student2@example.edu', passwordHash, displayName: 'Scr Student2', role: 'student', studentId: STU_SCORE_2, isActive: true },
    ]);

    await Student.create([
      {
        studentId: STU_SCORE_1,
        firstName: 'Divyanshu',
        lastName: 'Raj',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
      },
      {
        studentId: STU_SCORE_2,
        firstName: 'Anjali',
        lastName: 'Mehta',
        department: 'Information Technology',
        program: 'B.Tech IT',
        semester: 4,
        enrollmentYear: 2022,
      },
    ]);

    // Populate realistic records for STU_SCORE_1
    await Promise.all([
      AcademicRecord.create({
        studentId: STU_SCORE_1,
        term: 'Spring 2025',
        subjectCode: 'CS301',
        marksObtained: 88,
        maxMarks: 100,
        cgpa: 8.8,
        backlog: false,
      }),
      AttendanceRecord.create({
        studentId: STU_SCORE_1,
        term: 'Spring 2025',
        classesAttended: 42,
        classesHeld: 45,
      }),
      LmsActivity.create({
        studentId: STU_SCORE_1,
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-31'),
        loginCount: 22,
        assignmentsAssigned: 5,
        assignmentsCompleted: 5,
      }),
      PlacementAssessment.create({
        studentId: STU_SCORE_1,
        assessmentType: 'coding',
        score: 90,
        maxScore: 100,
      }),
      SkillAssessment.create({
        studentId: STU_SCORE_1,
        skillCategory: 'technical',
        skillName: 'Algorithms',
        score: 92,
        maxScore: 100,
      }),
    ]);

    // Obtain tokens
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'scr.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminLogin.body.data.accessToken;

    const facultyLogin = await request(app).post('/api/v1/auth/login').send({ email: 'scr.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyLogin.body.data.accessToken;

    const s1Login = await request(app).post('/api/v1/auth/login').send({ email: 'scr.student1@example.edu', password: TEST_PASSWORD });
    student1Token = s1Login.body.data.accessToken;

    const s2Login = await request(app).post('/api/v1/auth/login').send({ email: 'scr.student2@example.edu', password: TEST_PASSWORD });
    student2Token = s2Login.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^scr\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await StudentScore.deleteMany({ studentId: { $in: [STU_SCORE_1, STU_SCORE_2] } });
    await disconnectDatabase();
  });

  describe('GET /api/v1/students/:studentId/success-score', () => {
    it('should calculate and persist Student Success Score on initial request', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_SCORE_1}/success-score`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert.equal(data.studentId, STU_SCORE_1);
      assert.equal(data.formulaVersion, 'sss-v1');
      assert.ok(typeof data.score === 'number');
      assert.ok(data.score >= 0 && data.score <= 100);
      assert.ok(data.dataCompleteness >= 80);
      assert.ok(Array.isArray(data.components));
      assert.ok(Array.isArray(data.drivers));
      assert.ok(data.drivers.length > 0);

      // Verify persisted in DB
      const dbRecord = await StudentScore.findOne({ studentId: STU_SCORE_1, period: 'current' });
      assert.ok(dbRecord);
      assert.equal(dbRecord.score, data.score);
    });

    it('should allow student to retrieve their own success score', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_SCORE_1}/success-score`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.studentId, STU_SCORE_1);
    });

    it('should DENY student trying to view another student score with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_SCORE_2}/success-score`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should return 404 NOT_FOUND when studentId does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_NONEXISTENT_888/success-score')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });
  });

  describe('POST /api/v1/students/:studentId/success-score/recalculate', () => {
    it('should allow staff/admin to recalculate and update persisted score', async () => {
      // Add new academic record with higher performance
      await AcademicRecord.create({
        studentId: STU_SCORE_1,
        term: 'Spring 2025',
        subjectCode: 'CS302',
        marksObtained: 98,
        maxMarks: 100,
        cgpa: 9.8,
        backlog: false,
      });

      const res = await request(app)
        .post(`/api/v1/students/${STU_SCORE_1}/success-score/recalculate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ period: 'current' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert.equal(data.studentId, STU_SCORE_1);
      assert.ok(data.score >= 90);

      // Verify updated in database
      const dbRecord = await StudentScore.findOne({ studentId: STU_SCORE_1, period: 'current' });
      assert.equal(dbRecord.score, data.score);
    });

    it('should DENY students from triggering score recalculation with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/students/${STU_SCORE_1}/success-score/recalculate`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ period: 'current' });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });
});
