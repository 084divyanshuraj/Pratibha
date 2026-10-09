import { AuditEvent } from '../models/AuditEvent.js';
import { toCleanDTO } from '../serializers/index.js';

const SENSITIVE_KEY_PATTERN = /password|secret|token|auth|key|cred/i;

/**
 * Recursively sanitize metadata to ensure no sensitive credentials or keys are logged.
 */
function sanitizeMetadata(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.slice(0, 50).map(sanitizeMetadata);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      cleaned[key] = '[REDACTED_CREDENTIAL]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeMetadata(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Log a security-relevant administrative or privileged event.
 * Never throws an unhandled exception that could break the primary operation.
 */
export async function logAuditEvent({
  actorUserId,
  action,
  resourceType,
  resourceId = null,
  requestId = null,
  metadata = {},
}) {
  try {
    if (!actorUserId || !action || !resourceType) {
      console.warn('[Audit] Missing required fields for audit event. Skipping.');
      return null;
    }

    const sanitizedMeta = sanitizeMetadata(metadata);

    const event = await AuditEvent.create({
      actorUserId: String(actorUserId),
      action: String(action),
      resourceType: String(resourceType),
      resourceId: resourceId ? String(resourceId) : null,
      requestId: requestId ? String(requestId) : null,
      metadata: sanitizedMeta || {},
    });

    return toCleanDTO(event);
  } catch (err) {
    console.warn(`[Audit] Failed to record audit event (${action}): ${err.message}`);
    return null;
  }
}

/**
 * List audit events with pagination and filtering. Admin-only access.
 */
export async function listAuditEvents(filters = {}) {
  const match = {};

  if (filters.action) {
    match.action = filters.action;
  }
  if (filters.resourceType) {
    match.resourceType = filters.resourceType;
  }
  if (filters.actorUserId) {
    match.actorUserId = filters.actorUserId;
  }

  const page = Math.max(1, parseInt(filters.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit || '50', 10) || 50));
  const skip = (page - 1) * limit;

  const [total, events] = await Promise.all([
    AuditEvent.countDocuments(match),
    AuditEvent.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    events: events.map(toCleanDTO),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export default {
  logAuditEvent,
  listAuditEvents,
};
