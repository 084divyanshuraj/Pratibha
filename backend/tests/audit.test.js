import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { AuditEvent } from '../src/models/AuditEvent.js';
import { generateToken } from '../src/auth/auth.service.js';
import { logAuditEvent } from '../src/audit/audit.service.js';

describe('Phase 9 — Audit Logging Subsystem & Credential Sanitization', () => {
  let adminToken;
  let facultyToken;
  let studentToken;

  before(async () => {
    await connectDatabase(config.mongoUri);

    await User.deleteMany({ email: { $regex: /@ph9-audit-test\.edu$/ } });
    await AuditEvent.deleteMany({ actorUserId: { $regex: /ph9-audit/ } });

    const adminUser = await User.create({
      email: 'admin@ph9-audit-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Audit Admin',
      role: 'admin',
    });
    const facultyUser = await User.create({
      email: 'faculty@ph9-audit-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Audit Faculty',
      role: 'faculty',
    });
    const studentUser = await User.create({
      email: 'student@ph9-audit-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Audit Student',
      role: 'student',
      studentId: 'STU_AUDIT_001',
    });

    adminToken = generateToken(adminUser);
    facultyToken = generateToken(facultyUser);
    studentToken = generateToken(studentUser);
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /@ph9-audit-test\.edu$/ } });
    await AuditEvent.deleteMany({ actorUserId: { $regex: /ph9-audit/ } });
    await disconnectDatabase();
  });

  describe('GET /api/v1/audit/events (Admin-only Audit Trail)', () => {
    test('should allow admin to inspect audit logs', async () => {
      // First log a test event
      await logAuditEvent({
        actorUserId: 'admin@ph9-audit-test.edu',
        action: 'TEST_AUDIT_ACTION',
        resourceType: 'system_test',
        metadata: { info: 'Audit trail verification' },
      });

      const res = await request(app)
        .get('/api/v1/audit/events')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.events));
      assert.ok(res.body.data.pagination);
    });

    test('should DENY faculty from viewing audit events with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/audit/events')
        .set('Authorization', `Bearer ${facultyToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    test('should DENY student from viewing audit events with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/audit/events')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    test('should reject unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/api/v1/audit/events');
      assert.equal(res.status, 401);
    });
  });

  describe('Audit Credential Sanitization & Privileged Action Hooks', () => {
    test('logAuditEvent should scrub passwords, tokens, and secrets from metadata', async () => {
      const recorded = await logAuditEvent({
        actorUserId: 'admin@ph9-audit-test.edu',
        action: 'SECURITY_TEST',
        resourceType: 'auth',
        metadata: {
          username: 'audited_user',
          password: 'SuperSecretPassword123!',
          apiKey: 'sec-key-12345',
          authToken: 'jwt.token.here',
          nested: {
            userSecret: 'nested_secret',
            safeField: 'harmless_data',
          },
        },
      });

      assert.ok(recorded);
      assert.equal(recorded.metadata.password, '[REDACTED_CREDENTIAL]');
      assert.equal(recorded.metadata.apiKey, '[REDACTED_CREDENTIAL]');
      assert.equal(recorded.metadata.authToken, '[REDACTED_CREDENTIAL]');
      assert.equal(recorded.metadata.nested.userSecret, '[REDACTED_CREDENTIAL]');
      assert.equal(recorded.metadata.nested.safeField, 'harmless_data');
    });

    test('User provisioning endpoint should emit USER_PROVISIONED audit log', async () => {
      const res = await request(app)
        .post('/api/v1/institution/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@ph9-audit-test.edu',
          password: 'Password123!',
          displayName: 'New Provisioned User',
          role: 'faculty',
        });

      assert.equal(res.status, 201);

      // Verify that an audit event was saved for USER_PROVISIONED
      const auditLog = await AuditEvent.findOne({
        action: 'USER_PROVISIONED',
        'metadata.email': 'newuser@ph9-audit-test.edu',
      });

      assert.ok(auditLog);
      assert.equal(auditLog.resourceType, 'user');
      // Password must NEVER be logged in metadata
      assert.equal(auditLog.metadata.password, undefined);
      assert.equal(auditLog.metadata.passwordHash, undefined);
    });
  });
});
