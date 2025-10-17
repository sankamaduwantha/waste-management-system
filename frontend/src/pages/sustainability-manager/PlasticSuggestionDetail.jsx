/**
 * @fileoverview Plastic Suggestion Detail and Edit Page
 * @description Allows sustainability managers to view, edit, and manage individual plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaTrash, 
  FaEye, 
  FaLeaf, 
  FaDollarSign,
  FaChartBar,
  FaClock,
  FaTag,
  FaCheckCircle,
  FaLightbulb,
  FaShoppingBag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import PlasticSuggestionForm from '../../components/plastic-suggestions/PlasticSuggestionForm';
import './PlasticSuggestionDetail.css';

const PlasticSuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { suggestions, fetchSuggestions, updateSuggestion, deleteSuggestion } = usePlasticSuggestionsStore();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadSuggestion();
  }, [id]);

  const loadSuggestion = async () => {
    setLoading(true);
    try {
      console.log('Loading suggestion with ID:', id);
      console.log('Current suggestions:', suggestions);
      
      // First try to find in existing suggestions
      let foundSuggestion = suggestions.find(s => {
        const suggestionId = s._id || s.id;
        console.log('Comparing:', suggestionId, 'with', id);
        return suggestionId === id;
      });
      
      console.log('Found in cache:', foundSuggestion);
      
      // If not found, fetch all suggestions
      if (!foundSuggestion) {
        console.log('Not found in cache, fetching all suggestions...');
        await fetchSuggestions();
        foundSuggestion = suggestions.find(s => {
          const suggestionId = s._id || s.id;
          return suggestionId === id;
        });
        console.log('Found after fetch:', foundSuggestion);
      }
      
      if (foundSuggestion) {
        console.log('Setting suggestion:', foundSuggestion);
        setSuggestion(foundSuggestion);
      } else {
        console.error('Suggestion not found with ID:', id);
        toast.error('Suggestion not found');
        navigate('/sustainability-manager/plastic-suggestions');
      }
    } catch (error) {
      console.error('Error loading suggestion:', error);
      toast.error('Failed to load suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSave = async (updatedData) => {
    try {
      await updateSuggestion(id, updatedData);
      toast.success('Suggestion updated successfully!');
      setIsEditMode(false);
      await loadSuggestion(); // Reload to show updated data
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('Failed to update suggestion');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSuggestion(id);
      toast.success('Suggestion deleted successfully!');
      navigate('/sustainability-manager/plastic-suggestions');
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast.error('Failed to delete suggestion');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#3b82f6',
      kitchen: '#10b981',
      bathroom: '#8b5cf6',
      shopping: '#f59e0b',
      outdoor: '#06b6d4',
    };
    return colors[category] || '#6b7280';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
    };
    return colors[difficulty] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="suggestion-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading suggestion...</p>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="suggestion-detail-error">
        <h2>Suggestion Not Found</h2>
        <button onClick={() => navigate('/sustainability-manager/plastic-suggestions')}>
          Back to List
        </button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="suggestion-detail-edit-mode">
        <div className="edit-header">
          <h1>
            <FaEdit /> Edit Suggestion
          </h1>
          <button className="btn-cancel" onClick={handleCancelEdit}>
            <FaTimes /> Cancel
          </button>
        </div>
        <PlasticSuggestionForm
          mode="edit"
          suggestion={suggestion}
          onSubmit={handleSave}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="suggestion-detail-container">
      {/* Header with Actions */}
      <div className="detail-header">
        <div className="header-left">
          <button 
            className="btn-back" 
            onClick={() => navigate('/sustainability-manager/plastic-suggestions')}
          >
            ← Back to List
          </button>
        </div>
        <div className="header-actions">
          <button className="btn-edit" onClick={handleEdit}>
            <FaEdit /> Edit
          </button>
          <button 
            className="btn-delete" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete "{suggestion.title}"? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="detail-content">
        {/* Title Section */}
        <div className="detail-section title-section">
          <h1 className="suggestion-title">{suggestion.title}</h1>
          <div className="title-badges">
            <span 
              className="category-badge" 
              style={{ backgroundColor: `${getCategoryColor(suggestion.category)}20`, color: getCategoryColor(suggestion.category) }}
            >
              {suggestion.category}
            </span>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: `${getDifficultyColor(suggestion.difficulty)}20`, color: getDifficultyColor(suggestion.difficulty) }}
            >
              {suggestion.difficulty}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
              <FaLeaf />
            </div>
            <div className="stat-info">
              <span className="stat-label">Plastic Saved</span>
              <span className="stat-value">{suggestion.plasticSavedGrams}g</span>
            </div>
          </div>
          
          <div className="stat-box">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
              <FaDollarSign />
            </div>
            <div className="stat-info">
              <span className="stat-label">Money Saved</span>
              <span className="stat-value">Rs. {suggestion.moneySaved?.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="stat-box">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
              <FaEye />
            </div>
            <div className="stat-info">
              <span className="stat-label">Views</span>
              <span className="stat-value">{suggestion.viewCount || 0}</span>
            </div>
          </div>
          
          <div className="stat-box">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-label">Implementations</span>
              <span className="stat-value">{suggestion.implementationCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="detail-section">
          <h2 className="section-title">Description</h2>
          <p className="description-text">{suggestion.description}</p>
        </div>

        {/* Image */}
        {suggestion.imageUrl && (
          <div className="detail-section">
            <h2 className="section-title">Image</h2>
            <div className="image-container">
              <img src={suggestion.imageUrl} alt={suggestion.title} />
            </div>
          </div>
        )}

        {/* Detailed Steps */}
        {suggestion.detailedSteps && suggestion.detailedSteps.length > 0 && (
          <div className="detail-section">
            <h2 className="section-title">
              <FaChartBar /> Implementation Steps
            </h2>
            <ol className="steps-list">
              {suggestion.detailedSteps.map((step, index) => (
                <li key={index} className="step-item">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Implementation Tips */}
        {suggestion.implementationTips && suggestion.implementationTips.length > 0 && (
          <div className="detail-section">
            <h2 className="section-title">
              <FaLightbulb /> Implementation Tips
            </h2>
            <ul className="tips-list">
              {suggestion.implementationTips.map((tip, index) => (
                <li key={index} className="tip-item">
                  <FaCheckCircle className="tip-icon" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Products */}
        {suggestion.alternativeProducts && suggestion.alternativeProducts.length > 0 && (
          <div className="detail-section">
            <h2 className="section-title">
              <FaShoppingBag /> Alternative Products
            </h2>
            <ul className="alternatives-list">
              {suggestion.alternativeProducts.map((product, index) => (
                <li key={index} className="alternative-item">
                  {product}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {suggestion.tags && (
          <div className="detail-section">
            <h2 className="section-title">
              <FaTag /> Tags
            </h2>
            <div className="tags-container">
              {(Array.isArray(suggestion.tags) 
                ? suggestion.tags 
                : typeof suggestion.tags === 'string' 
                  ? suggestion.tags.split(',') 
                  : []
              ).map((tag, index) => (
                <span key={index} className="tag-chip">
                  {typeof tag === 'string' ? tag.trim() : tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="detail-section metadata-section">
          <h2 className="section-title">
            <FaClock /> Metadata
          </h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Created:</span>
              <span className="metadata-value">
                {new Date(suggestion.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {suggestion.updatedAt && suggestion.updatedAt !== suggestion.createdAt && (
              <div className="metadata-item">
                <span className="metadata-label">Last Updated:</span>
                <span className="metadata-value">
                  {new Date(suggestion.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">Status:</span>
              <span className={`status-badge ${suggestion.status || 'active'}`}>
                {suggestion.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlasticSuggestionDetail;
