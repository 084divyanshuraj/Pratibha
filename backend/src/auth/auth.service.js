import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { toUserDTO } from '../serializers/index.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Generate a signed JWT for an authenticated user.
 */
export function generateToken(user) {
  const payload = {
    sub: user._id?.toString() || user.id,
    email: user.email,
    role: user.role,
    studentId: user.studentId || null,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Authentication token has expired.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Authentication token is invalid.', 401, 'INVALID_TOKEN');
  }
}

/**
 * Authenticate credentials and return token + safe user profile.
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400, 'VALIDATION_ERROR', [
      ...(!email ? [{ field: 'email', message: 'Email is required.' }] : []),
      ...(!password ? [{ field: 'password', message: 'Password is required.' }] : []),
    ]);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (user.isActive === false) {
    throw new AppError('User account is deactivated.', 403, 'ACCOUNT_INACTIVE');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateToken(user);

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn,
    user: toUserDTO(user),
  };
}

/**
 * Provision a new user (admin workflow).
 * Guarantees password is never persisted raw.
 */
export async function provisionUser({ email, password, displayName, role, studentId = null }) {
  const validationErrors = [];

  if (!email) validationErrors.push({ field: 'email', message: 'Email is required.' });
  if (!password || password.length < 8) {
    validationErrors.push({ field: 'password', message: 'Password must be at least 8 characters long.' });
  }
  if (!displayName) validationErrors.push({ field: 'displayName', message: 'Display name is required.' });
  if (!role) {
    validationErrors.push({ field: 'role', message: 'Role is required.' });
  } else if (!['admin', 'faculty', 'placement_officer', 'student'].includes(role)) {
    validationErrors.push({ field: 'role', message: `Invalid role: ${role}.` });
  }

  if (role === 'student' && !studentId) {
    validationErrors.push({ field: 'studentId', message: 'studentId is required for users with student role.' });
  }

  if (validationErrors.length > 0) {
    throw new AppError('User provisioning validation failed.', 400, 'VALIDATION_ERROR', validationErrors);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError(`User with email "${normalizedEmail}" already exists.`, 409, 'CONFLICT');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    role,
    studentId: studentId ? studentId.trim().toUpperCase() : null,
    isActive: true,
  });

  return toUserDTO(newUser);
}

export default {
  generateToken,
  verifyToken,
  login,
  provisionUser,
};
