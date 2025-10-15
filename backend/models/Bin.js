const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: [true, 'Please provide bin ID'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'recyclable', 'organic', 'hazardous'],
    required: true
  },
  capacity: {
    type: Number, // in liters
    required: true
  },
  currentFillLevel: {
    type: Number, // percentage (0-100)
    default: 0,
    min: 0,
    max: 100
  },
  location: {
    address: String,
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident'
  },
  iotSensor: {
    sensorId: String,
    isActive: {
      type: Boolean,
      default: false
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    lastSync: Date
  },
  status: {
    type: String,
    enum: ['active', 'full', 'needs-maintenance', 'damaged', 'removed'],
    default: 'active'
  },
  maintenanceHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['cleaning', 'repair', 'replacement', 'inspection']
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  collectionHistory: [{
    date: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    wasteCollected: {
      weight: Number,
      volume: Number
    }
  }],
  qrCode: {
    type: String
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastEmptied: Date,
  nextScheduledCollection: Date,
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
binSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
binSchema.index({ zone: 1, type: 1 });

// Virtual for fill status
binSchema.virtual('fillStatus').get(function() {
  if (this.currentFillLevel >= 90) return 'critical';
  if (this.currentFillLevel >= 75) return 'high';
  if (this.currentFillLevel >= 50) return 'medium';
  return 'low';
});

// Method to check if bin needs collection
binSchema.methods.needsCollection = function() {
  return this.currentFillLevel >= 80 || this.status === 'full';
};

// Method to empty bin
binSchema.methods.empty = function() {
  this.currentFillLevel = 0;
  this.lastEmptied = new Date();
  this.status = 'active';
};

module.exports = mongoose.model('Bin', binSchema);
