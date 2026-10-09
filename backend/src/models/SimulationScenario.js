import mongoose from 'mongoose';

const allocationResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    interventionType: { type: String, required: true },
    reason: { type: String, required: true },
    priorityScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const excludedResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const simulationScenarioSchema = new mongoose.Schema(
  {
    scenarioId: {
      type: String,
      required: [true, 'scenarioId is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: [true, 'createdBy is required.'],
      trim: true,
    },
    cohortFilters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    strategy: {
      type: String,
      enum: {
        values: ['targeted', 'uniform', 'mixed', 'custom'],
        message: '{VALUE} is not a valid simulation strategy.',
      },
      default: 'targeted',
    },
    interventionTypes: {
      type: [String],
      default: [],
    },
    capacityConstraints: {
      type: Map,
      of: Number,
      default: {},
    },
    eligibilitySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    allocationResults: [allocationResultSchema],
    excludedResults: [excludedResultSchema],
    resourceSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    assumptions: {
      type: [String],
      default: [],
    },
    outcomeEstimates: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    estimateMethod: {
      type: String,
      enum: ['none', 'rule_based', 'model_estimate'],
      default: 'none',
    },
    modelVersion: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'simulated', 'approved', 'rejected', 'implemented'],
        message: '{VALUE} is not a valid scenario status.',
      },
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

simulationScenarioSchema.index({ status: 1, createdAt: -1 });

export const SimulationScenario = mongoose.model('SimulationScenario', simulationScenarioSchema, 'simulation_scenarios');
export default SimulationScenario;
