import { Router } from 'express';
import { usersController as defaultController } from '../controllers/users.controller.js';

export function createUsersRouter(dependencies = {}) {
  const router = Router();
  const controller = dependencies.usersController || defaultController;

  // Stats route must precede /:id parameter route
  router.get('/stats', controller.getUserStats);

  // Core CRUD routes
  router.get('/', controller.getAllUsers);
  router.get('/:id', controller.getUserById);
  router.post('/', controller.createUser);
  router.put('/:id', controller.updateUser);
  router.delete('/:id', controller.deleteUser);

  return router;
}

export default createUsersRouter();

