/**
 * @fileoverview Performance Store
 * @description Global state management for performance analytics
 * @author Waste Management System
 * @version 1.0.0
 */

import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';

const usePerformanceStore = create((set, get) => ({
  // State
  reports: [],
  currentReport: null,
  leaderboard: [],
  analytics: null,
  categoryAnalytics: [],
  trends: [],
  topPerformers: [],
  environmentalImpact: null,
  zoneComparison: [],
  dashboardStats: null,
  loading: false,
  error: null,
  
  // Filters
  filters: {
    period: 'monthly',
    zone: null,
    limit: 10,
    months: 6
  },

  // Actions

  /**
   * Fetch all performance reports
   */
  fetchReports: async (customFilters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const filters = { ...get().filters, ...customFilters };
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await api.get(`/performance?${queryParams}`);
      
      set({ 
        reports: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch reports',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  /**
   * Fetch single performance report
   */
  fetchReport: async (reportId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/${reportId}`);
      
      set({ 
        currentReport: response.data.data,
        loading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch report',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch report');
      throw error;
    }
  },

  /**
   * Generate performance report
   */
  generateReport: async (residentId, period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post('/performance/generate', {
        residentId,
        period
      });
      
      set({ loading: false });
      toast.success('Performance report generated successfully');
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to generate report',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to generate report');
      throw error;
    }
  },

  /**
   * Fetch leaderboard
   */
  fetchLeaderboard: async (customFilters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const filters = { ...get().filters, ...customFilters };
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await api.get(`/performance/leaderboard?${queryParams}`);
      
      set({ 
        leaderboard: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch leaderboard',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  },

  /**
   * Fetch resident analytics
   */
  fetchResidentAnalytics: async (residentId, period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/resident/${residentId}/analytics?period=${period}`);
      
      set({ 
        analytics: response.data.data,
        loading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch analytics',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      throw error;
    }
  },

  /**
   * Fetch my analytics (for logged-in resident)
   */
  fetchMyAnalytics: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/my/analytics?period=${period}`);
      
      set({ 
        analytics: response.data.data,
        loading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch your analytics',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch your analytics');
      throw error;
    }
  },

  /**
   * Fetch category analytics
   */
  fetchCategoryAnalytics: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/analytics/categories?period=${period}`);
      
      set({ 
        categoryAnalytics: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch category analytics',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch category analytics');
    }
  },

  /**
   * Fetch completion trends
   */
  fetchTrends: async (residentId = null, months = 6) => {
    try {
      set({ loading: true, error: null });
      
      const params = new URLSearchParams();
      if (residentId) params.append('residentId', residentId);
      params.append('months', months);

      const response = await api.get(`/performance/trends?${params.toString()}`);
      
      set({ 
        trends: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch trends',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch trends');
    }
  },

  /**
   * Fetch top performers
   */
  fetchTopPerformers: async (customFilters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const filters = { period: get().filters.period, limit: 5, ...customFilters };
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await api.get(`/performance/top-performers?${queryParams}`);
      
      set({ 
        topPerformers: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch top performers',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch top performers');
    }
  },

  /**
   * Fetch environmental impact
   */
  fetchEnvironmentalImpact: async (customFilters = {}) => {
    try {
      set({ loading: true, error: null });
      
      const filters = { period: get().filters.period, ...customFilters };
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await api.get(`/performance/environmental-impact?${queryParams}`);
      
      set({ 
        environmentalImpact: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch environmental impact',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch environmental impact');
    }
  },

  /**
   * Fetch zone comparison
   */
  fetchZoneComparison: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/zones/comparison?period=${period}`);
      
      set({ 
        zoneComparison: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch zone comparison',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch zone comparison');
    }
  },

  /**
   * Fetch dashboard stats
   */
  fetchDashboardStats: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/performance/dashboard/stats?period=${period}`);
      
      set({ 
        dashboardStats: response.data.data,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch dashboard stats',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  /**
   * Bulk generate reports
   */
  bulkGenerateReports: async (period = 'monthly') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post('/performance/bulk-generate', { period });
      
      set({ loading: false });
      toast.success(response.data.message);
      
      return response.data.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to bulk generate reports',
        loading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to bulk generate reports');
      throw error;
    }
  },

  /**
   * Set filters
   */
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters } 
    });
  },

  /**
   * Clear filters
   */
  clearFilters: () => {
    set({
      filters: {
        period: 'monthly',
        zone: null,
        limit: 10,
        months: 6
      }
    });
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      reports: [],
      currentReport: null,
      leaderboard: [],
      analytics: null,
      categoryAnalytics: [],
      trends: [],
      topPerformers: [],
      environmentalImpact: null,
      zoneComparison: [],
      dashboardStats: null,
      loading: false,
      error: null,
      filters: {
        period: 'monthly',
        zone: null,
        limit: 10,
        months: 6
      }
    });
  }
}));

export default usePerformanceStore;
