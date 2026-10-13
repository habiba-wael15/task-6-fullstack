import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Root & Health Endpoints - API Tests', () => {
  it('GET / should return 200 with API welcome info and documentation', async () => {
    const res = await request(app).get('/');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.message.includes('Saiket Systems'));
    assert.ok(res.body.documentation);
    assert.strictEqual(res.body.documentation.health, 'GET /api/health');
    assert.strictEqual(res.body.documentation.listUsers, 'GET /api/users');
  });

  it('GET /api/health should respond with a valid health JSON contract', async () => {
    const res = await request(app).get('/api/health');

    // Either 200 (if DB connected) or 503 (if DB offline in unit test environment)
    assert.ok([200, 503].includes(res.status));
    assert.ok('success' in res.body);
    assert.ok(['healthy', 'degraded'].includes(res.body.status));
    assert.strictEqual(res.body.service, 'saiket-task6-user-management-api');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
    assert.ok(res.body.database);
    assert.ok(['connected', 'disconnected'].includes(res.body.database.status));
  });

  it('GET /unknown-endpoint should return 404 Not Found JSON error', async () => {
    const res = await request(app).get('/api/unknown-route-12345');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'ROUTE_NOT_FOUND');
  });
});

