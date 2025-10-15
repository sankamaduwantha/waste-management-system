const mongoose = require('mongoose');

const wasteDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  wasteCollected: {
    general: {
      type: Number,
      default: 0
    },
    recyclable: {
      type: Number,
      default: 0
    },
    organic: {
      type: Number,
      default: 0
    },
    hazardous: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  unit: {
    type: String,
    enum: ['kg', 'tons', 'cubic_meters'],
    default: 'kg'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  collectionDetails: {
    binsCollected: {
      type: Number,
      default: 0
    },
    routeDistance: {
      type: Number, // in kilometers
      default: 0
    },
    fuelConsumed: {
      type: Number, // in liters
      default: 0
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  },
  processing: {
    recycled: {
      type: Number,
      default: 0
    },
    composted: {
      type: Number,
      default: 0
    },
    landfilled: {
      type: Number,
      default: 0
    },
    incinerated: {
      type: Number,
      default: 0
    }
  },
  environmentalImpact: {
    co2Emissions: {
      type: Number, // in kg
      default: 0
    },
    co2Saved: {
      type: Number, // in kg (from recycling)
      default: 0
    },
    energySaved: {
      type: Number, // in kWh
      default: 0
    }
  },
  composition: [{
    material: {
      type: String,
      enum: ['plastic', 'paper', 'glass', 'metal', 'organic', 'textile', 'electronic', 'other']
    },
    weight: Number,
    percentage: Number
  }],
  quality: {
    contaminationRate: {
      type: Number, // percentage
      default: 0
    },
    segregationQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Create compound index for efficient queries
wasteDataSchema.index({ date: -1, zone: 1 });

// Calculate totals before saving
wasteDataSchema.pre('save', function(next) {
  // Calculate total waste collected
  const collected = this.wasteCollected;
  this.wasteCollected.total = 
    (collected.general || 0) + 
    (collected.recyclable || 0) + 
    (collected.organic || 0) + 
    (collected.hazardous || 0);
  
  // Calculate total processing
  const processing = this.processing;
  const totalProcessed = 
    (processing.recycled || 0) + 
    (processing.composted || 0) + 
    (processing.landfilled || 0) + 
    (processing.incinerated || 0);
  
  // Calculate diversion rate (waste diverted from landfill)
  if (this.wasteCollected.total > 0) {
    const diverted = (processing.recycled || 0) + (processing.composted || 0);
    this.diversionRate = (diverted / this.wasteCollected.total) * 100;
  }
  
  next();
});

// Method to calculate environmental savings
wasteDataSchema.methods.calculateEnvironmentalSavings = function() {
  // Simplified calculation
  // 1 kg of recycled waste saves approximately 2 kg CO2
  // 1 kg of composted organic waste saves approximately 1 kg CO2
  const recycledSavings = (this.processing.recycled || 0) * 2;
  const compostedSavings = (this.processing.composted || 0) * 1;
  
  this.environmentalImpact.co2Saved = recycledSavings + compostedSavings;
  
  // Energy savings: 1 kg recycled plastic saves ~1.5 kWh
  const plasticWeight = this.composition.find(c => c.material === 'plastic')?.weight || 0;
  this.environmentalImpact.energySaved = plasticWeight * 1.5;
  
  return this.environmentalImpact;
};

module.exports = mongoose.model('WasteData', wasteDataSchema);
