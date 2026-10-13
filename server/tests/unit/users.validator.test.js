import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateId, validateCreateUser, validateUpdateUser } from '../../src/validators/users.validator.js';

describe('Users Validator - Unit Tests', () => {
  describe('validateId', () => {
    it('should return valid parsed integer for numeric strings', () => {
      assert.strictEqual(validateId('1'), 1);
      assert.strictEqual(validateId('42'), 42);
      assert.strictEqual(validateId('  999  '), 999);
      assert.strictEqual(validateId(15), 15);
    });

    it('should reject non-numeric strings', () => {
      assert.throws(() => validateId('abc'), {
        status: 400,
        code: 'INVALID_ID'
      });
      assert.throws(() => validateId('12a'), {
        status: 400,
        code: 'INVALID_ID'
      });
    });

    it('should reject zero and negative integers', () => {
      assert.throws(() => validateId('0'), {
        status: 400,
        code: 'INVALID_ID'
      });
      assert.throws(() => validateId('-5'), {
        status: 400,
        code: 'INVALID_ID'
      });
    });

    it('should reject decimals and floats', () => {
      assert.throws(() => validateId('3.14'), {
        status: 400,
        code: 'INVALID_ID'
      });
    });

    it('should reject undefined, null, or empty string', () => {
      assert.throws(() => validateId(''), { status: 400 });
      assert.throws(() => validateId(null), { status: 400 });
      assert.throws(() => validateId(undefined), { status: 400 });
    });
  });

  describe('validateCreateUser', () => {
    it('should sanitize and accept a valid user payload', () => {
      const input = {
        name: '  Jane Doe  ',
        email: '  Jane.Doe@Example.COM  ',
        age: 29
      };
      const result = validateCreateUser(input);
      assert.deepStrictEqual(result, {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        age: 29
      });
    });

    it('should accept string numeric age and convert to integer', () => {
      const input = { name: 'Bob Smith', email: 'bob@example.com', age: '35' };
      const result = validateCreateUser(input);
      assert.strictEqual(result.age, 35);
    });

    it('should reject missing or non-string name', () => {
      assert.throws(() => validateCreateUser({ email: 'test@example.com', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: ' ', email: 'test@example.com', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'A', email: 'test@example.com', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });

    it('should reject invalid or missing email', () => {
      assert.throws(() => validateCreateUser({ name: 'Alice', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'invalid-email', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'alice@', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: '@example.com', age: 25 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });

    it('should reject invalid, out-of-range, or decimal age', () => {
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'alice@example.com', age: 0 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'alice@example.com', age: 121 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'alice@example.com', age: 25.5 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateCreateUser({ name: 'Alice', email: 'alice@example.com', age: 'twenty' }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });
  });

  describe('validateUpdateUser', () => {
    it('should accept partial update with valid name only', () => {
      const result = validateUpdateUser({ name: '  Updated Name  ' });
      assert.deepStrictEqual(result, { name: 'Updated Name' });
    });

    it('should accept partial update with valid email only', () => {
      const result = validateUpdateUser({ email: 'new.email@example.com' });
      assert.deepStrictEqual(result, { email: 'new.email@example.com' });
    });

    it('should accept partial update with valid age only', () => {
      const result = validateUpdateUser({ age: 40 });
      assert.deepStrictEqual(result, { age: 40 });
    });

    it('should reject empty update payload', () => {
      assert.throws(() => validateUpdateUser({}), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });

    it('should reject invalid fields within update payload', () => {
      assert.throws(() => validateUpdateUser({ email: 'not-an-email' }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateUpdateUser({ age: 150 }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
      assert.throws(() => validateUpdateUser({ name: 'x' }), {
        status: 400,
        code: 'VALIDATION_ERROR'
      });
    });
  });
});

