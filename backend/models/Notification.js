const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'collection_reminder',
      'missed_collection',
      'service_request_update',
      'payment_due',
      'payment_confirmed',
      'achievement',
      'system_announcement',
      'bin_full',
      'schedule_change',
      'task_assignment',
      'task_update',
      'task_completion',
      'task_verification',
      'task_rejection',
      'task_cancellation',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  channels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    inApp: {
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Additional data like IDs, links, etc.
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

// Create index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
