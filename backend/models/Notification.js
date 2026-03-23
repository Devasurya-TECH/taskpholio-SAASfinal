const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'TASK_ASSIGNED',
      'TASK_UPDATED',
      'TASK_COMPLETED',
      'TASK_COMMENT',
      'TASK_MENTION',
      'MEETING_SCHEDULED',
      'MEETING_REMINDER',
      'MEETING_UPDATED',
      'TEAM_UPDATE',
      'FILE_SHARED'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: String,
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedMeeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date
}, { timestamps: true });

// Auto-delete old read notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);
