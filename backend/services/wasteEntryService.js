/**
 * @fileoverview Waste Entry Service
 * @description Business logic layer for waste entry operations
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Service Layer Pattern: Encapsulates business logic
 * - Repository Pattern: Abstracts data access
 * - Strategy Pattern: Different calculation strategies
 * - Dependency Injection: Dependencies injected via constructor
 * 
 * @solid-principles
 * - Single Responsibility: Handles only waste entry business logic
 * - Open/Closed: Extensible through strategy pattern
 * - Dependency Inversion: Depends on abstractions (model interface)
 * - Interface Segregation: Focused service interface
 */

const WasteEntry = require('../models/WasteEntry');
const AppError = require('../utils/appError');

/**
 * Waste Entry Service Class
 * Handles all business logic related to waste entries
 */
class WasteEntryService {
  /**
   * Create a new waste entry
   * @param {String} userId - User ID
   * @param {Object} entryData - Entry data
   * @returns {Promise<Object>} Created waste entry
   */
  async createEntry(userId, entryData) {
    try {
      const { date, wasteAmounts, notes, location } = entryData;

      // Validate waste amounts
      this._validateWasteAmounts(wasteAmounts);

      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Check if entry already exists for this date
      const existingEntry = await WasteEntry.findOne({
        user: userId,
        date: normalizedDate
      });

      if (existingEntry) {
        throw new AppError('Entry already exists for this date. Use update instead.', 400);
      }

      // Create new entry
      const entry = await WasteEntry.create({
        user: userId,
        date: normalizedDate,
        wasteAmounts,
        notes,
        location
      });

      return entry.toDisplayFormat();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to create waste entry: ${error.message}`, 500);
    }
  }

  /**
   * Get waste entry by ID
   * @param {String} entryId - Entry ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<Object>} Waste entry
   */
  async getEntryById(entryId, userId) {
    try {
      const entry = await WasteEntry.findById(entryId);

      if (!entry) {
        throw new AppError('Waste entry not found', 404);
      }

      // Check authorization
      if (entry.user.toString() !== userId) {
        throw new AppError('Not authorized to access this entry', 403);
      }

      return entry.toDisplayFormat();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to get waste entry: ${error.message}`, 500);
    }
  }

  /**
   * Get all waste entries for a user with filters
   * @param {String} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated entries and metadata
   */
  async getUserEntries(userId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        location,
        page = 1,
        limit = 10,
        sortBy = '-date'
      } = filters;

      // Build query
      const query = { user: userId };

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          query.date.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      // Location filter
      if (location) {
        query.location = location;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const entries = await WasteEntry.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await WasteEntry.countDocuments(query);

      // Format entries
      const formattedEntries = entries.map(entry => ({
        id: entry._id,
        date: entry.date,
        wasteAmounts: entry.wasteAmounts,
        totalWaste: Object.values(entry.wasteAmounts).reduce((sum, val) => sum + val, 0),
        notes: entry.notes,
        location: entry.location,
        isEdited: entry.isEdited,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }));

      return {
        entries: formattedEntries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new AppError(`Failed to get waste entries: ${error.message}`, 500);
    }
  }

  /**
   * Update waste entry
   * @param {String} entryId - Entry ID
   * @param {String} userId - User ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated entry
   */
  async updateEntry(entryId, userId, updateData) {
    try {
      const entry = await WasteEntry.findById(entryId);

      if (!entry) {
        throw new AppError('Waste entry not found', 404);
      }

      // Check authorization
      if (entry.user.toString() !== userId) {
        throw new AppError('Not authorized to update this entry', 403);
      }

      // Validate waste amounts if provided
      if (updateData.wasteAmounts) {
        this._validateWasteAmounts(updateData.wasteAmounts);
        entry.wasteAmounts = updateData.wasteAmounts;
      }

      // Update other fields
      if (updateData.notes !== undefined) entry.notes = updateData.notes;
      if (updateData.location) entry.location = updateData.location;

      await entry.save();

      return entry.toDisplayFormat();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to update waste entry: ${error.message}`, 500);
    }
  }

  /**
   * Delete waste entry
   * @param {String} entryId - Entry ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<void>}
   */
  async deleteEntry(entryId, userId) {
    try {
      const entry = await WasteEntry.findById(entryId);

      if (!entry) {
        throw new AppError('Waste entry not found', 404);
      }

      // Check authorization
      if (entry.user.toString() !== userId) {
        throw new AppError('Not authorized to delete this entry', 403);
      }

      await entry.remove();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to delete waste entry: ${error.message}`, 500);
    }
  }

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @param {Number} days - Number of days to look back
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics(userId, days = 30) {
    try {
      const stats = await WasteEntry.getUserStatistics(userId, days);

      // Calculate additional metrics
      const recyclingRate = stats.totalWaste > 0
        ? ((stats.breakdown.recyclable / stats.totalWaste) * 100).toFixed(2)
        : 0;

      const organicRate = stats.totalWaste > 0
        ? ((stats.breakdown.organic / stats.totalWaste) * 100).toFixed(2)
        : 0;

      return {
        ...stats,
        recyclingRate: parseFloat(recyclingRate),
        organicRate: parseFloat(organicRate),
        period: `Last ${days} days`
      };
    } catch (error) {
      throw new AppError(`Failed to get statistics: ${error.message}`, 500);
    }
  }

  /**
   * Get waste trend data for charts
   * @param {String} userId - User ID
   * @param {Number} days - Number of days to look back
   * @returns {Promise<Array>} Trend data
   */
  async getWasteTrend(userId, days = 7) {
    try {
      const entries = await WasteEntry.getWasteTrend(userId, days);

      // Transform data for chart consumption
      return entries.map(entry => ({
        date: entry.date,
        general: entry.wasteAmounts.general,
        recyclable: entry.wasteAmounts.recyclable,
        organic: entry.wasteAmounts.organic,
        hazardous: entry.wasteAmounts.hazardous,
        total: Object.values(entry.wasteAmounts).reduce((sum, val) => sum + val, 0)
      }));
    } catch (error) {
      throw new AppError(`Failed to get waste trend: ${error.message}`, 500);
    }
  }

  /**
   * Get chart data for circular/pie chart
   * @param {String} userId - User ID
   * @param {Number} days - Number of days to aggregate
   * @returns {Promise<Object>} Chart data
   */
  async getChartData(userId, days = 30) {
    try {
      const stats = await WasteEntry.getUserStatistics(userId, days);

      const breakdown = stats.breakdown;
      const total = stats.totalWaste;

      // Return data formatted for circular chart
      return {
        labels: ['General', 'Recyclable', 'Organic', 'Hazardous'],
        datasets: [
          {
            data: [
              breakdown.general,
              breakdown.recyclable,
              breakdown.organic,
              breakdown.hazardous
            ]
          }
        ],
        percentages: total > 0 ? [
          ((breakdown.general / total) * 100).toFixed(2),
          ((breakdown.recyclable / total) * 100).toFixed(2),
          ((breakdown.organic / total) * 100).toFixed(2),
          ((breakdown.hazardous / total) * 100).toFixed(2)
        ] : [0, 0, 0, 0],
        totalWaste: total,
        period: `Last ${days} days`
      };
    } catch (error) {
      throw new AppError(`Failed to get chart data: ${error.message}`, 500);
    }
  }

  /**
   * Check if entry exists for today
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} True if entry exists
   */
  async hasTodayEntry(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await WasteEntry.hasEntryForDate(userId, today);
    } catch (error) {
      throw new AppError(`Failed to check today's entry: ${error.message}`, 500);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate waste amounts
   * @private
   * @param {Object} wasteAmounts - Waste amounts to validate
   * @throws {AppError} If validation fails
   */
  _validateWasteAmounts(wasteAmounts) {
    if (!wasteAmounts) {
      throw new AppError('Waste amounts are required', 400);
    }

    const { general = 0, recyclable = 0, organic = 0, hazardous = 0 } = wasteAmounts;

    // At least one category should have a value
    if (general === 0 && recyclable === 0 && organic === 0 && hazardous === 0) {
      throw new AppError('At least one waste category must have a value greater than 0', 400);
    }

    // Check for negative values
    if (general < 0 || recyclable < 0 || organic < 0 || hazardous < 0) {
      throw new AppError('Waste amounts cannot be negative', 400);
    }

    // Check for unrealistic values
    if (general > 1000 || recyclable > 1000 || organic > 1000 || hazardous > 100) {
      throw new AppError('Waste amounts seem unrealistic. Please check your input', 400);
    }
  }
}

// Export singleton instance (Singleton Pattern)
module.exports = new WasteEntryService();
