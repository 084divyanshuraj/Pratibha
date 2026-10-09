import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { generateToken } from '../src/auth/auth.service.js';

describe('Phase 9 — Copilot Assistant & Grounded Analytical Dispatcher', () => {
  let facultyToken;

  before(async () => {
    await connectDatabase(config.mongoUri);

    await User.deleteMany({ email: { $regex: /@ph9-copilot-test\.edu$/ } });

    const facultyUser = await User.create({
      email: 'faculty@ph9-copilot-test.edu',
      passwordHash: 'dummyhash',
      displayName: 'Copilot Faculty',
      role: 'faculty',
    });

    facultyToken = generateToken(facultyUser);
  });

  after(async () => {
    await User.deleteMany({ email: { $regex: /@ph9-copilot-test\.edu$/ } });
    config.copilot.enabled = false; // Restore default
    await disconnectDatabase();
  });

  describe('POST /api/v1/copilot/query (Safe Execution & Provider Gates)', () => {
    test('should reject unauthenticated calls with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/copilot/query')
        .send({ query: 'Show me campus KPIs' });

      assert.equal(res.status, 401);
    });

    test('should reject empty or invalid query with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: '' });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    });

    test('should reject arbitrary SQL/NoSQL injection queries with 400 UNAUTHORIZED_QUERY_SYNTAX', async () => {
      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'SELECT * FROM users; DROP TABLE students;' });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'UNAUTHORIZED_QUERY_SYNTAX');
    });

    test('should return explicit not_configured response when copilot is disabled', async () => {
      config.copilot.enabled = false;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'What is the current average student success score?' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'not_configured');
      assert.equal(res.body.data.configured, false);
      assert.ok(res.body.data.message);
      assert.ok(Array.isArray(res.body.data.suggestedEndpoints));
    });

    test('should resolve overview KPI query grounded in verified analytics when copilot is enabled', async () => {
      config.copilot.enabled = true;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'Give me the campus overview KPI summary' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'answered');
      assert.equal(res.body.data.intent, 'INSTITUTION_OVERVIEW');
      assert.equal(res.body.data.grounded, true);
      assert.deepEqual(res.body.data.sources, ['/api/v1/analytics/overview']);
      assert.ok(res.body.data.data);
    });

    test('should resolve risk distribution query grounded in verified risk metrics', async () => {
      config.copilot.enabled = true;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'How many students are at high academic risk?' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'answered');
      assert.equal(res.body.data.intent, 'RISK_SUMMARY');
      assert.deepEqual(res.body.data.sources, ['/api/v1/analytics/risk-summary']);
    });

    test('should resolve student segments query grounded in deterministic segment rules', async () => {
      config.copilot.enabled = true;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'List current student segments and cohorts' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'answered');
      assert.equal(res.body.data.intent, 'STUDENT_SEGMENTS');
      assert.deepEqual(res.body.data.sources, ['/api/v1/segments']);
    });

    test('should resolve intervention catalog query grounded in active intervention programs', async () => {
      config.copilot.enabled = true;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'What intervention programs and tutoring are available in the catalog?' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'answered');
      assert.equal(res.body.data.intent, 'INTERVENTION_CATALOG');
      assert.deepEqual(res.body.data.sources, ['/api/v1/intervention-catalog']);
    });

    test('should return unsupported_intent with helpful suggestions for out-of-scope questions', async () => {
      config.copilot.enabled = true;

      const res = await request(app)
        .post('/api/v1/copilot/query')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ query: 'Tell me a joke about college life' });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'unsupported_intent');
      assert.ok(Array.isArray(res.body.data.supportedTopics));
    });
  });
});
