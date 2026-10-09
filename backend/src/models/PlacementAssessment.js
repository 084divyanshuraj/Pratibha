import mongoose from 'mongoose';

const placementAssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    assessmentType: {
      type: String,
      required: [true, 'assessmentType is required.'],
      enum: {
        values: ['aptitude', 'coding', 'mock_interview', 'placement_outcome', 'readiness', 'group_discussion', 'other'],
        message: '{VALUE} is not a valid assessmentType.',
      },
      index: true,
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative.'],
      default: null,
      validate: {
        validator: function (v) {
          return v == null || this.maxScore == null || v <= this.maxScore;
        },
        message: 'Score cannot exceed maxScore.',
      },
    },
    maxScore: {
      type: Number,
      min: [1, 'Max score must be at least 1.'],
      default: null,
    },
    outcomeLabel: {
      type: String,
      trim: true,
      default: null,
    },
    employerOrProgram: {
      type: String,
      trim: true,
      default: null,
    },
    assessedAt: {
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

placementAssessmentSchema.index({ studentId: 1, assessedAt: -1 });
placementAssessmentSchema.index({ studentId: 1, assessmentType: 1 });

export const PlacementAssessment = mongoose.model('PlacementAssessment', placementAssessmentSchema, 'placement_assessments');
export default PlacementAssessment;
