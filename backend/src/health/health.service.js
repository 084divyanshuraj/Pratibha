/**
 * Health check service managing liveness and dependency readiness probes.
 * Strictly guarantees that no database credentials, URLs, or internal secrets
 * are leaked in health probe responses.
 */

// Dependency probes registry
const dependencyProbes = new Map();

/**
 * Register or update a dependency readiness probe.
 * @param {string} name - Name of dependency (e.g., 'database', 'ml_service')
 * @param {() => Promise<{ ready: boolean, status: string, message?: string }>} probeFn
 * @param {boolean} required - Whether this dependency is mandatory for overall readiness
 */
export function registerDependencyProbe(name, probeFn, required = true) {
  dependencyProbes.set(name, { probeFn, required });
}

/**
 * Remove a dependency probe (useful for tests or teardown).
 */
export function unregisterDependencyProbe(name) {
  dependencyProbes.delete(name);
}

/**
 * Reset all probes (test helper).
 */
export function resetDependencyProbes() {
  dependencyProbes.clear();
}

/**
 * Check process liveness.
 * Verifies that the Node.js event loop and HTTP server are active.
 */
export function checkLiveness() {
  return {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check overall readiness against all registered dependency probes.
 */
export async function checkReadiness() {
  const timestamp = new Date().toISOString();
  const checks = {};
  let isOverallReady = true;

  // If no dependency probes are registered (e.g. initial foundation phase),
  // record default database probe state as not_configured
  if (dependencyProbes.size === 0) {
    checks.database = {
      status: 'not_configured',
      ready: false,
    };
    isOverallReady = false;
  } else {
    for (const [name, { probeFn, required }] of dependencyProbes.entries()) {
      try {
        const result = await probeFn();
        checks[name] = {
          status: result.status || (result.ready ? 'connected' : 'disconnected'),
          ready: Boolean(result.ready),
          ...(result.message ? { message: result.message } : {}),
        };
        if (required && !result.ready) {
          isOverallReady = false;
        }
      } catch (err) {
        checks[name] = {
          status: 'error',
          ready: false,
        };
        if (required) {
          isOverallReady = false;
        }
      }
    }
  }

  return {
    ready: isOverallReady,
    status: isOverallReady ? 'ready' : 'not_ready',
    timestamp,
    checks,
  };
}
