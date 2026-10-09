import mongoose from 'mongoose';

const lmsActivitySchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    periodStart: {
      type: Date,
      required: [true, 'periodStart is required.'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'periodEnd is required.'],
    },
    loginCount: {
      type: Number,
      min: [0, 'loginCount cannot be negative.'],
      default: 0,
    },
    activeDays: {
      type: Number,
      min: [0, 'activeDays cannot be negative.'],
      default: 0,
    },
    assignmentsAssigned: {
      type: Number,
      min: [0, 'assignmentsAssigned cannot be negative.'],
      default: 0,
    },
    assignmentsCompleted: {
      type: Number,
      min: [0, 'assignmentsCompleted cannot be negative.'],
      default: 0,
      validate: {
        validator: function (v) {
          return this.assignmentsAssigned == null || v <= this.assignmentsAssigned;
        },
        message: 'assignmentsCompleted cannot exceed assignmentsAssigned.',
      },
    },
    engagementMinutes: {
      type: Number,
      min: [0, 'engagementMinutes cannot be negative.'],
      default: null,
    },
    observedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sourceImportId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

lmsActivitySchema.index({ studentId: 1, periodStart: 1, periodEnd: 1 });
lmsActivitySchema.index({ studentId: 1, observedAt: -1 });

export const LmsActivity = mongoose.model('LmsActivity', lmsActivitySchema, 'lms_activity');
export default LmsActivity;
