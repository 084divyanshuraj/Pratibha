import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'firstName is required.'],
      trim: true,
      maxlength: 60,
    },
    lastName: {
      type: String,
      required: [true, 'lastName is required.'],
      trim: true,
      maxlength: 60,
    },
    institutionId: {
      type: String,
      trim: true,
      default: 'INST_MAIN',
      index: true,
    },
    department: {
      type: String,
      required: [true, 'department is required.'],
      trim: true,
      index: true,
    },
    program: {
      type: String,
      required: [true, 'program is required.'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'semester is required.'],
      min: [1, 'Semester must be between 1 and 12.'],
      max: [12, 'Semester must be between 1 and 12.'],
      index: true,
    },
    cohort: {
      type: String,
      trim: true,
      index: true,
    },
    enrollmentYear: {
      type: Number,
      required: [true, 'enrollmentYear is required.'],
      min: 2000,
      max: 2100,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'graduated', 'suspended'],
        message: '{VALUE} is not a valid student status.',
      },
      default: 'active',
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for cohort/department filtering
studentSchema.index({ department: 1, semester: 1, status: 1 });
studentSchema.index({ cohort: 1, department: 1 });

export const Student = mongoose.model('Student', studentSchema, 'students');
export default Student;
