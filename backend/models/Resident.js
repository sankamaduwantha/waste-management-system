const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  householdSize: {
    type: Number,
    default: 1
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'villa', 'commercial'],
    default: 'house'
  },
  binAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  }],
  collectionSchedule: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  }],
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      name: String,
      icon: String,
      earnedAt: Date
    }],
    rank: Number
  },
  recyclingStats: {
    totalWasteGenerated: {
      type: Number,
      default: 0
    },
    wasteRecycled: {
      type: Number,
      default: 0
    },
    recyclingRate: {
      type: Number,
      default: 0
    },
    co2Saved: {
      type: Number,
      default: 0
    }
  },
  paymentInfo: {
    monthlyFee: {
      type: Number,
      default: 0
    },
    lastPaymentDate: Date,
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending'
    }
  },
  specialRequirements: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate recycling rate
residentSchema.methods.calculateRecyclingRate = function() {
  if (this.recyclingStats.totalWasteGenerated > 0) {
    this.recyclingStats.recyclingRate = 
      (this.recyclingStats.wasteRecycled / this.recyclingStats.totalWasteGenerated) * 100;
  }
  return this.recyclingStats.recyclingRate;
};

// Update gamification points
residentSchema.methods.addPoints = function(points) {
  this.gamification.points += points;
  
  // Level up logic
  const requiredPoints = this.gamification.level * 100;
  if (this.gamification.points >= requiredPoints) {
    this.gamification.level += 1;
  }
};

module.exports = mongoose.model('Resident', residentSchema);
