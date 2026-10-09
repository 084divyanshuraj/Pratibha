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
import { StudentScore } from '../src/models/StudentScore.js';
import { RiskPrediction } from '../src/models/RiskPrediction.js';
import { StudentSegment } from '../src/models/StudentSegment.js';

describe('Phase 7 — Student Segmentation & Rule Engine', () => {
  const TEST_PASSWORD = 'SegmentTestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let placementToken = '';
  let studentToken = '';

  const STU_1 = 'STU_SEG_001'; // High academic, low placement
  const STU_2 = 'STU_SEG_002'; // Critical attendance (< 75%)
  const STU_3 = 'STU_SEG_003'; // LMS disengaged
  const STU_4 = 'STU_SEG_004'; // High potential / Top achiever
  const STU_5 = 'STU_SEG_005'; // Holistic support needed (low score / high backlogs)

  const ALL_TEST_STUS = [STU_1, STU_2, STU_3, STU_4, STU_5];

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean test accounts and records
    await User.deleteMany({ email: { $regex: /^seg\./ } });
    await Student.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await AcademicRecord.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await AttendanceRecord.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await LmsActivity.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await PlacementAssessment.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await StudentScore.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await RiskPrediction.deleteMany({ studentId: { $in: ALL_TEST_STUS } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    await User.create([
      { email: 'seg.admin@example.edu', passwordHash, displayName: 'Seg Admin', role: 'admin', isActive: true },
      { email: 'seg.faculty@example.edu', passwordHash, displayName: 'Seg Faculty', role: 'faculty', isActive: true },
      { email: 'seg.placement@example.edu', passwordHash, displayName: 'Seg Placement Officer', role: 'placement_officer', isActive: true },
      { email: 'seg.student@example.edu', passwordHash, displayName: 'Seg Student', role: 'student', studentId: STU_1, isActive: true },
    ]);

    // Create 5 distinct archetype students
    await Student.create([
      {
        studentId: STU_1,
        firstName: 'Arya',
        lastName: 'Sharma',
        department: 'Electronics',
        program: 'B.Tech ECE',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_2,
        firstName: 'Rohan',
        lastName: 'Verma',
        department: 'Electronics',
        program: 'B.Tech ECE',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_3,
        firstName: 'Pooja',
        lastName: 'Patel',
        department: 'Electronics',
        program: 'B.Tech ECE',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_4,
        firstName: 'Vikram',
        lastName: 'Singh',
        department: 'Electronics',
        program: 'B.Tech ECE',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
      {
        studentId: STU_5,
        firstName: 'Karan',
        lastName: 'Mehta',
        department: 'Electronics',
        program: 'B.Tech ECE',
        semester: 6,
        currentSemester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
      },
    ]);

    // STU_1: High Academic (CGPA 8.4), Low Placement (Score 40)
    await AcademicRecord.create({
      studentId: STU_1,
      term: '2024-SEM1',
      marksObtained: 84,
      maxMarks: 100,
      cgpa: 8.4,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_1,
      term: '2024-SEM1',
      classesAttended: 44,
      classesHeld: 50,
      attendancePercentage: 88,
    });
    await PlacementAssessment.create({
      studentId: STU_1,
      assessmentType: 'coding',
      score: 40,
      maxScore: 100,
    });
    await StudentScore.create({ studentId: STU_1, period: '2024-SEM1', score: 76 });

    // STU_2: Critical Attendance (65%)
    await AcademicRecord.create({
      studentId: STU_2,
      term: '2024-SEM1',
      marksObtained: 68,
      maxMarks: 100,
      cgpa: 6.8,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_2,
      term: '2024-SEM1',
      classesAttended: 32,
      classesHeld: 50,
      attendancePercentage: 64,
    });
    await StudentScore.create({ studentId: STU_2, period: '2024-SEM1', score: 62 });

    // STU_3: LMS Disengaged (Submitted 3 / 10 = 30%)
    await AcademicRecord.create({
      studentId: STU_3,
      term: '2024-SEM1',
      marksObtained: 70,
      maxMarks: 100,
      cgpa: 7.0,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_3,
      term: '2024-SEM1',
      classesAttended: 41,
      classesHeld: 50,
      attendancePercentage: 82,
    });
    await LmsActivity.create({
      studentId: STU_3,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-05-30'),
      loginCount: 4,
      assignmentsAssigned: 10,
      assignmentsCompleted: 3,
    });
    await StudentScore.create({ studentId: STU_3, period: '2024-SEM1', score: 66 });

    // STU_4: High Potential Achiever (Success Score 92, CGPA 9.2)
    await AcademicRecord.create({
      studentId: STU_4,
      term: '2024-SEM1',
      marksObtained: 92,
      maxMarks: 100,
      cgpa: 9.2,
      backlog: false,
    });
    await AttendanceRecord.create({
      studentId: STU_4,
      term: '2024-SEM1',
      classesAttended: 48,
      classesHeld: 50,
      attendancePercentage: 96,
    });
    await StudentScore.create({ studentId: STU_4, period: '2024-SEM1', score: 92 });

    // STU_5: Holistic Support Needed (Score 48, Backlogs 3)
    await AcademicRecord.create({
      studentId: STU_5,
      term: '2024-SEM1',
      marksObtained: 52,
      maxMarks: 100,
      cgpa: 5.2,
      backlog: true,
      backlogsCount: 3,
    });
    await AttendanceRecord.create({
      studentId: STU_5,
      term: '2024-SEM1',
      classesAttended: 35,
      classesHeld: 50,
      attendancePercentage: 70,
    });
    await StudentScore.create({ studentId: STU_5, period: '2024-SEM1', score: 48 });

    // Login users
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seg.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminRes.body.data.accessToken;

    const facultyRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seg.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyRes.body.data.accessToken;

    const placementRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seg.placement@example.edu', password: TEST_PASSWORD });
    placementToken = placementRes.body.data.accessToken;

    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'seg.student@example.edu', password: TEST_PASSWORD });
    studentToken = studentRes.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^seg\./ } });
    await Student.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await AcademicRecord.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await AttendanceRecord.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await LmsActivity.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await PlacementAssessment.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await StudentScore.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await RiskPrediction.deleteMany({ studentId: { $in: ALL_TEST_STUS } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/segments/rebuild', () => {
    it('should allow admin or faculty to rebuild segment memberships', async () => {
      const res = await request(app)
        .post('/api/v1/segments/rebuild')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.rebuiltCount, 5);
      assert.ok(Array.isArray(res.body.data.segments));
    });

    it('should evaluate and classify students into accurate explainable archetypes', async () => {
      await request(app)
        .post('/api/v1/segments/rebuild')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({});

      // 1. High Academic Low Placement: should contain STU_1
      const seg1 = await StudentSegment.findOne({ segmentKey: 'high_academic_low_placement' });
      assert.ok(seg1);
      assert.ok(seg1.studentIds.includes(STU_1));

      // 2. Critical Attendance: should contain STU_2 and STU_5 (attendance 70% < 75%)
      const seg2 = await StudentSegment.findOne({ segmentKey: 'attendance_critical_risk' });
      assert.ok(seg2);
      assert.ok(seg2.studentIds.includes(STU_2));
      assert.ok(seg2.studentIds.includes(STU_5));

      // 3. LMS Disengaged: should contain STU_3
      const seg3 = await StudentSegment.findOne({ segmentKey: 'lms_disengaged' });
      assert.ok(seg3);
      assert.ok(seg3.studentIds.includes(STU_3));

      // 4. High Potential Achiever: should contain STU_4
      const seg4 = await StudentSegment.findOne({ segmentKey: 'high_potential_achievers' });
      assert.ok(seg4);
      assert.ok(seg4.studentIds.includes(STU_4));

      // 5. Holistic Support: should contain STU_5
      const seg5 = await StudentSegment.findOne({ segmentKey: 'holistic_support_needed' });
      assert.ok(seg5);
      assert.ok(seg5.studentIds.includes(STU_5));
    });

    it('should DENY placement officer and student role from triggering rebuild with 403 FORBIDDEN', async () => {
      const pRes = await request(app)
        .post('/api/v1/segments/rebuild')
        .set('Authorization', `Bearer ${placementToken}`)
        .send({});
      assert.equal(pRes.status, 403);
      assert.equal(pRes.body.error.code, 'FORBIDDEN');

      const sRes = await request(app)
        .post('/api/v1/segments/rebuild')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});
      assert.equal(sRes.status, 403);
      assert.equal(sRes.body.error.code, 'FORBIDDEN');
    });
  });

  describe('GET /api/v1/segments', () => {
    it('should allow staff roles to list segment definitions with aggregate indicators', async () => {
      const res = await request(app)
        .get('/api/v1/segments')
        .set('Authorization', `Bearer ${placementToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.segments.length, 5);

      const first = res.body.data.segments[0];
      assert.ok(first.segmentKey);
      assert.ok(first.name);
      assert.ok(first.description);
      assert.equal(first.criteriaVersion, 'v1');
      assert.ok(first.studentCount !== undefined);
      // Ensure studentIds list is omitted by default for privacy/payload efficiency
      assert.equal(first.studentIds, undefined);
    });

    it('should include studentIds when explicitly requested with includeStudents=true by staff', async () => {
      const res = await request(app)
        .get('/api/v1/segments?includeStudents=true')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      const first = res.body.data.segments[0];
      assert.ok(Array.isArray(first.studentIds));
    });

    it('should DENY student role from listing segments with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/segments')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('GET /api/v1/segments/:segmentKey', () => {
    it('should allow staff to fetch specific segment by key with membership list', async () => {
      const res = await request(app)
        .get('/api/v1/segments/high_academic_low_placement')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.segmentKey, 'high_academic_low_placement');
      assert.ok(Array.isArray(res.body.data.studentIds));
      assert.ok(res.body.data.studentIds.includes(STU_1));
    });

    it('should return 404 NOT_FOUND for unknown segmentKey', async () => {
      const res = await request(app)
        .get('/api/v1/segments/non_existent_key_999')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });
  });
});
