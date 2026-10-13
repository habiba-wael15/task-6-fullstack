import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { UsersService } from '../../src/services/users.service.js';

describe('Users Service - Unit Tests (Mock Repository)', () => {
  let mockRepo;
  let service;
  let sampleUsers;

  beforeEach(() => {
    sampleUsers = [
      { Id: 1, Name: 'Habiba Wael', Email: 'habiba@example.com', Age: 22, CreatedAt: new Date() },
      { Id: 2, Name: 'Alex Johnson', Email: 'alex@example.com', Age: 28, CreatedAt: new Date() }
    ];

    mockRepo = {
      findAll: async (search) => {
        if (!search) return [...sampleUsers];
        return sampleUsers.filter(
          (u) =>
            u.Name.toLowerCase().includes(search.toLowerCase()) ||
            u.Email.toLowerCase().includes(search.toLowerCase())
        );
      },
      findById: async (id) => sampleUsers.find((u) => u.Id === id) || null,
      findByEmail: async (email) =>
        sampleUsers.find((u) => u.Email.toLowerCase() === email.toLowerCase()) || null,
      create: async (data) => {
        const newUser = {
          Id: sampleUsers.length + 1,
          ...data,
          CreatedAt: new Date(),
          UpdatedAt: null
        };
        sampleUsers.push(newUser);
        return newUser;
      },
      update: async (id, updates) => {
        const user = sampleUsers.find((u) => u.Id === id);
        if (!user) return null;
        if (updates.name !== undefined) user.Name = updates.name;
        if (updates.email !== undefined) user.Email = updates.email;
        if (updates.age !== undefined) user.Age = updates.age;
        user.UpdatedAt = new Date();
        return { ...user };
      },
      delete: async (id) => {
        const index = sampleUsers.findIndex((u) => u.Id === id);
        if (index === -1) return false;
        sampleUsers.splice(index, 1);
        return true;
      },
      getStats: async () => ({
        totalUsers: sampleUsers.length,
        averageAge: 25,
        minAge: 22,
        maxAge: 28
      })
    };

    service = new UsersService(mockRepo);
  });

  describe('getAllUsers', () => {
    it('should return all users when no search term is passed', async () => {
      const users = await service.getAllUsers();
      assert.strictEqual(users.length, 2);
      assert.strictEqual(users[0].Name, 'Habiba Wael');
    });

    it('should filter users matching search term', async () => {
      const users = await service.getAllUsers('alex');
      assert.strictEqual(users.length, 1);
      assert.strictEqual(users[0].Name, 'Alex Johnson');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await service.getUserById(1);
      assert.strictEqual(user.Id, 1);
      assert.strictEqual(user.Name, 'Habiba Wael');
    });

    it('should throw 404 error when user does not exist', async () => {
      await assert.rejects(
        async () => await service.getUserById(999),
        (err) => {
          assert.strictEqual(err.status, 404);
          assert.strictEqual(err.code, 'USER_NOT_FOUND');
          return true;
        }
      );
    });
  });

  describe('createUser', () => {
    it('should successfully create a new user when email is unique', async () => {
      const newUser = await service.createUser({
        name: 'Sara Connor',
        email: 'sara@example.com',
        age: 33
      });
      assert.strictEqual(newUser.Id, 3);
      assert.strictEqual(newUser.name, 'Sara Connor');
    });

    it('should throw 409 conflict error when email is already registered', async () => {
      await assert.rejects(
        async () =>
          await service.createUser({
            name: 'Duplicate User',
            email: 'habiba@example.com',
            age: 26
          }),
        (err) => {
          assert.strictEqual(err.status, 409);
          assert.strictEqual(err.code, 'EMAIL_ALREADY_EXISTS');
          return true;
        }
      );
    });
  });

  describe('updateUser', () => {
    it('should successfully update user details', async () => {
      const updated = await service.updateUser(1, { name: 'Habiba Updated', age: 23 });
      assert.strictEqual(updated.Name, 'Habiba Updated');
      assert.strictEqual(updated.Age, 23);
    });

    it('should throw 404 error when updating nonexistent user', async () => {
      await assert.rejects(
        async () => await service.updateUser(999, { name: 'Ghost' }),
        (err) => {
          assert.strictEqual(err.status, 404);
          assert.strictEqual(err.code, 'USER_NOT_FOUND');
          return true;
        }
      );
    });

    it('should throw 409 conflict error if new email is already taken by another user', async () => {
      await assert.rejects(
        async () => await service.updateUser(1, { email: 'alex@example.com' }),
        (err) => {
          assert.strictEqual(err.status, 409);
          assert.strictEqual(err.code, 'EMAIL_ALREADY_EXISTS');
          return true;
        }
      );
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete an existing user', async () => {
      const result = await service.deleteUser(2);
      assert.strictEqual(result.id, 2);
      const remaining = await service.getAllUsers();
      assert.strictEqual(remaining.length, 1);
    });

    it('should throw 404 error when deleting nonexistent user', async () => {
      await assert.rejects(
        async () => await service.deleteUser(999),
        (err) => {
          assert.strictEqual(err.status, 404);
          assert.strictEqual(err.code, 'USER_NOT_FOUND');
          return true;
        }
      );
    });
  });

  describe('getUserStats', () => {
    it('should return stats object', async () => {
      const stats = await service.getUserStats();
      assert.strictEqual(stats.totalUsers, 2);
      assert.strictEqual(stats.averageAge, 25);
    });
  });
});
