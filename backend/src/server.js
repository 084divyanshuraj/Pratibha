import { app } from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './db/connection.js';
import { Student } from './models/Student.js';
import { seedDatabase } from '../scripts/seed.js';

let server;

async function startServer() {
  try {
    // 1. Establish database connection
    await connectDatabase(config.mongoUri);

    // 2. Auto-seed if database has 0 students (ensures cloned repos work instantly out of the box)
    try {
      const studentCount = await Student.countDocuments();
      if (studentCount === 0) {
        console.log('[Auto-Seed] Empty database detected. Auto-seeding initial cohort...');
        await seedDatabase({ disconnect: false });
        console.log('[Auto-Seed] Initial cohort auto-seeded successfully.');
      } else {
        console.log(`[Smart Campus Backend] Active database verified (${studentCount} student records present).`);
      }
    } catch (seedErr) {
      console.warn('[Auto-Seed] Warning: Auto-seed check encountered non-fatal error:', seedErr.message);
    }

    // 3. Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`[Smart Campus Backend] Server listening on port ${config.port} (NODE_ENV=${config.nodeEnv})`);
      console.log(`[Smart Campus Backend] Health checks available at http://localhost:${config.port}/health/live`);
    });
  } catch (err) {
    console.error('[Smart Campus Backend] Fatal error during startup:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function handleGracefulShutdown(signal) {
  console.log(`\n[Smart Campus Backend] Received ${signal}. Closing HTTP server gracefully...`);
  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error('[Smart Campus Backend] Error during server close:', err);
      }
      await disconnectDatabase();
      console.log('[Smart Campus Backend] Server closed successfully.');
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('[Smart Campus Backend] Forceful shutdown initiated after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();
