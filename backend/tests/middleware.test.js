import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Middleware & Safety Tests', () => {
  describe('Request ID', () => {
    it('should generate a new request ID when none is provided in headers', async () => {
      const res = await request(app).get('/health/live');
      assert.ok(res.headers['x-request-id']);
      assert.ok(res.headers['x-request-id'].startsWith('req_'));
      assert.equal(res.body.meta.requestId, res.headers['x-request-id']);
    });

    it('should preserve and reflect an incoming X-Request-Id header', async () => {
      const customId = 'client-req-999888';
      const res = await request(app)
        .get('/health/live')
        .set('X-Request-Id', customId);

      assert.equal(res.headers['x-request-id'], customId);
      assert.equal(res.body.meta.requestId, customId);
    });
  });

  describe('404 Not Found Handling', () => {
    it('should return standard error envelope on unknown routes', async () => {
      const res = await request(app).get('/unknown/route/does/not/exist');

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'NOT_FOUND');
      assert.ok(res.body.error.message.includes('/unknown/route/does/not/exist'));
      assert.ok(res.body.meta.requestId);
    });
  });

  describe('Malformed JSON Request Body', () => {
    it('should return 400 with MALFORMED_JSON error code', async () => {
      const res = await request(app)
        .post('/api/v1')
        .set('Content-Type', 'application/json')
        .send('{"bad_json: missing_brace');

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'MALFORMED_JSON');
      assert.ok(res.body.error.message);
      assert.ok(res.body.meta.requestId);
    });
  });

  describe('CORS Handling', () => {
    it('should allow requests from whitelisted frontend origins', async () => {
      const res = await request(app)
        .get('/health/live')
        .set('Origin', 'http://localhost:3000');

      assert.equal(res.status, 200);
      assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000');
    });

    it('should reject requests from disallowed origins with 403', async () => {
      const res = await request(app)
        .get('/health/live')
        .set('Origin', 'https://malicious-site.example.com');

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CORS_FORBIDDEN');
    });
  });

  describe('Security Headers', () => {
    it('should include Helmet security headers', async () => {
      const res = await request(app).get('/health/live');

      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
    });
  });
});
