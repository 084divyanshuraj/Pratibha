import mongoose from 'mongoose';

const interventionCatalogSchema = new mongoose.Schema(
  {
    interventionType: {
      type: String,
      required: [true, 'interventionType is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'name is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'description is required.'],
      trim: true,
    },
    eligibilityRules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    capacityUnit: {
      type: String,
      default: 'seats',
      trim: true,
    },
    costUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: String,
      default: 'v1',
    },
  },
  {
    timestamps: true,
  }
);

export const InterventionCatalog = mongoose.model('InterventionCatalog', interventionCatalogSchema, 'intervention_catalog');
export default InterventionCatalog;
