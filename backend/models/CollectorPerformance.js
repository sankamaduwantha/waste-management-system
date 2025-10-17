const mongoose = require('mongoose');

const collectorPerformanceSchema = new mongoose.Schema({
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['day', 'week', 'month', 'year'],
    default: 'day'
  },
  metrics: {
    totalCollections: {
      type: Number,
      default: 0
    },
    completedCollections: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTimePerBin: {
      type: Number, // in minutes
      default: 0
    },
    distanceCovered: {
      type: Number, // in kilometers
      default: 0
    },
    onTimeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    efficiency: {
      type: Number, // Overall efficiency score 0-100
      default: 0,
      min: 0,
      max: 100
    },
    rating: {
      type: Number, // Rating out of 5
      default: 0,
      min: 0,
      max: 5
    }
  },
  tasks: {
    assigned: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    skipped: {
      type: Number,
      default: 0
    }
  },
  issues: {
    reported: {
      type: Number,
      default: 0
    },
    resolved: {
      type: Number,
      default: 0
    }
  },
  score: {
    type: Number, // Leaderboard score
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
collectorPerformanceSchema.index({ collector: 1, date: -1 });
collectorPerformanceSchema.index({ collector: 1, period: 1 });

// Calculate efficiency score based on various metrics
collectorPerformanceSchema.methods.calculateEfficiency = function() {
  const completionWeight = 0.4;
  const onTimeWeight = 0.3;
  const speedWeight = 0.3;
  
  const speedScore = this.metrics.averageTimePerBin > 0 
    ? Math.max(0, 100 - (this.metrics.averageTimePerBin - 5) * 10) 
    : 0;
  
  this.metrics.efficiency = Math.round(
    (this.metrics.completionRate * completionWeight) +
    (this.metrics.onTimeRate * onTimeWeight) +
    (speedScore * speedWeight)
  );
};

// Calculate leaderboard score
collectorPerformanceSchema.methods.calculateScore = function() {
  this.score = Math.round(
    (this.metrics.completedCollections * 10) +
    (this.metrics.completionRate * 5) +
    (this.metrics.efficiency * 3) +
    (this.metrics.rating * 20)
  );
};

module.exports = mongoose.model('CollectorPerformance', collectorPerformanceSchema);
