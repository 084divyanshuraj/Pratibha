import { config } from '../config/env.js';

/**
 * Standard Application Error class with HTTP status code and error code.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized express error handler middleware.
 * Enforces DESIGN.md standard error envelope and prevents leakage of internal stack traces.
 */
export function errorHandler(err, req, res, next) {
  // If response has already started sending, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.id || 'req_unknown';
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || [];

  // Handle standard JSON syntax errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Request body contains invalid JSON.';
  }

  // Handle CORS errors
  if (err.code === 'CORS_ERROR' || err.message?.includes('CORS policy')) {
    statusCode = 403;
    errorCode = 'CORS_FORBIDDEN';
  }

  // In production, mask unexpected 500 errors to avoid leaking system internals
  if (statusCode >= 500 && config.isProd) {
    message = 'An internal server error occurred. Please contact system support.';
    details = [];
  }

  const responseBody = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details.length > 0 ? { details } : {}),
    },
    meta: {
      requestId,
    },
  };

  // In development/test, optionally append stack if not prod
  if (!config.isProd && err.stack && statusCode >= 500) {
    responseBody.debug = {
      stack: err.stack,
    };
  }

  res.status(statusCode).json(responseBody);
}

export default errorHandler;
