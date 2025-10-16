/**
 * @fileoverview Plastic Suggestion Form Component (Create/Edit)
 * @description Form for sustainability managers to create and edit suggestions
 * @author Waste Management System
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import './PlasticSuggestionForm.css';

const PlasticSuggestionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  const { createSuggestion, updateSuggestion, fetchSuggestionById, loading } = usePlasticSuggestionsStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    plasticSavedGrams: '',
    moneySaved: '',
    difficulty: 'easy',
    tags: '',
    imageUrl: '',
    detailedSteps: [''],
    implementationTips: [''],
    alternativeProducts: ['']
  });

  const [errors, setErrors] = useState({});

  // Load existing suggestion for editing
  useEffect(() => {
    if (isEditMode) {
      // Validate ID first
      if (!id || id === 'undefined' || id === 'null') {
        toast.error('Invalid suggestion ID. Redirecting to create new suggestion.');
        navigate('/sustainability-manager/plastic-suggestions/create');
        return;
      }

      const suggestionFromState = location.state?.suggestion;
      if (suggestionFromState) {
        populateForm(suggestionFromState);
      } else {
        // Fetch from API
        fetchSuggestionById(id).then(suggestion => {
          if (suggestion) {
            populateForm(suggestion);
          } else {
            toast.error('Suggestion not found');
            navigate('/sustainability-manager/plastic-suggestions');
          }
        }).catch((error) => {
          console.error('Error loading suggestion:', error);
          toast.error('Failed to load suggestion');
          navigate('/sustainability-manager/plastic-suggestions');
        });
      }
    }
  }, [id, isEditMode]);

  const populateForm = (suggestion) => {
    setFormData({
      title: suggestion.title || '',
      description: suggestion.description || '',
      category: suggestion.category || 'general',
      plasticSavedGrams: suggestion.plasticSavedGrams || '',
      moneySaved: suggestion.moneySaved || '',
      difficulty: suggestion.difficulty || 'easy',
      tags: suggestion.tags?.join(', ') || '',
      imageUrl: suggestion.imageUrl || '',
      detailedSteps: suggestion.detailedSteps?.length > 0 ? suggestion.detailedSteps : [''],
      implementationTips: suggestion.implementationTips?.length > 0 ? suggestion.implementationTips : [''],
      alternativeProducts: suggestion.alternativeProducts?.length > 0 ? suggestion.alternativeProducts : ['']
    });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle array field change
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Add array item
  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Remove array item
  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.plasticSavedGrams || formData.plasticSavedGrams < 0) {
      newErrors.plasticSavedGrams = 'Please enter a valid amount';
    }

    if (!formData.moneySaved || formData.moneySaved < 0) {
      newErrors.moneySaved = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Prepare data
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      plasticSavedGrams: parseInt(formData.plasticSavedGrams),
      moneySaved: parseFloat(formData.moneySaved),
      difficulty: formData.difficulty,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: formData.imageUrl.trim() || undefined,
      detailedSteps: formData.detailedSteps.filter(step => step.trim()),
      implementationTips: formData.implementationTips.filter(tip => tip.trim()),
      alternativeProducts: formData.alternativeProducts.filter(product => product.trim())
    };

    try {
      if (isEditMode) {
        await updateSuggestion(id, submitData);
        toast.success('Suggestion updated successfully!');
      } else {
        await createSuggestion(submitData);
        toast.success('Suggestion created successfully!');
      }
      navigate('/sustainability-manager/plastic-suggestions');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} suggestion`);
    }
  };

  return (
    <div className="plastic-suggestion-form-container">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Suggestion' : 'Create New Suggestion'}</h1>
        <p>Help residents reduce plastic waste with practical suggestions</p>
      </div>

      <form onSubmit={handleSubmit} className="plastic-suggestion-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Use Reusable Water Bottles"
              className={errors.title ? 'error' : ''}
              maxLength={100}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the suggestion and its benefits..."
              rows={5}
              className={errors.description ? 'error' : ''}
              maxLength={1000}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <span className="char-count">{formData.description.length}/1000</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="shopping">Shopping</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="transportation">Transportation</option>
                <option value="packaging">Packaging</option>
                <option value="food_storage">Food Storage</option>
                <option value="clothing">Clothing</option>
                <option value="office">Office</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">
                Difficulty Level <span className="required">*</span>
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="form-section">
          <h2>Impact Metrics</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plasticSavedGrams">
                Plastic Saved (grams/year) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="plasticSavedGrams"
                name="plasticSavedGrams"
                value={formData.plasticSavedGrams}
                onChange={handleChange}
                placeholder="e.g., 5000"
                min="0"
                className={errors.plasticSavedGrams ? 'error' : ''}
              />
              {errors.plasticSavedGrams && <span className="error-message">{errors.plasticSavedGrams}</span>}
              <span className="help-text">Estimated annual plastic saved per person</span>
            </div>

            <div className="form-group">
              <label htmlFor="moneySaved">
                Money Saved ($/year) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="moneySaved"
                name="moneySaved"
                value={formData.moneySaved}
                onChange={handleChange}
                placeholder="e.g., 150"
                min="0"
                step="0.01"
                className={errors.moneySaved ? 'error' : ''}
              />
              {errors.moneySaved && <span className="error-message">{errors.moneySaved}</span>}
              <span className="help-text">Estimated annual cost savings</span>
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="form-section">
          <h2>Additional Details</h2>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="reusable, sustainable, eco-friendly (comma-separated)"
            />
            <span className="help-text">Comma-separated tags for better searchability</span>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <span className="help-text">Optional: URL to an illustrative image</span>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="form-section">
          <h2>Implementation Steps</h2>
          <p className="section-description">Break down how to implement this suggestion</p>

          {formData.detailedSteps.map((step, index) => (
            <div key={index} className="array-field">
              <div className="form-group">
                <label>Step {index + 1}</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleArrayChange('detailedSteps', index, e.target.value)}
                    placeholder={`Step ${index + 1}...`}
                  />
                  {formData.detailedSteps.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeArrayItem('detailedSteps', index)}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() => addArrayItem('detailedSteps')}
          >
            <FaPlus /> Add Step
          </button>
        </section>

        {/* Implementation Tips */}
        <section className="form-section">
          <h2>Implementation Tips</h2>
          <p className="section-description">Helpful tips for successful implementation</p>

          {formData.implementationTips.map((tip, index) => (
            <div key={index} className="array-field">
              <div className="form-group">
                <label>Tip {index + 1}</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleArrayChange('implementationTips', index, e.target.value)}
                    placeholder={`Tip ${index + 1}...`}
                  />
                  {formData.implementationTips.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeArrayItem('implementationTips', index)}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() => addArrayItem('implementationTips')}
          >
            <FaPlus /> Add Tip
          </button>
        </section>

        {/* Alternative Products */}
        <section className="form-section">
          <h2>Alternative Products</h2>
          <p className="section-description">Recommended plastic-free alternatives</p>

          {formData.alternativeProducts.map((product, index) => (
            <div key={index} className="array-field">
              <div className="form-group">
                <label>Product {index + 1}</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => handleArrayChange('alternativeProducts', index, e.target.value)}
                    placeholder={`Product ${index + 1}...`}
                  />
                  {formData.alternativeProducts.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeArrayItem('alternativeProducts', index)}
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            onClick={() => addArrayItem('alternativeProducts')}
          >
            <FaPlus /> Add Product
          </button>
        </section>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/sustainability-manager/plastic-suggestions')}
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : isEditMode ? 'Update Suggestion' : 'Create Suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlasticSuggestionForm;
