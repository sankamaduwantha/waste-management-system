import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (credentials) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, data } = response.data
          
          localStorage.setItem('token', token)
          set({ 
            user: data, 
            token, 
            isAuthenticated: true, 
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            loading: false 
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, data } = response.data
          
          localStorage.setItem('token', token)
          set({ 
            user: data, 
            token, 
            isAuthenticated: true, 
            loading: false 
          })
          
          return { success: true }
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            loading: false 
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token')
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      },

      // Check auth status
      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          const response = await api.get('/auth/me')
          console.log('🔄 checkAuth - Fetched user:', response.data.data.user?.name, 'Zone:', response.data.data.user?.zone)
          set({ 
            user: response.data.data.user, 
            isAuthenticated: true, 
            token 
          })
        } catch (error) {
          localStorage.removeItem('token')
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          })
        }
      },

      // Update user
      updateUser: (userData) => {
        console.log('👤 updateUser called with zone:', userData?.zone)
        set({ user: userData })
      },

      // Set user (alias for updateUser for compatibility)
      setUser: (userData) => {
        console.log('👤 setUser called with zone:', userData?.zone)
        set({ user: userData })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

export default useAuthStore
