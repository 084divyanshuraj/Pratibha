import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { config } from '../src/config/env.js';

describe('Phase 10 — Deployment Hardening & Security Assurance', () => {
  before(async () => {
    await connectDatabase(config.mongoUri);
  });

  after(async () => {
    config.isProd = false; // Ensure development mode is restored
    await disconnectDatabase();
  });

  describe('Security Headers (Helmet & HTTP Hardening)', () => {
    test('should include standard security headers in API responses', async () => {
      const res = await request(app).get('/health/live');

      assert.equal(res.status, 200);
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
      assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
      assert.equal(res.headers['x-dns-prefetch-control'], 'off');
      assert.equal(res.headers['x-download-options'], 'noopen');
    });

    test('should return unique requestId in meta and headers', async () => {
      const res = await request(app).get('/health/live');

      assert.equal(res.status, 200);
      assert.ok(res.body.meta?.requestId);
      assert.match(res.body.meta.requestId, /^req_/);
    });
  });

  describe('CORS Allowed Origins Policy', () => {
    test('should allow CORS requests originating from configured frontend origin', async () => {
      const allowedOrigin = config.cors.allowedOrigins[0] || 'http://localhost:5173';

      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'GET');

      assert.equal(res.status, 204);
      assert.equal(res.headers['access-control-allow-origin'], allowedOrigin);
    });
  });

  describe('Production Error Masking & Stack Protection', () => {
    test('should mask internal error messages and strip stack traces in production mode', async () => {
      const originalIsProd = config.isProd;
      try {
        config.isProd = true; // Temporarily simulate production runtime

        // Trigger a 404 or simulated error
        const res = await request(app).get('/api/v1/this-route-does-not-exist');

        assert.equal(res.status, 404);
        assert.equal(res.body.success, false);
        // Debug stack must NEVER be present in production
        assert.equal(res.body.debug, undefined);
      } finally {
        config.isProd = originalIsProd;
      }
    });
  });

  describe('Health Probes Readiness State', () => {
    test('/health/ready should report database as connected', async () => {
      const res = await request(app).get('/health/ready');

      assert.equal(res.status, 200);
      assert.equal(res.body.data.ready, true);
      assert.equal(res.body.data.status, 'ready');
      assert.equal(res.body.data.checks.database.status, 'connected');
    });
  });
});
