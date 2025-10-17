import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTrash,
  FaTruck,
  FaUserTie,
  FaClipboardList,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaRoute,
  FaPlus
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CityManagerDashboard = () => {
  const [stats, setStats] = useState({
    bins: {},
    vehicles: {},
    drivers: {},
    requests: {},
    schedules: {},
    zones: { total: 0 }
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all stats in parallel
      const [
        binsRes,
        vehiclesRes,
        driversRes,
        requestsRes,
        schedulesRes,
        zonesRes,
        recentRequestsRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/bins/stats/overview', { headers }).catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:5000/api/v1/vehicles/stats/overview', { headers }).catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:5000/api/v1/drivers/stats/overview', { headers }).catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:5000/api/v1/service-requests/stats/overview', { headers }).catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:5000/api/v1/schedules/stats/overview', { headers }).catch(() => ({ data: { data: {} } })),
        axios.get('http://localhost:5000/api/v1/zones/list/active', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5000/api/v1/service-requests?limit=5', { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setStats({
        bins: binsRes.data.data || {},
        vehicles: vehiclesRes.data.data || {},
        drivers: driversRes.data.data || {},
        requests: requestsRes.data.data || {},
        schedules: schedulesRes.data.data || {},
        zones: { total: zonesRes.data.data?.length || 0 }
      });

      setRecentRequests(recentRequestsRes.data.data || []);

      // Get today's schedules
      const today = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = days[today.getDay()];
      
      const todaySchedulesRes = await axios.get(
        `http://localhost:5000/api/v1/schedules/day/${todayName}`,
        { headers }
      ).catch(() => ({ data: { data: [] } }));
      
      setTodaySchedules(todaySchedulesRes.data.data || []);

      // Generate alerts
      generateAlerts({
        bins: binsRes.data.data,
        vehicles: vehiclesRes.data.data,
        drivers: driversRes.data.data,
        requests: requestsRes.data.data,
        schedules: schedulesRes.data.data
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const generateAlerts = (data) => {
    const newAlerts = [];

    // Bin alerts
    if (data.bins?.fullBins > 0) {
      newAlerts.push({
        type: 'warning',
        icon: <FaTrash />,
        message: `${data.bins.fullBins} bin(s) at full capacity`,
        action: '/city-manager/bins'
      });
    }

    // Vehicle alerts
    if (data.vehicles?.maintenanceDue > 0) {
      newAlerts.push({
        type: 'warning',
        icon: <FaTruck />,
        message: `${data.vehicles.maintenanceDue} vehicle(s) need maintenance`,
        action: '/city-manager/fleet'
      });
    }

    // Driver alerts
    if (data.drivers?.expiringLicenses > 0) {
      newAlerts.push({
        type: 'warning',
        icon: <FaUserTie />,
        message: `${data.drivers.expiringLicenses} driver license(s) expiring soon`,
        action: '/city-manager/drivers'
      });
    }

    // Request alerts
    if (data.requests?.urgentUnassigned > 0) {
      newAlerts.push({
        type: 'danger',
        icon: <FaClipboardList />,
        message: `${data.requests.urgentUnassigned} urgent request(s) unassigned`,
        action: '/city-manager/requests'
      });
    }

    if (data.requests?.overdueRequests > 0) {
      newAlerts.push({
        type: 'danger',
        icon: <FaClock />,
        message: `${data.requests.overdueRequests} request(s) overdue (>48 hours)`,
        action: '/city-manager/requests'
      });
    }

    // Schedule alerts
    if (data.schedules?.unassignedVehicles > 0) {
      newAlerts.push({
        type: 'warning',
        icon: <FaRoute />,
        message: `${data.schedules.unassignedVehicles} schedule(s) without vehicles`,
        action: '/city-manager/routes'
      });
    }

    setAlerts(newAlerts);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to City Manager Dashboard</p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <Link
              key={index}
              to={alert.action}
              className={`block p-4 rounded-lg border-l-4 ${
                alert.type === 'danger'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center">
                <span
                  className={`text-2xl mr-3 ${
                    alert.type === 'danger' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                >
                  {alert.icon}
                </span>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      alert.type === 'danger' ? 'text-red-800' : 'text-yellow-800'
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
                <FaExclamationTriangle
                  className={
                    alert.type === 'danger' ? 'text-red-500' : 'text-yellow-500'
                  }
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Bins */}
        <Link to="/city-manager/bins" className="block">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Bins</p>
                <p className="text-3xl font-bold">{stats.bins.total || 0}</p>
                <p className="text-xs text-green-100 mt-2">
                  {stats.bins.fullBins || 0} at capacity
                </p>
              </div>
              <FaTrash className="text-5xl text-green-200" />
            </div>
          </div>
        </Link>

        {/* Vehicles */}
        <Link to="/city-manager/fleet" className="block">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Vehicles</p>
                <p className="text-3xl font-bold">{stats.vehicles.total || 0}</p>
                <p className="text-xs text-blue-100 mt-2">
                  {stats.vehicles.available || 0} available
                </p>
              </div>
              <FaTruck className="text-5xl text-blue-200" />
            </div>
          </div>
        </Link>

        {/* Drivers */}
        <Link to="/city-manager/drivers" className="block">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Drivers</p>
                <p className="text-3xl font-bold">{stats.drivers.total || 0}</p>
                <p className="text-xs text-purple-100 mt-2">
                  {stats.drivers.active || 0} active
                </p>
              </div>
              <FaUserTie className="text-5xl text-purple-200" />
            </div>
          </div>
        </Link>

        {/* Service Requests */}
        <Link to="/city-manager/requests" className="block">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Service Requests</p>
                <p className="text-3xl font-bold">{stats.requests.total || 0}</p>
                <p className="text-xs text-orange-100 mt-2">
                  {(stats.requests.byStatus?.pending || 0)} pending
                </p>
              </div>
              <FaClipboardList className="text-5xl text-orange-200" />
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Zones */}
        <Link to="/city-manager/zones" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active Zones</p>
                <p className="text-2xl font-bold text-gray-800">{stats.zones.total}</p>
              </div>
              <FaMapMarkedAlt className="text-4xl text-indigo-500" />
            </div>
          </div>
        </Link>

        {/* Today's Schedules */}
        <Link to="/city-manager/routes" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Today's Routes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.schedules.todaySchedules || 0}
                </p>
              </div>
              <FaRoute className="text-4xl text-teal-500" />
            </div>
          </div>
        </Link>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.requests.avgResolutionTimeHours
                  ? `${stats.requests.avgResolutionTimeHours}h`
                  : 'N/A'}
              </p>
            </div>
            <FaClock className="text-4xl text-pink-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Service Requests</h2>
            <Link
              to="/city-manager/requests"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.slice(0, 5).map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {request.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.requestNumber} • {request.zone?.name}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <p className="text-center text-gray-500 py-4">No recent requests</p>
            )}
          </div>
        </div>

        {/* Today's Collection Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Today's Collection Schedule</h2>
            <Link
              to="/city-manager/routes"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {todaySchedules.slice(0, 5).map((schedule) => (
              <div
                key={schedule._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {schedule.zone?.name} - {schedule.wasteType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedule.timeSlot?.start} - {schedule.timeSlot?.end}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {schedule.assignedVehicle?.vehicleNumber || 'Unassigned'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedule.assignedCrew?.length || 0} crew
                  </p>
                </div>
              </div>
            ))}
            {todaySchedules.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No schedules for today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/city-manager/bins"
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FaPlus className="text-3xl text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Bin</span>
          </Link>

          <Link
            to="/city-manager/fleet"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaPlus className="text-3xl text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Vehicle</span>
          </Link>

          <Link
            to="/city-manager/drivers"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FaPlus className="text-3xl text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Driver</span>
          </Link>

          <Link
            to="/city-manager/routes"
            className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <FaPlus className="text-3xl text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Schedule</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CityManagerDashboard;
