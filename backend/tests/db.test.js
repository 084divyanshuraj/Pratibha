import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectDatabase, registerDatabaseHealthProbe } from '../src/db/connection.js';
import { checkReadiness, resetDependencyProbes } from '../src/health/health.service.js';

describe('Database Connection & Health Integration', () => {
  it('connectDatabase should throw clear error if MONGODB_URI is empty', async () => {
    await assert.rejects(
      async () => {
        await connectDatabase('');
      },
      {
        message: /MONGODB_URI is not defined/,
      }
    );
  });

  it('registerDatabaseHealthProbe should hook database probe into health readiness check', async () => {
    resetDependencyProbes();
    registerDatabaseHealthProbe();

    const readiness = await checkReadiness();
    assert.ok(readiness.checks.database);
    assert.equal(readiness.checks.database.status, 'disconnected');
    assert.equal(readiness.checks.database.ready, false);
    assert.equal(readiness.ready, false);
    // Ensure no secrets are leaked
    const jsonStr = JSON.stringify(readiness);
    assert.equal(jsonStr.includes('password'), false);
    assert.equal(jsonStr.includes('mongodb'), false);
  });
});
