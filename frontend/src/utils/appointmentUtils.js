/**
 * @fileoverview Appointment Constants and Utilities
 * @description Constants, date utilities, and helper functions for appointments
 */

// ============================================
// CONSTANTS
// ============================================

/**
 * Appointment Status Constants
 */
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

/**
 * Status Labels for Display
 */
export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pending',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
};

/**
 * Status Colors for UI
 */
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500',
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    badge: 'bg-blue-500',
  },
  [APPOINTMENT_STATUS.IN_PROGRESS]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    badge: 'bg-purple-500',
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    badge: 'bg-green-500',
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    badge: 'bg-red-500',
  },
  [APPOINTMENT_STATUS.NO_SHOW]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    badge: 'bg-gray-500',
  },
};

/**
 * Waste Type Constants
 */
export const WASTE_TYPES = {
  RECYCLABLE: 'recyclable',
  ORGANIC: 'organic',
  NON_RECYCLABLE: 'non-recyclable',
  HAZARDOUS: 'hazardous',
  BULKY: 'bulky',
};

/**
 * Waste Type Labels
 */
export const WASTE_TYPE_LABELS = {
  [WASTE_TYPES.RECYCLABLE]: 'Recyclable',
  [WASTE_TYPES.ORGANIC]: 'Organic',
  [WASTE_TYPES.NON_RECYCLABLE]: 'Non-Recyclable',
  [WASTE_TYPES.HAZARDOUS]: 'Hazardous',
  [WASTE_TYPES.BULKY]: 'Bulky Items',
};

/**
 * Waste Type Icons
 */
export const WASTE_TYPE_ICONS = {
  [WASTE_TYPES.RECYCLABLE]: '♻️',
  [WASTE_TYPES.ORGANIC]: '🌱',
  [WASTE_TYPES.NON_RECYCLABLE]: '🗑️',
  [WASTE_TYPES.HAZARDOUS]: '⚠️',
  [WASTE_TYPES.BULKY]: '📦',
};

/**
 * Waste Type Colors
 */
export const WASTE_TYPE_COLORS = {
  [WASTE_TYPES.RECYCLABLE]: 'bg-blue-500',
  [WASTE_TYPES.ORGANIC]: 'bg-green-500',
  [WASTE_TYPES.NON_RECYCLABLE]: 'bg-gray-500',
  [WASTE_TYPES.HAZARDOUS]: 'bg-red-500',
  [WASTE_TYPES.BULKY]: 'bg-purple-500',
};

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateToISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "Oct 15, 2025")
 */
export const formatDateForDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTimeForDisplay = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format time slot
 * @param {Object} timeSlot - Time slot {start, end}
 * @returns {string} Formatted time slot (e.g., "09:00 AM - 10:00 AM")
 */
export const formatTimeSlot = (timeSlot) => {
  if (!timeSlot || !timeSlot.start || !timeSlot.end) return '';
  
  const formatTime = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(timeSlot.start)} - ${formatTime(timeSlot.end)}`;
};

/**
 * Get day name from date
 * @param {Date|string} date - Date
 * @returns {string} Day name (e.g., "Monday")
 */
export const getDayName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === tomorrow.getDate() &&
    checkDate.getMonth() === tomorrow.getMonth() &&
    checkDate.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get relative time string
 * @param {Date|string} date - Date
 * @returns {string} Relative time (e.g., "in 2 days", "yesterday")
 */
export const getRelativeTimeString = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  
  const checkDate = new Date(date);
  const today = new Date();
  const diffTime = checkDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 0) return `in ${diffDays} days`;
  return formatDateForDisplay(date);
};

/**
 * Get minimum bookable date (1 hour from now)
 * @returns {Date} Minimum date
 */
export const getMinimumBookableDate = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return date;
};

/**
 * Get maximum bookable date (30 days from now)
 * @returns {Date} Maximum date
 */
export const getMaximumBookableDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
};

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Validate appointment date
 * @param {Date|string} date - Date to validate
 * @returns {Object} {valid, message}
 */
export const validateAppointmentDate = (date) => {
  if (!date) {
    return { valid: false, message: 'Please select a date' };
  }
  
  const appointmentDate = new Date(date);
  const minDate = getMinimumBookableDate();
  const maxDate = getMaximumBookableDate();
  
  if (appointmentDate < minDate) {
    return { valid: false, message: 'Appointment must be at least 1 hour in advance' };
  }
  
  if (appointmentDate > maxDate) {
    return { valid: false, message: 'Cannot book more than 30 days in advance' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate time slot
 * @param {Object} timeSlot - Time slot {start, end}
 * @returns {Object} {valid, message}
 */
export const validateTimeSlot = (timeSlot) => {
  if (!timeSlot || !timeSlot.start || !timeSlot.end) {
    return { valid: false, message: 'Please select a time slot' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate waste types
 * @param {Array} wasteTypes - Array of waste types
 * @returns {Object} {valid, message}
 */
export const validateWasteTypes = (wasteTypes) => {
  if (!wasteTypes || wasteTypes.length === 0) {
    return { valid: false, message: 'Please select at least one waste type' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate estimated amount
 * @param {number} amount - Estimated amount in kg
 * @returns {Object} {valid, message}
 */
export const validateEstimatedAmount = (amount) => {
  if (!amount || amount <= 0) {
    return { valid: false, message: 'Please enter a valid amount' };
  }
  
  if (amount < 0.1) {
    return { valid: false, message: 'Amount must be at least 0.1 kg' };
  }
  
  if (amount > 1000) {
    return { valid: false, message: 'Amount cannot exceed 1000 kg' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate cancellation reason
 * @param {string} reason - Cancellation reason
 * @returns {Object} {valid, message}
 */
export const validateCancellationReason = (reason) => {
  if (!reason || reason.trim().length === 0) {
    return { valid: false, message: 'Please provide a reason for cancellation' };
  }
  
  if (reason.trim().length < 5) {
    return { valid: false, message: 'Reason must be at least 5 characters' };
  }
  
  if (reason.length > 300) {
    return { valid: false, message: 'Reason cannot exceed 300 characters' };
  }
  
  return { valid: true, message: '' };
};

// ============================================
// APPOINTMENT HELPERS
// ============================================

/**
 * Check if appointment can be cancelled
 * @param {Object} appointment - Appointment object
 * @returns {boolean} True if can be cancelled
 */
export const canCancelAppointment = (appointment) => {
  if (!appointment) return false;
  
  const validStatuses = ['pending', 'confirmed'];
  if (!validStatuses.includes(appointment.status)) return false;
  
  // Check if appointment is at least 1 hour in the future
  const appointmentDate = new Date(appointment.appointmentDate);
  const minDate = getMinimumBookableDate();
  
  return appointmentDate > minDate;
};

/**
 * Check if appointment can be rescheduled
 * @param {Object} appointment - Appointment object
 * @returns {boolean} True if can be rescheduled
 */
export const canRescheduleAppointment = (appointment) => {
  return canCancelAppointment(appointment); // Same logic
};

/**
 * Get appointment status badge class
 * @param {string} status - Appointment status
 * @returns {string} CSS classes for status badge
 */
export const getStatusBadgeClass = (status) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS[APPOINTMENT_STATUS.PENDING];
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`;
};

/**
 * Get waste type badges
 * @param {Array} wasteTypes - Array of waste types
 * @returns {Array} Array of badge objects {label, icon, color}
 */
export const getWasteTypeBadges = (wasteTypes) => {
  if (!wasteTypes || wasteTypes.length === 0) return [];
  
  return wasteTypes.map(type => ({
    label: WASTE_TYPE_LABELS[type] || type,
    icon: WASTE_TYPE_ICONS[type] || '📦',
    color: WASTE_TYPE_COLORS[type] || 'bg-gray-500',
  }));
};

/**
 * Format appointment for display
 * @param {Object} appointment - Appointment object
 * @returns {Object} Formatted appointment data
 */
export const formatAppointmentForDisplay = (appointment) => {
  if (!appointment) return null;
  
  return {
    ...appointment,
    formattedDate: formatDateForDisplay(appointment.appointmentDate),
    formattedDateTime: formatDateTimeForDisplay(appointment.appointmentDate),
    formattedTimeSlot: formatTimeSlot(appointment.timeSlot),
    relativeTime: getRelativeTimeString(appointment.appointmentDate),
    dayName: getDayName(appointment.appointmentDate),
    statusLabel: STATUS_LABELS[appointment.status] || appointment.status,
    statusColor: STATUS_COLORS[appointment.status],
    wasteTypeBadges: getWasteTypeBadges(appointment.wasteTypes),
    canCancel: canCancelAppointment(appointment),
    canReschedule: canRescheduleAppointment(appointment),
  };
};

/**
 * Sort appointments by date
 * @param {Array} appointments - Array of appointments
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted appointments
 */
export const sortAppointmentsByDate = (appointments, order = 'desc') => {
  if (!appointments || appointments.length === 0) return [];
  
  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filter appointments by status
 * @param {Array} appointments - Array of appointments
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered appointments
 */
export const filterAppointmentsByStatus = (appointments, status) => {
  if (!appointments || appointments.length === 0) return [];
  if (!status) return appointments;
  
  return appointments.filter(apt => apt.status === status);
};

/**
 * Get upcoming appointments
 * @param {Array} appointments - Array of appointments
 * @returns {Array} Upcoming appointments
 */
export const getUpcomingAppointments = (appointments) => {
  if (!appointments || appointments.length === 0) return [];
  
  const now = new Date();
  return appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate > now && ['pending', 'confirmed'].includes(apt.status);
  });
};

/**
 * Get past appointments
 * @param {Array} appointments - Array of appointments
 * @returns {Array} Past appointments
 */
export const getPastAppointments = (appointments) => {
  if (!appointments || appointments.length === 0) return [];
  
  const now = new Date();
  return appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate < now || ['completed', 'cancelled', 'no-show'].includes(apt.status);
  });
};

export default {
  // Constants
  APPOINTMENT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  WASTE_TYPES,
  WASTE_TYPE_LABELS,
  WASTE_TYPE_ICONS,
  WASTE_TYPE_COLORS,
  
  // Date Utilities
  formatDateToISO,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatTimeSlot,
  getDayName,
  isToday,
  isTomorrow,
  isPastDate,
  getRelativeTimeString,
  getMinimumBookableDate,
  getMaximumBookableDate,
  
  // Validation
  validateAppointmentDate,
  validateTimeSlot,
  validateWasteTypes,
  validateEstimatedAmount,
  validateCancellationReason,
  
  // Helpers
  canCancelAppointment,
  canRescheduleAppointment,
  getStatusBadgeClass,
  getWasteTypeBadges,
  formatAppointmentForDisplay,
  sortAppointmentsByDate,
  filterAppointmentsByStatus,
  getUpcomingAppointments,
  getPastAppointments,
};
