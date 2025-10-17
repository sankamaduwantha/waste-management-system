/**
 * @fileoverview Task Store
 * @description Zustand store for task management state
 * @author Waste Management System
 * @version 1.0.0
 */

import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';

const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 10
  },
  filters: {
    status: '',
    category: '',
    priority: '',
    search: ''
  },
  statistics: null,

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Set filters
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  // Clear filters
  clearFilters: () => set({
    filters: {
      status: '',
      category: '',
      priority: '',
      search: ''
    }
  }),

  // Fetch all tasks with filters
  fetchTasks: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = await api.get('/tasks', {
        params: { ...filters, ...params }
      });

      set({
        tasks: response.data.data.tasks,
        pagination: response.data.data.pagination,
        loading: false
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  // Fetch single task
  fetchTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/tasks/${taskId}`);

      set({
        currentTask: response.data.data.task,
        loading: false
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/tasks', taskData);

      set({ loading: false });
      toast.success('Task created successfully');
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.task;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId, updateData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put(`/tasks/${taskId}`, updateData);

      set({ loading: false });
      toast.success('Task updated successfully');
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.task;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/tasks/${taskId}`);

      set({ loading: false });
      toast.success('Task deleted successfully');
      
      // Refresh task list
      get().fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Bulk assign tasks
  bulkAssignTasks: async (taskData, residentIds) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/tasks/bulk-assign', {
        taskData,
        residentIds
      });

      set({ loading: false });
      toast.success(response.data.message);
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.tasks;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Complete task (resident)
  completeTask: async (taskId, proof) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/tasks/${taskId}/complete`, { proof });

      set({ loading: false });
      toast.success('Task marked as completed');
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.task;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Verify task (manager)
  verifyTask: async (taskId, notes) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/tasks/${taskId}/verify`, { notes });

      set({ loading: false });
      toast.success('Task verified successfully');
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.task;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Reject task (manager)
  rejectTask: async (taskId, reason) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch(`/tasks/${taskId}/reject`, { reason });

      set({ loading: false });
      toast.success('Task rejected');
      
      // Refresh task list
      get().fetchTasks();
      
      return response.data.data.task;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject task';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Fetch task statistics
  fetchStatistics: async () => {
    try {
      const response = await api.get('/tasks/statistics');
      set({ statistics: response.data.data.statistics });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch statistics';
      toast.error(errorMessage);
    }
  },

  // Fetch resident tasks
  fetchMyTasks: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/tasks/my-tasks', { params });

      set({
        tasks: response.data.data.tasks,
        pagination: response.data.data.pagination,
        loading: false
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch your tasks';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  // Clear current task
  clearCurrentTask: () => set({ currentTask: null }),

  // Reset store
  reset: () => set({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      limit: 10
    },
    filters: {
      status: '',
      category: '',
      priority: '',
      search: ''
    },
    statistics: null
  })
}));

export default useTaskStore;
