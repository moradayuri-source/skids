import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    actionType: {
      type: String,
      enum: ['login', 'logout', 'create', 'update', 'delete', 'profile_update', 'other'],
      default: 'other',
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    resourceType: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ action: 'text', actorName: 'text', details: 'text' });
activityLogSchema.index({ createdAt: -1, actionType: 1, resourceType: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
