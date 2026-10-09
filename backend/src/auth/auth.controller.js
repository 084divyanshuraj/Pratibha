import authService from './auth.service.js';
import auditService from '../audit/audit.service.js';

/**
 * Handle POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { identifier, email, username, password } = req.body;
    const userIdentifier = identifier || email || username;
    const result = await authService.login(userIdentifier, password);

    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    await auditService.logAuditEvent({
      actorUserId: result.user?.id || 'SYSTEM',
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: result.user?.id,
      requestId: req.id,
      metadata: {
        email: result.user?.email,
        username: result.user?.username,
        role: result.user?.role,
      },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: result,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle GET /api/v1/auth/me
 */
export function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    data: req.user,
    meta: {
      requestId: req.id,
    },
  });
}

/**
 * Handle PUT/PATCH /api/v1/auth/me
 */
export async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle POST /api/v1/institution/users (admin-only)
 */
export async function provisionUser(req, res, next) {
  try {
    const result = await authService.provisionUser(req.body);

    await auditService.logAuditEvent({
      actorUserId: req.user?.id || req.user?.email || 'SYSTEM',
      action: 'USER_PROVISIONED',
      resourceType: 'user',
      resourceId: result.id,
      requestId: req.id,
      metadata: {
        email: result.email,
        role: result.role,
      },
    });

    res.status(201).json({
      success: true,
      data: result,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  login,
  getCurrentUser,
  provisionUser,
};
