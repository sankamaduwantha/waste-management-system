/**
 * @fileoverview Custom Hook for Appointment Management
 * @description Combines appointmentStore with UI logic and utilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import useAppointmentStore from '../store/appointmentStore';
import {
  formatAppointmentForDisplay,
  sortAppointmentsByDate,
  filterAppointmentsByStatus,
  getUpcomingAppointments,
  getPastAppointments,
  validateAppointmentDate,
  validateTimeSlot,
  validateWasteTypes,
  validateEstimatedAmount,
  canCancelAppointment,
  canRescheduleAppointment,
  getMinimumBookableDate,
  formatDateToISO,
} from '../utils/appointmentUtils';

/**
 * Custom hook for appointment management with UI logic
 * @returns {Object} Appointment data and methods
 */
export const useAppointments = () => {
  // Get store state and actions
  const {
    appointments,
    availableSlots,
    selectedDate,
    selectedSlot,
    statistics,
    filters,
    pagination,
    loading,
    error,
    fetchAvailability,
    bookAppointment,
    fetchMyAppointments,
    updateAppointment,
    cancelAppointment,
    fetchStatistics,
    setFilters,
    clearFilters,
    setPagination,
    reset,
  } = useAppointmentStore();

  // Local UI state
  const [formErrors, setFormErrors] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Load appointments on mount
  useEffect(() => {
    fetchMyAppointments();
    fetchStatistics();
  }, [fetchMyAppointments, fetchStatistics]);

  // Formatted appointments
  const formattedAppointments = useMemo(() => {
    return appointments.map(formatAppointmentForDisplay);
  }, [appointments]);

  // Sorted appointments
  const sortedAppointments = useMemo(() => {
    return sortAppointmentsByDate(formattedAppointments, 'desc');
  }, [formattedAppointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    let result = sortedAppointments;
    
    if (filters.status) {
      result = filterAppointmentsByStatus(result, filters.status);
    }
    
    if (filters.startDate) {
      result = result.filter(apt => 
        new Date(apt.appointmentDate) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      result = result.filter(apt => 
        new Date(apt.appointmentDate) <= new Date(filters.endDate)
      );
    }
    
    return result;
  }, [sortedAppointments, filters]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return getUpcomingAppointments(formattedAppointments);
  }, [formattedAppointments]);

  // Past appointments
  const pastAppointments = useMemo(() => {
    return getPastAppointments(formattedAppointments);
  }, [formattedAppointments]);

  // Paginated appointments
  const paginatedAppointments = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, pagination.page, pagination.limit]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAppointments.length / pagination.limit);
  }, [filteredAppointments.length, pagination.limit]);

  // Check if date is available
  const checkDateAvailability = useCallback(async (date) => {
    const validation = validateAppointmentDate(date);
    if (!validation.valid) {
      return { available: false, message: validation.message };
    }
    
    const formattedDate = formatDateToISO(date);
    const slots = await fetchAvailability(formattedDate);
    
    return {
      available: slots && slots.length > 0,
      message: slots && slots.length > 0 
        ? `${slots.length} slots available` 
        : 'No slots available for this date',
      slots,
    };
  }, [fetchAvailability]);

  // Validate appointment form
  const validateAppointmentForm = useCallback((formData) => {
    const errors = {};
    
    // Validate date
    const dateValidation = validateAppointmentDate(formData.date);
    if (!dateValidation.valid) {
      errors.date = dateValidation.message;
    }
    
    // Validate time slot
    const slotValidation = validateTimeSlot(formData.timeSlot);
    if (!slotValidation.valid) {
      errors.timeSlot = slotValidation.message;
    }
    
    // Validate waste types
    const wasteTypesValidation = validateWasteTypes(formData.wasteTypes);
    if (!wasteTypesValidation.valid) {
      errors.wasteTypes = wasteTypesValidation.message;
    }
    
    // Validate estimated amount
    const amountValidation = validateEstimatedAmount(formData.estimatedAmount);
    if (!amountValidation.valid) {
      errors.estimatedAmount = amountValidation.message;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  // Book new appointment
  const handleBookAppointment = useCallback(async (formData) => {
    // Validate form
    if (!validateAppointmentForm(formData)) {
      return { success: false, message: 'Please fix form errors' };
    }
    
    // Book appointment
    const result = await bookAppointment({
      appointmentDate: formData.date,
      timeSlot: formData.timeSlot,
      wasteTypes: formData.wasteTypes,
      estimatedAmount: formData.estimatedAmount,
      specialInstructions: formData.specialInstructions || '',
    });
    
    if (result.success) {
      setFormErrors({});
      // Refresh appointments and statistics
      fetchMyAppointments();
      fetchStatistics();
    }
    
    return result;
  }, [validateAppointmentForm, bookAppointment, fetchMyAppointments, fetchStatistics]);

  // Update appointment
  const handleUpdateAppointment = useCallback(async (appointmentId, updates) => {
    const result = await updateAppointment(appointmentId, updates);
    
    if (result.success) {
      // Refresh appointments and statistics
      fetchMyAppointments();
      fetchStatistics();
    }
    
    return result;
  }, [updateAppointment, fetchMyAppointments, fetchStatistics]);

  // Reschedule appointment
  const handleRescheduleAppointment = useCallback(async (appointmentId, newDate, newTimeSlot) => {
    const appointment = appointments.find(apt => apt._id === appointmentId);
    
    if (!appointment) {
      return { success: false, message: 'Appointment not found' };
    }
    
    if (!canRescheduleAppointment(appointment)) {
      return { success: false, message: 'This appointment cannot be rescheduled' };
    }
    
    return handleUpdateAppointment(appointmentId, {
      appointmentDate: newDate,
      timeSlot: newTimeSlot,
    });
  }, [appointments, handleUpdateAppointment]);

  // Cancel appointment
  const handleCancelAppointment = useCallback(async (appointmentId, reason) => {
    const appointment = appointments.find(apt => apt._id === appointmentId);
    
    if (!appointment) {
      return { success: false, message: 'Appointment not found' };
    }
    
    if (!canCancelAppointment(appointment)) {
      return { success: false, message: 'This appointment cannot be cancelled' };
    }
    
    const result = await cancelAppointment(appointmentId, reason);
    
    if (result.success) {
      // Refresh appointments and statistics
      fetchMyAppointments();
      fetchStatistics();
      setSelectedAppointment(null);
    }
    
    return result;
  }, [appointments, cancelAppointment, fetchMyAppointments, fetchStatistics]);

  // Select appointment
  const handleSelectAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
  }, []);

  // Clear selected appointment
  const handleClearSelection = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters({ [filterName]: value });
    setPagination({ page: 1 }); // Reset to first page
  }, [setFilters, setPagination]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setPagination({ page: 1 });
  }, [clearFilters, setPagination]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination({ page: newPage });
  }, [setPagination]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newLimit) => {
    setPagination({ limit: newLimit, page: 1 });
  }, [setPagination]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchMyAppointments(),
      fetchStatistics(),
    ]);
  }, [fetchMyAppointments, fetchStatistics]);

  return {
    // Appointment data
    appointments: formattedAppointments,
    sortedAppointments,
    filteredAppointments,
    paginatedAppointments,
    upcomingAppointments,
    pastAppointments,
    selectedAppointment,
    
    // Availability
    availableSlots,
    selectedDate,
    selectedSlot,
    
    // Statistics
    statistics,
    
    // Filters & Pagination
    filters,
    pagination,
    totalPages,
    
    // Loading & Errors
    loading,
    error,
    formErrors,
    
    // Actions
    fetchAvailability,
    checkDateAvailability,
    bookAppointment: handleBookAppointment,
    updateAppointment: handleUpdateAppointment,
    rescheduleAppointment: handleRescheduleAppointment,
    cancelAppointment: handleCancelAppointment,
    fetchMyAppointments,
    fetchStatistics,
    
    // Selection
    selectAppointment: handleSelectAppointment,
    clearSelection: handleClearSelection,
    
    // Filters & Pagination handlers
    setFilters: handleFilterChange,
    clearFilters: handleClearFilters,
    changePage: handlePageChange,
    changeItemsPerPage: handleItemsPerPageChange,
    
    // Validation
    validateForm: validateAppointmentForm,
    
    // Utility
    refresh: handleRefresh,
    reset,
  };
};

/**
 * Hook for appointment calendar with date selection
 * @returns {Object} Calendar-specific data and methods
 */
export const useAppointmentCalendar = () => {
  const { fetchAvailability, availableSlots, selectedDate, loading } = useAppointmentStore();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDaySlots, setSelectedDaySlots] = useState([]);
  
  // Get minimum and maximum dates
  const minDate = useMemo(() => getMinimumBookableDate(), []);
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }, []);
  
  // Handle date selection
  const handleDateSelect = useCallback(async (date) => {
    const formattedDate = formatDateToISO(date);
    const slots = await fetchAvailability(formattedDate);
    setSelectedDaySlots(slots || []);
  }, [fetchAvailability]);
  
  // Handle month change
  const handleMonthChange = useCallback((direction) => {
    setCalendarMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  }, []);
  
  // Check if date is selectable
  const isDateSelectable = useCallback((date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= minDate && checkDate <= maxDate;
  }, [minDate, maxDate]);
  
  return {
    calendarMonth,
    selectedDate,
    selectedDaySlots,
    availableSlots,
    minDate,
    maxDate,
    loading,
    selectDate: handleDateSelect,
    changeMonth: handleMonthChange,
    isDateSelectable,
  };
};

/**
 * Hook for appointment statistics
 * @returns {Object} Statistics data and methods
 */
export const useAppointmentStatistics = () => {
  const { statistics, loading, fetchStatistics } = useAppointmentStore();
  
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);
  
  // Format statistics for display
  const formattedStatistics = useMemo(() => {
    if (!statistics) return null;
    
    return {
      totalAppointments: statistics.totalAppointments || 0,
      completedAppointments: statistics.completedAppointments || 0,
      cancelledAppointments: statistics.cancelledAppointments || 0,
      upcomingAppointments: statistics.upcomingAppointments || 0,
      completionRate: statistics.completionRate || 0,
      cancellationRate: statistics.cancellationRate || 0,
      totalWasteCollected: statistics.totalWasteCollected || 0,
      averageWastePerAppointment: statistics.averageWastePerAppointment || 0,
    };
  }, [statistics]);
  
  return {
    statistics: formattedStatistics,
    loading,
    refresh: fetchStatistics,
  };
};

export default useAppointments;
