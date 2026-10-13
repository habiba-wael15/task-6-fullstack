import { usersService as defaultService } from '../services/users.service.js';
import { validateId, validateCreateUser, validateUpdateUser } from '../validators/users.validator.js';

export class UsersController {
  constructor(service = defaultService) {
    this.service = service;
  }

  /**
   * GET /api/users
   * Returns all users with optional ?search= or ?q= parameter
   */
  getAllUsers = async (req, res, next) => {
    try {
      const search = req.query.search || req.query.q || null;
      const users = await this.service.getAllUsers(search);
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/users/stats
   * Returns statistics for dashboard summary cards
   */
  getUserStats = async (req, res, next) => {
    try {
      const stats = await this.service.getUserStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/users/:id
   * Returns single user by ID
   */
  getUserById = async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const user = await this.service.getUserById(id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/users
   * Creates a new user
   */
  createUser = async (req, res, next) => {
    try {
      const validatedData = validateCreateUser(req.body);
      const newUser = await this.service.createUser(validatedData);
      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: newUser
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/users/:id
   * Updates an existing user
   */
  updateUser = async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const validatedUpdates = validateUpdateUser(req.body);
      const updatedUser = await this.service.updateUser(id, validatedUpdates);
      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: updatedUser
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/users/:id
   * Deletes a user by ID
   */
  deleteUser = async (req, res, next) => {
    try {
      const id = validateId(req.params.id);
      const result = await this.service.deleteUser(id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { id: result.id }
      });
    } catch (err) {
      next(err);
    }
  };
}

export const usersController = new UsersController();

