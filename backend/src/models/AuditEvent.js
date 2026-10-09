import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: String,
      required: [true, 'actorUserId is required.'],
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'action is required.'],
      trim: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: [true, 'resourceType is required.'],
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    requestId: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditEventSchema.index({ createdAt: -1 });
auditEventSchema.index({ actorUserId: 1, createdAt: -1 });

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema, 'audit_events');
export default AuditEvent;
