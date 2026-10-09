import mongoose from 'mongoose';

const importSchema = new mongoose.Schema(
  {
    importId: {
      type: String,
      required: [true, 'importId is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    datasetType: {
      type: String,
      required: [true, 'datasetType is required.'],
      enum: {
        values: ['academic', 'attendance', 'lms', 'engagement', 'placement', 'skills', 'feedback'],
        message: '{VALUE} is not a valid datasetType.',
      },
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['received', 'validated', 'partially_imported', 'completed', 'failed'],
        message: '{VALUE} is not a valid import status.',
      },
      default: 'received',
      index: true,
    },
    uploadedBy: {
      type: String,
      required: [true, 'uploadedBy is required.'],
      trim: true,
    },
    counts: {
      received: { type: Number, default: 0, min: 0 },
      accepted: { type: Number, default: 0, min: 0 },
      rejected: { type: Number, default: 0, min: 0 },
      warnings: { type: Number, default: 0, min: 0 },
    },
    rowErrors: [
      {
        row: { type: Number, required: true },
        field: { type: String, default: null },
        message: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
    fileName: {
      type: String,
      trim: true,
      default: null,
    },
    dryRun: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

importSchema.index({ status: 1, createdAt: -1 });

export const Import = mongoose.model('Import', importSchema, 'imports');
export default Import;
