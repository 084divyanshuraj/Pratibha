import { app } from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`[Smart Campus Backend] Server listening on port ${config.port} (NODE_ENV=${config.nodeEnv})`);
  console.log(`[Smart Campus Backend] Health checks available at http://localhost:${config.port}/health/live`);
});

// Graceful shutdown handling
function handleGracefulShutdown(signal) {
  console.log(`\n[Smart Campus Backend] Received ${signal}. Closing HTTP server gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('[Smart Campus Backend] Error during server close:', err);
      process.exit(1);
    }
    console.log('[Smart Campus Backend] Server closed successfully.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('[Smart Campus Backend] Forceful shutdown initiated after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
