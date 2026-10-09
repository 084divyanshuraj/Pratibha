import mongoose from 'mongoose';

const feedbackRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    feedbackType: {
      type: String,
      required: [true, 'feedbackType is required.'],
      enum: {
        values: ['student_satisfaction', 'faculty_feedback', 'course_feedback', 'other'],
        message: '{VALUE} is not a valid feedbackType.',
      },
      index: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
      default: null,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters.'],
      default: null,
    },
    visibility: {
      type: String,
      enum: ['private', 'staff_only', 'aggregated'],
      default: 'staff_only',
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

feedbackRecordSchema.index({ studentId: 1, createdAt: -1 });
feedbackRecordSchema.index({ feedbackType: 1, createdAt: -1 });

export const FeedbackRecord = mongoose.model('FeedbackRecord', feedbackRecordSchema, 'feedback_records');
export default FeedbackRecord;
