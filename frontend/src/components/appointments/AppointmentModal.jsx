/**
 * @fileoverview Appointment Modal Component
 * @description Modal for viewing, updating, and cancelling appointments
 */

import { useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import AppointmentForm from './AppointmentForm';
import {
  formatAppointmentForDisplay,
  getStatusBadgeClass,
  validateCancellationReason,
} from '../../utils/appointmentUtils';

/**
 * AppointmentModal Component
 * @param {Object} props - Component props
 * @param {Object} props.appointment - Appointment data
 * @param {string} props.mode - Modal mode: 'view', 'update', 'cancel'
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onUpdate - Update callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element}
 */
const AppointmentModal = ({
  appointment,
  mode = 'view',
  isOpen,
  onClose,
  onUpdate,
  onCancel,
  loading = false,
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !appointment) return null;

  const formattedAppointment = formatAppointmentForDisplay(appointment);

  // Handle cancellation reason change
  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= 300) {
      setCancellationReason(value);
      setCancelError('');
    }
  };

  // Handle cancel submission
  const handleCancelSubmit = () => {
    const validation = validateCancellationReason(cancellationReason);
    if (!validation.valid) {
      setCancelError(validation.message);
      return;
    }

    onCancel?.(appointment._id, cancellationReason);
  };

  // Handle update submission
  const handleUpdateSubmit = (formData) => {
    onUpdate?.(appointment._id, formData);
  };

  // Reset and close
  const handleClose = () => {
    setCancellationReason('');
    setCancelError('');
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              {mode === 'view' && 'Appointment Details'}
              {mode === 'update' && 'Update Appointment'}
              {mode === 'cancel' && 'Cancel Appointment'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* View Mode */}
            {mode === 'view' && (
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Status
                  </label>
                  <span className={getStatusBadgeClass(appointment.status)}>
                    {formattedAppointment.statusLabel}
                  </span>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Date & Time
                  </label>
                  <p className="text-lg text-gray-900">
                    {formattedAppointment.formattedDate}
                  </p>
                  <p className="text-gray-600 mt-1">
                    {formattedAppointment.formattedTimeSlot}
                  </p>
                </div>

                {/* Waste Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Waste Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formattedAppointment.wasteTypeBadges.map((badge, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white ${badge.color}`}
                      >
                        <span className="mr-1.5">{badge.icon}</span>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estimated Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Estimated Amount
                  </label>
                  <p className="text-lg text-gray-900">
                    {appointment.estimatedAmount} kg
                  </p>
                </div>

                {/* Special Instructions */}
                {appointment.specialInstructions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Special Instructions
                    </label>
                    <p className="text-gray-900 p-4 bg-gray-50 rounded-lg">
                      {appointment.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Zone */}
                {appointment.zone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Zone
                    </label>
                    <p className="text-gray-900">
                      {appointment.zone.name || `Zone ${appointment.zone.zoneNumber}`}
                    </p>
                  </div>
                )}

                {/* Vehicle (if assigned) */}
                {appointment.vehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Assigned Vehicle
                    </label>
                    <p className="text-gray-900">
                      {appointment.vehicle.vehicleNumber || 'To be assigned'}
                    </p>
                  </div>
                )}

                {/* Cancellation Details (if cancelled) */}
                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Cancellation Reason
                    </label>
                    <p className="text-red-800">{appointment.cancellationReason}</p>
                    {appointment.cancelledAt && (
                      <p className="text-sm text-red-700 mt-2">
                        Cancelled on {new Date(appointment.cancelledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Update Mode */}
            {mode === 'update' && (
              <AppointmentForm
                initialData={appointment}
                selectedDate={appointment.appointmentDate}
                selectedSlot={appointment.timeSlot}
                onSubmit={handleUpdateSubmit}
                onCancel={handleClose}
                loading={loading}
              />
            )}

            {/* Cancel Mode */}
            {mode === 'cancel' && (
              <div className="space-y-6">
                {/* Warning */}
                <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FiAlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-yellow-900 font-medium mb-1">
                      Are you sure you want to cancel this appointment?
                    </p>
                    <p className="text-yellow-800 text-sm">
                      This action cannot be undone. You'll need to book a new appointment if you change your mind.
                    </p>
                  </div>
                </div>

                {/* Appointment Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Appointment Details</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formattedAppointment.formattedDate}
                  </p>
                  <p className="text-gray-700">{formattedAppointment.formattedTimeSlot}</p>
                </div>

                {/* Cancellation Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={handleReasonChange}
                    rows="4"
                    maxLength="300"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                      cancelError
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-green-200'
                    }`}
                    placeholder="Please provide a reason for cancellation..."
                  ></textarea>
                  {cancelError && (
                    <p className="text-red-500 text-sm mt-2">{cancelError}</p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-500 text-xs">
                      Minimum 5 characters required
                    </p>
                    <p className="text-gray-400 text-xs">
                      {cancellationReason.length}/300
                    </p>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="cancelConfirm"
                    checked={showCancelConfirm}
                    onChange={(e) => setShowCancelConfirm(e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="cancelConfirm" className="ml-3 text-sm text-gray-700">
                    I understand that this appointment will be cancelled and cannot be recovered.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCancelSubmit}
                    disabled={!showCancelConfirm || loading}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Keep Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
