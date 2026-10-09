import mongoose from 'mongoose';

const skillAssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    skillCategory: {
      type: String,
      required: [true, 'skillCategory is required.'],
      enum: {
        values: ['technical', 'soft_skill'],
        message: '{VALUE} is not a valid skillCategory.',
      },
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'skillName is required.'],
      trim: true,
      maxlength: 100,
    },
    score: {
      type: Number,
      required: [true, 'score is required.'],
      min: [0, 'score cannot be negative.'],
      validate: {
        validator: function (v) {
          return this.maxScore == null || v <= this.maxScore;
        },
        message: 'Score cannot exceed maxScore.',
      },
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [1, 'maxScore must be at least 1.'],
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

skillAssessmentSchema.index({ studentId: 1, assessedAt: -1 });
skillAssessmentSchema.index({ studentId: 1, skillCategory: 1, skillName: 1 });

export const SkillAssessment = mongoose.model('SkillAssessment', skillAssessmentSchema, 'skill_assessments');
export default SkillAssessment;
