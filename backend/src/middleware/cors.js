import cors from 'cors';
import { config } from '../config/env.js';

/**
 * Configure CORS middleware with strict allowed origin checking.
 */
export function corsMiddleware() {
  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server health checks)
      if (!origin) {
        return callback(null, true);
      }

      if (config.cors.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`Origin ${origin} is not allowed by CORS policy.`);
      error.statusCode = 403;
      error.code = 'CORS_ERROR';
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });
}

export default corsMiddleware;
