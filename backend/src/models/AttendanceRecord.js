import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
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
    classesAttended: {
      type: Number,
      required: [true, 'classesAttended is required.'],
      min: [0, 'classesAttended cannot be negative.'],
      validate: {
        validator: function (v) {
          return this.classesHeld == null || v <= this.classesHeld;
        },
        message: 'classesAttended cannot exceed classesHeld.',
      },
    },
    classesHeld: {
      type: Number,
      required: [true, 'classesHeld is required.'],
      min: [0, 'classesHeld cannot be negative.'],
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'attendancePercentage cannot be negative.'],
      max: [100, 'attendancePercentage cannot exceed 100.'],
    },
    periodStart: {
      type: Date,
      default: null,
    },
    periodEnd: {
      type: Date,
      default: null,
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

// Automated attendancePercentage calculation if not provided
attendanceRecordSchema.pre('validate', function () {
  if (this.classesAttended != null && this.classesHeld != null && this.classesHeld > 0 && this.attendancePercentage == null) {
    this.attendancePercentage = parseFloat(((this.classesAttended / this.classesHeld) * 100).toFixed(2));
  }
});

attendanceRecordSchema.index({ studentId: 1, term: 1 });
attendanceRecordSchema.index({ studentId: 1, observedAt: -1 });

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema, 'attendance_records');
export default AttendanceRecord;
