import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import healthRoutes from './health/health.routes.js';
import apiV1Router from './api/v1/index.js';

export function createApp() {
  const app = express();

  // Basic security headers
  app.use(helmet());

  // Request ID tracking
  app.use(requestIdMiddleware);

  // Strict CORS policy
  app.use(corsMiddleware());

  // Logging (suppressed in test environment)
  if (!config.isTest) {
    // Custom morgan token for request ID
    morgan.token('id', (req) => req.id);
    const logFormat = config.isProd
      ? '[:date[iso]] :id :method :url :status :response-time ms'
      : ':method :url :status :response-time ms - :id';
    app.use(morgan(logFormat));
  }

  // Request parsing with limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Root health endpoints (as specified in ARCHITECTURE.md & DESIGN.md)
  app.use('/health', healthRoutes);

  // API v1 router
  app.use('/api/v1', apiV1Router);

  // 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
