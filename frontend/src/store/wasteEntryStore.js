/**
 * @fileoverview Waste Entry Store
 * @description State management for waste entries using Zustand
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Singleton Pattern: Single store instance
 * - Observer Pattern: Reactive state updates
 * - Facade Pattern: Simplified API interface
 * 
 * @solid-principles
 * - Single Responsibility: Manages only waste entry state
 * - Open/Closed: Extensible through additional actions
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';

const useWasteEntryStore = create(
  devtools(
    (set, get) => ({
      // ========================================================================
      // STATE
      // ========================================================================
      entries: [],
      currentEntry: null,
      statistics: null,
      chartData: null,
      trendData: null,
      loading: false,
      error: null,
      
      // Pagination
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      },

      // Filters
      filters: {
        startDate: null,
        endDate: null,
        location: null
      },

      // Modal state
      isModalOpen: false,
      modalMode: 'create', // 'create' or 'edit'

      // ========================================================================
      // ACTIONS - CRUD Operations
      // ========================================================================

      /**
       * Fetch all waste entries for current user
       */
      fetchEntries: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
          if (filters.location) params.append('location', filters.location);
          if (filters.page) params.append('page', filters.page);
          if (filters.limit) params.append('limit', filters.limit);
          if (filters.sortBy) params.append('sortBy', filters.sortBy);

          const response = await api.get(`/waste-entries?${params.toString()}`);
          
          set({
            entries: response.data.entries,
            pagination: response.data.pagination,
            loading: false
          });

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Fetch single waste entry by ID
       */
      fetchEntryById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/waste-entries/${id}`);
          
          set({
            currentEntry: response.data.entry,
            loading: false
          });

          return { success: true, data: response.data.entry };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Create new waste entry
       */
      createEntry: async (entryData) => {
        set({ loading: true, error: null });
        try {
          console.log('📝 Creating waste entry...', entryData);
          const response = await api.post('/waste-entries', entryData);
          
          const newEntry = response.data.entry;
          console.log('✅ Waste entry created:', newEntry);
          
          set((state) => ({
            entries: [newEntry, ...state.entries],
            loading: false,
            isModalOpen: false
          }));

          // Refresh statistics and chart data
          console.log('🔄 Refreshing statistics and chart data...');
          await get().fetchStatistics(30);
          await get().fetchChartData(30);
          console.log('✅ Data refreshed successfully');

          return { success: true, data: newEntry };
        } catch (error) {
          console.error('❌ Failed to create entry:', error);
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Update existing waste entry
       */
      updateEntry: async (id, updateData) => {
        set({ loading: true, error: null });
        try {
          console.log('📝 Updating waste entry...', id, updateData);
          const response = await api.put(`/waste-entries/${id}`, updateData);
          
          const updatedEntry = response.data.entry;
          console.log('✅ Waste entry updated:', updatedEntry);
          
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.id === id ? updatedEntry : entry
            ),
            currentEntry: updatedEntry,
            loading: false,
            isModalOpen: false
          }));

          // Refresh statistics and chart data
          console.log('🔄 Refreshing statistics and chart data...');
          await get().fetchStatistics(30);
          await get().fetchChartData(30);
          console.log('✅ Data refreshed successfully');

          return { success: true, data: updatedEntry };
        } catch (error) {
          console.error('❌ Failed to update entry:', error);
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Delete waste entry
       */
      deleteEntry: async (id) => {
        set({ loading: true, error: null });
        try {
          console.log('🗑️ Deleting waste entry...', id);
          await api.delete(`/waste-entries/${id}`);
          
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== id),
            loading: false
          }));

          // Refresh statistics and chart data
          console.log('🔄 Refreshing statistics and chart data...');
          await get().fetchStatistics(30);
          await get().fetchChartData(30);
          console.log('✅ Data refreshed successfully');

          return { success: true };
        } catch (error) {
          console.error('❌ Failed to delete entry:', error);
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      // ========================================================================
      // ACTIONS - Data Fetching
      // ========================================================================

      /**
       * Fetch user statistics
       */
      fetchStatistics: async (days = 30) => {
        set({ loading: true, error: null });
        try {
          console.log(`📊 Fetching statistics for ${days} days...`);
          const response = await api.get(`/waste-entries/statistics?days=${days}`);
          
          console.log('✅ Raw statistics response:', response);
          console.log('✅ Statistics data:', response.data);
          
          const statistics = response.data.statistics || response.data.data?.statistics;
          console.log('✅ Extracted statistics:', statistics);
          
          set({
            statistics: statistics,
            loading: false
          });

          return { success: true, data: statistics };
        } catch (error) {
          console.error('❌ Failed to fetch statistics:', error);
          console.error('❌ Error response:', error.response);
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Fetch chart data for circular chart
       */
      fetchChartData: async (days = 30) => {
        set({ loading: true, error: null });
        try {
          console.log(`📈 Fetching chart data for ${days} days...`);
          const response = await api.get(`/waste-entries/chart-data?days=${days}`);
          
          console.log('✅ Raw API response:', response);
          console.log('✅ Chart data from API:', response.data);
          console.log('✅ Chart data object:', response.data.chartData);
          
          const chartData = response.data.chartData || response.data.data?.chartData;
          console.log('✅ Chart data to store:', chartData);
          
          set({
            chartData: chartData,
            loading: false
          });

          return { success: true, data: chartData };
        } catch (error) {
          console.error('❌ Failed to fetch chart data:', error);
          console.error('❌ Error response:', error.response);
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Fetch trend data for line chart
       */
      fetchTrendData: async (days = 7) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/waste-entries/trend?days=${days}`);
          
          set({
            trendData: response.data.trend,
            loading: false
          });

          return { success: true, data: response.data.trend };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          set({ error: errorMessage, loading: false });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Check if entry exists for today
       */
      checkTodayEntry: async () => {
        try {
          const response = await api.get('/waste-entries/check-today');
          return response.data.hasEntry;
        } catch (error) {
          return false;
        }
      },

      // ========================================================================
      // ACTIONS - UI State Management
      // ========================================================================

      /**
       * Set filters
       */
      setFilters: (filters) => {
        set({ filters });
      },

      /**
       * Clear filters
       */
      clearFilters: () => {
        set({
          filters: {
            startDate: null,
            endDate: null,
            location: null
          }
        });
      },

      /**
       * Set pagination page
       */
      setPage: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, page }
        }));
      },

      /**
       * Open modal
       */
      openModal: (mode = 'create', entry = null) => {
        set({
          isModalOpen: true,
          modalMode: mode,
          currentEntry: entry
        });
      },

      /**
       * Close modal
       */
      closeModal: () => {
        set({
          isModalOpen: false,
          modalMode: 'create',
          currentEntry: null
        });
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
        set({
          entries: [],
          currentEntry: null,
          statistics: null,
          chartData: null,
          trendData: null,
          loading: false,
          error: null,
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          },
          filters: {
            startDate: null,
            endDate: null,
            location: null
          },
          isModalOpen: false,
          modalMode: 'create'
        });
      }
    }),
    { name: 'wasteEntryStore' }
  )
);

export default useWasteEntryStore;
