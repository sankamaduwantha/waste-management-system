/**
 * @fileoverview Task Model
 * @description Schema for tasks assigned to residents by sustainability managers
 * @author Waste Management System
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['waste_reduction', 'recycling', 'composting', 'plastic_reduction', 'energy_saving', 'water_conservation', 'education', 'other'],
    default: 'waste_reduction'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to a resident']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have an assignor']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  rewardPoints: {
    type: Number,
    required: [true, 'Reward points are required'],
    min: [0, 'Reward points cannot be negative'],
    max: [1000, 'Reward points cannot exceed 1000'],
    default: 10
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'verified', 'rejected', 'cancelled'],
    default: 'assigned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completionProof: {
    type: {
      type: String,
      enum: ['image', 'text', 'file'],
      default: 'text'
    },
    url: String,
    description: String,
    submittedAt: Date
  },
  completedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  verificationNotes: {
    type: String,
    maxlength: [500, 'Verification notes cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    },
    endDate: Date
  },
  reminders: [{
    sentAt: Date,
    type: {
      type: String,
      enum: ['email', 'sms', 'notification']
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    estimatedTime: {
      type: Number, // in minutes
      min: 0
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100
    },
    viewCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, isActive: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'verified') return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for completion rate (if needed for recurring tasks)
taskSchema.virtual('completionRate').get(function() {
  if (this.status === 'verified') return 100;
  if (this.status === 'completed') return 75;
  if (this.status === 'in_progress') return 50;
  return 0;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Auto-set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-set verifiedAt when status changes to verified
  if (this.isModified('status') && this.status === 'verified' && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  
  next();
});

// Static method to get tasks by status
taskSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true })
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name')
    .sort('-createdAt');
};

// Static method to get overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'verified', 'cancelled'] },
    isActive: true
  })
    .populate('assignedTo', 'name email')
    .sort('dueDate');
};

// Static method to get tasks by resident
taskSchema.statics.findByResident = function(residentId, options = {}) {
  const query = { assignedTo: residentId, isActive: true };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('assignedBy', 'name')
    .sort(options.sort || '-createdAt');
};

// Static method to get task statistics
taskSchema.statics.getStatistics = async function(managerId) {
  const stats = await this.aggregate([
    { $match: { assignedBy: new mongoose.Types.ObjectId(managerId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$rewardPoints' }
      }
    }
  ]);
  
  return stats;
};

// Instance method to mark as completed
taskSchema.methods.markCompleted = function(proofData) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (proofData) {
    this.completionProof = {
      ...proofData,
      submittedAt: new Date()
    };
  }
  return this.save();
};

// Instance method to verify completion
taskSchema.methods.verify = function(notes) {
  this.status = 'verified';
  this.verifiedAt = new Date();
  if (notes) {
    this.verificationNotes = notes;
  }
  return this.save();
};

// Instance method to reject completion
taskSchema.methods.reject = function(reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.completedAt = null;
  this.completionProof = undefined;
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
