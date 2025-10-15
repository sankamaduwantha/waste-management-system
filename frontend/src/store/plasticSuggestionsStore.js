/**
 * @fileoverview Plastic Reduction Suggestions Store
 * @description Zustand store for managing plastic reduction suggestions state
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - State Management Pattern: Centralized state with Zustand
 * - Observer Pattern: Components subscribe to state changes
 * - Command Pattern: Actions encapsulate state mutations
 * 
 * @solid-principles
 * - Single Responsibility: Manages only plastic suggestions state
 * - Open/Closed: Extensible without modifying existing actions
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../services/api';

/**
 * @typedef {Object} PlasticSuggestion
 * @property {string} id - Unique identifier
 * @property {string} title - Suggestion title
 * @property {string} description - Detailed description
 * @property {string} category - Category type
 * @property {number} plasticSavedGrams - Plastic saved in grams
 * @property {string} plasticSavedFormatted - Formatted plastic saved
 * @property {number} moneySaved - Money saved amount
 * @property {string} difficulty - Difficulty level
 * @property {number} impactScore - Impact score (0-100)
 * @property {Array<string>} tags - Suggestion tags
 * @property {string} imageUrl - Image URL
 * @property {Object} statistics - View/implementation statistics
 * @property {Date} createdAt - Creation date
 */

const usePlasticSuggestionsStore = create(
  devtools(
    (set, get) => ({
      // ==================== STATE ====================
      
      suggestions: [],
      currentSuggestion: null,
      topSuggestions: [],
      statistics: null,
      
      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasMore: false
      },
      
      // Filters
      filters: {
        category: null,
        difficulty: null,
        minImpactScore: null,
        tags: [],
        search: ''
      },
      
      // UI State
      loading: false,
      error: null,
      isModalOpen: false,
      modalMode: null, // 'view' | 'create' | 'edit'
      
      // ==================== ACTIONS ====================
      
      /**
       * Fetch all suggestions with filters and pagination
       * @param {Object} options - Filter and pagination options
       */
      fetchSuggestions: async (options = {}) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams();
          
          // Apply filters
          const currentFilters = get().filters;
          if (options.category || currentFilters.category) {
            params.append('category', options.category || currentFilters.category);
          }
          if (options.difficulty || currentFilters.difficulty) {
            params.append('difficulty', options.difficulty || currentFilters.difficulty);
          }
          if (options.minImpactScore || currentFilters.minImpactScore) {
            params.append('minImpactScore', options.minImpactScore || currentFilters.minImpactScore);
          }
          if (options.search || currentFilters.search) {
            params.append('search', options.search || currentFilters.search);
          }
          if (options.tags || (currentFilters.tags && currentFilters.tags.length > 0)) {
            const tags = options.tags || currentFilters.tags;
            params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
          }
          
          // Apply pagination
          params.append('page', options.page || get().pagination.page);
          params.append('limit', options.limit || get().pagination.limit);
          params.append('sortBy', options.sortBy || '-impactScore');
          
          const response = await api.get(`/plastic-suggestions?${params.toString()}`);
          
          set({
            suggestions: response.data.data,
            pagination: response.data.pagination,
            filters: { ...get().filters, ...options },
            loading: false
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch suggestions';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Fetch single suggestion by ID
       * @param {string} id - Suggestion ID
       */
      fetchSuggestionById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/plastic-suggestions/${id}`);
          set({
            currentSuggestion: response.data.data,
            loading: false
          });
          return response.data.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch suggestion';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Fetch top suggestions
       * @param {number} limit - Number of suggestions to fetch
       */
      fetchTopSuggestions: async (limit = 5) => {
        try {
          const response = await api.get(`/plastic-suggestions/top/${limit}`);
          set({ topSuggestions: response.data.data });
          return response.data.data;
        } catch (error) {
          console.error('Failed to fetch top suggestions:', error);
          return [];
        }
      },
      
      /**
       * Search suggestions
       * @param {string} query - Search query
       */
      searchSuggestions: async (query) => {
        if (!query || query.trim().length < 2) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/plastic-suggestions/search?q=${encodeURIComponent(query)}`);
          set({
            suggestions: response.data.data,
            loading: false
          });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Search failed';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Fetch suggestions by category
       * @param {string} category - Category name
       */
      fetchByCategory: async (category) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/plastic-suggestions/category/${category}`);
          set({
            suggestions: response.data.data,
            filters: { ...get().filters, category },
            loading: false
          });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch category';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Create new suggestion (Admin only)
       * @param {Object} suggestionData - Suggestion data
       */
      createSuggestion: async (suggestionData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post('/plastic-suggestions', suggestionData);
          
          // Add to beginning of list
          set(state => ({
            suggestions: [response.data.data, ...state.suggestions],
            loading: false
          }));
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create suggestion';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Update suggestion (Admin only)
       * @param {string} id - Suggestion ID
       * @param {Object} updateData - Update data
       */
      updateSuggestion: async (id, updateData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.put(`/plastic-suggestions/${id}`, updateData);
          
          // Update in list
          set(state => ({
            suggestions: state.suggestions.map(s => 
              s.id === id ? response.data.data : s
            ),
            currentSuggestion: response.data.data,
            loading: false
          }));
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update suggestion';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Delete suggestion (Admin only)
       * @param {string} id - Suggestion ID
       */
      deleteSuggestion: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await api.delete(`/plastic-suggestions/${id}`);
          
          // Remove from list
          set(state => ({
            suggestions: state.suggestions.filter(s => s.id !== id),
            loading: false
          }));
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete suggestion';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
      
      /**
       * Mark suggestion as implemented
       * @param {string} id - Suggestion ID
       */
      markAsImplemented: async (id) => {
        try {
          const response = await api.post(`/plastic-suggestions/${id}/implement`);
          
          // Update statistics in list
          set(state => ({
            suggestions: state.suggestions.map(s => 
              s.id === id 
                ? { ...s, statistics: { ...s.statistics, implementations: response.data.data.implementations } }
                : s
            )
          }));
          
          return response.data;
        } catch (error) {
          console.error('Failed to mark as implemented:', error);
          throw error;
        }
      },
      
      /**
       * Fetch statistics
       */
      fetchStatistics: async () => {
        try {
          const response = await api.get('/plastic-suggestions/statistics');
          set({ statistics: response.data.data });
          return response.data.data;
        } catch (error) {
          console.error('Failed to fetch statistics:', error);
          return null;
        }
      },
      
      // ==================== UI ACTIONS ====================
      
      /**
       * Set filters
       * @param {Object} newFilters - New filter values
       */
      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 } // Reset to page 1 when filtering
        }));
      },
      
      /**
       * Clear filters
       */
      clearFilters: () => {
        set({
          filters: {
            category: null,
            difficulty: null,
            minImpactScore: null,
            tags: [],
            search: ''
          },
          pagination: { ...get().pagination, page: 1 }
        });
      },
      
      /**
       * Set page
       * @param {number} page - Page number
       */
      setPage: (page) => {
        set(state => ({
          pagination: { ...state.pagination, page }
        }));
      },
      
      /**
       * Open modal
       * @param {string} mode - Modal mode ('view' | 'create' | 'edit')
       * @param {Object} suggestion - Suggestion data (for view/edit)
       */
      openModal: (mode, suggestion = null) => {
        set({
          isModalOpen: true,
          modalMode: mode,
          currentSuggestion: suggestion
        });
      },
      
      /**
       * Close modal
       */
      closeModal: () => {
        set({
          isModalOpen: false,
          modalMode: null,
          currentSuggestion: null
        });
      },
      
      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    { name: 'plastic-suggestions-store' }
  )
);

export default usePlasticSuggestionsStore;
