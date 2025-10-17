import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiNavigation,
  FiAlertCircle,
  FiTruck,
  FiPackage,
  FiActivity
} from 'react-icons/fi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CollectorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAssignments: 0,
    completedToday: 0,
    pendingTasks: 0,
    totalDistance: 0,
    urgentBins: 0
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes, urgentRes] = await Promise.all([
        api.get('/collectors/my-tasks'),
        api.get('/collectors/my-stats'),
        api.get('/collectors/urgent-bins')
      ]);

      setTodayTasks(tasksRes.data.data || []);
      setStats(statsRes.data.data || stats);
      setUrgentAlerts(alertsRes.data.data?.bins || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Today's Collections</h1>
        <p className="text-green-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Tasks</p>
              <p className="text-3xl font-bold mt-1">{stats.todayAssignments}</p>
            </div>
            <FiPackage className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{stats.completedToday}</p>
            </div>
            <FiCheckCircle className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingTasks}</p>
            </div>
            <FiClock className="text-4xl text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Urgent</p>
              <p className="text-3xl font-bold mt-1">{stats.urgentBins}</p>
            </div>
            <FiAlertCircle className="text-4xl text-red-200" />
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <FiAlertCircle className="text-2xl text-red-600" />
            <h2 className="text-lg font-bold text-red-900">Urgent Alerts</h2>
          </div>
          <div className="space-y-2">
            {urgentAlerts.slice(0, 3).map((bin) => (
              <div key={bin._id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Bin #{bin.binId}</p>
                    <p className="text-sm text-gray-600">
                      {bin.location?.address || 'Location not available'} • Fill Level: {bin.fillLevel}%
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/garbage-collector/navigate/${bin._id}`)}
                    className="btn-primary text-sm py-1 px-3"
                  >
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/garbage-collector/route')}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <FiNavigation className="text-3xl text-blue-600 mx-auto mb-2" />
          <p className="text-center font-medium text-gray-900">View Route</p>
        </button>

        <button
          onClick={() => navigate('/garbage-collector/scanner')}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <FiActivity className="text-3xl text-purple-600 mx-auto mb-2" />
          <p className="text-center font-medium text-gray-900">Scan QR</p>
        </button>

        <button
          onClick={() => navigate('/garbage-collector/report')}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <FiAlertCircle className="text-3xl text-orange-600 mx-auto mb-2" />
          <p className="text-center font-medium text-gray-900">Report Issue</p>
        </button>

        <button
          onClick={() => navigate('/garbage-collector/performance')}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <FiTrendingUp className="text-3xl text-green-600 mx-auto mb-2" />
          <p className="text-center font-medium text-gray-900">Performance</p>
        </button>
      </div>

      {/* Today's Task List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Collection Tasks</h2>
          <button
            onClick={fetchDashboardData}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-12">
            <FiCheckCircle className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600">No tasks assigned for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <div
                key={task._id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${getPriorityColor(task.priority)} flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Bin #{task.bin?.binId || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <FiMapPin className="inline mr-1" />
                          {task.bin?.location?.address || 'Location not available'}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          {task.bin?.fillLevel && (
                            <span className="text-xs text-gray-600">
                              Fill: {task.bin.fillLevel}%
                            </span>
                          )}
                          {task.estimatedTime && (
                            <span className="text-xs text-gray-600">
                              <FiClock className="inline mr-1" />
                              {task.estimatedTime}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => navigate(`/garbage-collector/task/${task._id}`)}
                          className="btn-primary text-sm py-1 px-3 whitespace-nowrap"
                        >
                          View Details
                        </button>
                        {task.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/garbage-collector/navigate/${task.bin._id}`)}
                            className="btn-secondary text-sm py-1 px-3 whitespace-nowrap"
                          >
                            Navigate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.todayAssignments > 0 
                ? Math.round((stats.completedToday / stats.todayAssignments) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Distance Covered</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalDistance || 0} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg. Time/Bin</p>
            <p className="text-2xl font-bold text-pink-600">
              {stats.completedToday > 0 ? Math.round(480 / stats.completedToday) : 0} min
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Efficiency</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedToday >= stats.todayAssignments * 0.8 ? 'Excellent' : 'Good'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
