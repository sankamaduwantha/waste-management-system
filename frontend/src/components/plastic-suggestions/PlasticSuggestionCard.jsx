/**
 * @fileoverview Plastic Reduction Suggestion Card Component
 * @description Reusable card component for displaying plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Presentational Component Pattern: Pure UI component
 * - Composition Pattern: Composable with other components
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FaLeaf, FaDollarSign, FaEye, FaCheckCircle, FaClock } from 'react-icons/fa';
import './PlasticSuggestionCard.css';

/**
 * Category badge component
 */
const CategoryBadge = ({ category }) => {
  const categoryColors = {
    shopping: 'bg-blue-500',
    kitchen: 'bg-green-500',
    bathroom: 'bg-purple-500',
    transportation: 'bg-yellow-500',
    packaging: 'bg-red-500',
    food_storage: 'bg-indigo-500',
    clothing: 'bg-pink-500',
    office: 'bg-gray-500',
    travel: 'bg-teal-500',
    general: 'bg-orange-500'
  };

  return (
    <span className={`category-badge ${categoryColors[category] || 'bg-gray-500'}`}>
      {category.replace('_', ' ')}
    </span>
  );
};

/**
 * Difficulty badge component
 */
const DifficultyBadge = ({ difficulty }) => {
  const difficultyConfig = {
    easy: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Easy' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', label: 'Medium' },
    hard: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Hard' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.easy;

  return (
    <span className={`difficulty-badge ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

/**
 * Impact score display component
 */
const ImpactScore = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'High Impact';
    if (score >= 60) return 'Medium Impact';
    if (score >= 40) return 'Low Impact';
    return 'Very Low Impact';
  };

  return (
    <div className="impact-score">
      <div className={`score-value ${getScoreColor()}`}>
        {Math.round(score)}
      </div>
      <div className="score-label">{getScoreLabel()}</div>
    </div>
  );
};

/**
 * Main Plastic Suggestion Card Component
 */
const PlasticSuggestionCard = ({
  suggestion,
  onImplement,
  onViewDetails,
  showActions = true,
  compact = false
}) => {
  const {
    _id,
    title,
    description,
    category,
    plasticSavedFormatted = 'N/A',
    moneySaved: rawMoneySaved = 0,
    difficulty,
    impactScore,
    imageUrl,
    statistics,
    tags
  } = suggestion;

  // Safely convert moneySaved to number
  const moneySaved = typeof rawMoneySaved === 'number' 
    ? rawMoneySaved 
    : parseFloat(rawMoneySaved) || 0;

  const handleImplementClick = (e) => {
    e.stopPropagation();
    // Support both _id (MongoDB) and id (virtual field) for backward compatibility
    const suggestionId = _id || suggestion.id || suggestion._id;
    console.log('🔍 DEBUG - Implement clicked:', { _id, id: suggestion.id, suggestionId, fullSuggestion: suggestion });
    if (!suggestionId) {
      console.error('❌ ERROR: No valid ID found!', suggestion);
    }
    onImplement && onImplement(suggestionId);
  };

  const handleCardClick = () => {
    onViewDetails && onViewDetails(suggestion);
  };

  return (
    <div 
      className={`plastic-suggestion-card ${compact ? 'compact' : ''}`}
      onClick={handleCardClick}
      role="article"
      aria-label={`Plastic reduction suggestion: ${title}`}
    >
      {/* Image Section */}
      {imageUrl && !compact && (
        <div className="card-image">
          <img 
            src={imageUrl} 
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder-suggestion.png'; // Fallback image
            }}
          />
          <div className="image-overlay">
            <ImpactScore score={impactScore} />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <div className="card-badges">
            <CategoryBadge category={category} />
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>

        {/* Description */}
        <p className="card-description">
          {compact 
            ? `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`
            : description
          }
        </p>

        {/* Stats */}
        <div className="card-stats">
          <div className="stat-item">
            <FaLeaf className="stat-icon text-green-600" />
            <span className="stat-label">Plastic Saved:</span>
            <span className="stat-value">{plasticSavedFormatted}</span>
          </div>
          
          <div className="stat-item">
            <FaDollarSign className="stat-icon text-yellow-600" />
            <span className="stat-label">Money Saved:</span>
            <span className="stat-value">Rs. {moneySaved.toFixed(2)}</span>
          </div>

          {statistics && (
            <>
              <div className="stat-item">
                <FaEye className="stat-icon text-blue-600" />
                <span className="stat-value">{statistics.views || 0} views</span>
              </div>

              <div className="stat-item">
                <FaCheckCircle className="stat-icon text-purple-600" />
                <span className="stat-value">{statistics.implementations || 0} implemented</span>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && !compact && (
          <div className="card-tags">
            {tags.slice(0, 5).map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="tag">+{tags.length - 5} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="card-actions">
            <button
              className="btn-implement"
              onClick={handleImplementClick}
              aria-label={`Mark "${title}" as implemented`}
            >
              <FaCheckCircle className="mr-2" />
              I Implemented This!
            </button>
            
            <button
              className="btn-details"
              onClick={handleCardClick}
              aria-label={`View details of "${title}"`}
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes validation
PlasticSuggestionCard.propTypes = {
  suggestion: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.oneOf([
      'shopping', 'kitchen', 'bathroom', 'transportation',
      'packaging', 'food_storage', 'clothing', 'office',
      'travel', 'general'
    ]).isRequired,
    plasticSavedFormatted: PropTypes.string,
    moneySaved: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
    impactScore: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    statistics: PropTypes.shape({
      views: PropTypes.number,
      implementations: PropTypes.number,
      likes: PropTypes.number
    }),
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onImplement: PropTypes.func,
  onViewDetails: PropTypes.func,
  showActions: PropTypes.bool,
  compact: PropTypes.bool
};

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired
};

DifficultyBadge.propTypes = {
  difficulty: PropTypes.string.isRequired
};

ImpactScore.propTypes = {
  score: PropTypes.number.isRequired
};

export default PlasticSuggestionCard;
