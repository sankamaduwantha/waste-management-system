import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const useRewardStore = create((set, get) => ({
  // State
  rewards: [],
  claims: [],
  myClaims: [],
  currentReward: null,
  statistics: null,
  loading: false,
  error: null,
  
  // Filters
  filters: {
    category: '',
    status: '',
    minPoints: '',
    maxPoints: '',
    search: ''
  },
  
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  
  // Actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    pagination: { ...state.pagination, currentPage: 1 }
  })),
  
  setPage: (page) => set((state) => ({
    pagination: { ...state.pagination, currentPage: page }
  })),
  
  // Fetch all rewards
  fetchRewards: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.minPoints) params.append('minPoints', filters.minPoints);
      if (filters.maxPoints) params.append('maxPoints', filters.maxPoints);
      if (filters.search) params.append('search', filters.search);
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.itemsPerPage);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rewards?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        rewards: response.data.data.rewards,
        pagination: {
          currentPage: response.data.data.currentPage,
          totalPages: response.data.data.totalPages,
          totalItems: response.data.data.totalRewards,
          itemsPerPage: response.data.data.limit
        },
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch rewards',
        loading: false
      });
    }
  },
  
  // Fetch single reward
  fetchReward: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rewards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        currentReward: response.data.data.reward,
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch reward',
        loading: false
      });
    }
  },
  
  // Create reward
  createReward: async (rewardData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/rewards`, rewardData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        rewards: [response.data.data.reward, ...state.rewards],
        loading: false
      }));
      
      return response.data.data.reward;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create reward',
        loading: false
      });
      throw error;
    }
  },
  
  // Update reward
  updateReward: async (id, rewardData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/rewards/${id}`, rewardData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        rewards: state.rewards.map((r) =>
          r._id === id ? response.data.data.reward : r
        ),
        currentReward: response.data.data.reward,
        loading: false
      }));
      
      return response.data.data.reward;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update reward',
        loading: false
      });
      throw error;
    }
  },
  
  // Delete reward
  deleteReward: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/rewards/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        rewards: state.rewards.filter((r) => r._id !== id),
        loading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete reward',
        loading: false
      });
      throw error;
    }
  },
  
  // Claim reward (for residents)
  claimReward: async (rewardId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/rewards/${rewardId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set({ loading: false });
      return response.data.data.claim;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to claim reward',
        loading: false
      });
      throw error;
    }
  },
  
  // Fetch all claims (for managers)
  fetchClaims: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.residentId) params.append('resident', filters.residentId);
      if (filters.rewardId) params.append('reward', filters.rewardId);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rewards/claims?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        claims: response.data.data.claims,
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch claims',
        loading: false
      });
    }
  },
  
  // Fetch my claims (for residents)
  fetchMyClaims: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rewards/my-claims`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        myClaims: response.data.data.claims,
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch your claims',
        loading: false
      });
    }
  },
  
  // Approve claim
  approveClaim: async (claimId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/rewards/claims/${claimId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set((state) => ({
        claims: state.claims.map((c) =>
          c._id === claimId ? response.data.data.claim : c
        ),
        loading: false
      }));
      
      return response.data.data.claim;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to approve claim',
        loading: false
      });
      throw error;
    }
  },
  
  // Mark claim as delivered
  markDelivered: async (claimId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/rewards/claims/${claimId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set((state) => ({
        claims: state.claims.map((c) =>
          c._id === claimId ? response.data.data.claim : c
        ),
        loading: false
      }));
      
      return response.data.data.claim;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to mark as delivered',
        loading: false
      });
      throw error;
    }
  },
  
  // Fetch statistics
  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rewards/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        statistics: response.data.data.statistics,
        loading: false
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch statistics',
        loading: false
      });
    }
  },
  
  // Award points to resident
  awardPoints: async (residentId, points, reason) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/rewards/award-points`,
        { residentId, points, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set({ loading: false });
      return response.data.data.user;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to award points',
        loading: false
      });
      throw error;
    }
  },
  
  // Clear error
  clearError: () => set({ error: null }),
  
  // Reset filters
  resetFilters: () => set({
    filters: {
      category: '',
      status: '',
      minPoints: '',
      maxPoints: '',
      search: ''
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    }
  })
}));

export default useRewardStore;
