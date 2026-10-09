import authService from './auth.service.js';

/**
 * Handle POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

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
 * Handle POST /api/v1/institution/users (admin-only)
 */
export async function provisionUser(req, res, next) {
  try {
    const result = await authService.provisionUser(req.body);

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
