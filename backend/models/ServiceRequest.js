const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['missed_collection', 'bulk_pickup', 'illegal_dumping', 'bin_request', 'bin_repair', 'complaint', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'cancelled', 'rejected'],
    default: 'pending'
  },
  images: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  scheduledDate: Date,
  completedDate: Date,
  resolutionNotes: {
    type: String
  },
  resolutionImages: [{
    url: String,
    uploadedAt: Date
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  slaDeadline: Date,
  isOverdue: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate request number
serviceRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestNumber = `SR${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate SLA deadline based on priority
  if (this.isNew && !this.slaDeadline) {
    const hoursMap = { urgent: 4, high: 24, medium: 48, low: 72 };
    const hours = hoursMap[this.priority] || 48;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  
  next();
});

// Check if request is overdue
serviceRequestSchema.methods.checkOverdue = function() {
  if (this.status !== 'resolved' && this.status !== 'cancelled') {
    this.isOverdue = new Date() > this.slaDeadline;
  }
  return this.isOverdue;
};

// Add timeline entry
serviceRequestSchema.methods.addTimelineEntry = function(status, userId, notes) {
  this.timeline.push({
    status,
    updatedBy: userId,
    notes,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
