import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
      index: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required.'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required.'],
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters.'],
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      enum: {
        values: ['admin', 'faculty', 'placement_officer', 'student'],
        message: '{VALUE} is not a valid role.',
      },
      index: true,
    },
    studentId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    officeLocation: {
      type: String,
      trim: true,
      default: null,
    },
    linkedIn: {
      type: String,
      trim: true,
      default: null,
    },
    github: {
      type: String,
      trim: true,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    specialization: {
      type: String,
      trim: true,
      default: null,
    },
    education: {
      type: String,
      trim: true,
      default: null,
    },
    program: {
      type: String,
      trim: true,
      default: null,
    },
    semester: {
      type: String,
      trim: true,
      default: null,
    },
    careerGoals: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema, 'users');
export default User;
