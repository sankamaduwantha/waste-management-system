/**
 * @fileoverview TimeSlot Configuration Model
 * @description Mongoose schema for managing available appointment time slots per zone
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Manages only time slot configuration data
 * - Open/Closed: Extensible for holidays and special dates
 * 
 * @module models/TimeSlotConfig
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Slot
 * @property {string} start - Start time in HH:MM format
 * @property {string} end - End time in HH:MM format
 * @property {number} capacity - Maximum number of appointments
 * @property {boolean} isActive - Whether slot is currently active
 */

/**
 * @typedef {Object} SpecialDate
 * @property {Date} date - Special date
 * @property {number} capacity - Override capacity for this date
 * @property {boolean} isAvailable - Whether date is available
 */

/**
 * Time Slot Configuration Schema
 * @description Defines available appointment slots for each zone and day
 */
const timeSlotConfigSchema = new mongoose.Schema(
  {
    // === ZONE REFERENCE ===
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: [true, 'Zone is required'],
      index: true,
    },

    // === DAY CONFIGURATION ===
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required'],
      min: [0, 'Day of week must be between 0-6'],
      max: [6, 'Day of week must be between 0-6'],
      index: true,
      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    },

    // === TIME SLOTS ===
    slots: [{
      start: {
        type: String,
        required: [true, 'Slot start time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
      },
      end: {
        type: String,
        required: [true, 'Slot end time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
      },
      capacity: {
        type: Number,
        required: [true, 'Slot capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [50, 'Capacity cannot exceed 50'],
        default: 10,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],

    // === HOLIDAYS (No Service) ===
    holidays: [{
      type: Date,
    }],

    // === SPECIAL DATES (Custom Capacity/Availability) ===
    specialDates: [{
      date: {
        type: Date,
        required: true,
      },
      capacity: {
        type: Number,
        min: [0, 'Capacity cannot be negative'],
        max: [50, 'Capacity cannot exceed 50'],
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
      reason: {
        type: String,
        maxlength: [200, 'Reason cannot exceed 200 characters'],
      },
    }],

    // === OPERATIONAL SETTINGS ===
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // === METADATA ===
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

// Compound index for efficient zone-day queries
timeSlotConfigSchema.index({ zone: 1, dayOfWeek: 1 }, { unique: true });

// Index for active configurations
timeSlotConfigSchema.index({ zone: 1, isActive: 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

/**
 * Virtual: Day name
 * @returns {string} Human-readable day name
 */
timeSlotConfigSchema.virtual('dayName').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.dayOfWeek] || 'Unknown';
});

/**
 * Virtual: Active slots count
 * @returns {number} Number of active slots
 */
timeSlotConfigSchema.virtual('activeSlotCount').get(function() {
  return this.slots.filter(slot => slot.isActive).length;
});

/**
 * Virtual: Total capacity
 * @returns {number} Total capacity across all active slots
 */
timeSlotConfigSchema.virtual('totalCapacity').get(function() {
  return this.slots
    .filter(slot => slot.isActive)
    .reduce((sum, slot) => sum + slot.capacity, 0);
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Check if a specific date is a holiday
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is a holiday
 */
timeSlotConfigSchema.methods.isHoliday = function(date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return this.holidays.some(holiday => {
    const holidayDate = new Date(holiday);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === checkDate.getTime();
  });
};

/**
 * Get special date configuration if exists
 * @param {Date} date - Date to check
 * @returns {Object|null} Special date config or null
 */
timeSlotConfigSchema.methods.getSpecialDateConfig = function(date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return this.specialDates.find(special => {
    const specialDate = new Date(special.date);
    specialDate.setHours(0, 0, 0, 0);
    return specialDate.getTime() === checkDate.getTime();
  }) || null;
};

/**
 * Check if date is available for appointments
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is available
 */
timeSlotConfigSchema.methods.isDateAvailable = function(date) {
  // Check if it's a holiday
  if (this.isHoliday(date)) {
    return false;
  }

  // Check special date configuration
  const specialConfig = this.getSpecialDateConfig(date);
  if (specialConfig) {
    return specialConfig.isAvailable;
  }

  // Default: available if config is active
  return this.isActive;
};

/**
 * Get slots for a specific date (considering special dates)
 * @param {Date} date - Date to get slots for
 * @returns {Array} Array of slots with adjusted capacity
 */
timeSlotConfigSchema.methods.getSlotsForDate = function(date) {
  if (!this.isDateAvailable(date)) {
    return [];
  }

  const specialConfig = this.getSpecialDateConfig(date);
  
  // Return active slots, with special capacity if applicable
  return this.slots
    .filter(slot => slot.isActive)
    .map(slot => ({
      start: slot.start,
      end: slot.end,
      capacity: specialConfig?.capacity ?? slot.capacity,
      isActive: slot.isActive,
    }));
};

/**
 * Add a new time slot
 * @param {Object} slotData - Slot data {start, end, capacity}
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.addSlot = async function(slotData) {
  // Validate slot doesn't overlap with existing slots
  const hasOverlap = this.slots.some(existing => {
    if (!existing.isActive) return false;
    
    const [newStart, newEnd] = [slotData.start, slotData.end];
    const [exStart, exEnd] = [existing.start, existing.end];
    
    return (newStart < exEnd && newEnd > exStart);
  });

  if (hasOverlap) {
    throw new Error('Time slot overlaps with existing slot');
  }

  this.slots.push({
    start: slotData.start,
    end: slotData.end,
    capacity: slotData.capacity || 10,
    isActive: true,
  });

  return await this.save();
};

/**
 * Remove a time slot
 * @param {string} slotId - Slot subdocument ID
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.removeSlot = async function(slotId) {
  this.slots = this.slots.filter(slot => slot._id.toString() !== slotId.toString());
  return await this.save();
};

/**
 * Update slot capacity
 * @param {string} slotId - Slot subdocument ID
 * @param {number} newCapacity - New capacity value
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.updateSlotCapacity = async function(slotId, newCapacity) {
  const slot = this.slots.find(s => s._id.toString() === slotId.toString());
  
  if (!slot) {
    throw new Error('Slot not found');
  }

  slot.capacity = newCapacity;
  return await this.save();
};

/**
 * Add holiday
 * @param {Date} date - Holiday date
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.addHoliday = async function(date) {
  const holidayDate = new Date(date);
  holidayDate.setHours(0, 0, 0, 0);

  // Check if already exists
  if (!this.isHoliday(holidayDate)) {
    this.holidays.push(holidayDate);
    return await this.save();
  }

  return this;
};

/**
 * Remove holiday
 * @param {Date} date - Holiday date to remove
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.removeHoliday = async function(date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  this.holidays = this.holidays.filter(holiday => {
    const holidayDate = new Date(holiday);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() !== checkDate.getTime();
  });

  return await this.save();
};

/**
 * Add or update special date
 * @param {Date} date - Special date
 * @param {Object} config - Configuration {capacity, isAvailable, reason}
 * @returns {Promise<TimeSlotConfig>} Updated config
 */
timeSlotConfigSchema.methods.setSpecialDate = async function(date, config) {
  const specialDate = new Date(date);
  specialDate.setHours(0, 0, 0, 0);

  // Remove existing if present
  this.specialDates = this.specialDates.filter(special => {
    const sd = new Date(special.date);
    sd.setHours(0, 0, 0, 0);
    return sd.getTime() !== specialDate.getTime();
  });

  // Add new
  this.specialDates.push({
    date: specialDate,
    capacity: config.capacity,
    isAvailable: config.isAvailable !== undefined ? config.isAvailable : true,
    reason: config.reason || '',
  });

  return await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Get configuration for a specific zone and day
 * @param {ObjectId} zoneId - Zone ID
 * @param {number} dayOfWeek - Day of week (0-6)
 * @returns {Promise<TimeSlotConfig>} Configuration
 */
timeSlotConfigSchema.statics.getConfig = function(zoneId, dayOfWeek) {
  return this.findOne({ zone: zoneId, dayOfWeek, isActive: true })
    .populate('zone', 'name')
    .exec();
};

/**
 * Get all configurations for a zone
 * @param {ObjectId} zoneId - Zone ID
 * @returns {Promise<Array<TimeSlotConfig>>} Array of configurations
 */
timeSlotConfigSchema.statics.getZoneConfigs = function(zoneId) {
  return this.find({ zone: zoneId, isActive: true })
    .sort({ dayOfWeek: 1 })
    .populate('zone', 'name')
    .exec();
};

/**
 * Initialize default slots for a zone
 * @param {ObjectId} zoneId - Zone ID
 * @param {ObjectId} userId - User creating the config
 * @returns {Promise<Array<TimeSlotConfig>>} Created configurations
 */
timeSlotConfigSchema.statics.initializeDefaultSlots = async function(zoneId, userId) {
  const defaultSlots = [
    { start: '09:00', end: '10:00', capacity: 10 },
    { start: '10:00', end: '11:00', capacity: 10 },
    { start: '11:00', end: '12:00', capacity: 10 },
    { start: '14:00', end: '15:00', capacity: 10 },
    { start: '15:00', end: '16:00', capacity: 10 },
    { start: '16:00', end: '17:00', capacity: 10 },
  ];

  const configs = [];

  // Create config for Monday to Friday (1-5)
  for (let day = 1; day <= 5; day++) {
    const config = await this.create({
      zone: zoneId,
      dayOfWeek: day,
      slots: defaultSlots,
      isActive: true,
      createdBy: userId,
      lastModifiedBy: userId,
    });
    configs.push(config);
  }

  // Saturday with reduced slots (6)
  const saturdaySlots = [
    { start: '09:00', end: '10:00', capacity: 5 },
    { start: '10:00', end: '11:00', capacity: 5 },
    { start: '11:00', end: '12:00', capacity: 5 },
  ];

  const saturdayConfig = await this.create({
    zone: zoneId,
    dayOfWeek: 6,
    slots: saturdaySlots,
    isActive: true,
    createdBy: userId,
    lastModifiedBy: userId,
  });
  configs.push(saturdayConfig);

  return configs;
};

/**
 * Get available slots for a specific date
 * @param {ObjectId} zoneId - Zone ID
 * @param {Date} date - Date to check
 * @returns {Promise<Array>} Available slots
 */
timeSlotConfigSchema.statics.getAvailableSlots = async function(zoneId, date) {
  const dayOfWeek = new Date(date).getDay();
  const config = await this.getConfig(zoneId, dayOfWeek);

  if (!config) {
    return [];
  }

  return config.getSlotsForDate(date);
};

// ============================================
// MIDDLEWARE HOOKS
// ============================================

/**
 * Pre-save hook: Validate slots don't overlap
 */
timeSlotConfigSchema.pre('save', function(next) {
  const activeSlots = this.slots.filter(slot => slot.isActive);

  for (let i = 0; i < activeSlots.length; i++) {
    for (let j = i + 1; j < activeSlots.length; j++) {
      const slot1 = activeSlots[i];
      const slot2 = activeSlots[j];

      // Check for overlap
      if (slot1.start < slot2.end && slot1.end > slot2.start) {
        return next(new Error(`Slot ${slot1.start}-${slot1.end} overlaps with ${slot2.start}-${slot2.end}`));
      }
    }
  }

  next();
});

/**
 * Pre-save hook: Validate slot times
 */
timeSlotConfigSchema.pre('save', function(next) {
  for (const slot of this.slots) {
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return next(new Error(`Invalid slot: ${slot.start}-${slot.end}. End time must be after start time.`));
    }
  }

  next();
});

/**
 * Post-save hook: Log configuration changes
 */
timeSlotConfigSchema.post('save', function(doc) {
  console.log(`⚙️ TimeSlotConfig updated - Zone: ${doc.zone}, Day: ${doc.dayName}`);
});

// ============================================
// MODEL EXPORT
// ============================================

/**
 * TimeSlotConfig Model
 * @type {mongoose.Model<TimeSlotConfig>}
 */
const TimeSlotConfig = mongoose.model('TimeSlotConfig', timeSlotConfigSchema);

module.exports = TimeSlotConfig;
