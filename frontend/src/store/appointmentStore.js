/**
 * @fileoverview Appointment Store
 * @description Zustand store for appointment state management
 * 
 * @module store/appointmentStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';
import { toast } from 'react-toastify';

/**
 * Appointment Store
 * @description Manages appointment-related state and operations
 */
const useAppointmentStore = create(
  devtools(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================
      
      // Appointments data
      appointments: [],
      upcomingAppointments: [],
      pastAppointments: [],
      selectedAppointment: null,
      
      // Availability data
      availableSlots: [],
      availableDates: [],
      selectedDate: null,
      selectedSlot: null,
      
      // Statistics
      statistics: null,
      
      // UI state
      loading: false,
      error: null,
      isBooking: false,
      isCancelling: false,
      isUpdating: false,
      
      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
      
      // Filters
      filters: {
        status: null,
        startDate: null,
        endDate: null,
      },

      // ============================================
      // ACTIONS - AVAILABILITY
      // ============================================

      /**
       * Fetch available slots for a specific date
       * @param {string} date - Date in YYYY-MM-DD format
       */
      fetchAvailability: async (date) => {
        console.log('📅 Fetching availability for:', date);
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/appointments/availability?date=${date}`);
          
          console.log('✅ Availability fetched:', response.data);
          
          set({
            availableSlots: response.data.data.slots || [],
            selectedDate: date,
            loading: false,
          });
          
          return response.data.data.slots;
        } catch (error) {
          console.error('❌ Failed to fetch availability:', error);
          const errorMessage = error.response?.data?.message || 'Failed to fetch available slots';
          
          set({ 
            error: errorMessage, 
            loading: false,
            availableSlots: [],
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Fetch available dates
       * @param {number} days - Number of days to fetch (default: 30)
       */
      fetchAvailableDates: async (days = 30) => {
        console.log('📆 Fetching available dates for next', days, 'days');
        
        try {
          const response = await api.get(`/appointments/available-dates?days=${days}`);
          
          console.log('✅ Available dates fetched:', response.data);
          
          set({
            availableDates: response.data.data.dates || [],
          });
          
          return response.data.data.dates;
        } catch (error) {
          console.error('❌ Failed to fetch available dates:', error);
          toast.error('Failed to fetch available dates');
          return [];
        }
      },

      /**
       * Find next available slot
       */
      findNextAvailableSlot: async () => {
        console.log('🔍 Finding next available slot');
        
        try {
          const response = await api.get('/appointments/next-available');
          
          if (response.data.data.slot) {
            console.log('✅ Next available slot found:', response.data.data.slot);
            toast.success('Next available slot found!');
            return response.data.data.slot;
          } else {
            toast.info('No available slots found in the next 30 days');
            return null;
          }
        } catch (error) {
          console.error('❌ Failed to find next available slot:', error);
          toast.error('Failed to find next available slot');
          return null;
        }
      },

      /**
       * Select a time slot
       * @param {Object} slot - Selected slot {start, end}
       */
      selectSlot: (slot) => {
        console.log('🎯 Slot selected:', slot);
        set({ selectedSlot: slot });
      },

      /**
       * Clear selected slot
       */
      clearSelection: () => {
        console.log('🔄 Clearing selection');
        set({ 
          selectedSlot: null,
          selectedDate: null,
          availableSlots: [],
        });
      },

      // ============================================
      // ACTIONS - APPOINTMENTS
      // ============================================

      /**
       * Book a new appointment
       * @param {Object} appointmentData - Appointment details
       */
      bookAppointment: async (appointmentData) => {
        console.log('📝 Booking appointment:', appointmentData);
        set({ isBooking: true, error: null });
        
        try {
          const response = await api.post('/appointments', appointmentData);
          
          console.log('✅ Appointment booked successfully:', response.data);
          
          const newAppointment = response.data.data.appointment;
          
          set((state) => ({
            appointments: [newAppointment, ...state.appointments],
            upcomingAppointments: [newAppointment, ...state.upcomingAppointments],
            isBooking: false,
            selectedSlot: null,
            selectedDate: null,
          }));
          
          toast.success('Appointment booked successfully! 🎉');
          
          // Refresh statistics
          get().fetchStatistics();
          
          return newAppointment;
        } catch (error) {
          console.error('❌ Failed to book appointment:', error);
          const errorMessage = error.response?.data?.message || 'Failed to book appointment';
          
          set({ 
            error: errorMessage, 
            isBooking: false,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Fetch resident's appointments
       * @param {Object} filters - Filter options
       */
      fetchMyAppointments: async (filters = {}) => {
        console.log('📋 Fetching my appointments with filters:', filters);
        set({ loading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams({
            page: filters.page || get().pagination.page,
            limit: filters.limit || get().pagination.limit,
            ...(filters.status && { status: filters.status }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
          }).toString();
          
          const response = await api.get(`/appointments/my-appointments?${queryParams}`);
          
          console.log('✅ Appointments fetched:', response.data);
          
          set({
            appointments: response.data.data.appointments || [],
            pagination: {
              page: response.data.data.page,
              limit: response.data.data.limit || 10,
              total: response.data.data.total,
              pages: response.data.data.pages,
            },
            filters,
            loading: false,
          });
          
          return response.data.data.appointments;
        } catch (error) {
          console.error('❌ Failed to fetch appointments:', error);
          const errorMessage = error.response?.data?.message || 'Failed to fetch appointments';
          
          set({ 
            error: errorMessage, 
            loading: false,
          });
          
          toast.error(errorMessage);
          return [];
        }
      },

      /**
       * Fetch appointment details
       * @param {string} appointmentId - Appointment ID
       */
      fetchAppointmentDetails: async (appointmentId) => {
        console.log('🔍 Fetching appointment details:', appointmentId);
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/appointments/${appointmentId}`);
          
          console.log('✅ Appointment details fetched:', response.data);
          
          set({
            selectedAppointment: response.data.data.appointment,
            loading: false,
          });
          
          return response.data.data.appointment;
        } catch (error) {
          console.error('❌ Failed to fetch appointment details:', error);
          const errorMessage = error.response?.data?.message || 'Failed to fetch appointment details';
          
          set({ 
            error: errorMessage, 
            loading: false,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Update appointment
       * @param {string} appointmentId - Appointment ID
       * @param {Object} updateData - Update data
       */
      updateAppointment: async (appointmentId, updateData) => {
        console.log('✏️ Updating appointment:', appointmentId, updateData);
        set({ isUpdating: true, error: null });
        
        try {
          const response = await api.patch(`/appointments/${appointmentId}`, updateData);
          
          console.log('✅ Appointment updated successfully:', response.data);
          
          const updatedAppointment = response.data.data.appointment;
          
          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt._id === appointmentId ? updatedAppointment : apt
            ),
            upcomingAppointments: state.upcomingAppointments.map((apt) =>
              apt._id === appointmentId ? updatedAppointment : apt
            ),
            selectedAppointment: updatedAppointment,
            isUpdating: false,
          }));
          
          toast.success('Appointment updated successfully! ✅');
          
          return updatedAppointment;
        } catch (error) {
          console.error('❌ Failed to update appointment:', error);
          const errorMessage = error.response?.data?.message || 'Failed to update appointment';
          
          set({ 
            error: errorMessage, 
            isUpdating: false,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Cancel appointment
       * @param {string} appointmentId - Appointment ID
       * @param {string} reason - Cancellation reason
       */
      cancelAppointment: async (appointmentId, reason) => {
        console.log('❌ Cancelling appointment:', appointmentId, 'Reason:', reason);
        set({ isCancelling: true, error: null });
        
        try {
          await api.delete(`/appointments/${appointmentId}`, {
            data: { reason },
          });
          
          console.log('✅ Appointment cancelled successfully');
          
          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
            ),
            upcomingAppointments: state.upcomingAppointments.filter(
              (apt) => apt._id !== appointmentId
            ),
            isCancelling: false,
          }));
          
          toast.success('Appointment cancelled successfully');
          
          // Refresh statistics
          get().fetchStatistics();
          
          return true;
        } catch (error) {
          console.error('❌ Failed to cancel appointment:', error);
          const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
          
          set({ 
            error: errorMessage, 
            isCancelling: false,
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      /**
       * Fetch appointment statistics
       */
      fetchStatistics: async () => {
        console.log('📊 Fetching appointment statistics');
        
        try {
          const response = await api.get('/appointments/statistics');
          
          console.log('✅ Statistics fetched:', response.data);
          
          set({
            statistics: response.data.data,
          });
          
          return response.data.data;
        } catch (error) {
          console.error('❌ Failed to fetch statistics:', error);
          return null;
        }
      },

      // ============================================
      // UTILITY ACTIONS
      // ============================================

      /**
       * Set filters
       * @param {Object} newFilters - New filter values
       */
      setFilters: (newFilters) => {
        console.log('🔧 Setting filters:', newFilters);
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      /**
       * Clear filters
       */
      clearFilters: () => {
        console.log('🔄 Clearing filters');
        set({
          filters: {
            status: null,
            startDate: null,
            endDate: null,
          },
        });
      },

      /**
       * Set pagination
       * @param {Object} pagination - Pagination values
       */
      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        }));
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Reset store
       */
      reset: () => {
        console.log('🔄 Resetting appointment store');
        set({
          appointments: [],
          upcomingAppointments: [],
          pastAppointments: [],
          selectedAppointment: null,
          availableSlots: [],
          availableDates: [],
          selectedDate: null,
          selectedSlot: null,
          statistics: null,
          loading: false,
          error: null,
          isBooking: false,
          isCancelling: false,
          isUpdating: false,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          },
          filters: {
            status: null,
            startDate: null,
            endDate: null,
          },
        });
      },
    }),
    { name: 'AppointmentStore' }
  )
);

export default useAppointmentStore;
