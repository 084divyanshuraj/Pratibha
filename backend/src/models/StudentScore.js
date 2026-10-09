import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    rawValue: { type: Number, default: null },
    normalizedValue: { type: Number, default: null },
    weight: { type: Number, default: null },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    observedValue: { type: mongoose.Schema.Types.Mixed, default: null },
    contribution: { type: Number, default: 0 },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const studentScoreSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    period: {
      type: String,
      required: [true, 'period is required.'],
      trim: true,
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'score is required.'],
      min: [0, 'score cannot be less than 0.'],
      max: [100, 'score cannot exceed 100.'],
      index: true,
    },
    formulaVersion: {
      type: String,
      required: [true, 'formulaVersion is required.'],
      default: 'sss-v1',
      index: true,
    },
    components: [componentSchema],
    drivers: [driverSchema],
    missingFields: {
      type: [String],
      default: [],
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studentScoreSchema.index({ studentId: 1, period: 1 });
studentScoreSchema.index({ studentId: 1, calculatedAt: -1 });

export const StudentScore = mongoose.model('StudentScore', studentScoreSchema, 'student_scores');
export default StudentScore;
