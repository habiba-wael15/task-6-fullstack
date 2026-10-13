import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getPool, closePool, checkConnection } from '../../src/config/database.js';
import { UsersRepository } from '../../src/repositories/users.repository.js';

describe('Database Integration Tests (Real SQL Server - SaiketTask6DB)', () => {
  let repository;
  let testUserId = null;
  const uniqueTimestamp = Date.now();
  const testEmail = `qa.test.${uniqueTimestamp}@example.com`;
  const updatedEmail = `qa.updated.${uniqueTimestamp}@example.com`;

  before(async (t) => {
    const health = await checkConnection();
    if (!health.connected) {
      console.warn(`[Integration Test Skipped] SQL Server not reachable: ${health.error}`);
      t.skip('SQL Server is not available.');
      return;
    }
    repository = new UsersRepository(getPool);
  });

  after(async () => {
    // Clean up ONLY the test user if still present
    if (testUserId && repository) {
      try {
        await repository.delete(testUserId);
      } catch (err) {
        console.warn(`[Cleanup Warning] Could not delete test user ID ${testUserId}:`, err.message);
      }
    }
    await closePool();
  });

  it('1. Should connect and verify connection health against SaiketTask6DB', async (t) => {
    const health = await checkConnection();
    if (!health.connected) {
      t.skip('SQL Server is not available.');
      return;
    }
    assert.strictEqual(health.connected, true);
    assert.strictEqual(health.database, 'SaiketTask6DB');
  });

  it('2. Should create a new user record in dbo.Users', async (t) => {
    if (!repository) {
      t.skip('Repository not initialized.');
      return;
    }

    const created = await repository.create({
      name: 'Integration Test User',
      email: testEmail,
      age: 33
    });

    assert.ok(created);
    assert.ok(created.Id);
    testUserId = created.Id;
    assert.strictEqual(created.Name, 'Integration Test User');
    assert.strictEqual(created.Email, testEmail);
    assert.strictEqual(created.Age, 33);
    assert.ok(created.CreatedAt);
  });

  it('3. Should retrieve created test user by ID and by Email', async (t) => {
    if (!repository || !testUserId) {
      t.skip('No test user created.');
      return;
    }

    const byId = await repository.findById(testUserId);
    assert.ok(byId);
    assert.strictEqual(byId.Id, testUserId);
    assert.strictEqual(byId.Name, 'Integration Test User');

    const byEmail = await repository.findByEmail(testEmail);
    assert.ok(byEmail);
    assert.strictEqual(byEmail.Id, testUserId);
  });

  it('4. Should update test user and record UpdatedAt timestamp', async (t) => {
    if (!repository || !testUserId) {
      t.skip('No test user created.');
      return;
    }

    const updated = await repository.update(testUserId, {
      name: 'Integration User Updated',
      email: updatedEmail,
      age: 34
    });

    assert.ok(updated);
    assert.strictEqual(updated.Id, testUserId);
    assert.strictEqual(updated.Name, 'Integration User Updated');
    assert.strictEqual(updated.Email, updatedEmail);
    assert.strictEqual(updated.Age, 34);
    assert.ok(updated.UpdatedAt);
  });

  it('5. Should retrieve stats including the test user', async (t) => {
    if (!repository) {
      t.skip('Repository not initialized.');
      return;
    }

    const stats = await repository.getStats();
    assert.ok(typeof stats.totalUsers === 'number');
    assert.ok(stats.totalUsers > 0);
  });

  it('6. Should delete the test user record and verify it no longer exists', async (t) => {
    if (!repository || !testUserId) {
      t.skip('No test user created.');
      return;
    }

    const deleted = await repository.delete(testUserId);
    assert.strictEqual(deleted, true);

    const check = await repository.findById(testUserId);
    assert.strictEqual(check, null);

    // Clear ID so after hook doesn't attempt redundant delete
    testUserId = null;
  });
});

