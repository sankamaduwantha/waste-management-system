import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiUsers,
  FiUserCheck,
  FiTrash2,
  FiAlertCircle,
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiDatabase,
  FiServer
} from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, usersByRole, recentActivity, appointmentsByStatus, systemHealth } = stats || {};

  // Calculate percentages for progress bars
  const userActivityRate = overview?.totalUsers > 0 
    ? ((overview.activeUsers / overview.totalUsers) * 100).toFixed(1) 
    : 0;

  const binFullRate = overview?.totalBins > 0 
    ? ((overview.fullBins / overview.totalBins) * 100).toFixed(1) 
    : 0;

  const vehicleActiveRate = overview?.totalVehicles > 0 
    ? ((overview.activeVehicles / overview.totalVehicles) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and statistics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary flex items-center space-x-2"
        >
          <FiActivity className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Health Banner */}
      <div className={`card ${systemHealth?.database === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiServer className={`text-2xl ${systemHealth?.database === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <h3 className="font-semibold text-gray-900">System Health</h3>
              <p className="text-sm text-gray-600">
                Database: <span className="font-medium capitalize">{systemHealth?.database}</span> • 
                Uptime: <span className="font-medium">{systemHealth?.uptime}</span>
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth?.database === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {systemHealth?.database === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold mt-2">{overview?.totalUsers || 0}</h3>
              <p className="text-blue-100 text-sm mt-2">
                {overview?.activeUsers || 0} active ({userActivityRate}%)
              </p>
            </div>
            <FiUsers className="text-5xl text-blue-200 opacity-50" />
          </div>
          <div className="mt-4 bg-blue-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${userActivityRate}%` }}
            />
          </div>
        </div>

        {/* Total Residents */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Residents</p>
              <h3 className="text-3xl font-bold mt-2">{overview?.totalResidents || 0}</h3>
              <p className="text-green-100 text-sm mt-2">
                Registered users
              </p>
            </div>
            <FiUserCheck className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        {/* Total Bins */}
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Waste Bins</p>
              <h3 className="text-3xl font-bold mt-2">{overview?.totalBins || 0}</h3>
              <p className="text-orange-100 text-sm mt-2">
                {overview?.fullBins || 0} full ({binFullRate}%)
              </p>
            </div>
            <FiTrash2 className="text-5xl text-orange-200 opacity-50" />
          </div>
          <div className="mt-4 bg-orange-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${binFullRate}%` }}
            />
          </div>
        </div>

        {/* Appointments */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Appointments</p>
              <h3 className="text-3xl font-bold mt-2">{overview?.totalAppointments || 0}</h3>
              <p className="text-purple-100 text-sm mt-2">
                {overview?.pendingAppointments || 0} pending
              </p>
            </div>
            <FiCalendar className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiMapPin className="text-2xl text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totalZones || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <FiTruck className="text-2xl text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview?.activeVehicles || 0}/{overview?.totalVehicles || 0}
                <span className="text-sm text-gray-500 ml-2">active</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiAlertCircle className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.unreadNotifications || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiUsers className="mr-2" />
            Users by Role
          </h3>
          <div className="space-y-3">
            {usersByRole?.map((role) => {
              const total = overview?.totalUsers || 1;
              const percentage = ((role.count / total) * 100).toFixed(1);
              const colors = {
                resident: 'bg-blue-500',
                city_manager: 'bg-green-500',
                admin: 'bg-red-500',
                sustainability_manager: 'bg-purple-500',
                garbage_collector: 'bg-yellow-500'
              };
              return (
                <div key={role._id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {role._id?.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{role.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[role._id] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Recent Activity (Last 7 Days)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiUsers className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Users</p>
                  <p className="text-xs text-gray-600">Registrations</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{recentActivity?.newUsers || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiCalendar className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Appointments</p>
                  <p className="text-xs text-gray-600">Bookings</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{recentActivity?.newAppointments || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiClock className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed</p>
                  <p className="text-xs text-gray-600">Appointments</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{recentActivity?.completedAppointments || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Status Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiDatabase className="mr-2" />
          Appointment Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {appointmentsByStatus?.map((status) => {
            const statusColors = {
              pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
              in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
              completed: 'bg-green-100 text-green-800 border-green-200',
              cancelled: 'bg-red-100 text-red-800 border-red-200',
              rescheduled: 'bg-orange-100 text-orange-800 border-orange-200'
            };
            return (
              <div
                key={status._id}
                className={`p-4 rounded-lg border-2 text-center ${statusColors[status._id] || 'bg-gray-100 text-gray-800'}`}
              >
                <p className="text-3xl font-bold">{status.count}</p>
                <p className="text-sm font-medium mt-1 capitalize">{status._id?.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Waste Collection Stats */}
      <div className="card bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Total Waste Collected</h3>
            <p className="text-4xl font-bold">{overview?.totalWasteCollected || 0} <span className="text-2xl">kg</span></p>
            <p className="text-emerald-100 mt-2">Across all zones and time periods</p>
          </div>
          <FiTrendingUp className="text-6xl text-white opacity-30" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
