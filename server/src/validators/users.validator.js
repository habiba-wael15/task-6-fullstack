/**
 * Email syntax validation regex (RFC 5322 compatible standard)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates user ID parameter from request params.
 * Returns parsed integer or throws validation error.
 */
export function validateId(paramId) {
  if (paramId === undefined || paramId === null || String(paramId).trim() === '') {
    const error = new Error('User ID is required.');
    error.status = 400;
    error.code = 'INVALID_ID';
    throw error;
  }

  const trimmed = String(paramId).trim();
  // Ensure it's purely digits
  if (!/^\d+$/.test(trimmed)) {
    const error = new Error(`Invalid user ID '${paramId}'. ID must be a positive integer.`);
    error.status = 400;
    error.code = 'INVALID_ID';
    throw error;
  }

  const id = parseInt(trimmed, 10);
  if (id <= 0 || !Number.isSafeInteger(id)) {
    const error = new Error(`User ID must be a positive integer.`);
    error.status = 400;
    error.code = 'INVALID_ID';
    throw error;
  }

  return id;
}

/**
 * Validates request payload for creating a new user.
 */
export function validateCreateUser(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Name validation
  let name = data.name;
  if (name === undefined || name === null || typeof name !== 'string') {
    errors.push('Name is required and must be a string.');
  } else {
    name = name.trim();
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long.');
    } else if (name.length > 100) {
      errors.push('Name cannot exceed 100 characters.');
    }
  }

  // Email validation
  let email = data.email;
  if (email === undefined || email === null || typeof email !== 'string') {
    errors.push('Email is required and must be a string.');
  } else {
    email = email.trim().toLowerCase();
    if (email.length === 0) {
      errors.push('Email is required.');
    } else if (email.length > 255) {
      errors.push('Email cannot exceed 255 characters.');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('Email must have a valid email format (e.g. user@example.com).');
    }
  }

  // Age validation
  const age = data.age;
  if (age === undefined || age === null || age === '') {
    errors.push('Age is required.');
  } else {
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge)) {
      errors.push('Age must be a valid whole integer.');
    } else if (numericAge < 1 || numericAge > 120) {
      errors.push('Age must be between 1 and 120.');
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.errors = errors;
    throw error;
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age: parseInt(age, 10)
  };
}

/**
 * Validates request payload for updating an existing user.
 * Supports updating all fields or partial fields if provided.
 */
export function validateUpdateUser(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // At least one field must be provided
  if (data.name === undefined && data.email === undefined && data.age === undefined) {
    const error = new Error('At least one field (name, email, or age) must be provided for update.');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const sanitized = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string.');
    } else {
      const name = data.name.trim();
      if (name.length < 2) {
        errors.push('Name must be at least 2 characters long.');
      } else if (name.length > 100) {
        errors.push('Name cannot exceed 100 characters.');
      } else {
        sanitized.name = name;
      }
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('Email must be a string.');
    } else {
      const email = data.email.trim().toLowerCase();
      if (email.length === 0) {
        errors.push('Email cannot be empty.');
      } else if (email.length > 255) {
        errors.push('Email cannot exceed 255 characters.');
      } else if (!EMAIL_REGEX.test(email)) {
        errors.push('Email must have a valid email format (e.g. user@example.com).');
      } else {
        sanitized.email = email;
      }
    }
  }

  if (data.age !== undefined) {
    const numericAge = Number(data.age);
    if (!Number.isInteger(numericAge)) {
      errors.push('Age must be a valid whole integer.');
    } else if (numericAge < 1 || numericAge > 120) {
      errors.push('Age must be between 1 and 120.');
    } else {
      sanitized.age = numericAge;
    }
  }

  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.errors = errors;
    throw error;
  }

  return sanitized;
}

