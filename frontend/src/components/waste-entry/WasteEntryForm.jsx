/**
 * @fileoverview Waste Entry Form Component
 * @description Form for creating/editing daily waste entries
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Controlled Component Pattern: React controlled inputs
 * - Builder Pattern: Form data construction
 * - Validator Pattern: Form validation logic
 * 
 * @solid-principles
 * - Single Responsibility: Handles only waste entry form
 * - Open/Closed: Extensible through props
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaTimes, FaTrash, FaRecycle, FaLeaf, FaExclamationTriangle } from 'react-icons/fa';
import useWasteEntryStore from '../../store/wasteEntryStore';
import './WasteEntryForm.css';

const WasteEntryForm = ({ entry = null, onClose, onSuccess }) => {
  const { createEntry, updateEntry, loading } = useWasteEntryStore();

  const [formData, setFormData] = useState({
    date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    wasteAmounts: {
      general: entry?.wasteAmounts?.general || 0,
      recyclable: entry?.wasteAmounts?.recyclable || 0,
      organic: entry?.wasteAmounts?.organic || 0,
      hazardous: entry?.wasteAmounts?.hazardous || 0
    },
    location: entry?.location || 'home',
    notes: entry?.notes || ''
  });

  const [errors, setErrors] = useState({});

  // Calculate total waste
  const totalWaste = Object.values(formData.wasteAmounts).reduce((sum, val) => sum + parseFloat(val || 0), 0);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('waste.')) {
      const wasteType = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        wasteAmounts: {
          ...prev.wasteAmounts,
          [wasteType]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    // Waste amounts validation
    const { general, recyclable, organic, hazardous } = formData.wasteAmounts;
    
    if (general === 0 && recyclable === 0 && organic === 0 && hazardous === 0) {
      newErrors.wasteAmounts = 'At least one waste category must have a value greater than 0';
    }

    if (general < 0 || recyclable < 0 || organic < 0 || hazardous < 0) {
      newErrors.wasteAmounts = 'Waste amounts cannot be negative';
    }

    if (general > 1000 || recyclable > 1000 || organic > 1000 || hazardous > 100) {
      newErrors.wasteAmounts = 'Waste amounts seem unrealistic. Please check your input';
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const result = entry
      ? await updateEntry(entry.id, formData)
      : await createEntry(formData);

    if (result.success) {
      toast.success(entry ? 'Waste entry updated successfully!' : 'Waste entry created successfully!');
      onSuccess?.();
      onClose?.();
    } else {
      toast.error(result.error || 'Failed to save waste entry');
    }
  };

  /**
   * Get recycling rate
   */
  const getRecyclingRate = () => {
    if (totalWaste === 0) return 0;
    return ((formData.wasteAmounts.recyclable / totalWaste) * 100).toFixed(1);
  };

  return (
    <div className="waste-entry-form-container">
      <div className="form-header">
        <h2>{entry ? 'Edit Waste Entry' : 'Add Daily Waste Entry'}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close form">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="waste-entry-form">
        {/* Date Field */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.date ? 'error' : ''}`}
            disabled={!!entry} // Disable date editing for existing entries
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
          {entry && <span className="help-text">Date cannot be changed for existing entries</span>}
        </div>

        {/* Waste Amounts Section */}
        <div className="waste-amounts-section">
          <h3 className="section-title">Waste Amounts (kg)</h3>
          {errors.wasteAmounts && <span className="error-message section-error">{errors.wasteAmounts}</span>}

          <div className="waste-inputs-grid">
            {/* General Waste */}
            <div className="form-group waste-input">
              <label htmlFor="waste.general" className="form-label">
                <FaTrash className="icon text-gray-600" />
                General Waste
              </label>
              <input
                type="number"
                id="waste.general"
                name="waste.general"
                value={formData.wasteAmounts.general}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                className="form-input"
                placeholder="0.0"
              />
            </div>

            {/* Recyclable Waste */}
            <div className="form-group waste-input">
              <label htmlFor="waste.recyclable" className="form-label">
                <FaRecycle className="icon text-green-600" />
                Recyclable Waste
              </label>
              <input
                type="number"
                id="waste.recyclable"
                name="waste.recyclable"
                value={formData.wasteAmounts.recyclable}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                className="form-input"
                placeholder="0.0"
              />
            </div>

            {/* Organic Waste */}
            <div className="form-group waste-input">
              <label htmlFor="waste.organic" className="form-label">
                <FaLeaf className="icon text-yellow-600" />
                Organic Waste
              </label>
              <input
                type="number"
                id="waste.organic"
                name="waste.organic"
                value={formData.wasteAmounts.organic}
                onChange={handleChange}
                min="0"
                max="1000"
                step="0.1"
                className="form-input"
                placeholder="0.0"
              />
            </div>

            {/* Hazardous Waste */}
            <div className="form-group waste-input">
              <label htmlFor="waste.hazardous" className="form-label">
                <FaExclamationTriangle className="icon text-red-600" />
                Hazardous Waste
              </label>
              <input
                type="number"
                id="waste.hazardous"
                name="waste.hazardous"
                value={formData.wasteAmounts.hazardous}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="waste-summary">
            <div className="summary-item">
              <span className="summary-label">Total Waste:</span>
              <span className="summary-value">{totalWaste.toFixed(2)} kg</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Recycling Rate:</span>
              <span className={`summary-value ${parseFloat(getRecyclingRate()) >= 30 ? 'text-green-600' : 'text-orange-600'}`}>
                {getRecyclingRate()}%
              </span>
            </div>
          </div>
        </div>

        {/* Location Field */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Notes Field */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            maxLength="500"
            rows="3"
            className={`form-input ${errors.notes ? 'error' : ''}`}
            placeholder="Add any additional notes about today's waste..."
          />
          {errors.notes && <span className="error-message">{errors.notes}</span>}
          <span className="character-count">{formData.notes.length}/500</span>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <FaSave className="mr-2" />
            {loading ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WasteEntryForm;
