import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { MockUsersRepository } from '../helpers/mockUsersRepository.js';

describe('Users REST API Endpoints (Isolated Tests with Mock Repository)', () => {
  let mockRepo;
  let app;

  beforeEach(() => {
    mockRepo = new MockUsersRepository();
    app = createApp({ usersRepository: mockRepo });
  });

  describe('GET /api/users', () => {
    it('should return 200 and list of all users', async () => {
      const res = await request(app).get('/api/users');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 3);
      assert.strictEqual(res.body.data.length, 3);
      assert.strictEqual(res.body.data[0].Name, 'Habiba Wael');
    });

    it('should filter users by search query parameter', async () => {
      const res = await request(app).get('/api/users?search=alex');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1);
      assert.strictEqual(res.body.data[0].Name, 'Alex Johnson');
    });
  });

  describe('GET /api/users/stats', () => {
    it('should return 200 and dashboard statistics', async () => {
      const res = await request(app).get('/api/users/stats');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.totalUsers, 3);
      assert.ok(typeof res.body.data.averageAge === 'number');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 200 and user data for existing ID', async () => {
      const res = await request(app).get('/api/users/1');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.Id, 1);
      assert.strictEqual(res.body.data.Name, 'Habiba Wael');
    });

    it('should return 404 for nonexistent user ID', async () => {
      const res = await request(app).get('/api/users/999');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'USER_NOT_FOUND');
    });

    it('should return 400 for non-numeric ID', async () => {
      const res = await request(app).get('/api/users/abc');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_ID');
    });

    it('should return 400 for negative or zero ID', async () => {
      const resZero = await request(app).get('/api/users/0');
      assert.strictEqual(resZero.status, 400);

      const resNeg = await request(app).get('/api/users/-3');
      assert.strictEqual(resNeg.status, 400);
    });
  });

  describe('POST /api/users', () => {
    it('should return 201 and created user for valid payload', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          age: 45
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'User created successfully.');
      assert.strictEqual(res.body.data.Id, 4);
      assert.strictEqual(res.body.data.Name, 'Michael Brown');
      assert.strictEqual(res.body.data.Email, 'michael.brown@example.com');
      assert.strictEqual(res.body.data.Age, 45);
    });

    it('should return 400 when required fields are missing or invalid', async () => {
      // Missing name
      const resNoName = await request(app)
        .post('/api/users')
        .send({ email: 'noname@example.com', age: 30 });
      assert.strictEqual(resNoName.status, 400);
      assert.strictEqual(resNoName.body.error.code, 'VALIDATION_ERROR');

      // Invalid email
      const resBadEmail = await request(app)
        .post('/api/users')
        .send({ name: 'Valid Name', email: 'not-an-email', age: 30 });
      assert.strictEqual(resBadEmail.status, 400);

      // Out of range age
      const resBadAge = await request(app)
        .post('/api/users')
        .send({ name: 'Valid Name', email: 'valid@example.com', age: 150 });
      assert.strictEqual(resBadAge.status, 400);
    });

    it('should return 409 when email already exists', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Habiba Clone',
          email: 'habiba.wael@example.com',
          age: 25
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 200 and updated user for valid request', async () => {
      const res = await request(app)
        .put('/api/users/2')
        .send({
          name: 'Alex Johnson Updated',
          email: 'alex.updated@example.com',
          age: 29
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.Id, 2);
      assert.strictEqual(res.body.data.Name, 'Alex Johnson Updated');
      assert.strictEqual(res.body.data.Email, 'alex.updated@example.com');
      assert.strictEqual(res.body.data.Age, 29);
    });

    it('should return 404 for nonexistent user ID', async () => {
      const res = await request(app)
        .put('/api/users/999')
        .send({
          name: 'Ghost User',
          email: 'ghost@example.com',
          age: 30
        });

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error.code, 'USER_NOT_FOUND');
    });

    it('should return 400 for malformed ID', async () => {
      const res = await request(app)
        .put('/api/users/xyz')
        .send({ name: 'Testing' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.code, 'INVALID_ID');
    });

    it('should return 409 when updated email is already taken by another user', async () => {
      const res = await request(app)
        .put('/api/users/2')
        .send({
          email: 'habiba.wael@example.com' // Belongs to user ID 1
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 200 and delete user for valid ID', async () => {
      const res = await request(app).delete('/api/users/3');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.id, 3);

      // Verify user was deleted
      const checkRes = await request(app).get('/api/users/3');
      assert.strictEqual(checkRes.status, 404);
    });

    it('should return 404 for nonexistent user ID', async () => {
      const res = await request(app).delete('/api/users/999');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error.code, 'USER_NOT_FOUND');
    });

    it('should return 400 for malformed user ID', async () => {
      const res = await request(app).delete('/api/users/invalid-id');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.code, 'INVALID_ID');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return 400 for malformed JSON request bodies', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('{"name": "Bad JSON", "age": ');

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_JSON_BODY');
    });
  });
});

