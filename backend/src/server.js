import { app } from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './db/connection.js';

let server;

async function startServer() {
  try {
    // 1. Establish database connection
    await connectDatabase(config.mongoUri);

    // 2. Start HTTP server
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
