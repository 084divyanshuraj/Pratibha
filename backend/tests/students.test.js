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
import { EngagementRecord } from '../src/models/EngagementRecord.js';
import { PlacementAssessment } from '../src/models/PlacementAssessment.js';
import { SkillAssessment } from '../src/models/SkillAssessment.js';
import { FeedbackRecord } from '../src/models/FeedbackRecord.js';

describe('Phase 4 — Student Profiles & Integrated Data Records', () => {
  const TEST_PASSWORD = 'TestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let student1Token = '';
  let student2Token = '';

  const STU_1_ID = 'STU_PH4_001';
  const STU_2_ID = 'STU_PH4_002';
  const STU_3_ID = 'STU_PH4_003';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean previous test artifacts
    await User.deleteMany({ email: { $regex: /^ph4\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID, STU_3_ID, 'STU_NEW_999'] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await EngagementRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    // 1. Create auth users
    await User.create([
      { email: 'ph4.admin@example.edu', passwordHash, displayName: 'Ph4 Admin', role: 'admin', isActive: true },
      { email: 'ph4.faculty@example.edu', passwordHash, displayName: 'Ph4 Faculty', role: 'faculty', isActive: true },
      { email: 'ph4.student1@example.edu', passwordHash, displayName: 'Student One', role: 'student', studentId: STU_1_ID, isActive: true },
      { email: 'ph4.student2@example.edu', passwordHash, displayName: 'Student Two', role: 'student', studentId: STU_2_ID, isActive: true },
    ]);

    // 2. Create student records
    await Student.create([
      {
        studentId: STU_1_ID,
        firstName: 'Aarav',
        lastName: 'Sharma',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 6,
        cohort: '2021-2025',
        enrollmentYear: 2021,
        status: 'active',
        email: 'ph4.student1@example.edu',
      },
      {
        studentId: STU_2_ID,
        firstName: 'Priya',
        lastName: 'Patel',
        department: 'Information Technology',
        program: 'B.Tech IT',
        semester: 4,
        cohort: '2022-2026',
        enrollmentYear: 2022,
        status: 'active',
        email: 'ph4.student2@example.edu',
      },
      {
        studentId: STU_3_ID,
        firstName: 'Rohan',
        lastName: 'Gupta',
        department: 'Computer Science',
        program: 'B.Tech CSE',
        semester: 8,
        cohort: '2020-2024',
        enrollmentYear: 2020,
        status: 'graduated',
      },
    ]);

    // 3. Create sample category records for STU_1_ID
    await Promise.all([
      AcademicRecord.create({
        studentId: STU_1_ID,
        term: 'Spring 2025',
        subjectCode: 'CS301',
        subjectName: 'Algorithms',
        assessmentType: 'final',
        marksObtained: 85,
        maxMarks: 100,
        cgpa: 8.5,
      }),
      AttendanceRecord.create({
        studentId: STU_1_ID,
        term: 'Spring 2025',
        subjectCode: 'CS301',
        classesAttended: 40,
        classesHeld: 45,
      }),
      LmsActivity.create({
        studentId: STU_1_ID,
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-31'),
        loginCount: 20,
        activeDays: 15,
        assignmentsAssigned: 5,
        assignmentsCompleted: 5,
        engagementMinutes: 450,
      }),
      EngagementRecord.create({
        studentId: STU_1_ID,
        activityType: 'hackathon',
        activityName: 'Smart Campus Hackathon',
        hours: 24,
        result: 'First Place',
      }),
      PlacementAssessment.create({
        studentId: STU_1_ID,
        assessmentType: 'coding',
        score: 90,
        maxScore: 100,
      }),
      SkillAssessment.create({
        studentId: STU_1_ID,
        skillCategory: 'technical',
        skillName: 'Python',
        score: 88,
        maxScore: 100,
      }),
      // Feedback records: 1 staff_only and 1 student_satisfaction
      FeedbackRecord.create([
        {
          studentId: STU_1_ID,
          feedbackType: 'faculty_feedback',
          rating: 4,
          comment: 'Strong problem-solving capability in data structures.',
          visibility: 'staff_only',
        },
        {
          studentId: STU_1_ID,
          feedbackType: 'student_satisfaction',
          rating: 5,
          comment: 'Laboratory setup and teaching assistants are very supportive.',
          visibility: 'aggregated',
        },
      ]),
    ]);

    // Obtain JWT tokens
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ph4.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminLogin.body.data.accessToken;

    const facultyLogin = await request(app).post('/api/v1/auth/login').send({ email: 'ph4.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyLogin.body.data.accessToken;

    const s1Login = await request(app).post('/api/v1/auth/login').send({ email: 'ph4.student1@example.edu', password: TEST_PASSWORD });
    student1Token = s1Login.body.data.accessToken;

    const s2Login = await request(app).post('/api/v1/auth/login').send({ email: 'ph4.student2@example.edu', password: TEST_PASSWORD });
    student2Token = s2Login.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^ph4\./ } });
    await Student.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID, STU_3_ID, 'STU_NEW_999'] } });
    await AcademicRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await AttendanceRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await LmsActivity.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await EngagementRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await PlacementAssessment.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await SkillAssessment.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [STU_1_ID, STU_2_ID] } });
    await disconnectDatabase();
  });

  describe('GET /api/v1/students (List & Search)', () => {
    it('should allow staff to retrieve paginated list of students', async () => {
      const res = await request(app)
        .get('/api/v1/students?page=1&limit=2')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.students));
      assert.equal(res.body.data.students.length, 2);
      assert.equal(res.body.data.pagination.page, 1);
      assert.equal(res.body.data.pagination.limit, 2);
      assert.ok(res.body.data.pagination.total >= 3);
      assert.equal(res.body.data.pagination.hasNextPage, true);
    });

    it('should filter students by department and semester', async () => {
      const res = await request(app)
        .get('/api/v1/students?department=Computer%20Science&semester=6')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.students.length, 1);
      assert.equal(res.body.data.students[0].studentId, STU_1_ID);
    });

    it('should support search by student name or studentId substring', async () => {
      const res = await request(app)
        .get(`/api/v1/students?search=${STU_1_ID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.students.length, 1);
      assert.equal(res.body.data.students[0].studentId, STU_1_ID);
    });

    it('should deny students from listing the entire student directory with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should deny unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/students');
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/students (Profile Creation)', () => {
    it('should allow admin to create a new student profile', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STU_NEW_999',
          firstName: 'Ananya',
          lastName: 'Verma',
          department: 'Electronics',
          program: 'B.Tech ECE',
          semester: 2,
          cohort: '2023-2027',
          enrollmentYear: 2023,
          status: 'active',
          email: 'ananya.verma@example.edu',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.studentId, 'STU_NEW_999');
      assert.equal(res.body.data.firstName, 'Ananya');
      assert.equal(res.body.data.fullName, 'Ananya Verma');
    });

    it('should reject duplicate studentId with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STU_NEW_999',
          firstName: 'Duplicate',
          lastName: 'Student',
          department: 'Electronics',
          program: 'B.Tech ECE',
          semester: 2,
          enrollmentYear: 2023,
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, 'CONFLICT');
    });

    it('should prevent non-admin from creating students with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: 'STU_FAIL_001',
          firstName: 'Unauthorized',
          lastName: 'User',
          department: 'CSE',
          program: 'B.Tech',
          semester: 1,
          enrollmentYear: 2024,
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should reject payload missing required fields with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: '',
          firstName: 'Incomplete',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/students/:studentId (Profile Detail)', () => {
    it('should allow staff to retrieve any student profile', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_1_ID}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.studentId, STU_1_ID);
      assert.equal(res.body.data.firstName, 'Aarav');
    });

    it('should allow student to retrieve their own profile', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_1_ID}`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.studentId, STU_1_ID);
    });

    it('should DENY student from retrieving another student profile with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_2_ID}`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should return 404 NOT_FOUND when studentId does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_NONEXISTENT_999')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/students/:studentId (Profile Update)', () => {
    it('should allow staff to update student profile fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/students/${STU_1_ID}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'suspended',
          cohort: '2021-2025-HONORS',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, 'suspended');
      assert.equal(res.body.data.cohort, '2021-2025-HONORS');

      // Revert status for remaining tests
      await Student.updateOne({ studentId: STU_1_ID }, { status: 'active' });
    });

    it('should reject attempts to mutate immutable studentId with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch(`/api/v1/students/${STU_1_ID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'STU_MUTATED_999',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('should prevent students from editing their own profile with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .patch(`/api/v1/students/${STU_1_ID}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          firstName: 'HackedName',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('GET /api/v1/students/:studentId/records (Integrated Category Records)', () => {
    it('should return aggregated category counts and records for staff', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_1_ID}/records`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert.equal(data.student.studentId, STU_1_ID);
      assert.equal(data.counts.academic, 1);
      assert.equal(data.counts.attendance, 1);
      assert.equal(data.counts.lms, 1);
      assert.equal(data.counts.engagement, 1);
      assert.equal(data.counts.placement, 1);
      assert.equal(data.counts.skills, 1);
      assert.equal(data.counts.feedback, 2); // Staff sees both feedback items

      assert.equal(data.records.academic[0].subjectCode, 'CS301');
      assert.equal(data.records.attendance[0].classesAttended, 40);
      assert.equal(data.records.skills[0].skillName, 'Python');
    });

    it('should allow student to access their own integrated records but HIDE staff_only feedback', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_1_ID}/records`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      const data = res.body.data;

      assert.equal(data.student.studentId, STU_1_ID);
      // Student should only see 1 feedback record (aggregated/visible), not the staff_only one
      assert.equal(data.counts.feedback, 1);
      assert.equal(data.records.feedback[0].visibility, 'aggregated');
    });

    it('should DENY student from accessing another student records with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/api/v1/students/${STU_2_ID}/records`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });
});
