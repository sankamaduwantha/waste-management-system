/**
 * @fileoverview Waste Entry Model
 * @description Mongoose schema for tracking daily waste entries by residents
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Active Record Pattern: Model encapsulates data and behavior
 * - Builder Pattern: Complex query building with static methods
 * 
 * @solid-principles
 * - Single Responsibility: Handles only waste entry data and related operations
 * - Open/Closed: Extensible through virtuals and methods without modifying core schema
 */

const mongoose = require('mongoose');

/**
 * Waste Entry Schema
 * Tracks daily waste amounts by category for each resident
 */
const wasteEntrySchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },

  // Entry date (normalized to start of day)
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
    validate: {
      validator: function(value) {
        // Date should not be in the future
        return value <= new Date();
      },
      message: 'Date cannot be in the future'
    }
  },

  // Waste amounts by category (in kilograms)
  wasteAmounts: {
    general: {
      type: Number,
      default: 0,
      min: [0, 'General waste amount cannot be negative'],
      max: [1000, 'General waste amount seems unrealistic']
    },
    recyclable: {
      type: Number,
      default: 0,
      min: [0, 'Recyclable waste amount cannot be negative'],
      max: [1000, 'Recyclable waste amount seems unrealistic']
    },
    organic: {
      type: Number,
      default: 0,
      min: [0, 'Organic waste amount cannot be negative'],
      max: [1000, 'Organic waste amount seems unrealistic']
    },
    hazardous: {
      type: Number,
      default: 0,
      min: [0, 'Hazardous waste amount cannot be negative'],
      max: [100, 'Hazardous waste amount seems unrealistic']
    }
  },

  // Additional metadata
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Location where waste was generated (optional)
  location: {
    type: String,
    trim: true,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },

  // Auto-calculated fields
  isEdited: {
    type: Boolean,
    default: false
  },

  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================================================
// INDEXES
// ============================================================================

// Compound index for efficient queries by user and date
wasteEntrySchema.index({ user: 1, date: -1 });

// Compound index for date range queries
wasteEntrySchema.index({ user: 1, createdAt: -1 });

// Unique constraint: one entry per user per day
wasteEntrySchema.index({ user: 1, date: 1 }, { unique: true });

// ============================================================================
// VIRTUALS
// ============================================================================

/**
 * Calculate total waste for the entry
 * @returns {Number} Total waste in kg
 */
wasteEntrySchema.virtual('totalWaste').get(function() {
  const { general, recyclable, organic, hazardous } = this.wasteAmounts;
  return general + recyclable + organic + hazardous;
});

/**
 * Calculate recycling rate
 * @returns {Number} Percentage of recyclable waste
 */
wasteEntrySchema.virtual('recyclingRate').get(function() {
  const total = this.totalWaste;
  if (total === 0) return 0;
  return ((this.wasteAmounts.recyclable / total) * 100).toFixed(2);
});

/**
 * Calculate organic waste percentage
 * @returns {Number} Percentage of organic waste
 */
wasteEntrySchema.virtual('organicRate').get(function() {
  const total = this.totalWaste;
  if (total === 0) return 0;
  return ((this.wasteAmounts.organic / total) * 100).toFixed(2);
});

/**
 * Get waste breakdown as percentages
 * @returns {Object} Waste breakdown by category
 */
wasteEntrySchema.virtual('wasteBreakdown').get(function() {
  const total = this.totalWaste;
  if (total === 0) {
    return {
      general: 0,
      recyclable: 0,
      organic: 0,
      hazardous: 0
    };
  }

  return {
    general: ((this.wasteAmounts.general / total) * 100).toFixed(2),
    recyclable: ((this.wasteAmounts.recyclable / total) * 100).toFixed(2),
    organic: ((this.wasteAmounts.organic / total) * 100).toFixed(2),
    hazardous: ((this.wasteAmounts.hazardous / total) * 100).toFixed(2)
  };
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-save middleware: Normalize date to start of day
 */
wasteEntrySchema.pre('save', function(next) {
  if (this.isModified('date')) {
    // Normalize date to start of day (00:00:00)
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);
    this.date = date;
  }

  // Track if entry was edited
  if (!this.isNew && this.isModified('wasteAmounts')) {
    this.isEdited = true;
    this.editedAt = new Date();
  }

  next();
});

// ============================================================================
// STATIC METHODS (Builder Pattern)
// ============================================================================

/**
 * Get waste entries for a user within a date range
 * @param {String} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of waste entries
 */
wasteEntrySchema.statics.getEntriesByDateRange = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

/**
 * Get aggregated statistics for a user
 * @param {String} userId - User ID
 * @param {Number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Aggregated statistics
 */
wasteEntrySchema.statics.getUserStatistics = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const stats = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalGeneral: { $sum: '$wasteAmounts.general' },
        totalRecyclable: { $sum: '$wasteAmounts.recyclable' },
        totalOrganic: { $sum: '$wasteAmounts.organic' },
        totalHazardous: { $sum: '$wasteAmounts.hazardous' },
        avgGeneral: { $avg: '$wasteAmounts.general' },
        avgRecyclable: { $avg: '$wasteAmounts.recyclable' },
        avgOrganic: { $avg: '$wasteAmounts.organic' },
        avgHazardous: { $avg: '$wasteAmounts.hazardous' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        totalWaste: {
          $add: ['$totalGeneral', '$totalRecyclable', '$totalOrganic', '$totalHazardous']
        },
        breakdown: {
          general: '$totalGeneral',
          recyclable: '$totalRecyclable',
          organic: '$totalOrganic',
          hazardous: '$totalHazardous'
        },
        averages: {
          general: { $round: ['$avgGeneral', 2] },
          recyclable: { $round: ['$avgRecyclable', 2] },
          organic: { $round: ['$avgOrganic', 2] },
          hazardous: { $round: ['$avgHazardous', 2] }
        }
      }
    }
  ]);

  // Return default values if no entries found
  if (!stats.length) {
    return {
      totalEntries: 0,
      totalWaste: 0,
      breakdown: { general: 0, recyclable: 0, organic: 0, hazardous: 0 },
      averages: { general: 0, recyclable: 0, organic: 0, hazardous: 0 }
    };
  }

  return stats[0];
};

/**
 * Get waste trend data for charting
 * @param {String} userId - User ID
 * @param {Number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of daily totals
 */
wasteEntrySchema.statics.getWasteTrend = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return this.find({
    user: userId,
    date: { $gte: startDate }
  })
  .sort({ date: 1 })
  .select('date wasteAmounts')
  .lean();
};

/**
 * Check if entry exists for user on specific date
 * @param {String} userId - User ID
 * @param {Date} date - Date to check
 * @returns {Promise<Boolean>} True if entry exists
 */
wasteEntrySchema.statics.hasEntryForDate = async function(userId, date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const entry = await this.findOne({
    user: userId,
    date: normalizedDate
  });

  return !!entry;
};

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Update waste amounts
 * @param {Object} newAmounts - New waste amounts
 * @returns {Promise<WasteEntry>} Updated entry
 */
wasteEntrySchema.methods.updateAmounts = async function(newAmounts) {
  Object.assign(this.wasteAmounts, newAmounts);
  return this.save();
};

/**
 * Get formatted entry data for display
 * @returns {Object} Formatted entry data
 */
wasteEntrySchema.methods.toDisplayFormat = function() {
  return {
    id: this._id,
    date: this.date,
    wasteAmounts: this.wasteAmounts,
    totalWaste: this.totalWaste,
    recyclingRate: this.recyclingRate,
    wasteBreakdown: this.wasteBreakdown,
    notes: this.notes,
    location: this.location,
    isEdited: this.isEdited,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

/**
 * Check if entry is from today
 * @returns {Boolean} True if entry is from today
 */
wasteEntrySchema.methods.isToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.date.getTime() === today.getTime();
};

// Export model
module.exports = mongoose.model('WasteEntry', wasteEntrySchema);
