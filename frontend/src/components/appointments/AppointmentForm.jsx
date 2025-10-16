/**
 * @fileoverview Appointment Form Component
 * @description Form for creating/updating appointments with waste type selection and validation
 */

import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import {
  WASTE_TYPES,
  WASTE_TYPE_LABELS,
  WASTE_TYPE_ICONS,
  validateWasteTypes,
  validateEstimatedAmount,
} from '../../utils/appointmentUtils';

/**
 * AppointmentForm Component
 * @param {Object} props - Component props
 * @param {Date} props.selectedDate - Selected appointment date
 * @param {Object} props.selectedSlot - Selected time slot
 * @param {Object} props.initialData - Initial form data for editing
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element}
 */
const AppointmentForm = ({
  selectedDate,
  selectedSlot,
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    wasteTypes: [],
    estimatedAmount: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        wasteTypes: initialData.wasteTypes || [],
        estimatedAmount: initialData.estimatedAmount || '',
        specialInstructions: initialData.specialInstructions || '',
      });
    }
  }, [initialData]);

  // Handle waste type toggle
  const handleWasteTypeToggle = (wasteType) => {
    setFormData(prev => {
      const currentTypes = prev.wasteTypes;
      const newTypes = currentTypes.includes(wasteType)
        ? currentTypes.filter(t => t !== wasteType)
        : [...currentTypes, wasteType];
      
      return { ...prev, wasteTypes: newTypes };
    });
    
    // Clear waste type error
    if (errors.wasteTypes) {
      setErrors(prev => ({ ...prev, wasteTypes: null }));
    }
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, estimatedAmount: value }));
    
    // Clear amount error
    if (errors.estimatedAmount) {
      setErrors(prev => ({ ...prev, estimatedAmount: null }));
    }
  };

  // Handle instructions change
  const handleInstructionsChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setFormData(prev => ({ ...prev, specialInstructions: value }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate waste types
    const wasteTypesValidation = validateWasteTypes(formData.wasteTypes);
    if (!wasteTypesValidation.valid) {
      newErrors.wasteTypes = wasteTypesValidation.message;
    }

    // Validate amount
    const amountValidation = validateEstimatedAmount(Number(formData.estimatedAmount));
    if (!amountValidation.valid) {
      newErrors.estimatedAmount = amountValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      date: selectedDate,
      timeSlot: selectedSlot,
      wasteTypes: formData.wasteTypes,
      estimatedAmount: Number(formData.estimatedAmount),
      specialInstructions: formData.specialInstructions.trim(),
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {initialData ? 'Update Appointment' : 'Appointment Details'}
      </h3>

      {/* Waste Types Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Waste Types <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(WASTE_TYPES).map(wasteType => {
            const isSelected = formData.wasteTypes.includes(wasteType);
            
            return (
              <button
                key={wasteType}
                type="button"
                onClick={() => handleWasteTypeToggle(wasteType)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {WASTE_TYPE_ICONS[wasteType]}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {WASTE_TYPE_LABELS[wasteType]}
                    </p>
                    {isSelected && (
                      <p className="text-xs text-green-600 mt-1">✓ Selected</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.wasteTypes && (
          <p className="text-red-500 text-sm mt-2">{errors.wasteTypes}</p>
        )}
      </div>

      {/* Estimated Amount */}
      <div className="mb-6">
        <label
          htmlFor="estimatedAmount"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Estimated Amount (kg) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="estimatedAmount"
          value={formData.estimatedAmount}
          onChange={handleAmountChange}
          min="0.1"
          max="1000"
          step="0.1"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.estimatedAmount
              ? 'border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
          }`}
          placeholder="Enter estimated waste amount"
        />
        {errors.estimatedAmount && (
          <p className="text-red-500 text-sm mt-2">{errors.estimatedAmount}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Please provide an estimate of total waste weight
        </p>
      </div>

      {/* Special Instructions */}
      <div className="mb-6">
        <label
          htmlFor="specialInstructions"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Special Instructions (Optional)
        </label>
        <textarea
          id="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleInstructionsChange}
          rows="4"
          maxLength="500"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 resize-none"
          placeholder="Any special instructions or notes for collection..."
        ></textarea>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-500 text-xs">
            Provide any additional details about the collection
          </p>
          <p className="text-gray-400 text-xs">
            {formData.specialInstructions.length}/500
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {initialData ? 'Updating...' : 'Booking...'}
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              {initialData ? 'Update Appointment' : 'Book Appointment'}
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AppointmentForm;
