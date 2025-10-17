/**
 * @fileoverview Appointment Repository
 * @description Data Access Layer for Appointment operations following Repository Pattern
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles database operations
 * - Dependency Inversion: Provides abstraction over data access
 * - Interface Segregation: Focused methods for specific operations
 * 
 * @module repositories/appointmentRepository
 * @requires models/Appointment
 */

const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

/**
 * AppointmentRepository Class
 * @description Encapsulates all database operations for appointments
 */
class AppointmentRepository {
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Appointment>} Created appointment
   */
  async create(appointmentData) {
    try {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      return await this.findById(appointment._id);
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  /**
   * Find appointment by ID
   * @param {ObjectId|string} id - Appointment ID
   * @param {Object} options - Query options {populate, lean}
   * @returns {Promise<Appointment|null>} Appointment or null
   */
  async findById(id, options = {}) {
    try {
      let query = Appointment.findById(id);

      if (options.populate) {
        query = query
          .populate('resident', 'name email phone')
          .populate('zone', 'name')
          .populate('assignedVehicle', 'registrationNumber type')
          .populate('assignedDriver', 'name phone');
      }

      if (options.lean) {
        query = query.lean();
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find appointment: ${error.message}`);
    }
  }

  /**
   * Find appointments by resident ID
   * @param {ObjectId|string} residentId - Resident ID
   * @param {Object} filters - Filter options {status, startDate, endDate}
   * @param {Object} pagination - Pagination {page, limit, sort}
   * @returns {Promise<Object>} {appointments, total, page, pages}
   */
  async findByResident(residentId, filters = {}, pagination = {}) {
    try {
      const {
        status,
        startDate,
        endDate,
      } = filters;

      const {
        page = 1,
        limit = 10,
        sort = { appointmentDate: -1 },
      } = pagination;

      // Build query
      const query = { resident: residentId };

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.appointmentDate = {};
        if (startDate) {
          query.appointmentDate.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.appointmentDate.$lte = end;
        }
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('zone', 'name')
          .populate('assignedVehicle', 'registrationNumber')
          .exec(),
        Appointment.countDocuments(query),
      ]);

      return {
        appointments,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Failed to find appointments by resident: ${error.message}`);
    }
  }

  /**
   * Find upcoming appointments for a resident
   * @param {ObjectId|string} residentId - Resident ID
   * @param {number} limit - Maximum results
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async findUpcomingByResident(residentId, limit = 10) {
    try {
      return await Appointment.findUpcoming(residentId, limit);
    } catch (error) {
      throw new Error(`Failed to find upcoming appointments: ${error.message}`);
    }
  }

  /**
   * Find past appointments for a resident
   * @param {ObjectId|string} residentId - Resident ID
   * @param {number} limit - Maximum results
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async findPastByResident(residentId, limit = 10) {
    try {
      return await Appointment.findPast(residentId, limit);
    } catch (error) {
      throw new Error(`Failed to find past appointments: ${error.message}`);
    }
  }

  /**
   * Find appointments by zone
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Additional options
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async findByZone(zoneId, startDate, endDate, options = {}) {
    try {
      const query = {
        zone: zoneId,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (options.status) {
        query.status = options.status;
      }

      return await Appointment.find(query)
        .sort({ appointmentDate: 1 })
        .populate('resident', 'name address phone')
        .populate('assignedVehicle', 'registrationNumber')
        .populate('assignedDriver', 'name')
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by zone: ${error.message}`);
    }
  }

  /**
   * Find appointments by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async findByDateRange(startDate, endDate, filters = {}) {
    try {
      const query = {
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (filters.zone) {
        query.zone = filters.zone;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      return await Appointment.find(query)
        .sort({ appointmentDate: 1 })
        .populate('resident', 'name')
        .populate('zone', 'name')
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by date range: ${error.message}`);
    }
  }

  /**
   * Update appointment by ID
   * @param {ObjectId|string} id - Appointment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Appointment>} Updated appointment
   */
  async update(id, updateData) {
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('resident', 'name email phone')
        .populate('zone', 'name')
        .exec();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return appointment;
    } catch (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }
  }

  /**
   * Delete appointment by ID (soft delete by setting status to cancelled)
   * @param {ObjectId|string} id - Appointment ID
   * @param {ObjectId|string} userId - User performing the deletion
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Appointment>} Cancelled appointment
   */
  async delete(id, userId, reason) {
    try {
      const appointment = await Appointment.findById(id);

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      return await appointment.cancel(userId, reason);
    } catch (error) {
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
  }

  /**
   * Hard delete appointment (admin only)
   * @param {ObjectId|string} id - Appointment ID
   * @returns {Promise<boolean>} Success status
   */
  async hardDelete(id) {
    try {
      const result = await Appointment.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete appointment: ${error.message}`);
    }
  }

  /**
   * Count appointments by slot
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date} date - Appointment date
   * @param {Object} timeSlot - Time slot {start, end}
   * @returns {Promise<number>} Count of appointments
   */
  async countBySlot(zoneId, date, timeSlot) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await Appointment.countDocuments({
        zone: zoneId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        'timeSlot.start': timeSlot.start,
        'timeSlot.end': timeSlot.end,
        status: { $in: ['pending', 'confirmed'] },
      });
    } catch (error) {
      throw new Error(`Failed to count appointments: ${error.message}`);
    }
  }

  /**
   * Check slot availability
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date} date - Appointment date
   * @param {Object} timeSlot - Time slot {start, end}
   * @param {number} maxCapacity - Maximum capacity
   * @returns {Promise<boolean>} True if available
   */
  async isSlotAvailable(zoneId, date, timeSlot, maxCapacity = 10) {
    try {
      const count = await this.countBySlot(zoneId, date, timeSlot);
      return count < maxCapacity;
    } catch (error) {
      throw new Error(`Failed to check slot availability: ${error.message}`);
    }
  }

  /**
   * Get appointment statistics for a resident
   * @param {ObjectId|string} residentId - Resident ID
   * @returns {Promise<Object>} Statistics object
   */
  async getResidentStatistics(residentId) {
    try {
      return await Appointment.getResidentStats(residentId);
    } catch (error) {
      throw new Error(`Failed to get resident statistics: ${error.message}`);
    }
  }

  /**
   * Get appointments needing reminders
   * @param {number} hoursAhead - Hours before appointment
   * @returns {Promise<Array<Appointment>>} Appointments needing reminders
   */
  async findNeedingReminders(hoursAhead = 24) {
    try {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + hoursAhead);

      const endTime = new Date();
      endTime.setHours(endTime.getHours() + hoursAhead + 1);

      return await Appointment.find({
        appointmentDate: {
          $gte: reminderTime,
          $lt: endTime,
        },
        status: 'confirmed',
        reminderSent: false,
      })
        .populate('resident', 'name email phone')
        .populate('zone', 'name')
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments needing reminders: ${error.message}`);
    }
  }

  /**
   * Mark reminder as sent
   * @param {ObjectId|string} id - Appointment ID
   * @returns {Promise<Appointment>} Updated appointment
   */
  async markReminderSent(id) {
    try {
      return await this.update(id, { reminderSent: true });
    } catch (error) {
      throw new Error(`Failed to mark reminder as sent: ${error.message}`);
    }
  }

  /**
   * Bulk update appointments
   * @param {Array<ObjectId>} ids - Array of appointment IDs
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result {modifiedCount}
   */
  async bulkUpdate(ids, updateData) {
    try {
      const result = await Appointment.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
      );

      return {
        modifiedCount: result.modifiedCount,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to bulk update appointments: ${error.message}`);
    }
  }

  /**
   * Get appointments by status
   * @param {string} status - Appointment status
   * @param {Object} options - Additional options {limit, zone}
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async findByStatus(status, options = {}) {
    try {
      const query = { status };

      if (options.zone) {
        query.zone = options.zone;
      }

      let queryBuilder = Appointment.find(query)
        .sort({ appointmentDate: 1 })
        .populate('resident', 'name phone')
        .populate('zone', 'name');

      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }

      return await queryBuilder.exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by status: ${error.message}`);
    }
  }

  /**
   * Get dashboard statistics
   * @param {Object} filters - Filter options {zone, dateRange}
   * @returns {Promise<Object>} Statistics
   */
  async getDashboardStats(filters = {}) {
    try {
      const matchStage = {};

      if (filters.zone) {
        matchStage.zone = new mongoose.Types.ObjectId(filters.zone);
      }

      if (filters.startDate || filters.endDate) {
        matchStage.appointmentDate = {};
        if (filters.startDate) {
          matchStage.appointmentDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          matchStage.appointmentDate.$lte = new Date(filters.endDate);
        }
      }

      const stats = await Appointment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalEstimated: { $sum: '$estimatedAmount' },
            totalActual: { $sum: '$actualAmount' },
          },
        },
      ]);

      const result = {
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        totalWaste: 0,
      };

      stats.forEach(item => {
        result.total += item.count;
        result[item._id] = item.count;
        if (item._id === 'completed' && item.totalActual) {
          result.totalWaste += item.totalActual;
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Search appointments
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array<Appointment>>} Array of appointments
   */
  async search(searchTerm, filters = {}) {
    try {
      const query = {
        $text: { $search: searchTerm },
      };

      if (filters.zone) {
        query.zone = filters.zone;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      return await Appointment.find(query)
        .populate('resident', 'name email phone')
        .populate('zone', 'name')
        .limit(20)
        .exec();
    } catch (error) {
      throw new Error(`Failed to search appointments: ${error.message}`);
    }
  }

  /**
   * Get appointments requiring action (admin view)
   * @returns {Promise<Object>} Appointments categorized by action needed
   */
  async getActionRequired() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [pending, todayConfirmed, needsAssignment] = await Promise.all([
        // Pending approvals
        Appointment.find({ status: 'pending' })
          .sort({ createdAt: 1 })
          .limit(10)
          .populate('resident', 'name phone')
          .exec(),

        // Today's confirmed appointments
        Appointment.find({
          status: 'confirmed',
          appointmentDate: {
            $gte: now,
            $lt: tomorrow,
          },
        })
          .sort({ appointmentDate: 1 })
          .populate('resident', 'name phone')
          .populate('zone', 'name')
          .exec(),

        // Confirmed but not assigned vehicle/driver
        Appointment.find({
          status: 'confirmed',
          $or: [
            { assignedVehicle: null },
            { assignedDriver: null },
          ],
        })
          .sort({ appointmentDate: 1 })
          .limit(10)
          .populate('resident', 'name')
          .exec(),
      ]);

      return {
        pendingApprovals: pending,
        todayScheduled: todayConfirmed,
        needsAssignment,
      };
    } catch (error) {
      throw new Error(`Failed to get action-required appointments: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new AppointmentRepository();
