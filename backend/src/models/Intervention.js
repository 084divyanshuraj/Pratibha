import mongoose from 'mongoose';

const interventionSchema = new mongoose.Schema(
  {
    interventionId: {
      type: String,
      required: [true, 'interventionId is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    scenarioId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    interventionType: {
      type: String,
      required: [true, 'interventionType is required.'],
      trim: true,
      index: true,
    },
    assignedBy: {
      type: String,
      required: [true, 'assignedBy is required.'],
      trim: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['planned', 'assigned', 'in_progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid intervention status.',
      },
      default: 'assigned',
      index: true,
    },
    participation: {
      attendanceCount: { type: Number, default: 0, min: 0 },
      completedModules: { type: Number, default: 0, min: 0 },
      lastEngagedAt: { type: Date, default: null },
    },
    observedOutcomes: [
      {
        metric: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        observedAt: { type: Date, default: Date.now },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

interventionSchema.index({ studentId: 1, status: 1 });
interventionSchema.index({ interventionType: 1, status: 1 });

export const Intervention = mongoose.model('Intervention', interventionSchema, 'interventions');
export default Intervention;
