import { verifyToken } from '../auth/auth.service.js';
import { User } from '../models/User.js';
import { toUserDTO } from '../serializers/index.js';
import { AppError } from './errorHandler.js';

/**
 * Authentication middleware.
 * Verifies Bearer JWT, validates user account status, and populates req.user.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or malformed Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError('User account associated with this token no longer exists.', 401, 'USER_NOT_FOUND');
    }

    if (user.isActive === false) {
      throw new AppError('User account is deactivated.', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = toUserDTO(user);
    req.auth = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-based authorization middleware factory.
 * @param  {...string} allowedRoles - List of permitted roles (e.g. 'admin', 'faculty')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

/**
 * Object-level scoping middleware for student access.
 * Strict constraint: A student can ONLY access their own records.
 * Staff roles (admin, faculty, placement_officer) are granted institutional access.
 * @param {string} paramKey - URL route parameter containing studentId (default: 'studentId')
 */
export function authorizeStudentScope(paramKey = 'studentId') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const targetStudentId = req.params[paramKey];

    // If the caller is a student, enforce strict identity match
    if (req.user.role === 'student') {
      if (!req.user.studentId || req.user.studentId.toUpperCase() !== targetStudentId?.toUpperCase()) {
        return next(
          new AppError(
            'Forbidden: Students are only permitted to access their own private records.',
            403,
            'FORBIDDEN'
          )
        );
      }
    }

    next();
  };
}

export default {
  authenticate,
  authorizeRoles,
  authorizeStudentScope,
};
