import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { User } from '../src/models/User.js';

describe('Phase 3 — Authentication & Role Authorization', () => {
  const TEST_PASSWORD = 'TestPassword123!';
  let adminToken = '';
  let facultyToken = '';
  let studentToken = '';

  before(async () => {
    await connectDatabase(config.mongoUri);

    // Clean previous test accounts
    await User.deleteMany({ email: { $regex: /^test\./ } });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, salt);

    // 1. Create Admin
    await User.create({
      email: 'test.admin@example.edu',
      passwordHash,
      displayName: 'Test Admin',
      role: 'admin',
      isActive: true,
    });

    // 2. Create Faculty
    await User.create({
      email: 'test.faculty@example.edu',
      passwordHash,
      displayName: 'Test Faculty',
      role: 'faculty',
      isActive: true,
    });

    // 3. Create Student
    await User.create({
      email: 'test.student@example.edu',
      passwordHash,
      displayName: 'Test Student',
      role: 'student',
      studentId: 'STU_TEST_001',
      isActive: true,
    });

    // 4. Create Inactive User
    await User.create({
      email: 'test.inactive@example.edu',
      passwordHash,
      displayName: 'Test Inactive',
      role: 'student',
      studentId: 'STU_TEST_002',
      isActive: false,
    });

    // Obtain tokens for role tests
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test.admin@example.edu', password: TEST_PASSWORD });
    adminToken = adminLoginRes.body.data.accessToken;

    const facultyLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test.faculty@example.edu', password: TEST_PASSWORD });
    facultyToken = facultyLoginRes.body.data.accessToken;

    const studentLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test.student@example.edu', password: TEST_PASSWORD });
    studentToken = studentLoginRes.body.data.accessToken;
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /^test\./ } });
    await disconnectDatabase();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate valid credentials and return JWT + user profile DTO', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.faculty@example.edu',
          password: TEST_PASSWORD,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.accessToken);
      assert.equal(res.body.data.tokenType, 'Bearer');
      assert.equal(res.body.data.user.email, 'test.faculty@example.edu');
      assert.equal(res.body.data.user.role, 'faculty');
      assert.equal(res.body.data.user.passwordHash, undefined); // Strictly omitted
      assert.ok(res.body.meta.requestId);
    });

    it('should reject invalid password with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.faculty@example.edu',
          password: 'WrongPassword999!',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
      assert.ok(res.body.error.message);
    });

    it('should reject non-existent email with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.edu',
          password: TEST_PASSWORD,
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    });

    it('should reject missing email or password with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test.faculty@example.edu' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    it('should reject deactivated user with 403 ACCOUNT_INACTIVE', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.inactive@example.edu',
          password: TEST_PASSWORD,
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'ACCOUNT_INACTIVE');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile when valid token is provided', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, 'test.student@example.edu');
      assert.equal(res.body.data.role, 'student');
      assert.equal(res.body.data.studentId, 'STU_TEST_001');
      assert.equal(res.body.data.passwordHash, undefined);
    });

    it('should reject request missing Authorization header with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    it('should reject invalid token signature with 401 INVALID_TOKEN', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'INVALID_TOKEN');
    });

    it('should reject expired token with 401 TOKEN_EXPIRED', async () => {
      const expiredToken = jwt.sign(
        { sub: '507f1f77bcf86cd799439011', role: 'student' },
        config.jwtSecret,
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'TOKEN_EXPIRED');
    });
  });

  describe('POST /api/v1/institution/users (Admin Provisioning)', () => {
    it('should allow admin to provision a new user with hashed password', async () => {
      const newEmail = 'test.provisioned@example.edu';
      const res = await request(app)
        .post('/api/v1/institution/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: newEmail,
          password: 'SecurePassword123!',
          displayName: 'Provisioned Faculty',
          role: 'faculty',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.email, newEmail);
      assert.equal(res.body.data.role, 'faculty');
      assert.equal(res.body.data.passwordHash, undefined);

      // Verify in DB that password was hashed
      const saved = await User.findOne({ email: newEmail });
      assert.ok(saved.passwordHash.startsWith('$2'));
      assert.notEqual(saved.passwordHash, 'SecurePassword123!');
    });

    it('should prevent non-admin from provisioning users with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/institution/users')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          email: 'test.unauthorized@example.edu',
          password: 'SecurePassword123!',
          displayName: 'Unauthorized Attempt',
          role: 'faculty',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('should reject duplicate email with 409 CONFLICT', async () => {
      const res = await request(app)
        .post('/api/v1/institution/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test.admin@example.edu',
          password: 'AnotherPassword123!',
          displayName: 'Duplicate Admin',
          role: 'admin',
        });

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CONFLICT');
    });

    it('should require studentId when provisioning student role', async () => {
      const res = await request(app)
        .post('/api/v1/institution/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test.nostudentid@example.edu',
          password: 'Password123!',
          displayName: 'Student Without ID',
          role: 'student',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('Object-Level Student Authorization Gate', () => {
    it('should allow student to access their own studentId record', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_TEST_001/test-scope')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.studentId, 'STU_TEST_001');
    });

    it('should DENY student trying to access another student record with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_OTHER_999/test-scope')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.ok(res.body.error.message.includes('only permitted to access their own'));
    });

    it('should allow faculty to access any student record', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_TEST_001/test-scope')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.accessedByRole, 'faculty');
    });

    it('should allow admin to access any student record', async () => {
      const res = await request(app)
        .get('/api/v1/students/STU_TEST_001/test-scope')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.accessedByRole, 'admin');
    });

    it('should deny unauthenticated requests to student record with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/students/STU_TEST_001/test-scope');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });
  });
});
