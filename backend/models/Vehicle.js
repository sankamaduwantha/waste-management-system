const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['truck', 'compactor', 'tipper', 'mini_truck', 'specialized'],
    required: true
  },
  make: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  capacity: {
    type: Number, // in cubic meters or kg
    required: true
  },
  currentCapacity: {
    type: Number,
    default: 0
  },
  assignedZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gpsDevice: {
    deviceId: String,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  status: {
    type: String,
    enum: ['available', 'on-route', 'maintenance', 'out-of-service'],
    default: 'available'
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'petrol', 'cng', 'electric', 'hybrid']
  },
  fuelEfficiency: {
    type: Number // km per liter or km per charge
  },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    lastServiceOdometer: Number,
    nextServiceOdometer: Number,
    maintenanceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number,
      odometer: Number
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  documents: [{
    type: String,
    name: String,
    expiryDate: Date
  }],
  odometer: {
    type: Number,
    default: 0
  },
  operationalStats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    totalWasteCollected: {
      type: Number,
      default: 0
    },
    averageFuelConsumption: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate fill percentage
vehicleSchema.virtual('fillPercentage').get(function() {
  return (this.currentCapacity / this.capacity) * 100;
});

// Check if vehicle needs service
vehicleSchema.methods.needsService = function() {
  if (!this.maintenance.nextServiceDate) return false;
  return new Date() >= new Date(this.maintenance.nextServiceDate);
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
