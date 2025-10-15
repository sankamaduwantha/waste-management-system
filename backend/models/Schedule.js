const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['general', 'recyclable', 'organic', 'hazardous'],
    required: true
  },
  collectionDay: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  timeSlot: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  route: {
    type: String
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  assignedCrew: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
    default: 'weekly'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  completionDetails: {
    startTime: Date,
    endTime: Date,
    wasteCollected: {
      weight: Number, // in kg
      volume: Number  // in cubic meters
    },
    binsServiced: Number,
    notes: String
  },
  nextScheduledDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
scheduleSchema.index({ zone: 1, collectionDay: 1, wasteType: 1 });

// Method to check if schedule is for today
scheduleSchema.methods.isToday = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[today.getDay()] === this.collectionDay.toLowerCase();
};

module.exports = mongoose.model('Schedule', scheduleSchema);
