import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import {
  registerDependencyProbe,
  resetDependencyProbes,
} from '../src/health/health.service.js';

describe('Health Endpoints', () => {
  beforeEach(() => {
    resetDependencyProbes();
  });

  describe('GET /health/live', () => {
    it('should return 200 OK with liveness status and request ID', async () => {
      const res = await request(app).get('/health/live');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, 'ok');
      assert.equal(typeof res.body.data.uptimeSeconds, 'number');
      assert.ok(res.body.data.timestamp);
      assert.ok(res.body.meta.requestId.startsWith('req_'));
      assert.equal(res.headers['x-request-id'], res.body.meta.requestId);
    });
  });

  describe('GET /health/ready', () => {
    it('should return 503 when database dependency is unconfigured/not connected', async () => {
      const res = await request(app).get('/health/ready');

      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.data.ready, false);
      assert.equal(res.body.data.status, 'not_ready');
      assert.equal(res.body.data.checks.database.status, 'not_configured');
      assert.equal(res.body.data.checks.database.ready, false);
      // Ensure zero credentials or secret substrings in output
      const rawText = JSON.stringify(res.body);
      assert.equal(rawText.includes('password'), false);
      assert.equal(rawText.includes('mongodb+srv'), false);
    });

    it('should return 200 OK when registered dependencies report ready', async () => {
      registerDependencyProbe('database', async () => ({
        ready: true,
        status: 'connected',
      }));

      const res = await request(app).get('/health/ready');

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.ready, true);
      assert.equal(res.body.data.status, 'ready');
      assert.equal(res.body.data.checks.database.status, 'connected');
      assert.equal(res.body.data.checks.database.ready, true);
    });

    it('should return 503 if any required probe throws or reports not ready', async () => {
      registerDependencyProbe('database', async () => ({
        ready: false,
        status: 'disconnected',
        message: 'Connection pool closed',
      }));

      const res = await request(app).get('/health/ready');

      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.data.ready, false);
      assert.equal(res.body.data.checks.database.status, 'disconnected');
    });
  });
});
