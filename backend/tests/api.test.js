import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('API v1 Base Endpoint', () => {
  it('GET /api/v1 should return API status and version metadata', async () => {
    const res = await request(app).get('/api/v1');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.version, 'v1');
    assert.equal(res.body.data.status, 'active');
    assert.ok(res.body.meta.requestId);
  });
});
