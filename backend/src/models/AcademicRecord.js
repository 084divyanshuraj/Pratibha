import mongoose from 'mongoose';

const academicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required.'],
      trim: true,
      uppercase: true,
      index: true,
    },
    term: {
      type: String,
      required: [true, 'term is required.'],
      trim: true,
      index: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      default: null,
    },
    subjectName: {
      type: String,
      trim: true,
      default: null,
    },
    assessmentType: {
      type: String,
      enum: {
        values: ['internal', 'midterm', 'final', 'quiz', 'assignment', 'practical', 'other'],
        message: '{VALUE} is not a valid assessmentType.',
      },
      default: 'final',
    },
    marksObtained: {
      type: Number,
      required: [true, 'marksObtained is required.'],
      min: [0, 'marksObtained cannot be negative.'],
      validate: {
        validator: function (v) {
          return this.maxMarks == null || v <= this.maxMarks;
        },
        message: 'marksObtained cannot be greater than maxMarks.',
      },
    },
    maxMarks: {
      type: Number,
      required: [true, 'maxMarks is required.'],
      min: [1, 'maxMarks must be at least 1.'],
    },
    grade: {
      type: String,
      trim: true,
      default: null,
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative.'],
      max: [10, 'CGPA cannot exceed 10.0.'],
      default: null,
    },
    backlog: {
      type: Boolean,
      default: false,
    },
    observedAt: {
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



academicRecordSchema.index({ studentId: 1, term: 1 });
academicRecordSchema.index({ studentId: 1, observedAt: -1 });

export const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema, 'academic_records');
export default AcademicRecord;
