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
import { RiskPrediction } from '../src/models/RiskPrediction.js';
import { StudentFeature } from '../src/models/StudentFeature.js';
import { setMockPredictHandler, resetMockPredictHandler } from '../src/ml/ml.client.js';

describe('Phase 6 — ML Prediction Endpoints & Zero-Fabrication Safety', () => {
  const TEST_PASSWORD = 'TestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let student1Token = '';
  let student2Token = '';

  const STU_ML_1 = 'STU_ML_001';
  const STU_ML_2 = 'STU_ML_002';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts & data
    await User.deleteMany({ email: { $regex: /^ml\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await RiskPrediction.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await StudentFeature.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'ml.admin@example.edu', passwordHash, displayName: 'ML Admin', role: 'admin', isActive: true },
      { email: 'ml.faculty@example.edu', passwordHash, displayName: 'ML Faculty', role: 'faculty', isActive: true },
      { email: 'ml.student1@example.edu', passwordHash, displayName: 'ML Student1', role: 'student', studentId: STU_ML_1, isActive: true },
      { email: 'ml.student2@example.edu', passwordHash, displayName: 'ML Student2', role: 'student', studentId: STU_ML_2, isActive: true },
    ]);

    await Student.create([
      {
        studentId: STU_ML_1,
        firstName: 'Divyanshu',
        lastName: 'Raj',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
      },
      {
        studentId: STU_ML_2,
        firstName: 'Ananya',
        lastName: 'Sharma',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        enrollmentYear: 2021,
      },
    ]);

    await AcademicRecord.create({
      studentId: STU_ML_1,
      term: 'Spring 2025',
      cgpa: 8.5,
      marksObtained: 85,
      maxMarks: 100,
      backlog: false,
    });

    await AttendanceRecord.create({
      studentId: STU_ML_1,
      term: 'Spring 2025',
      classesAttended: 40,
      classesHeld: 45,
    });

    // Obtain JWT tokens
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ml.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminLogin.body.data.accessToken;

    const facultyLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ml.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyLogin.body.data.accessToken;

    const s1Login = await request(app).post('/api/v1/auth/login').send({ email: 'ml.student1@example.edu', password: TEST_PASSWORD });
    student1Token = s1Login.body.data.accessToken;

    const s2Login = await request(app).post('/api/v1/auth/login').send({ email: 'ml.student2@example.edu', password: TEST_PASSWORD });
    student2Token = s2Login.body.data.accessToken;
  });

  after(async () => {
    resetMockPredictHandler();
    await User.deleteMany({ email: { $regex: /^ml\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await RiskPrediction.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await StudentFeature.deleteMany({ studentId: { $in: [STU_ML_1, STU_ML_2] } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/students/:studentId/predictions (Prediction Generation)', () => {
    it('should generate, validate, and persist academic_risk prediction', async () => {
      // Mock successful ML inference response
      setMockPredictHandler(async ({ target }) => {
        return {
          target,
          riskLevel: 'low',
          probability: 0.12,
          modelVersion: 'academic_rf_v1.0',
          drivers: [
            {
              name: 'cgpa',
              direction: 'decreases_risk',
              observedValue: 8.5,
              explanation: 'Strong CGPA significantly reduces academic failure risk.',
            },
          ],
          limitations: ['Trained on synthetic institution cohort dataset'],
        };
      });

      const res = await request(app)
        .post(`/api/v1/students/${STU_ML_1}/predictions`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ target: 'academic_risk' });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert.equal(data.studentId, STU_ML_1);
      assert.equal(data.target, 'academic_risk');
      assert.equal(data.riskLevel, 'low');
      assert.equal(data.probability, 0.12);
      assert.equal(data.status, 'valid');

      // Verify persisted in MongoDB
      const savedInDb = await RiskPrediction.findOne({ studentId: STU_ML_1, target: 'academic_risk', status: 'valid' });
      assert.ok(savedInDb);
      assert.equal(savedInDb.riskLevel, 'low');

      // Verify StudentFeature snapshot was created
      const savedFeature = await StudentFeature.findOne({ studentId: STU_ML_1 });
      assert.ok(savedFeature);
      assert.equal(savedFeature.features.get('cgpa'), 8.5);
    });

    it('should supersede previous predictions when new prediction is generated for same target', async () => {
      setMockPredictHandler(async ({ target }) => ({
        target,
        riskLevel: 'medium',
        probability: 0.45,
        modelVersion: 'academic_rf_v1.0',
        drivers: [],
        limitations: [],
      }));

      const res = await request(app)
        .post(`/api/v1/students/${STU_ML_1}/predictions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ target: 'academic_risk' });

      assert.equal(res.status, 201);
      assert.equal(res.body.data.riskLevel, 'medium');

      // Verify old prediction is now superseded
      const superseded = await RiskPrediction.find({ studentId: STU_ML_1, status: 'superseded' });
      assert.equal(superseded.length, 1);
      assert.equal(superseded[0].riskLevel, 'low');
    });

    it('should DENY student role from triggering prediction generation with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/students/${STU_ML_1}/predictions`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ target: 'academic_risk' });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('Zero-Fabrication Gate: should return 503 and NEVER create fake prediction if ML service fails', async () => {
      // Mock failure / offline state
      setMockPredictHandler(async () => {
        const err = new Error('fetch failed: connect ECONNREFUSED 127.0.0.1:8000');
        err.code = 'ECONNREFUSED';
        throw err;
      });

      const initialCount = await RiskPrediction.countDocuments({ studentId: STU_ML_2 });

      const res = await request(app)
        .post(`/api/v1/students/${STU_ML_2}/predictions`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ target: 'academic_risk' });

      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'ML_SERVICE_UNAVAILABLE');

      // Strictly verify: zero prediction records were fabricated in the DB!
      const postCount = await RiskPrediction.countDocuments({ studentId: STU_ML_2 });
      assert.equal(postCount, initialCount);
    });
  });

  describe('GET /api/v1/students/:studentId/predictions (Prediction Retrieval)', () => {
    it('should allow staff to retrieve latest active predictions for a student', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_ML_1}/predictions`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.studentId, STU_ML_1);
      assert.ok(res.body.data.targets.academic_risk);
      assert.equal(res.body.data.targets.academic_risk.riskLevel, 'medium');
    });

    it('should allow student to retrieve their own predictions', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_ML_1}/predictions`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.studentId, STU_ML_1);
    });

    it('should DENY student from viewing another student predictions with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_ML_2}/predictions`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });
});
