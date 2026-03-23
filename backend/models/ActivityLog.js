const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'TASK_CREATED',
      'TASK_UPDATED',
      'TASK_DELETED',
      'TASK_COMPLETED',
      'MEETING_CREATED',
      'MEETING_UPDATED',
      'FILE_UPLOADED',
      'COMMENT_ADDED',
      'TEAM_UPDATED',
      'USER_UPDATED',
      'PASSWORD_CHANGED'
    ]
  },
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  relatedModel: String,
  relatedId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

// TTL index - auto delete after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
