const mongoose = require('mongoose');

const collectorTaskSchema = new mongoose.Schema({
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  bins: [{
    bin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin',
      required: true
    },
    sequence: {
      type: Number, // Order in the route
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    },
    scheduledTime: Date,
    startTime: Date,
    completionTime: Date,
    fillLevel: Number,
    wasteCollected: {
      weight: Number,
      volume: Number
    },
    notes: String,
    issues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest'
    }]
  }],
  route: {
    type: String
  },
  optimizedRoute: [{
    lat: Number,
    lng: Number,
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin'
    }
  }],
  totalDistance: {
    type: Number, // in kilometers
    default: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 0
  },
  actualTime: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'assigned'
  },
  startLocation: {
    lat: Number,
    lng: Number
  },
  endLocation: {
    lat: Number,
    lng: Number
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes for efficient queries
collectorTaskSchema.index({ collector: 1, date: -1 });
collectorTaskSchema.index({ status: 1, date: -1 });
collectorTaskSchema.index({ collector: 1, status: 1, date: -1 });

// Get today's tasks for a collector
collectorTaskSchema.statics.getTodayTasks = async function(collectorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    collector: collectorId,
    date: { $gte: today, $lt: tomorrow }
  })
  .populate('bins.bin')
  .populate('schedule')
  .sort({ priority: -1, 'bins.sequence': 1 });
};

// Get task statistics
collectorTaskSchema.methods.getStatistics = function() {
  const totalBins = this.bins.length;
  const completed = this.bins.filter(b => b.status === 'completed').length;
  const inProgress = this.bins.filter(b => b.status === 'in_progress').length;
  const pending = this.bins.filter(b => b.status === 'pending').length;
  const skipped = this.bins.filter(b => b.status === 'skipped').length;
  
  return {
    totalBins,
    completed,
    inProgress,
    pending,
    skipped,
    completionRate: totalBins > 0 ? Math.round((completed / totalBins) * 100) : 0
  };
};

// Check if task is completed
collectorTaskSchema.methods.isCompleted = function() {
  return this.bins.every(bin => 
    bin.status === 'completed' || bin.status === 'skipped'
  );
};

// Update task status based on bin statuses
collectorTaskSchema.methods.updateStatus = function() {
  if (this.isCompleted()) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.bins.some(bin => bin.status === 'in_progress')) {
    this.status = 'in_progress';
  }
};

module.exports = mongoose.model('CollectorTask', collectorTaskSchema);
