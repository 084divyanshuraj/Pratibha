import mongoose from 'mongoose';

const studentFeatureSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    featureSetVersion: {
      type: String,
      required: [true, 'featureSetVersion is required.'],
      trim: true,
      index: true,
    },
    asOfDate: {
      type: Date,
      required: [true, 'asOfDate is required.'],
      index: true,
    },
    features: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sourceRecordWatermarks: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

studentFeatureSchema.index({ studentId: 1, featureSetVersion: 1, asOfDate: -1 });

export const StudentFeature = mongoose.model('StudentFeature', studentFeatureSchema, 'student_features');
export default StudentFeature;
