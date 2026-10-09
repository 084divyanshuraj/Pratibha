import crypto from 'node:crypto';

/**
 * Middleware to ensure every request has a unique request ID.
 * Uses incoming X-Request-Id header if present, or generates a new UUID.
 * Attaches requestId to req.id and sets X-Request-Id response header.
 */
export function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-request-id'];
  const requestId = (typeof incomingId === 'string' && incomingId.trim()) 
    ? incomingId.trim() 
    : `req_${crypto.randomUUID()}`;

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

export default requestIdMiddleware;
