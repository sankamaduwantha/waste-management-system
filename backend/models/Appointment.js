/**
 * @fileoverview Appointment Model
 * @description Mongoose schema for waste collection appointments
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Handles only appointment data structure
 * - Open/Closed: Extensible through virtuals and methods
 * - Interface Segregation: Clean, focused schema definition
 * 
 * @module models/Appointment
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} TimeSlot
 * @property {string} start - Start time in HH:MM format
 * @property {string} end - End time in HH:MM format
 */

/**
 * @typedef {Object} Cancellation
 * @property {string} reason - Reason for cancellation
 * @property {ObjectId} cancelledBy - User who cancelled
 * @property {Date} cancelledAt - Cancellation timestamp
 */

/**
 * Appointment Schema
 * @description Defines the structure for waste collection appointments
 */
const appointmentSchema = new mongoose.Schema(
  {
    // === RELATIONSHIP FIELDS ===
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Resident is required'],
      index: true,
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: false, // Zone is now optional
      index: true,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // === SCHEDULING FIELDS ===
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
      validate: {
        validator: function(date) {
          // Appointment must be in the future (at least 1 hour from now)
          const minDate = new Date();
          minDate.setHours(minDate.getHours() + 1);
          return date >= minDate;
        },
        message: 'Appointment must be at least 1 hour in the future',
      },
    },

    timeSlot: {
      start: {
        type: String,
        required: [true, 'Time slot start is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
      },
      end: {
        type: String,
        required: [true, 'Time slot end is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
      },
    },

    // === WASTE DETAILS ===
    wasteTypes: [{
      type: String,
      enum: {
        values: ['recyclable', 'organic', 'non-recyclable', 'hazardous', 'bulky'],
        message: '{VALUE} is not a valid waste type',
      },
      required: true,
    }],

    estimatedAmount: {
      type: Number,
      required: [true, 'Estimated amount is required'],
      min: [0.1, 'Estimated amount must be at least 0.1 kg'],
      max: [1000, 'Estimated amount cannot exceed 1000 kg'],
    },

    actualAmount: {
      type: Number,
      min: [0, 'Actual amount cannot be negative'],
      default: null,
    },

    specialInstructions: {
      type: String,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
      trim: true,
    },

    // === STATUS MANAGEMENT ===
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },

    // === CANCELLATION INFO ===
    cancellation: {
      reason: {
        type: String,
        maxlength: [300, 'Cancellation reason cannot exceed 300 characters'],
      },
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      cancelledAt: {
        type: Date,
      },
    },

    // === OPERATIONAL FIELDS ===
    reminderSent: {
      type: Boolean,
      default: false,
      index: true,
    },

    completionNotes: {
      type: String,
      maxlength: [500, 'Completion notes cannot exceed 500 characters'],
    },

    // === METADATA ===
    metadata: {
      ipAddress: String,
      userAgent: String,
      bookingSource: {
        type: String,
        enum: ['web', 'mobile', 'admin'],
        default: 'web',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES FOR PERFORMANCE OPTIMIZATION
// ============================================

// Compound index for efficient querying of resident's appointments
appointmentSchema.index({ resident: 1, appointmentDate: -1 });

// Compound index for zone-based scheduling queries
appointmentSchema.index({ zone: 1, appointmentDate: 1, status: 1 });

// Index for finding appointments that need reminders
appointmentSchema.index({ appointmentDate: 1, reminderSent: 1, status: 1 });

// Text index for searching by special instructions
appointmentSchema.index({ specialInstructions: 'text', completionNotes: 'text' });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

/**
 * Virtual: Is appointment upcoming?
 * @returns {boolean} True if appointment is in the future and not cancelled
 */
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.appointmentDate > new Date() && 
         this.status !== 'cancelled' && 
         this.status !== 'completed';
});

/**
 * Virtual: Is appointment past?
 * @returns {boolean} True if appointment date has passed
 */
appointmentSchema.virtual('isPast').get(function() {
  return this.appointmentDate < new Date();
});

/**
 * Virtual: Can appointment be cancelled?
 * @returns {boolean} True if appointment can still be cancelled
 */
appointmentSchema.virtual('canBeCancelled').get(function() {
  // Can cancel if status is pending or confirmed, and appointment is in the future
  const validStatuses = ['pending', 'confirmed'];
  const hasMinimumTime = this.appointmentDate > new Date(Date.now() + 3600000); // 1 hour ahead
  return validStatuses.includes(this.status) && hasMinimumTime;
});

/**
 * Virtual: Can appointment be rescheduled?
 * @returns {boolean} True if appointment can be rescheduled
 */
appointmentSchema.virtual('canBeRescheduled').get(function() {
  const validStatuses = ['pending', 'confirmed'];
  const hasMinimumTime = this.appointmentDate > new Date(Date.now() + 3600000);
  return validStatuses.includes(this.status) && hasMinimumTime;
});

/**
 * Virtual: Duration in minutes
 * @returns {number} Duration of appointment in minutes
 */
appointmentSchema.virtual('durationMinutes').get(function() {
  if (!this.timeSlot.start || !this.timeSlot.end) return 0;
  
  const [startHour, startMin] = this.timeSlot.start.split(':').map(Number);
  const [endHour, endMin] = this.timeSlot.end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
});

/**
 * Virtual: Formatted time slot
 * @returns {string} Human-readable time slot (e.g., "09:00 AM - 10:00 AM")
 */
appointmentSchema.virtual('formattedTimeSlot').get(function() {
  if (!this.timeSlot.start || !this.timeSlot.end) return '';
  
  const formatTime = (time) => {
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(this.timeSlot.start)} - ${formatTime(this.timeSlot.end)}`;
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Cancel the appointment
 * @param {ObjectId} userId - User cancelling the appointment
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<Appointment>} Updated appointment
 */
appointmentSchema.methods.cancel = async function(userId, reason) {
  if (!this.canBeCancelled) {
    throw new Error('This appointment cannot be cancelled');
  }

  this.status = 'cancelled';
  this.cancellation = {
    reason: reason || 'No reason provided',
    cancelledBy: userId,
    cancelledAt: new Date(),
  };

  return await this.save();
};

/**
 * Confirm the appointment
 * @param {ObjectId} vehicleId - Assigned vehicle
 * @param {ObjectId} driverId - Assigned driver
 * @returns {Promise<Appointment>} Updated appointment
 */
appointmentSchema.methods.confirm = async function(vehicleId = null, driverId = null) {
  if (this.status !== 'pending') {
    throw new Error('Only pending appointments can be confirmed');
  }

  this.status = 'confirmed';
  if (vehicleId) this.assignedVehicle = vehicleId;
  if (driverId) this.assignedDriver = driverId;

  return await this.save();
};

/**
 * Mark appointment as in progress
 * @returns {Promise<Appointment>} Updated appointment
 */
appointmentSchema.methods.startCollection = async function() {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed appointments can be started');
  }

  this.status = 'in-progress';
  return await this.save();
};

/**
 * Complete the appointment
 * @param {number} actualAmount - Actual waste collected
 * @param {string} notes - Completion notes
 * @returns {Promise<Appointment>} Updated appointment
 */
appointmentSchema.methods.complete = async function(actualAmount, notes = '') {
  if (this.status !== 'in-progress') {
    throw new Error('Only in-progress appointments can be completed');
  }

  this.status = 'completed';
  this.actualAmount = actualAmount;
  this.completionNotes = notes;

  return await this.save();
};

/**
 * Reschedule the appointment
 * @param {Date} newDate - New appointment date
 * @param {Object} newTimeSlot - New time slot {start, end}
 * @returns {Promise<Appointment>} Updated appointment
 */
appointmentSchema.methods.reschedule = async function(newDate, newTimeSlot) {
  if (!this.canBeRescheduled) {
    throw new Error('This appointment cannot be rescheduled');
  }

  this.appointmentDate = newDate;
  if (newTimeSlot) {
    this.timeSlot = newTimeSlot;
  }

  return await this.save();
};

/**
 * Check if appointment needs reminder
 * @param {number} hoursAhead - Hours before appointment to send reminder
 * @returns {boolean} True if reminder should be sent
 */
appointmentSchema.methods.needsReminder = function(hoursAhead = 24) {
  if (this.reminderSent || this.status !== 'confirmed') {
    return false;
  }

  const reminderTime = new Date(this.appointmentDate);
  reminderTime.setHours(reminderTime.getHours() - hoursAhead);

  return new Date() >= reminderTime;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find upcoming appointments for a resident
 * @param {ObjectId} residentId - Resident ID
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array<Appointment>>} Array of appointments
 */
appointmentSchema.statics.findUpcoming = function(residentId, limit = 10) {
  return this.find({
    resident: residentId,
    appointmentDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] },
  })
    .sort({ appointmentDate: 1 })
    .limit(limit)
    .populate('zone', 'name')
    .exec();
};

/**
 * Find past appointments for a resident
 * @param {ObjectId} residentId - Resident ID
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array<Appointment>>} Array of appointments
 */
appointmentSchema.statics.findPast = function(residentId, limit = 10) {
  return this.find({
    resident: residentId,
    $or: [
      { appointmentDate: { $lt: new Date() } },
      { status: { $in: ['completed', 'cancelled', 'no-show'] } },
    ],
  })
    .sort({ appointmentDate: -1 })
    .limit(limit)
    .populate('zone', 'name')
    .exec();
};

/**
 * Get appointment statistics for a resident
 * @param {ObjectId} residentId - Resident ID
 * @returns {Promise<Object>} Statistics object
 */
appointmentSchema.statics.getResidentStats = async function(residentId) {
  const stats = await this.aggregate([
    { $match: { resident: new mongoose.Types.ObjectId(residentId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEstimated: { $sum: '$estimatedAmount' },
        totalActual: { $sum: '$actualAmount' },
      },
    },
  ]);

  return stats.reduce((acc, item) => {
    acc[item._id] = {
      count: item.count,
      totalEstimated: item.totalEstimated,
      totalActual: item.totalActual,
    };
    return acc;
  }, {});
};

/**
 * Check slot availability for a given date and time
 * @param {Date} date - Appointment date
 * @param {Object} timeSlot - Time slot {start, end}
 * @param {ObjectId} zoneId - Zone ID
 * @param {number} maxCapacity - Maximum appointments per slot
 * @returns {Promise<boolean>} True if slot is available
 */
appointmentSchema.statics.isSlotAvailable = async function(
  date,
  timeSlot,
  zoneId,
  maxCapacity = 10
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await this.countDocuments({
    zone: zoneId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    'timeSlot.start': timeSlot.start,
    'timeSlot.end': timeSlot.end,
    status: { $in: ['pending', 'confirmed'] },
  });

  return count < maxCapacity;
};

// ============================================
// MIDDLEWARE HOOKS
// ============================================

/**
 * Pre-save hook: Validate time slot logic
 */
appointmentSchema.pre('save', function(next) {
  // Ensure end time is after start time
  if (this.timeSlot.start && this.timeSlot.end) {
    const [startHour, startMin] = this.timeSlot.start.split(':').map(Number);
    const [endHour, endMin] = this.timeSlot.end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }

  // Validate at least one waste type is selected
  if (!this.wasteTypes || this.wasteTypes.length === 0) {
    return next(new Error('At least one waste type must be selected'));
  }

  next();
});

/**
 * Pre-save hook: Update timestamps
 */
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Post-save hook: Log appointment creation (for audit trail)
 */
appointmentSchema.post('save', function(doc) {
  console.log(`📅 Appointment ${doc._id} saved - Status: ${doc.status}`);
});

// ============================================
// MODEL EXPORT
// ============================================

/**
 * Appointment Model
 * @type {mongoose.Model<Appointment>}
 */
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
