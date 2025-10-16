/**
 * @fileoverview Appointment Card Component
 * @description Display individual appointment with status, details, and actions
 */

import { FiCalendar, FiClock, FiPackage, FiMapPin, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import {
  formatAppointmentForDisplay,
  getStatusBadgeClass,
  STATUS_LABELS,
} from '../../utils/appointmentUtils';

/**
 * AppointmentCard Component
 * @param {Object} props - Component props
 * @param {Object} props.appointment - Appointment data
 * @param {Function} props.onView - View callback
 * @param {Function} props.onUpdate - Update callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} props.compact - Compact view mode
 * @returns {JSX.Element}
 */
const AppointmentCard = ({
  appointment,
  onView,
  onUpdate,
  onCancel,
  compact = false,
}) => {
  const formattedAppointment = formatAppointmentForDisplay(appointment);
  
  if (!formattedAppointment) return null;

  const {
    formattedDate,
    formattedTimeSlot,
    relativeTime,
    statusLabel,
    wasteTypeBadges,
    canCancel,
    canReschedule,
    estimatedAmount,
    specialInstructions,
    zone,
    vehicle,
    status,
  } = formattedAppointment;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={getStatusBadgeClass(status)}>
              {statusLabel}
            </span>
            {relativeTime && (
              <span className="text-sm text-gray-500">
                {relativeTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-3 mb-4">
        {/* Date & Time */}
        <div className="flex items-start">
          <FiCalendar className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={18} />
          <div>
            <p className="text-gray-900 font-medium">{formattedDate}</p>
            {formattedTimeSlot && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <FiClock className="mr-1" size={14} />
                {formattedTimeSlot}
              </p>
            )}
          </div>
        </div>

        {/* Waste Types */}
        <div className="flex items-start">
          <FiPackage className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Waste Types</p>
            <div className="flex flex-wrap gap-2">
              {wasteTypeBadges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
            {estimatedAmount && (
              <p className="text-sm text-gray-500 mt-2">
                Estimated: <span className="font-medium">{estimatedAmount} kg</span>
              </p>
            )}
          </div>
        </div>

        {/* Zone (if available) */}
        {zone && !compact && (
          <div className="flex items-start">
            <FiMapPin className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm text-gray-600">Zone</p>
              <p className="text-gray-900 font-medium">
                {zone.name || zone.zoneName || `Zone ${zone.zoneNumber || ''}`}
              </p>
            </div>
          </div>
        )}

        {/* Vehicle (if assigned) */}
        {vehicle && !compact && (
          <div className="text-sm text-gray-600 ml-9">
            <span className="font-medium">Vehicle:</span>{' '}
            {vehicle.vehicleNumber || vehicle.registrationNumber || 'TBA'}
          </div>
        )}

        {/* Special Instructions */}
        {specialInstructions && !compact && (
          <div className="ml-9 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-900">
              <span className="font-medium">Note:</span> {specialInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(appointment)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FiEye className="mr-2" size={16} />
            View Details
          </button>
        )}
        
        {canReschedule && onUpdate && (
          <button
            onClick={() => onUpdate(appointment)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FiEdit className="mr-2" size={16} />
            Reschedule
          </button>
        )}
        
        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(appointment)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FiTrash2 className="mr-2" size={16} />
            Cancel
          </button>
        )}
      </div>

      {/* Cancellation Info (if cancelled) */}
      {status === 'cancelled' && appointment.cancellationReason && !compact && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-900">
            <span className="font-medium">Cancellation Reason:</span>{' '}
            {appointment.cancellationReason}
          </p>
          {appointment.cancelledAt && (
            <p className="text-xs text-red-700 mt-1">
              Cancelled on {new Date(appointment.cancelledAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
