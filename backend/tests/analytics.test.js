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
import { EngagementRecord } from '../src/models/EngagementRecord.js';
import { FeedbackRecord } from '../src/models/FeedbackRecord.js';
import { StudentScore } from '../src/models/StudentScore.js';
import { RiskPrediction } from '../src/models/RiskPrediction.js';

describe('Phase 7 — Institution Analytics Endpoints & KPIs', () => {
  const TEST_PASSWORD = 'AnalyticsTestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let placementToken = '';
  let studentToken = '';

  const STU_1 = 'STU_AN_001';
  const STU_2 = 'STU_AN_002';
  const STU_3 = 'STU_AN_003';
  const STU_4 = 'STU_AN_004';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts and records
    await User.deleteMany({ email: { $regex: /^an\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await EngagementRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await StudentScore.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await RiskPrediction.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'an.admin@example.edu', passwordHash, displayName: 'An Admin', role: 'admin', isActive: true },
      { email: 'an.faculty@example.edu', passwordHash, displayName: 'An Faculty', role: 'faculty', isActive: true },
      { email: 'an.placement@example.edu', passwordHash, displayName: 'An Placement Officer', role: 'placement_officer', isActive: true },
      { email: 'an.student@example.edu', passwordHash, displayName: 'An Student', role: 'student', studentId: STU_1, isActive: true },
    ]);

    // Create 4 students: 3 in Aerospace Engineering (2021-2025), 1 in Biotechnology (2022-2026)
    await Student.create([
      {
        studentId: STU_1,
        firstName: 'Neil',
        lastName: 'Armstrong',
        department: 'Aerospace Engineering',
        program: 'B.Tech Aero',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_2,
        firstName: 'Buzz',
        lastName: 'Aldrin',
        department: 'Aerospace Engineering',
        program: 'B.Tech Aero',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_3,
        firstName: 'Michael',
        lastName: 'Collins',
        department: 'Aerospace Engineering',
        program: 'B.Tech Aero',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_4,
        firstName: 'Sally',
        lastName: 'Ride',
        department: 'Biotechnology',
        program: 'B.Tech Biotech',
        semester: 4,
        currentSemester: 4,
        cohort: '2022-2026',
        enrollmentYear: 2022,
        status: 'inactive',
      },
    ]);

    // STU_1: Full records across all 7 categories + high score + low risk
    await AcademicRecord.create({
      studentId: STU_1,
      term: '2024-SEM1',
      marksObtained: 88,
      maxMarks: 100,
      cgpa: 8.8,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_1,
      term: '2024-SEM1',
      classesAttended: 46,
      classesHeld: 50,
      attendancePercentage: 92,
    });
    await LmsActivity.create({
      studentId: STU_1,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-05-30'),
      loginCount: 20,
      assignmentsAssigned: 10,
      assignmentsCompleted: 10,
    });
    await PlacementAssessment.create({
      studentId: STU_1,
      assessmentType: 'coding',
      assessmentDate: new Date('2024-03-01'),
      score: 85,
      maxScore: 100,
    });
    await SkillAssessment.create({
      studentId: STU_1,
      skillCategory: 'technical',
      skillName: 'Aero Structures',
      score: 90,
      maxScore: 100,
    });
    await EngagementRecord.create({
      studentId: STU_1,
      activityType: 'event',
      activityName: 'Aero Symposium',
    });
    await FeedbackRecord.create({
      studentId: STU_1,
      feedbackType: 'faculty_feedback',
      rating: 4,
      visibility: 'staff_only',
    });
    await StudentScore.create({
      studentId: STU_1,
      period: '2024-SEM1',
      score: 88.0,
      formulaVersion: 'sss-v1',
      calculatedAt: new Date(),
    });
    await RiskPrediction.create([
      {
        studentId: STU_1,
        target: 'academic_risk',
        riskLevel: 'low',
        probability: 0.1,
        modelVersion: 'lgb-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
      },
      {
        studentId: STU_1,
        target: 'placement_risk',
        riskLevel: 'low',
        probability: 0.15,
        modelVersion: 'logreg-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
      },
    ]);

    // STU_2: Decoupled risk divergence (CGPA 8.0, but high placement risk)
    await AcademicRecord.create({
      studentId: STU_2,
      term: '2024-SEM1',
      marksObtained: 80,
      maxMarks: 100,
      cgpa: 8.0,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_2,
      term: '2024-SEM1',
      classesAttended: 40,
      classesHeld: 50,
      attendancePercentage: 80,
    });
    await PlacementAssessment.create({
      studentId: STU_2,
      assessmentType: 'coding',
      assessmentDate: new Date('2024-03-01'),
      score: 45,
      maxScore: 100,
    });
    await StudentScore.create({
      studentId: STU_2,
      period: '2024-SEM1',
      score: 65.0,
      formulaVersion: 'sss-v1',
      calculatedAt: new Date(),
    });
    await RiskPrediction.create([
      {
        studentId: STU_2,
        target: 'academic_risk',
        riskLevel: 'low',
        probability: 0.2,
        modelVersion: 'lgb-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
      },
      {
        studentId: STU_2,
        target: 'placement_risk',
        riskLevel: 'high',
        probability: 0.82,
        modelVersion: 'logreg-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
        drivers: [
          { name: 'coding_skills', explanation: 'Low coding assessment performance.' },
        ],
      },
    ]);

    // STU_3: Critical risk student (CGPA 5.5, 3 backlogs, low attendance, high academic risk)
    await AcademicRecord.create({
      studentId: STU_3,
      term: '2024-SEM1',
      marksObtained: 55,
      maxMarks: 100,
      cgpa: 5.5,
      backlog: true,
      backlogsCount: 3,
    });
    await AttendanceRecord.create({
      studentId: STU_3,
      term: '2024-SEM1',
      classesAttended: 31,
      classesHeld: 50,
      attendancePercentage: 62,
    });
    await StudentScore.create({
      studentId: STU_3,
      period: '2024-SEM1',
      score: 52.0,
      formulaVersion: 'sss-v1',
      calculatedAt: new Date(),
    });
    await RiskPrediction.create([
      {
        studentId: STU_3,
        target: 'academic_risk',
        riskLevel: 'high',
        probability: 0.88,
        modelVersion: 'lgb-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
        drivers: [
          { name: 'attendance', explanation: 'Attendance is below mandatory 75% threshold.' },
        ],
      },
      {
        studentId: STU_3,
        target: 'placement_risk',
        riskLevel: 'high',
        probability: 0.79,
        modelVersion: 'logreg-v1.0.0',
        featureSetVersion: 'v1.0.0',
        status: 'valid',
        drivers: [
          { name: 'aptitude_score', explanation: 'Deficient aptitude score.' },
        ],
      },
    ]);

    // Login users to acquire JWT tokens
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'an.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminRes.body.data.accessToken;

    const facultyRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'an.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyRes.body.data.accessToken;

    const placementRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'an.placement@example.edu', password: TEST_PASSWORD });
    placementToken = placementRes.body.data.accessToken;

    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'an.student@example.edu', password: TEST_PASSWORD });
    studentToken = studentRes.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^an\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await EngagementRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await StudentScore.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await RiskPrediction.deleteMany({ studentId: { $in: [STU_1, STU_2, STU_3, STU_4] } });
    await disconnectDatabase();
  });

  describe('GET /api/v1/analytics/overview', () => {
    it('should allow staff roles (admin, faculty, placement_officer) to access overview KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview?department=Aerospace%20Engineering')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data);
      assert.equal(res.body.data.students.total, 3);
      assert.equal(res.body.data.students.active, 3);
      assert.equal(res.body.data.students.inactive, 0);

      // Verify placement officer has access
      const pRes = await request(app)
        .get('/api/v1/analytics/overview?department=Aerospace%20Engineering')
        .set('Authorization', `Bearer ${placementToken}`);
      assert.equal(pRes.status, 200);
    });

    it('should DENY student role with 403 FORBIDDEN and block cohort PII leaks', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should DENY unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/analytics/overview');
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    it('should compute accurate Success Score metrics, distribution, and decoupled risk distributions', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview?department=Aerospace%20Engineering')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      const data = res.body.data;

      // Success Score: (88 + 65 + 52) / 3 = 68.3
      assert.equal(data.successScore.scoredCount, 3);
      assert.equal(data.successScore.average, 68.3);
      assert.equal(data.successScore.min, 52);
      assert.equal(data.successScore.max, 88);
      assert.equal(data.successScore.median, 65);
      assert.deepEqual(data.successScore.distribution, {
        critical: 1, // 52
        moderate: 1, // 65
        good: 0,
        excellent: 1, // 88
      });

      // Decoupled Risks
      assert.deepEqual(data.academicRisk, {
        low: 2, // STU_1, STU_2
        medium: 0,
        high: 1, // STU_3
        unknown: 0,
        unassessed: 0,
      });

      assert.deepEqual(data.placementRisk, {
        low: 1, // STU_1
        medium: 0,
        high: 2, // STU_2, STU_3
        unknown: 0,
        unassessed: 0,
      });

      // 7-category coverage
      assert.ok(data.dataCoverage.categories.academic);
      assert.equal(data.dataCoverage.categories.academic.count, 3);
      assert.equal(data.dataCoverage.categories.academic.percentage, 100);

      // Coverage notes
      assert.ok(Array.isArray(data.coverageNotes));
      assert.ok(data.coverageNotes.length > 0);
    });

    it('should handle non-matching filters safely with zeroes and explicit notes without fabricating data', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview?department=Astrophysics')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      const data = res.body.data;
      assert.equal(data.students.total, 0);
      assert.equal(data.students.active, 0);
      assert.equal(data.successScore.average, null);
      assert.equal(data.successScore.scoredCount, 0);
      assert.deepEqual(data.coverageNotes, [
        'No students found matching the specified filters.',
      ]);
    });
  });

  describe('GET /api/v1/analytics/trends', () => {
    it('should return aggregated time-series trends across periods', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/trends?department=Aerospace%20Engineering')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.trend));

      const sem1Trend = res.body.data.trend.find((t) => t.period === '2024-SEM1');
      assert.ok(sem1Trend);
      assert.equal(sem1Trend.studentCount, 3);
      assert.equal(sem1Trend.averageSuccessScore, 68.3);
      assert.ok(sem1Trend.averageAttendance > 0);
    });

    it('should return empty trend array when no records match filter', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/trends?department=NonExistentDept')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.deepEqual(res.body.data.trend, []);
    });
  });

  describe('GET /api/v1/analytics/risk-summary', () => {
    it('should return department/semester breakdowns, top drivers, and decoupled risk divergence', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/risk-summary?department=Aerospace%20Engineering')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      const data = res.body.data;
      // Department breakdown
      assert.ok(Array.isArray(data.departmentBreakdown));
      const aero = data.departmentBreakdown.find((d) => d.department === 'Aerospace Engineering');
      assert.ok(aero);
      assert.equal(aero.total, 3);
      assert.equal(aero.academicRisk.high, 1);
      assert.equal(aero.placementRisk.high, 2);

      // Semester breakdown
      assert.ok(Array.isArray(data.semesterBreakdown));
      const sem6 = data.semesterBreakdown.find((s) => s.semester === 6);
      assert.ok(sem6);
      assert.equal(sem6.total, 3);

      // Top drivers
      assert.ok(Array.isArray(data.topRiskDrivers));
      const driverNames = data.topRiskDrivers.map((d) => d.name);
      assert.ok(
        driverNames.includes('coding_skills') ||
        driverNames.includes('attendance') ||
        driverNames.includes('aptitude_score')
      );

      // Decoupled Risk Divergence
      // STU_2 has CGPA 8.0 >= 7.5 and high placement risk
      assert.equal(data.decoupledDivergence.count, 1);
      assert.ok(data.decoupledDivergence.explanation.includes('confirming independent risk dynamics'));
    });
  });
});
