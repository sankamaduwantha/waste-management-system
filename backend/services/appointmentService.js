/**
 * @fileoverview Appointment Service
 * @description Business logic layer for appointment operations
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Handles only appointment business logic
 * - Dependency Inversion: Depends on repository and service abstractions
 * - Open/Closed: Extensible for new appointment types
 * 
 * @module services/appointmentService
 */

const appointmentRepository = require('../repositories/appointmentRepository');
const availabilityService = require('./availabilityService');
const notificationService = require('../utils/notificationService');
const AppError = require('../utils/appError');

/**
 * Appointment Service Class
 * @description Manages appointment business logic
 */
class AppointmentService {
  /**
   * Create a new appointment
   * @param {ObjectId|string} residentId - Resident ID
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Appointment>} Created appointment
   */
  async createAppointment(residentId, appointmentData) {
    try {
      const {
        appointmentDate,
        timeSlot,
        wasteTypes,
        estimatedAmount,
        specialInstructions,
        zone,
      } = appointmentData;

      // Validate appointment date
      const apptDate = new Date(appointmentDate);
      const minDate = new Date();
      minDate.setHours(minDate.getHours() + 1);

      if (apptDate < minDate) {
        throw new AppError('Appointment must be at least 1 hour in the future', 400);
      }

      // Check slot availability
      const availability = await availabilityService.checkSlotAvailability(
        zone,
        appointmentDate,
        timeSlot
      );

      if (!availability.isAvailable) {
        throw new AppError(availability.reason || 'Time slot is not available', 400);
      }

      // Check resident's appointment limit (max 3 pending/confirmed at a time)
      const activeAppointments = await appointmentRepository.findByResident(
        residentId,
        { status: ['pending', 'confirmed'] }
      );

      if (activeAppointments.appointments.length >= 3) {
        throw new AppError('Maximum 3 active appointments allowed', 400);
      }

      // Create appointment
      const appointment = await appointmentRepository.create({
        resident: residentId,
        zone,
        appointmentDate: apptDate,
        timeSlot,
        wasteTypes,
        estimatedAmount,
        specialInstructions,
        status: 'pending',
        metadata: {
          bookingSource: 'web',
        },
      });

      // Send confirmation notification
      try {
        await notificationService.sendAppointmentConfirmation(appointment);
      } catch (error) {
        console.error('Failed to send confirmation notification:', error);
        // Don't fail the appointment creation if notification fails
      }

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to create appointment: ${error.message}`, 500);
    }
  }

  /**
   * Get resident's appointments
   * @param {ObjectId|string} residentId - Resident ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Appointments with pagination
   */
  async getMyAppointments(residentId, filters = {}) {
    try {
      return await appointmentRepository.findByResident(residentId, filters, {
        page: filters.page || 1,
        limit: filters.limit || 10,
        sort: { appointmentDate: filters.sortOrder === 'asc' ? 1 : -1 },
      });
    } catch (error) {
      throw new AppError(`Failed to fetch appointments: ${error.message}`, 500);
    }
  }

  /**
   * Get appointment details
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @param {ObjectId|string} residentId - Resident ID (for verification)
   * @returns {Promise<Appointment>} Appointment details
   */
  async getAppointmentDetails(appointmentId, residentId) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId, {
        populate: true,
      });

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      // Verify ownership
      if (appointment.resident._id.toString() !== residentId.toString()) {
        throw new AppError('Access denied', 403);
      }

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch appointment details: ${error.message}`, 500);
    }
  }

  /**
   * Update appointment (reschedule)
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @param {ObjectId|string} residentId - Resident ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Appointment>} Updated appointment
   */
  async updateAppointment(appointmentId, residentId, updateData) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      // Verify ownership
      if (appointment.resident.toString() !== residentId.toString()) {
        throw new AppError('Access denied', 403);
      }

      // Check if appointment can be rescheduled
      if (!appointment.canBeRescheduled) {
        throw new AppError('This appointment cannot be rescheduled', 400);
      }

      // If rescheduling (date/time changed), check availability
      if (updateData.appointmentDate || updateData.timeSlot) {
        const newDate = updateData.appointmentDate || appointment.appointmentDate;
        const newTimeSlot = updateData.timeSlot || appointment.timeSlot;

        const availability = await availabilityService.checkSlotAvailability(
          appointment.zone,
          newDate,
          newTimeSlot
        );

        if (!availability.isAvailable) {
          throw new AppError(availability.reason || 'Time slot is not available', 400);
        }
      }

      // Update appointment
      const updated = await appointmentRepository.update(appointmentId, updateData);

      // Send update notification
      try {
        await notificationService.sendAppointmentUpdate(updated);
      } catch (error) {
        console.error('Failed to send update notification:', error);
      }

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to update appointment: ${error.message}`, 500);
    }
  }

  /**
   * Cancel appointment
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @param {ObjectId|string} residentId - Resident ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<void>}
   */
  async cancelAppointment(appointmentId, residentId, reason) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      // Verify ownership
      if (appointment.resident.toString() !== residentId.toString()) {
        throw new AppError('Access denied', 403);
      }

      // Check if appointment can be cancelled
      if (!appointment.canBeCancelled) {
        throw new AppError('This appointment cannot be cancelled', 400);
      }

      // Cancel appointment
      await appointmentRepository.delete(appointmentId, residentId, reason);

      // Send cancellation notification
      try {
        await notificationService.sendAppointmentCancellation(appointment, reason);
      } catch (error) {
        console.error('Failed to send cancellation notification:', error);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to cancel appointment: ${error.message}`, 500);
    }
  }

  /**
   * Get resident statistics
   * @param {ObjectId|string} residentId - Resident ID
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(residentId) {
    try {
      const [stats, upcoming, past] = await Promise.all([
        appointmentRepository.getResidentStatistics(residentId),
        appointmentRepository.findUpcomingByResident(residentId, 1),
        appointmentRepository.findPastByResident(residentId, 5),
      ]);

      return {
        statistics: stats,
        nextAppointment: upcoming[0] || null,
        recentAppointments: past,
        totalAppointments: Object.values(stats).reduce((sum, s) => sum + (s.count || 0), 0),
      };
    } catch (error) {
      throw new AppError(`Failed to fetch statistics: ${error.message}`, 500);
    }
  }

  /**
   * Confirm appointment (admin)
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @param {Object} assignmentData - Vehicle and driver assignment
   * @returns {Promise<Appointment>} Confirmed appointment
   */
  async confirmAppointment(appointmentId, assignmentData = {}) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      if (appointment.status !== 'pending') {
        throw new AppError('Only pending appointments can be confirmed', 400);
      }

      await appointment.confirm(
        assignmentData.vehicleId,
        assignmentData.driverId
      );

      // Send confirmation notification
      try {
        await notificationService.sendAppointmentConfirmed(appointment);
      } catch (error) {
        console.error('Failed to send confirmation notification:', error);
      }

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to confirm appointment: ${error.message}`, 500);
    }
  }

  /**
   * Start collection (driver)
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @returns {Promise<Appointment>} Updated appointment
   */
  async startCollection(appointmentId) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      await appointment.startCollection();
      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to start collection: ${error.message}`, 500);
    }
  }

  /**
   * Complete appointment (driver)
   * @param {ObjectId|string} appointmentId - Appointment ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Appointment>} Completed appointment
   */
  async completeAppointment(appointmentId, completionData) {
    try {
      const appointment = await appointmentRepository.findById(appointmentId);

      if (!appointment) {
        throw new AppError('Appointment not found', 404);
      }

      await appointment.complete(
        completionData.actualAmount,
        completionData.notes
      );

      // Send completion notification
      try {
        await notificationService.sendAppointmentCompleted(appointment);
      } catch (error) {
        console.error('Failed to send completion notification:', error);
      }

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to complete appointment: ${error.message}`, 500);
    }
  }

  /**
   * Get all appointments (admin)
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Appointments with pagination
   */
  async getAllAppointments(filters = {}, pagination = {}) {
    try {
      const {
        zone,
        status,
        startDate,
        endDate,
      } = filters;

      const queryFilters = {};
      if (zone) queryFilters.zone = zone;
      if (status) queryFilters.status = status;
      if (startDate) queryFilters.startDate = startDate;
      if (endDate) queryFilters.endDate = endDate;

      // Use appropriate repository method based on filters
      if (zone && startDate && endDate) {
        const appointments = await appointmentRepository.findByZone(
          zone,
          new Date(startDate),
          new Date(endDate),
          { status }
        );
        return { appointments, total: appointments.length };
      }

      // Default: use general search
      return await appointmentRepository.findByResident(null, queryFilters, pagination);
    } catch (error) {
      throw new AppError(`Failed to fetch appointments: ${error.message}`, 500);
    }
  }

  /**
   * Get dashboard data (admin)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData(filters = {}) {
    try {
      const [stats, actionRequired] = await Promise.all([
        appointmentRepository.getDashboardStats(filters),
        appointmentRepository.getActionRequired(),
      ]);

      return {
        statistics: stats,
        actionRequired,
      };
    } catch (error) {
      throw new AppError(`Failed to fetch dashboard data: ${error.message}`, 500);
    }
  }

  /**
   * Send appointment reminders (scheduled job)
   * @param {number} hoursAhead - Hours before appointment
   * @returns {Promise<Object>} Result summary
   */
  async sendReminders(hoursAhead = 24) {
    try {
      const appointments = await appointmentRepository.findNeedingReminders(hoursAhead);

      const results = {
        total: appointments.length,
        sent: 0,
        failed: 0,
      };

      for (const appointment of appointments) {
        try {
          await notificationService.sendAppointmentReminder(appointment);
          await appointmentRepository.markReminderSent(appointment._id);
          results.sent++;
        } catch (error) {
          console.error(`Failed to send reminder for ${appointment._id}:`, error);
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      throw new AppError(`Failed to send reminders: ${error.message}`, 500);
    }
  }
}

// Export singleton instance
module.exports = new AppointmentService();
