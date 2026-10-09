import mongoose from 'mongoose';

const riskPredictionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    target: {
      type: String,
      required: [true, 'target is required.'],
      trim: true,
      index: true,
    },
    riskLevel: {
      type: String,
      required: [true, 'riskLevel is required.'],
      enum: {
        values: ['low', 'medium', 'high', 'unknown'],
        message: '{VALUE} is not a valid riskLevel.',
      },
      index: true,
    },
    probability: {
      type: Number,
      min: [0, 'probability cannot be less than 0.'],
      max: [1, 'probability cannot exceed 1.'],
      default: null,
    },
    modelVersion: {
      type: String,
      required: [true, 'modelVersion is required.'],
      trim: true,
      index: true,
    },
    featureSetVersion: {
      type: String,
      required: [true, 'featureSetVersion is required.'],
      trim: true,
    },
    predictedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    drivers: [
      {
        name: { type: String, required: true },
        direction: { type: String, default: null },
        observedValue: { type: mongoose.Schema.Types.Mixed, default: null },
        explanation: { type: String, required: true },
      },
    ],
    limitations: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['valid', 'stale', 'superseded'],
      default: 'valid',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

riskPredictionSchema.index({ studentId: 1, target: 1, predictedAt: -1 });

export const RiskPrediction = mongoose.model('RiskPrediction', riskPredictionSchema, 'risk_predictions');
export default RiskPrediction;
