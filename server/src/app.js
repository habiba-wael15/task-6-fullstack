import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { checkConnection as defaultCheckConnection } from './config/database.js';
import { createUsersRouter } from './routes/users.routes.js';
import { UsersService } from './services/users.service.js';
import { UsersController } from './controllers/users.controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';

export function createApp(dependencies = {}) {
  const app = express();

  // Allowed origins for CORS
  const allowedOrigins = [
    config.corsOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );

  app.use(express.json());

  // Resolve dependencies
  let usersController;
  if (dependencies.usersController) {
    usersController = dependencies.usersController;
  } else if (dependencies.usersService) {
    usersController = new UsersController(dependencies.usersService);
  } else if (dependencies.usersRepository) {
    const service = new UsersService(dependencies.usersRepository);
    usersController = new UsersController(service);
  }

  const checkConnection = dependencies.checkConnection || defaultCheckConnection;

  // Root endpoint: API meta-information
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to Saiket Systems Task 6 User Management API',
      version: '1.0.0',
      documentation: {
        health: 'GET /api/health',
        listUsers: 'GET /api/users',
        userStats: 'GET /api/users/stats',
        getUser: 'GET /api/users/:id',
        createUser: 'POST /api/users',
        updateUser: 'PUT /api/users/:id',
        deleteUser: 'DELETE /api/users/:id'
      }
    });
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const dbStatus = await checkConnection();
    const isHealthy = dbStatus.connected;

    const payload = {
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'saiket-task6-user-management-api',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: isHealthy ? 'connected' : 'disconnected',
        server: dbStatus.server,
        database: dbStatus.database,
        authType: dbStatus.authType,
        message: dbStatus.message
      }
    };

    res.status(isHealthy ? 200 : 503).json(payload);
  });

  // Mount Users routes
  app.use('/api/users', createUsersRouter({ usersController }));

  // 404 Route Not Found
  app.use(notFoundHandler);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();

