import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { toUserDTO } from '../serializers/index.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Generate a signed JWT for an authenticated user.
 */
export function generateToken(user) {
  const payload = {
    sub: user._id?.toString() || user.id,
    email: user.email,
    username: user.username || null,
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
 * Supports identifier as: Email, Username, or Student Roll ID.
 */
export async function login(identifier, password) {
  if (!identifier || !password) {
    throw new AppError('Username/email and password are required.', 400, 'VALIDATION_ERROR', [
      ...(!identifier ? [{ field: 'identifier', message: 'Username or Email is required.' }] : []),
      ...(!password ? [{ field: 'password', message: 'Password is required.' }] : []),
    ]);
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const rawIdentifier = identifier.trim();

  // Find user by email, username, or studentId
  const user = await User.findOne({
    $or: [
      { email: cleanIdentifier },
      { username: cleanIdentifier },
      { studentId: rawIdentifier.toUpperCase() },
      { studentId: rawIdentifier },
    ],
  });

  if (!user) {
    throw new AppError('Invalid username/email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (user.isActive === false) {
    throw new AppError('User account is deactivated.', 403, 'ACCOUNT_INACTIVE');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid username/email or password.', 401, 'INVALID_CREDENTIALS');
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
 * Register a new user dynamically in MongoDB with secure bcrypt password hash and issue JWT.
 */
export async function register({
  username,
  email,
  password,
  displayName,
  name,
  role = 'student',
  portal = 'student',
  studentId = null,
  department = null,
}) {
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanUsername = username ? username.trim().toLowerCase() : null;
  const finalDisplayName = (displayName || name || cleanUsername || cleanEmail?.split('@')[0] || 'User').trim();

  if (!cleanEmail) {
    throw new AppError('Email address is required.', 400, 'VALIDATION_ERROR', [
      { field: 'email', message: 'Email address is required.' },
    ]);
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new AppError('Please provide a valid email address.', 400, 'VALIDATION_ERROR', [
      { field: 'email', message: 'Please provide a valid email address format.' },
    ]);
  }

  if (!password || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long.', 400, 'VALIDATION_ERROR', [
      { field: 'password', message: 'Password must be at least 6 characters long.' },
    ]);
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) {
    throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
  }

  // Check if username already exists
  if (cleanUsername) {
    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      throw new AppError('This username is already taken. Please choose another.', 409, 'USERNAME_TAKEN');
    }
  }

  // Resolve role
  let mappedRole = 'student';
  if (portal === 'student' || role === 'student') {
    mappedRole = 'student';
  } else if (role === 'faculty_mentor' || role === 'faculty') {
    mappedRole = 'faculty';
  } else if (role === 'placement_officer' || role === 'placement') {
    mappedRole = 'placement_officer';
  } else if (role === 'institution_admin' || role === 'admin') {
    mappedRole = 'admin';
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate studentId if student
  let finalStudentId = studentId ? studentId.trim().toUpperCase() : null;
  if (mappedRole === 'student' && !finalStudentId) {
    const count = await User.countDocuments({ role: 'student' });
    finalStudentId = `STU_${String(count + 10).padStart(4, '0')}`;
  }

  const newUser = new User({
    email: cleanEmail,
    username: cleanUsername || undefined,
    passwordHash,
    displayName: finalDisplayName,
    role: mappedRole,
    studentId: finalStudentId,
    department: department || null,
    program: null,
    semester: null,
    isActive: true,
  });

  await newUser.save();

  // If student role, create or sync corresponding Student profile document
  if (mappedRole === 'student' && finalStudentId) {
    try {
      const existingStudent = await Student.findOne({ studentId: finalStudentId });
      if (!existingStudent) {
        const parts = finalDisplayName.split(' ');
        const firstName = parts[0] || 'Student';
        const lastName = parts.slice(1).join(' ') || 'Scholar';
        await Student.create({
          studentId: finalStudentId,
          firstName,
          lastName,
          email: cleanEmail,
          department: department || 'CSE',
          program: 'B.Tech',
          semester: 1,
          status: 'active',
          enrollmentYear: new Date().getFullYear(),
        });
      }
    } catch (e) {
      console.warn('Student record auto-creation notice:', e.message);
    }
  }

  const accessToken = generateToken(newUser);

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn,
    user: toUserDTO(newUser),
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

export async function updateProfile(userId, updateData) {
  const allowed = [
    'displayName',
    'phone',
    'bio',
    'avatar',
    'department',
    'designation',
    'officeLocation',
    'linkedIn',
    'github',
    'skills',
    'specialization',
    'education',
    'program',
    'semester',
    'careerGoals',
    'studentId',
  ];
  const payload = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      payload[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: payload }, { new: true, runValidators: true });
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  if (user.studentId && (payload.displayName || payload.department || payload.program || payload.semester)) {
    try {
      const parts = (payload.displayName || '').trim().split(' ');
      const sUpdate = {};
      if (parts[0]) sUpdate.firstName = parts[0];
      if (parts.length > 1) sUpdate.lastName = parts.slice(1).join(' ');
      if (payload.department) sUpdate.department = payload.department;
      if (payload.program) sUpdate.program = payload.program;
      if (payload.semester) {
        const parsedSem = parseInt(payload.semester, 10);
        if (!isNaN(parsedSem)) sUpdate.semester = parsedSem;
      }
      if (Object.keys(sUpdate).length > 0) {
        await Student.findOneAndUpdate({ studentId: user.studentId }, { $set: sUpdate });
      }
    } catch {
      // non-blocking
    }
  }

  return toUserDTO(user);
}

export default {
  generateToken,
  verifyToken,
  login,
  register,
  provisionUser,
  updateProfile,
};
