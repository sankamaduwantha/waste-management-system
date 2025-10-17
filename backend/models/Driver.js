const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  // Link to User account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Driver-specific info
  employeeId: {
    type: String,
    required: [true, 'Please provide employee ID'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  licenseType: {
    type: String,
    enum: ['light_vehicle', 'medium_vehicle', 'heavy_vehicle', 'specialized'],
    required: true
  },
  
  licenseExpiry: {
    type: Date,
    required: true
  },
  
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  assignedZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },
  
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  status: {
    type: String,
    enum: ['active', 'on-leave', 'suspended', 'terminated'],
    default: 'active'
  },
  
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'rotating'],
    default: 'morning'
  },
  
  contactDetails: {
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    bloodGroup: String
  },
  
  performance: {
    totalTrips: {
      type: Number,
      default: 0
    },
    completedTrips: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5
    },
    totalComplaints: {
      type: Number,
      default: 0
    },
    awards: [{
      title: String,
      date: Date,
      description: String
    }]
  },
  
  attendance: {
    totalPresent: {
      type: Number,
      default: 0
    },
    totalAbsent: {
      type: Number,
      default: 0
    },
    totalLeaves: {
      type: Number,
      default: 0
    }
  },
  
  trainingRecords: [{
    trainingName: String,
    date: Date,
    certificateNumber: String,
    validUntil: Date
  }],
  
  medicalRecords: [{
    checkupDate: Date,
    nextCheckupDate: Date,
    fitnessCertificate: String,
    validUntil: Date,
    remarks: String
  }],
  
  documents: [{
    type: {
      type: String,
      enum: ['license', 'id_proof', 'medical_certificate', 'police_clearance', 'other']
    },
    documentNumber: String,
    uploadDate: Date,
    expiryDate: Date,
    fileUrl: String
  }],
  
  salary: {
    basic: Number,
    allowances: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  notes: {
    type: String
  }
  
}, {
  timestamps: true
});

// Indexes for better query performance
driverSchema.index({ employeeId: 1 });
driverSchema.index({ user: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ assignedZone: 1 });
driverSchema.index({ licenseExpiry: 1 });

// Virtual for full driver info with user details
driverSchema.virtual('fullInfo').get(function() {
  return {
    ...this.toObject(),
    user: this.user
  };
});

// Check if license is expired
driverSchema.methods.isLicenseValid = function() {
  return new Date() < this.licenseExpiry;
};

// Calculate age
driverSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
