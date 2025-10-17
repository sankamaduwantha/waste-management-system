/**
 * @fileoverview PlasticReductionSuggestion Model
 * @description Mongoose schema for managing plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Active Record Pattern: Business logic within model methods
 * - Builder Pattern: Static factory methods for complex creation
 * 
 * @solid-principles
 * - Single Responsibility: Handles only plastic reduction suggestion data
 * - Open/Closed: Extensible through virtuals and methods without modification
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} PlasticReductionSuggestion
 * @property {string} title - Title of the suggestion (required)
 * @property {string} description - Detailed description
 * @property {string} category - Category type
 * @property {number} plasticSavedGrams - Estimated plastic saved in grams
 * @property {number} moneySaved - Estimated money saved in local currency
 * @property {string} difficulty - Implementation difficulty level
 * @property {number} impactScore - Calculated impact score (0-100)
 * @property {boolean} isActive - Visibility status
 * @property {string} source - Source of suggestion
 * @property {Array<string>} tags - Searchable tags
 * @property {ObjectId} createdBy - Admin who created the suggestion
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const plasticReductionSuggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Suggestion title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'shopping',
          'kitchen',
          'bathroom',
          'transportation',
          'packaging',
          'food_storage',
          'clothing',
          'office',
          'travel',
          'general'
        ],
        message: '{VALUE} is not a valid category'
      },
      index: true
    },
    plasticSavedGrams: {
      type: Number,
      required: [true, 'Estimated plastic saved is required'],
      min: [1, 'Plastic saved must be at least 1 gram'],
      max: [100000, 'Plastic saved cannot exceed 100kg']
    },
    moneySaved: {
      type: Number,
      required: [true, 'Estimated money saved is required'],
      min: [0, 'Money saved cannot be negative'],
      max: [10000, 'Money saved value seems unrealistic']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty level'
      },
      default: 'medium'
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    source: {
      type: String,
      trim: true,
      maxlength: [200, 'Source cannot exceed 200 characters']
    },
    tags: {
      type: [String],
      validate: {
        validator: function(tags) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags'
      }
    },
    imageUrl: {
      type: String,
      trim: true
    },
    implementationSteps: {
      type: [String],
      validate: {
        validator: function(steps) {
          return steps.length <= 20;
        },
        message: 'Cannot have more than 20 implementation steps'
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true
    },
    statistics: {
      views: {
        type: Number,
        default: 0,
        min: 0
      },
      implementations: {
        type: Number,
        default: 0,
        min: 0
      },
      likes: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        ret._id = ret._id;  // Preserve _id
        delete ret.id;      // Remove the virtual id field
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// ==================== INDEXES ====================
// Compound indexes for efficient queries
plasticReductionSuggestionSchema.index({ category: 1, isActive: 1 });
plasticReductionSuggestionSchema.index({ impactScore: -1, isActive: 1 });
plasticReductionSuggestionSchema.index({ createdAt: -1 });
plasticReductionSuggestionSchema.index({ tags: 1 });

// Text index for search functionality
plasticReductionSuggestionSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// ==================== VIRTUALS ====================

/**
 * Calculate impact category based on plastic saved
 */
plasticReductionSuggestionSchema.virtual('impactCategory').get(function() {
  if (this.plasticSavedGrams >= 1000) return 'high';
  if (this.plasticSavedGrams >= 100) return 'medium';
  return 'low';
});

/**
 * Calculate ROI (Return on Investment) score
 */
plasticReductionSuggestionSchema.virtual('roi').get(function() {
  const difficultyWeight = {
    easy: 1,
    medium: 0.7,
    hard: 0.4
  };
  
  return Math.round(
    (this.plasticSavedGrams * difficultyWeight[this.difficulty] * 0.1) +
    (this.moneySaved * difficultyWeight[this.difficulty])
  );
});

/**
 * Format plastic saved for display
 */
plasticReductionSuggestionSchema.virtual('plasticSavedFormatted').get(function() {
  if (this.plasticSavedGrams >= 1000) {
    return `${(this.plasticSavedGrams / 1000).toFixed(2)} kg`;
  }
  return `${this.plasticSavedGrams} g`;
});

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware: Calculate impact score
 * Formula: (plasticSaved * 0.05) + (moneySaved * 0.3) + difficultyBonus + popularityBonus
 */
plasticReductionSuggestionSchema.pre('save', function(next) {
  // Calculate base score from plastic saved (max 50 points)
  const plasticScore = Math.min(this.plasticSavedGrams * 0.05, 50);
  
  // Calculate money saved score (max 30 points)
  const moneyScore = Math.min(this.moneySaved * 0.3, 30);
  
  // Difficulty bonus (easier = higher score)
  const difficultyBonus = {
    easy: 15,
    medium: 10,
    hard: 5
  }[this.difficulty] || 10;
  
  // Popularity bonus based on implementations (max 5 points)
  const popularityBonus = Math.min(this.statistics.implementations * 0.1, 5);
  
  this.impactScore = Math.min(
    Math.round(plasticScore + moneyScore + difficultyBonus + popularityBonus),
    100
  );
  
  next();
});

/**
 * Pre-save middleware: Normalize tags
 */
plasticReductionSuggestionSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    this.tags = this.tags.map(tag => 
      tag.toLowerCase().trim().replace(/\s+/g, '-')
    );
    // Remove duplicates
    this.tags = [...new Set(this.tags)];
  }
  next();
});

// ==================== STATIC METHODS ====================

/**
 * Get active suggestions by category
 * @param {string} category - Category to filter by
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Array of suggestions
 */
plasticReductionSuggestionSchema.statics.getByCategory = async function(category, options = {}) {
  const { page = 1, limit = 10, sortBy = '-impactScore' } = options;
  const skip = (page - 1) * limit;

  return this.find({ category, isActive: true })
    .populate('createdBy', 'name email')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Get top suggestions by impact score
 * @param {number} limit - Number of suggestions to return
 * @returns {Promise<Array>} Top suggestions
 */
plasticReductionSuggestionSchema.statics.getTopSuggestions = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort('-impactScore -statistics.implementations')
    .limit(limit)
    .populate('createdBy', 'name')
    .lean();
};

/**
 * Search suggestions by text
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Matching suggestions
 */
plasticReductionSuggestionSchema.statics.searchSuggestions = async function(query, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  return this.find(
    { 
      $text: { $search: query },
      isActive: true
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name')
    .lean();
};

/**
 * Get statistics summary
 * @returns {Promise<Object>} Statistics object
 */
plasticReductionSuggestionSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalSuggestions: { $sum: 1 },
        totalPlasticSaved: { $sum: '$plasticSavedGrams' },
        totalMoneySaved: { $sum: '$moneySaved' },
        totalImplementations: { $sum: '$statistics.implementations' },
        averageImpactScore: { $avg: '$impactScore' }
      }
    }
  ]);

  return stats[0] || {
    totalSuggestions: 0,
    totalPlasticSaved: 0,
    totalMoneySaved: 0,
    totalImplementations: 0,
    averageImpactScore: 0
  };
};

// ==================== INSTANCE METHODS ====================

/**
 * Increment view count
 * @returns {Promise<void>}
 */
plasticReductionSuggestionSchema.methods.incrementViews = async function() {
  this.statistics.views += 1;
  return this.save();
};

/**
 * Mark as implemented by a user
 * @returns {Promise<void>}
 */
plasticReductionSuggestionSchema.methods.markAsImplemented = async function() {
  this.statistics.implementations += 1;
  return this.save();
};

/**
 * Toggle like
 * @param {boolean} increment - Whether to increment or decrement
 * @returns {Promise<void>}
 */
plasticReductionSuggestionSchema.methods.toggleLike = async function(increment = true) {
  this.statistics.likes += increment ? 1 : -1;
  this.statistics.likes = Math.max(0, this.statistics.likes);
  return this.save();
};

/**
 * Check if suggestion is impactful
 * @returns {boolean}
 */
plasticReductionSuggestionSchema.methods.isHighImpact = function() {
  return this.impactScore >= 70;
};

/**
 * Get formatted display data
 * @returns {Object}
 */
plasticReductionSuggestionSchema.methods.toDisplayFormat = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    plasticSaved: this.plasticSavedFormatted,
    moneySaved: `Rs. ${this.moneySaved.toFixed(2)}`,
    difficulty: this.difficulty,
    impactScore: this.impactScore,
    impactCategory: this.impactCategory,
    roi: this.roi,
    tags: this.tags,
    imageUrl: this.imageUrl,
    steps: this.implementationSteps,
    statistics: this.statistics,
    createdAt: this.createdAt
  };
};

// ==================== MODEL EXPORT ====================

const PlasticReductionSuggestion = mongoose.model(
  'PlasticReductionSuggestion',
  plasticReductionSuggestionSchema
);

module.exports = PlasticReductionSuggestion;
