import { usersRepository as defaultRepository } from '../repositories/users.repository.js';

export class UsersService {
  constructor(repository = defaultRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves all users, optionally filtered by search string.
   */
  async getAllUsers(search = null) {
    return await this.repository.findAll(search);
  }

  /**
   * Retrieves a single user by ID. Throws 404 if not found.
   */
  async getUserById(id) {
    const user = await this.repository.findById(id);
    if (!user) {
      const error = new Error(`User with ID ${id} was not found.`);
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return user;
  }

  /**
   * Creates a new user. Enforces unique email check.
   */
  async createUser(userData) {
    const existing = await this.repository.findByEmail(userData.email);
    if (existing) {
      const error = new Error(`A user with email '${userData.email}' already exists.`);
      error.status = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    return await this.repository.create(userData);
  }

  /**
   * Updates an existing user. Enforces existence and unique email constraints.
   */
  async updateUser(id, updateData) {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      const error = new Error(`User with ID ${id} was not found.`);
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Check if new email is taken by a different user
    if (updateData.email && updateData.email.toLowerCase() !== existingUser.Email?.toLowerCase()) {
      const emailHolder = await this.repository.findByEmail(updateData.email);
      if (emailHolder && emailHolder.Id !== id) {
        const error = new Error(`A user with email '${updateData.email}' already exists.`);
        error.status = 409;
        error.code = 'EMAIL_ALREADY_EXISTS';
        throw error;
      }
    }

    const updated = await this.repository.update(id, updateData);
    if (!updated) {
      const error = new Error(`User with ID ${id} was not found.`);
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return updated;
  }

  /**
   * Deletes a user by ID. Throws 404 if user does not exist.
   */
  async deleteUser(id) {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      const error = new Error(`User with ID ${id} was not found.`);
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      const error = new Error(`User with ID ${id} could not be deleted.`);
      error.status = 500;
      error.code = 'DELETE_FAILED';
      throw error;
    }

    return { id, message: `User with ID ${id} successfully deleted.` };
  }

  /**
   * Retrieves summary statistics for the user dashboard.
   */
  async getUserStats() {
    return await this.repository.getStats();
  }
}

export const usersService = new UsersService();

