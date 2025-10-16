/**
 * @fileoverview Availability Service
 * @description Business logic for checking and managing appointment slot availability
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles availability logic
 * - Dependency Inversion: Depends on repository abstractions
 * 
 * @module services/availabilityService
 */

const TimeSlotConfig = require('../models/TimeSlotConfig');
const appointmentRepository = require('../repositories/appointmentRepository');

/**
 * Availability Service Class
 * @description Manages appointment slot availability checking
 */
class AvailabilityService {
  /**
   * Get available slots for a specific date
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date|string} date - Date to check
   * @returns {Promise<Array>} Available slots with capacity info
   */
  async getAvailableSlots(zoneId, date) {
    try {
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();

      // Get time slot configuration for the zone and day
      const config = await TimeSlotConfig.getConfig(zoneId, dayOfWeek);

      if (!config) {
        return [];
      }

      // Check if date is available
      if (!config.isDateAvailable(appointmentDate)) {
        return [];
      }

      // Get configured slots for the date
      const slots = config.getSlotsForDate(appointmentDate);

      // For each slot, check current bookings
      const availabilityPromises = slots.map(async (slot) => {
        const bookedCount = await appointmentRepository.countBySlot(
          zoneId,
          appointmentDate,
          { start: slot.start, end: slot.end }
        );

        return {
          start: slot.start,
          end: slot.end,
          capacity: slot.capacity,
          booked: bookedCount,
          available: slot.capacity - bookedCount,
          isAvailable: bookedCount < slot.capacity,
        };
      });

      const availability = await Promise.all(availabilityPromises);

      return availability;
    } catch (error) {
      throw new Error(`Failed to get available slots: ${error.message}`);
    }
  }

  /**
   * Check if a specific slot is available
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date|string} date - Date to check
   * @param {Object} timeSlot - Time slot {start, end}
   * @returns {Promise<Object>} {isAvailable, reason}
   */
  async checkSlotAvailability(zoneId, date, timeSlot) {
    try {
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();

      // Validate date is not in the past
      const now = new Date();
      now.setHours(now.getHours() + 1); // Must be at least 1 hour ahead
      if (appointmentDate < now) {
        return {
          isAvailable: false,
          reason: 'Cannot book appointments in the past or within 1 hour',
        };
      }

      // Get configuration
      const config = await TimeSlotConfig.getConfig(zoneId, dayOfWeek);

      if (!config) {
        return {
          isAvailable: false,
          reason: 'No appointment slots configured for this day',
        };
      }

      // Check if date is available (not a holiday)
      if (!config.isDateAvailable(appointmentDate)) {
        const specialConfig = config.getSpecialDateConfig(appointmentDate);
        if (specialConfig && !specialConfig.isAvailable) {
          return {
            isAvailable: false,
            reason: specialConfig.reason || 'This date is not available for appointments',
          };
        }
        return {
          isAvailable: false,
          reason: 'This date is a holiday - no appointments available',
        };
      }

      // Check if the requested time slot exists in configuration
      const configuredSlot = config.slots.find(
        slot => slot.start === timeSlot.start && slot.end === timeSlot.end && slot.isActive
      );

      if (!configuredSlot) {
        return {
          isAvailable: false,
          reason: 'This time slot is not available',
        };
      }

      // Get special date capacity if applicable
      const specialConfig = config.getSpecialDateConfig(appointmentDate);
      const capacity = specialConfig?.capacity ?? configuredSlot.capacity;

      // Check current bookings
      const bookedCount = await appointmentRepository.countBySlot(
        zoneId,
        appointmentDate,
        timeSlot
      );

      if (bookedCount >= capacity) {
        return {
          isAvailable: false,
          reason: 'This time slot is fully booked',
        };
      }

      return {
        isAvailable: true,
        capacity,
        booked: bookedCount,
        available: capacity - bookedCount,
      };
    } catch (error) {
      throw new Error(`Failed to check slot availability: ${error.message}`);
    }
  }

  /**
   * Get available dates for the next N days
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {number} days - Number of days to check (default: 30)
   * @returns {Promise<Array>} Array of available dates
   */
  async getAvailableDates(zoneId, days = 30) {
    try {
      const availableDates = [];
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      for (let i = 1; i <= days; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);

        const dayOfWeek = checkDate.getDay();
        const config = await TimeSlotConfig.getConfig(zoneId, dayOfWeek);

        if (config && config.isDateAvailable(checkDate)) {
          const slots = await this.getAvailableSlots(zoneId, checkDate);
          const hasAvailability = slots.some(slot => slot.isAvailable);

          if (hasAvailability) {
            availableDates.push({
              date: checkDate.toISOString().split('T')[0],
              dayOfWeek,
              availableSlots: slots.filter(slot => slot.isAvailable).length,
            });
          }
        }
      }

      return availableDates;
    } catch (error) {
      throw new Error(`Failed to get available dates: ${error.message}`);
    }
  }

  /**
   * Get availability summary for a date range
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Object>} Availability summary
   */
  async getAvailabilitySummary(zoneId, startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const summary = {
        totalDays: 0,
        availableDays: 0,
        fullyBookedDays: 0,
        holidays: 0,
        dates: [],
      };

      let currentDate = new Date(start);
      while (currentDate <= end) {
        summary.totalDays++;
        const dayOfWeek = currentDate.getDay();
        const config = await TimeSlotConfig.getConfig(zoneId, dayOfWeek);

        if (!config || !config.isDateAvailable(currentDate)) {
          summary.holidays++;
        } else {
          const slots = await this.getAvailableSlots(zoneId, currentDate);
          const hasAvailability = slots.some(slot => slot.isAvailable);

          if (hasAvailability) {
            summary.availableDays++;
          } else {
            summary.fullyBookedDays++;
          }

          summary.dates.push({
            date: currentDate.toISOString().split('T')[0],
            status: hasAvailability ? 'available' : 'full',
            availableSlots: slots.filter(slot => slot.isAvailable).length,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return summary;
    } catch (error) {
      throw new Error(`Failed to get availability summary: ${error.message}`);
    }
  }

  /**
   * Find next available slot
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date|string} afterDate - Search after this date (default: now)
   * @returns {Promise<Object|null>} Next available slot or null
   */
  async findNextAvailableSlot(zoneId, afterDate = new Date()) {
    try {
      const startDate = new Date(afterDate);
      startDate.setHours(0, 0, 0, 0);

      // Check next 30 days
      for (let i = 1; i <= 30; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);

        const slots = await this.getAvailableSlots(zoneId, checkDate);
        const availableSlot = slots.find(slot => slot.isAvailable);

        if (availableSlot) {
          return {
            date: checkDate.toISOString().split('T')[0],
            slot: {
              start: availableSlot.start,
              end: availableSlot.end,
            },
            available: availableSlot.available,
          };
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to find next available slot: ${error.message}`);
    }
  }

  /**
   * Get peak hours analysis
   * @param {ObjectId|string} zoneId - Zone ID
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Object>} Peak hours analysis
   */
  async getPeakHoursAnalysis(zoneId, startDate, endDate) {
    try {
      const appointments = await appointmentRepository.findByZone(
        zoneId,
        new Date(startDate),
        new Date(endDate),
        { status: ['confirmed', 'completed'] }
      );

      const slotBookings = {};

      appointments.forEach(apt => {
        const slotKey = `${apt.timeSlot.start}-${apt.timeSlot.end}`;
        slotBookings[slotKey] = (slotBookings[slotKey] || 0) + 1;
      });

      const sorted = Object.entries(slotBookings)
        .sort(([, a], [, b]) => b - a)
        .map(([slot, count]) => {
          const [start, end] = slot.split('-');
          return { start, end, bookings: count };
        });

      return {
        peakSlots: sorted.slice(0, 3),
        allSlots: sorted,
      };
    } catch (error) {
      throw new Error(`Failed to get peak hours analysis: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new AvailabilityService();
