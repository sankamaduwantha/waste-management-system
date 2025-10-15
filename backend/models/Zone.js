const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide zone name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide zone code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  district: {
    type: String,
    required: [true, 'Please provide district name']
  },
  city: {
    type: String,
    required: [true, 'Please provide city name']
  },
  state: {
    type: String,
    required: [true, 'Please provide state name']
  },
  area: {
    type: Number, // in square kilometers
    required: true
  },
  population: {
    type: Number,
    default: 0
  },
  coordinates: [{
    latitude: Number,
    longitude: Number
  }],
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedVehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  bins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  }],
  schedules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  }],
  stats: {
    totalHouseholds: {
      type: Number,
      default: 0
    },
    totalBins: {
      type: Number,
      default: 0
    },
    averageWastePerDay: {
      type: Number,
      default: 0
    },
    recyclingRate: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    residentialMonthly: {
      type: Number,
      default: 0
    },
    commercialMonthly: {
      type: Number,
      default: 0
    },
    bulkPickupFee: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create index for geospatial queries
zoneSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
