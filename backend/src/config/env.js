import dotenv from 'dotenv';

// Load .env only if not already loaded and not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

/**
 * Validates and exports environment configuration.
 * Fails fast on invalid or missing production configuration.
 */
function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const errors = [];

  // Port validation
  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT: "${process.env.PORT}". Must be a number between 1 and 65535.`);
  }

  // Database URI validation
  const mongoUri = process.env.MONGODB_URI;
  if (isProd && (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>'))) {
    errors.push('MONGODB_URI must be provided with valid credentials in production.');
  }

  // JWT Secret validation
  const jwtSecret = process.env.JWT_SECRET || (isTest ? 'test-jwt-secret-min-32-chars-long-123456789' : undefined);
  if (isProd && (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('replace_with_a_secure'))) {
    errors.push('JWT_SECRET must be at least 32 characters long in production.');
  }

  // Frontend origins validation
  const rawOrigins = process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://localhost:5173';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (isProd && allowedOrigins.length === 0) {
    errors.push('FRONTEND_ORIGIN must be specified in production.');
  }

  // ML Service URL validation
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  if (isProd && (!mlServiceUrl || mlServiceUrl.includes('localhost'))) {
    // In production, warn or error if pointing to localhost
    errors.push('ML_SERVICE_URL cannot point to localhost in production.');
  }

  const mlTimeoutMs = parseInt(process.env.ML_TIMEOUT_MS || '5000', 10);

  if (errors.length > 0 && isProd) {
    throw new Error(`Configuration validation failed:\n - ${errors.join('\n - ')}`);
  }

  return {
    nodeEnv,
    isProd,
    isTest,
    port,
    mongoUri: mongoUri || 'mongodb://localhost:27017/smart_campus_dev',
    jwtSecret: jwtSecret || 'dev-secret-key-at-least-32-characters-long-1234',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cors: {
      allowedOrigins,
    },
    mlService: {
      url: mlServiceUrl,
      token: process.env.ML_SERVICE_TOKEN || null,
      timeoutMs: isNaN(mlTimeoutMs) ? 5000 : mlTimeoutMs,
    },
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

export const config = loadConfig();
export default config;
