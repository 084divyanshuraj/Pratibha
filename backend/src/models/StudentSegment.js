import mongoose from 'mongoose';

const studentSegmentSchema = new mongoose.Schema(
  {
    segmentKey: {
      type: String,
      required: [true, 'segmentKey is required.'],
      unique: true,
      trim: true,
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
    criteriaVersion: {
      type: String,
      default: 'v1',
    },
    studentIds: {
      type: [String],
      default: [],
    },
    indicators: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentSegment = mongoose.model('StudentSegment', studentSegmentSchema, 'student_segments');
export default StudentSegment;
