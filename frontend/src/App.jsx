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
import ResidentProfile from './pages/resident/Profile'
import ResidentPlasticSuggestions from './pages/resident/ResidentPlasticSuggestions'
import Appointments from './pages/resident/Appointments'
import ResidentPerformance from './pages/resident/ResidentPerformance'

// City Manager pages
import CityManagerDashboard from './pages/city-manager/Dashboard'
import FleetManagement from './pages/city-manager/FleetManagement'
import RouteManagement from './pages/city-manager/RouteManagement'
import BinManagement from './pages/city-manager/BinManagement'
import RequestManagement from './pages/city-manager/RequestManagement'
import CityManagerProfile from './pages/city-manager/Profile'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import ZoneManagement from './pages/admin/ZoneManagement'
import SystemSettings from './pages/admin/SystemSettings'
import AdminProfile from './pages/admin/Profile'

// Sustainability Manager pages (import at top)
import SustainabilityManagerProfile from './pages/sustainability-manager/Profile'
import TaskManagement from './pages/sustainability-manager/TaskManagement'
import SustainabilityManagerMainDashboard from './pages/sustainability-manager/Dashboard'
import RewardManagement from './pages/sustainability-manager/RewardManagement'
import PerformanceMonitoring from './pages/sustainability-manager/PerformanceMonitoring'
import Leaderboard from './components/performance/Leaderboard'

// Sustainability Manager pages
import SustainabilityDashboard from './pages/sustainability/Dashboard'
import Analytics from './pages/sustainability/Analytics'
import Reports from './pages/sustainability/Reports'
import EnvironmentalImpact from './pages/sustainability/EnvironmentalImpact'

// Shared pages
import NotFound from './pages/NotFound'
import Home from './pages/Home'

// Public pages
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import Careers from './pages/Careers'
import Blog from './pages/Blog'
import HelpCenter from './pages/HelpCenter'
import Documentation from './pages/Documentation'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'

function App() {
  const { user, checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      {/* Public Home Page */}
      <Route path="/" element={!isAuthenticated ? <Home /> : <Navigate to={getRoleRoute(user)} replace />} />
      
      {/* Auth routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getRoleRoute(user)} replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getRoleRoute(user)} replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public pages */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Protected routes with layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Resident routes */}
        <Route path="/resident/dashboard" element={<PrivateRoute roles={['resident']}><ResidentDashboard /></PrivateRoute>} />
        <Route path="/resident/schedule" element={<PrivateRoute roles={['resident']}><CollectionSchedule /></PrivateRoute>} />
        <Route path="/resident/requests" element={<PrivateRoute roles={['resident']}><ServiceRequests /></PrivateRoute>} />
        <Route path="/resident/payments" element={<PrivateRoute roles={['resident']}><Payments /></PrivateRoute>} />
        <Route path="/resident/profile" element={<PrivateRoute roles={['resident']}><ResidentProfile /></PrivateRoute>} />
        <Route path="/resident/appointments" element={<PrivateRoute roles={['resident']}><Appointments /></PrivateRoute>} />
        <Route path="/resident/plastic-suggestions" element={<PrivateRoute roles={['resident']}><ResidentPlasticSuggestions /></PrivateRoute>} />
        <Route path="/resident/plastic-suggestions/:id" element={<PrivateRoute roles={['resident']}><ResidentPlasticSuggestions /></PrivateRoute>} />
        <Route path="/resident/performance" element={<PrivateRoute roles={['resident']}><ResidentPerformance /></PrivateRoute>} />

        {/* City Manager routes */}
        <Route path="/city-manager/dashboard" element={<PrivateRoute roles={['city_manager', 'admin']}><CityManagerDashboard /></PrivateRoute>} />
        <Route path="/city-manager/fleet" element={<PrivateRoute roles={['city_manager', 'admin']}><FleetManagement /></PrivateRoute>} />
        <Route path="/city-manager/routes" element={<PrivateRoute roles={['city_manager', 'admin']}><RouteManagement /></PrivateRoute>} />
        <Route path="/city-manager/bins" element={<PrivateRoute roles={['city_manager', 'admin']}><BinManagement /></PrivateRoute>} />
        <Route path="/city-manager/requests" element={<PrivateRoute roles={['city_manager', 'admin']}><RequestManagement /></PrivateRoute>} />
        <Route path="/city-manager/profile" element={<PrivateRoute roles={['city_manager']}><CityManagerProfile /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/zones" element={<PrivateRoute roles={['admin']}><ZoneManagement /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><SystemSettings /></PrivateRoute>} />
        <Route path="/admin/profile" element={<PrivateRoute roles={['admin']}><AdminProfile /></PrivateRoute>} />

        {/* Sustainability Manager routes */}
        <Route path="/sustainability/dashboard" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><SustainabilityDashboard /></PrivateRoute>} />
        <Route path="/sustainability/analytics" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><Analytics /></PrivateRoute>} />
        <Route path="/sustainability/reports" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><Reports /></PrivateRoute>} />
        <Route path="/sustainability/impact" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><EnvironmentalImpact /></PrivateRoute>} />
        <Route path="/sustainability/leaderboard" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><Leaderboard /></PrivateRoute>} />
        <Route path="/sustainability/profile" element={<PrivateRoute roles={['sustainability_manager']}><SustainabilityManagerProfile /></PrivateRoute>} />

        {/* Sustainability Manager Main Dashboard */}
        <Route path="/sustainability-manager/dashboard" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><SustainabilityManagerMainDashboard /></PrivateRoute>} />
        
        {/* Task Management Routes */}
        <Route path="/sustainability-manager/tasks" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><TaskManagement /></PrivateRoute>} />
        
        {/* Reward Management Routes */}
        <Route path="/sustainability-manager/rewards" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><RewardManagement /></PrivateRoute>} />
        
        {/* Performance Monitoring Routes */}
        <Route path="/sustainability-manager/performance" element={<PrivateRoute roles={['sustainability_manager', 'admin']}><PerformanceMonitoring /></PrivateRoute>} />

        {/* Plastic Reduction Management (Sustainability Manager CRUD) */}
        <Route 
          path="/sustainability-manager/*" 
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

// Helper function to get role-based route
function getRoleRoute(user) {
  if (!user) return '/login'

  const roleRoutes = {
    resident: '/resident/dashboard',
    city_manager: '/city-manager/dashboard',
    admin: '/admin/dashboard',
    sustainability_manager: '/sustainability/dashboard',
  }

  return roleRoutes[user.role] || '/login'
}

// Helper component for role-based redirect (kept for compatibility if used elsewhere)
function RoleBasedRedirect({ user }) {
  return <Navigate to={getRoleRoute(user)} replace />
}

export default App
