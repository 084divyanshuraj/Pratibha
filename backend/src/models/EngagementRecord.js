import mongoose from 'mongoose';

const engagementRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    activityType: {
      type: String,
      required: [true, 'activityType is required.'],
      enum: {
        values: ['event', 'club', 'hackathon', 'certification', 'workshop', 'sports', 'other'],
        message: '{VALUE} is not a valid activityType.',
      },
      index: true,
    },
    activityName: {
      type: String,
      required: [true, 'activityName is required.'],
      trim: true,
      maxlength: 120,
    },
    hours: {
      type: Number,
      min: [0, 'hours cannot be negative.'],
      default: null,
    },
    result: {
      type: String,
      trim: true,
      default: null,
    },
    occurredAt: {
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

engagementRecordSchema.index({ studentId: 1, occurredAt: -1 });
engagementRecordSchema.index({ studentId: 1, activityType: 1 });

export const EngagementRecord = mongoose.model('EngagementRecord', engagementRecordSchema, 'engagement_records');
export default EngagementRecord;
