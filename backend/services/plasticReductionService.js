/**
 * @fileoverview Plastic Reduction Suggestion Service
 * @description Business logic layer for plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Service Layer Pattern: Separates business logic from controllers
 * - Dependency Injection: Loose coupling with repository
 * - Strategy Pattern: Different strategies for filtering and sorting
 * 
 * @solid-principles
 * - Single Responsibility: Handles only business logic for suggestions
 * - Dependency Inversion: Depends on abstractions (repository interface)
 * - Interface Segregation: Specific methods for specific operations
 */

const PlasticReductionSuggestion = require('../models/PlasticReductionSuggestion');
const AppError = require('../utils/appError');

/**
 * @class PlasticReductionSuggestionService
 * @description Manages all business logic for plastic reduction suggestions
 */
class PlasticReductionSuggestionService {
  constructor(repository = PlasticReductionSuggestion) {
    this.repository = repository;
  }

  /**
   * Create a new plastic reduction suggestion
   * @param {Object} suggestionData - Suggestion data
   * @param {ObjectId} createdBy - User ID of creator
   * @returns {Promise<Object>} Created suggestion
   * @throws {AppError} If validation fails
   */
  async createSuggestion(suggestionData, createdBy) {
    try {
      // Validate required fields
      this._validateSuggestionData(suggestionData);

      // Check for duplicate titles
      const existingSuggestion = await this.repository.findOne({
        title: suggestionData.title,
        isActive: true
      });

      if (existingSuggestion) {
        throw new AppError('A suggestion with this title already exists', 400);
      }

      // Create suggestion with creator
      const suggestion = await this.repository.create({
        ...suggestionData,
        createdBy
      });

      return suggestion.toDisplayFormat();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to create suggestion: ${error.message}`, 500);
    }
  }

  /**
   * Get all active suggestions with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated suggestions with metadata
   */
  async getAllSuggestions(filters = {}, pagination = {}) {
    try {
      const {
        category,
        difficulty,
        minImpactScore,
        tags,
        search
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = '-impactScore'
      } = pagination;

      // Build query
      const query = { isActive: true };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (minImpactScore) query.impactScore = { $gte: minImpactScore };
      if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      if (search) {
        query.$text = { $search: search };
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [suggestions, total] = await Promise.all([
        this.repository
          .find(query)
          .populate('createdBy', 'name email role')
          .sort(sortBy)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.repository.countDocuments(query)
      ]);

      // Format suggestions
      const formattedSuggestions = suggestions.map(suggestion => 
        this._formatSuggestionResponse(suggestion)
      );

      return {
        success: true,
        data: formattedSuggestions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total
        },
        filters: filters
      };
    } catch (error) {
      throw new AppError(`Failed to fetch suggestions: ${error.message}`, 500);
    }
  }

  /**
   * Get suggestion by ID
   * @param {ObjectId} suggestionId - Suggestion ID
   * @param {boolean} incrementView - Whether to increment view count
   * @returns {Promise<Object>} Suggestion details
   * @throws {AppError} If suggestion not found
   */
  async getSuggestionById(suggestionId, incrementView = true) {
    try {
      const suggestion = await this.repository
        .findById(suggestionId)
        .populate('createdBy', 'name email role profileImage');

      if (!suggestion) {
        throw new AppError('Suggestion not found', 404);
      }

      if (!suggestion.isActive) {
        throw new AppError('This suggestion is no longer available', 410);
      }

      // Increment view count asynchronously (fire and forget)
      if (incrementView) {
        suggestion.incrementViews().catch(err => 
          console.error('Failed to increment views:', err)
        );
      }

      return {
        success: true,
        data: this._formatDetailedSuggestionResponse(suggestion)
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch suggestion: ${error.message}`, 500);
    }
  }

  /**
   * Update suggestion
   * @param {ObjectId} suggestionId - Suggestion ID
   * @param {Object} updateData - Update data
   * @param {ObjectId} userId - User making the update
   * @returns {Promise<Object>} Updated suggestion
   * @throws {AppError} If unauthorized or validation fails
   */
  async updateSuggestion(suggestionId, updateData, userId) {
    try {
      const suggestion = await this.repository.findById(suggestionId);

      if (!suggestion) {
        throw new AppError('Suggestion not found', 404);
      }

      // Authorization check (only creator or admin can update)
      // Note: Role checking should be done in controller/middleware
      if (suggestion.createdBy.toString() !== userId.toString()) {
        throw new AppError('You are not authorized to update this suggestion', 403);
      }

      // Validate update data
      if (updateData.plasticSavedGrams !== undefined) {
        this._validatePlasticSaved(updateData.plasticSavedGrams);
      }

      if (updateData.moneySaved !== undefined) {
        this._validateMoneySaved(updateData.moneySaved);
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'createdBy') {
          suggestion[key] = updateData[key];
        }
      });

      await suggestion.save();

      return {
        success: true,
        data: suggestion.toDisplayFormat(),
        message: 'Suggestion updated successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to update suggestion: ${error.message}`, 500);
    }
  }

  /**
   * Soft delete suggestion (mark as inactive)
   * @param {ObjectId} suggestionId - Suggestion ID
   * @param {ObjectId} userId - User making the deletion
   * @returns {Promise<Object>} Success message
   * @throws {AppError} If unauthorized or not found
   */
  async deleteSuggestion(suggestionId, userId) {
    try {
      const suggestion = await this.repository.findById(suggestionId);

      if (!suggestion) {
        throw new AppError('Suggestion not found', 404);
      }

      // Authorization check
      if (suggestion.createdBy.toString() !== userId.toString()) {
        throw new AppError('You are not authorized to delete this suggestion', 403);
      }

      // Soft delete
      suggestion.isActive = false;
      await suggestion.save();

      return {
        success: true,
        message: 'Suggestion deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to delete suggestion: ${error.message}`, 500);
    }
  }

  /**
   * Get suggestions by category
   * @param {string} category - Category name
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Array>} Filtered suggestions
   */
  async getSuggestionsByCategory(category, options = {}) {
    try {
      const suggestions = await this.repository.getByCategory(category, options);
      
      return {
        success: true,
        data: suggestions.map(s => this._formatSuggestionResponse(s)),
        category
      };
    } catch (error) {
      throw new AppError(`Failed to fetch suggestions by category: ${error.message}`, 500);
    }
  }

  /**
   * Get top performing suggestions
   * @param {number} limit - Number of suggestions to return
   * @returns {Promise<Array>} Top suggestions
   */
  async getTopSuggestions(limit = 10) {
    try {
      const suggestions = await this.repository.getTopSuggestions(limit);
      
      return {
        success: true,
        data: suggestions.map(s => this._formatSuggestionResponse(s))
      };
    } catch (error) {
      throw new AppError(`Failed to fetch top suggestions: ${error.message}`, 500);
    }
  }

  /**
   * Search suggestions
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchSuggestions(query, options = {}) {
    try {
      if (!query || query.trim().length < 2) {
        throw new AppError('Search query must be at least 2 characters', 400);
      }

      const suggestions = await this.repository.searchSuggestions(query, options);
      
      return {
        success: true,
        data: suggestions.map(s => this._formatSuggestionResponse(s)),
        query
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Search failed: ${error.message}`, 500);
    }
  }

  /**
   * Mark suggestion as implemented
   * @param {ObjectId} suggestionId - Suggestion ID
   * @param {ObjectId} userId - User ID
   * @returns {Promise<Object>} Updated suggestion
   */
  async markAsImplemented(suggestionId, userId) {
    try {
      const suggestion = await this.repository.findById(suggestionId);

      if (!suggestion) {
        throw new AppError('Suggestion not found', 404);
      }

      await suggestion.markAsImplemented();

      return {
        success: true,
        message: 'Suggestion marked as implemented',
        data: {
          implementations: suggestion.statistics.implementations
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to mark as implemented: ${error.message}`, 500);
    }
  }

  /**
   * Get statistics dashboard
   * @returns {Promise<Object>} Statistics summary
   */
  async getStatistics() {
    try {
      const stats = await this.repository.getStatistics();
      
      return {
        success: true,
        data: {
          ...stats,
          plasticSavedFormatted: `${(stats.totalPlasticSaved / 1000).toFixed(2)} kg`,
          moneySavedFormatted: `$${stats.totalMoneySaved.toFixed(2)}`,
          averageImpactScore: Math.round(stats.averageImpactScore)
        }
      };
    } catch (error) {
      throw new AppError(`Failed to fetch statistics: ${error.message}`, 500);
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Validate suggestion data
   * @private
   */
  _validateSuggestionData(data) {
    if (!data.title || data.title.trim().length < 5) {
      throw new AppError('Title must be at least 5 characters', 400);
    }

    if (!data.description || data.description.trim().length < 20) {
      throw new AppError('Description must be at least 20 characters', 400);
    }

    if (!data.category) {
      throw new AppError('Category is required', 400);
    }

    this._validatePlasticSaved(data.plasticSavedGrams);
    this._validateMoneySaved(data.moneySaved);
  }

  /**
   * Validate plastic saved amount
   * @private
   */
  _validatePlasticSaved(amount) {
    if (!amount || amount < 1) {
      throw new AppError('Plastic saved must be at least 1 gram', 400);
    }

    if (amount > 100000) {
      throw new AppError('Plastic saved amount seems unrealistic', 400);
    }
  }

  /**
   * Validate money saved amount
   * @private
   */
  _validateMoneySaved(amount) {
    if (amount === undefined || amount < 0) {
      throw new AppError('Money saved cannot be negative', 400);
    }

    if (amount > 10000) {
      throw new AppError('Money saved amount seems unrealistic', 400);
    }
  }

  /**
   * Format suggestion for response
   * @private
   */
  _formatSuggestionResponse(suggestion) {
    return {
      id: suggestion._id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      plasticSavedGrams: suggestion.plasticSavedGrams,
      plasticSavedFormatted: suggestion.plasticSavedGrams >= 1000 
        ? `${(suggestion.plasticSavedGrams / 1000).toFixed(2)} kg`
        : `${suggestion.plasticSavedGrams} g`,
      moneySaved: suggestion.moneySaved,
      difficulty: suggestion.difficulty,
      impactScore: suggestion.impactScore,
      tags: suggestion.tags,
      imageUrl: suggestion.imageUrl,
      statistics: suggestion.statistics,
      createdAt: suggestion.createdAt,
      createdBy: suggestion.createdBy ? {
        id: suggestion.createdBy._id,
        name: suggestion.createdBy.name
      } : null
    };
  }

  /**
   * Format detailed suggestion response
   * @private
   */
  _formatDetailedSuggestionResponse(suggestion) {
    const basic = this._formatSuggestionResponse(suggestion);
    
    return {
      ...basic,
      implementationSteps: suggestion.implementationSteps,
      source: suggestion.source,
      createdBy: suggestion.createdBy ? {
        id: suggestion.createdBy._id,
        name: suggestion.createdBy.name,
        email: suggestion.createdBy.email,
        role: suggestion.createdBy.role,
        profileImage: suggestion.createdBy.profileImage
      } : null,
      updatedAt: suggestion.updatedAt
    };
  }
}

// Export singleton instance
module.exports = new PlasticReductionSuggestionService();
