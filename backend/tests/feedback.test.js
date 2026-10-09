import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Student } from '../src/models/Student.js';
import { FeedbackRecord } from '../src/models/FeedbackRecord.js';
import { generateToken } from '../src/auth/auth.service.js';

describe('Phase 9 — Feedback Subsystem & Privacy Boundaries', () => {
  let adminToken;
  let facultyToken;
  let student1Token;
  let student2Token;

  const testStudentId1 = 'STU_PH9_001';
  const testStudentId2 = 'STU_PH9_002';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean up test collections
    await User.deleteMany({ email: { $regex: /@ph9-test\.edu$/ } });
    await Student.deleteMany({ studentId: { $in: [testStudentId1, testStudentId2] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [testStudentId1, testStudentId2] } });

    // Seed test students
    await Student.create([
      {
        studentId: testStudentId1,
        firstName: 'Ananya',
        lastName: 'Sharma',
        department: 'Computer Science',
        program: 'B.Tech',
        semester: 6,
        enrollmentYear: 2021,
      },
      {
        studentId: testStudentId2,
        firstName: 'Rohit',
        lastName: 'Verma',
        department: 'Data Science',
        program: 'B.Tech',
        semester: 6,
        enrollmentYear: 2021,
      },
    ]);

    // Create test users
    const adminUser = await User.create({
      email: 'admin@ph9-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Phase 9 Admin',
      role: 'admin',
    });
    const facultyUser = await User.create({
      email: 'faculty@ph9-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Phase 9 Faculty',
      role: 'faculty',
    });
    const student1User = await User.create({
      email: 'student1@ph9-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Phase 9 Student 1',
      role: 'student',
      studentId: testStudentId1,
    });
    const student2User = await User.create({
      email: 'student2@ph9-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Phase 9 Student 2',
      role: 'student',
      studentId: testStudentId2,
    });

    adminToken = generateToken(adminUser);
    facultyToken = generateToken(facultyUser);
    student1Token = generateToken(student1User);
    student2Token = generateToken(student2User);
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /@ph9-test\.edu$/ } });
    await Student.deleteMany({ studentId: { $in: [testStudentId1, testStudentId2] } });
    await FeedbackRecord.deleteMany({ studentId: { $in: [testStudentId1, testStudentId2] } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/feedback (Feedback Submission)', () => {
    test('should allow student to submit feedback for their own profile', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          feedbackType: 'student_satisfaction',
          rating: 4,
          comment: 'The algorithmic problem-solving lab was very insightful.',
          visibility: 'staff_only',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.studentId, testStudentId1);
      assert.equal(res.body.data.rating, 4);
      assert.equal(res.body.data.feedbackType, 'student_satisfaction');
    });

    test('should prevent student from submitting feedback for another student ID with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          studentId: testStudentId2,
          feedbackType: 'course_feedback',
          rating: 2,
          comment: 'Trying to impersonate student 2',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    test('should allow faculty to submit feedback for a student', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: testStudentId2,
          feedbackType: 'faculty_feedback',
          rating: 5,
          comment: 'Consistent attendance and active participation in discussions.',
          visibility: 'private',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.studentId, testStudentId2);
      assert.equal(res.body.data.visibility, 'private');
    });

    test('should reject invalid feedbackType with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: testStudentId1,
          feedbackType: 'invalid_category_xyz',
          rating: 3,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    test('should reject out-of-range rating with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          feedbackType: 'student_satisfaction',
          rating: 7, // Invalid (must be 1-5)
          comment: 'Too high rating',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    test('should return 404 NOT_FOUND for non-existent studentId', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          studentId: 'STU_GHOST_9999',
          feedbackType: 'faculty_feedback',
          rating: 3,
        });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });

    test('should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app).post('/api/v1/feedback').send({
        studentId: testStudentId1,
        feedbackType: 'other',
        rating: 3,
      });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  describe('GET /api/v1/feedback/summary (Aggregated Summary & Privacy)', () => {
    test('should allow staff to retrieve aggregated summary without raw comment exposure', async () => {
      const res = await request(app)
        .get('/api/v1/feedback/summary')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert(typeof data.totalResponses === 'number');
      assert(typeof data.ratedResponses === 'number');
      assert(data.averageRating !== undefined);
      assert.ok(data.ratingDistribution);
      assert.ok(Array.isArray(data.byType));
      assert(typeof data.commentsCount === 'number');
      assert.ok(data.commentPrivacyNote);
      // Raw comments array must NOT exist in the summary response!
      assert.equal(data.comments, undefined);
    });

    test('should DENY student from accessing feedback summary with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/feedback/summary')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });
  });

  describe('GET /api/v1/feedback (List & Comment Redaction)', () => {
    test('should scope student view strictly to own records', async () => {
      const res = await request(app)
        .get('/api/v1/feedback')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.feedback));

      for (const item of res.body.data.feedback) {
        assert.equal(item.studentId, testStudentId1);
      }
    });

    test('should redact private comments for non-admin faculty when submitted by another', async () => {
      const res = await request(app)
        .get(`/api/v1/feedback?studentId=${testStudentId2}`)
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      const privateFeedback = res.body.data.feedback.find((f) => f.visibility === 'private');
      if (privateFeedback) {
        assert.equal(privateFeedback.comment, '[REDACTED: PRIVATE FEEDBACK]');
      }
    });

    test('should allow admin to view unredacted comments', async () => {
      const res = await request(app)
        .get(`/api/v1/feedback?studentId=${testStudentId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      const privateFeedback = res.body.data.feedback.find((f) => f.visibility === 'private');
      if (privateFeedback) {
        assert.notEqual(privateFeedback.comment, '[REDACTED: PRIVATE FEEDBACK]');
      }
    });
  });
});
