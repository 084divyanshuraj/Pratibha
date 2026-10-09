import mongoose from 'mongoose';
import { registerDependencyProbe } from '../health/health.service.js';

/**
 * Maps Mongoose readyState numbers to human-readable safe strings.
 */
function getMongooseStateString(state) {
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}

/**
 * Register the Mongoose database health probe into health service.
 */
export function registerDatabaseHealthProbe() {
  registerDependencyProbe('database', async () => {
    const state = mongoose.connection.readyState;
    const isReady = state === 1;

    return {
      ready: isReady,
      status: getMongooseStateString(state),
    };
  }, true);
}

/**
 * Connect to MongoDB using the configured connection string.
 * @param {string} mongoUri - MongoDB Atlas connection URI
 * @param {object} options - Optional mongoose connect options
 */
export async function connectDatabase(mongoUri, options = {}) {
  registerDatabaseHealthProbe();

  if (!mongoUri) {
    throw new Error('Database connection failed: MONGODB_URI is not defined.');
  }

  // Mask credentials for safe logging
  const safeLogUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`[Database] Connecting to MongoDB: ${safeLogUri}`);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev/test, manage explicitly in prod
      ...options,
    });

    console.log('[Database] MongoDB connection established successfully.');
    return mongoose.connection;
  } catch (err) {
    console.error('[Database] MongoDB connection error:', err.message);
    throw err;
  }
}

/**
 * Gracefully disconnect from MongoDB.
 */
export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
  registerDatabaseHealthProbe,
};
