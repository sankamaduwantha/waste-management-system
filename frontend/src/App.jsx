import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import SustainabilityManagerDashboard from './pages/sustainability-manager/SustainabilityManagerDashboard';

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Resident pages
import ResidentDashboard from './pages/resident/Dashboard'
import CollectionSchedule from './pages/resident/CollectionSchedule'
import ServiceRequests from './pages/resident/ServiceRequests'
import Payments from './pages/resident/Payments'
import Profile from './pages/resident/Profile'
import ResidentPlasticSuggestions from './pages/resident/ResidentPlasticSuggestions'
import Appointments from './pages/resident/Appointments'

// City Manager pages
import CityManagerDashboard from './pages/city-manager/Dashboard'
import FleetManagement from './pages/city-manager/FleetManagement'
import RouteManagement from './pages/city-manager/RouteManagement'
import BinManagement from './pages/city-manager/BinManagement'
import RequestManagement from './pages/city-manager/RequestManagement'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import ZoneManagement from './pages/admin/ZoneManagement'
import SystemSettings from './pages/admin/SystemSettings'

// Sustainability Manager pages
import SustainabilityDashboard from './pages/sustainability/Dashboard'
import Analytics from './pages/sustainability/Analytics'
import Reports from './pages/sustainability/Reports'
import EnvironmentalImpact from './pages/sustainability/EnvironmentalImpact'

// Shared pages
import NotFound from './pages/NotFound'

function App() {
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes with layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Redirect based on role */}
        <Route index element={<RoleBasedRedirect user={user} />} />

        {/* Resident routes */}
        <Route path="resident">
          <Route path="dashboard" element={<PrivateRoute roles={['resident']}><ResidentDashboard /></PrivateRoute>} />
          <Route path="schedule" element={<PrivateRoute roles={['resident']}><CollectionSchedule /></PrivateRoute>} />
          <Route path="requests" element={<PrivateRoute roles={['resident']}><ServiceRequests /></PrivateRoute>} />
          <Route path="payments" element={<PrivateRoute roles={['resident']}><Payments /></PrivateRoute>} />
          <Route path="profile" element={<PrivateRoute roles={['resident']}><Profile /></PrivateRoute>} />
          <Route path="appointments" element={<PrivateRoute roles={['resident']}><Appointments /></PrivateRoute>} />
          <Route path="plastic-suggestions" element={<PrivateRoute roles={['resident']}><ResidentPlasticSuggestions /></PrivateRoute>} />
          <Route path="plastic-suggestions/:id" element={<PrivateRoute roles={['resident']}><ResidentPlasticSuggestions /></PrivateRoute>} />
        </Route>

        {/* City Manager routes */}
        <Route path="city-manager">
          <Route path="dashboard" element={<PrivateRoute roles={['city_manager', 'admin']}><CityManagerDashboard /></PrivateRoute>} />
          <Route path="fleet" element={<PrivateRoute roles={['city_manager', 'admin']}><FleetManagement /></PrivateRoute>} />
          <Route path="routes" element={<PrivateRoute roles={['city_manager', 'admin']}><RouteManagement /></PrivateRoute>} />
          <Route path="bins" element={<PrivateRoute roles={['city_manager', 'admin']}><BinManagement /></PrivateRoute>} />
          <Route path="requests" element={<PrivateRoute roles={['city_manager', 'admin']}><RequestManagement /></PrivateRoute>} />
        </Route>

        {/* Admin routes */}
        <Route path="admin">
          <Route path="dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
          <Route path="zones" element={<PrivateRoute roles={['admin']}><ZoneManagement /></PrivateRoute>} />
          <Route path="settings" element={<PrivateRoute roles={['admin']}><SystemSettings /></PrivateRoute>} />
        </Route>

        {/* Sustainability Manager routes */}
        <Route path="sustainability">
          <Route path="dashboard" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><SustainabilityDashboard /></PrivateRoute>} />
          <Route path="analytics" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><Analytics /></PrivateRoute>} />
          <Route path="reports" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><Reports /></PrivateRoute>} />
          <Route path="impact" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><EnvironmentalImpact /></PrivateRoute>} />
        </Route>

        {/* Plastic Reduction Management (Sustainability Manager CRUD) */}
        <Route 
          path="sustainability-manager/*" 
          element={
            <PrivateRoute roles={['sustainability_manager', 'admin']}>
              <SustainabilityManagerDashboard />
            </PrivateRoute>
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    
  )
}

// Helper component for role-based redirect
function RoleBasedRedirect({ user }) {
  if (!user) return <Navigate to="/login" replace />

  const roleRoutes = {
    resident: '/resident/dashboard',
    city_manager: '/city-manager/dashboard',
    admin: '/admin/dashboard',
    sustainability_manager: '/sustainability/dashboard',
  }

  return <Navigate to={roleRoutes[user.role] || '/login'} replace />
}

export default App
