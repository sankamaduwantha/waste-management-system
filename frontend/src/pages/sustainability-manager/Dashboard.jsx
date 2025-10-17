/**
 * @fileoverview Sustainability Manager Main Dashboard
 * @description Comprehensive dashboard with tasks, residents, environmental impact, and performance metrics
 * @author Waste Management System
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTasks, FaUsers, FaChartLine, FaLeaf, FaTrophy, FaRecycle,
  FaCheckCircle, FaClock, FaExclamationTriangle, FaPlus,
  FaChartBar, FaBolt, FaWater, FaTrash, FaGlobe, FaCalendar,
  FaGift, FaAward
} from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useTaskStore from '../../store/taskStore';
import usePerformanceStore from '../../store/performanceStore';
import useRewardStore from '../../store/rewardStore';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const { statistics: taskStats, fetchStatistics: fetchTaskStats } = useTaskStore();
  const { environmentalImpact, fetchEnvironmentalImpact, trends, fetchTrends } = usePerformanceStore();
  const { statistics: rewardStats, fetchStatistics: fetchRewardStats } = useRewardStore();
  
  const [residentStats, setResidentStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      await Promise.all([
        fetchTaskStats(),
        fetchEnvironmentalImpact(),
        fetchTrends(6),
        fetchRewardStats(),
        loadResidentStats(),
        loadRecentTasks()
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const loadResidentStats = async () => {
    try {
      const response = await api.get('/residents');
      const residents = response.data.data?.residents || [];
      
      setResidentStats({
        total: residents.length,
        active: residents.filter(r => r.paymentInfo?.paymentStatus === 'paid').length,
        inactive: residents.filter(r => r.paymentInfo?.paymentStatus !== 'paid').length
      });
    } catch (error) {
      console.error('Error loading resident stats:', error);
    }
  };

  const loadRecentTasks = async () => {
    try {
      const response = await api.get('/tasks?limit=5&sortBy=-createdAt');
      setRecentTasks(response.data.data?.tasks || []);
    } catch (error) {
      console.error('Error loading recent tasks:', error);
    }
  };

  // Chart colors
  const COLORS = {
    primary: '#10b981',
    secondary: '#3b82f6',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4'
  };

  const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger];

  // Format task status data for pie chart
  const taskStatusData = taskStats?.byStatus?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  // Format trends data for line chart - safely handle undefined values
  const trendsData = trends?.filter(item => item?._id?.year && item?._id?.month)
    .map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      completed: item.completed || 0,
      total: item.total || 0
    })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sustainability Dashboard</h1>
        <p className="text-gray-600">Monitor and manage waste reduction initiatives</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/sustainability-manager/tasks')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
        >
          <FaPlus className="text-2xl" />
          <span className="font-semibold">Create Task</span>
        </button>
        
        <button
          onClick={() => navigate('/sustainability/analytics')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
        >
          <FaChartLine className="text-2xl" />
          <span className="font-semibold">View Analytics</span>
        </button>
        
        <button
          onClick={() => navigate('/sustainability/reports')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
        >
          <FaChartBar className="text-2xl" />
          <span className="font-semibold">View Reports</span>
        </button>
        
        <button
          onClick={() => navigate('/sustainability/impact')}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
        >
          <FaGlobe className="text-2xl" />
          <span className="font-semibold">Impact Metrics</span>
        </button>
      </div>

      {/* Reward System Summary */}
      {rewardStats && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FaGift className="mr-2 text-yellow-600" />
              Reward System Overview
            </h3>
            <button
              onClick={() => navigate('/sustainability-manager/rewards')}
              className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
            >
              Manage Rewards →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaGift className="text-xl text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rewardStats.totalRewards || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Rewards</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaCheckCircle className="text-xl text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rewardStats.activeRewards || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Rewards</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaTrophy className="text-xl text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rewardStats.totalClaims || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Claims</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaAward className="text-xl text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(rewardStats.pointsDistributed || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Points Distributed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaTasks className="text-2xl text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Tasks</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {taskStats?.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0}
          </div>
          <p className="text-sm text-gray-600">Active assignments</p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaCheckCircle className="text-2xl text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Completed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {taskStats?.byStatus?.find(s => ['completed', 'verified'].includes(s._id))?.count || 0}
          </div>
          <p className="text-sm text-gray-600">
            {taskStats?.completionRate || 0}% completion rate
          </p>
        </div>

        {/* Active Residents */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaUsers className="text-2xl text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Residents</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {residentStats.active}
          </div>
          <p className="text-sm text-gray-600">
            of {residentStats.total} total residents
          </p>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-2xl text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Overdue</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {taskStats?.overdueTasks || 0}
          </div>
          <p className="text-sm text-gray-600">Requires attention</p>
        </div>
      </div>

      {/* Environmental Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* CO2 Saved */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FaLeaf className="text-xl text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">CO₂ Saved</h3>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {(environmentalImpact?.co2Saved || 0).toFixed(1)} kg
          </div>
          <p className="text-xs text-gray-600 mt-1">Carbon footprint reduction</p>
        </div>

        {/* Waste Diverted */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaTrash className="text-xl text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Waste Diverted</h3>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {(environmentalImpact?.wasteDiverted || 0).toFixed(1)} kg
          </div>
          <p className="text-xs text-gray-600 mt-1">From landfills</p>
        </div>

        {/* Water Saved */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <FaWater className="text-xl text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Water Saved</h3>
          </div>
          <div className="text-2xl font-bold text-cyan-700">
            {(environmentalImpact?.waterSaved || 0).toFixed(1)} L
          </div>
          <p className="text-xs text-gray-600 mt-1">Water conservation</p>
        </div>

        {/* Energy Saved */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <FaBolt className="text-xl text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Energy Saved</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {(environmentalImpact?.energySaved || 0).toFixed(1)} kWh
          </div>
          <p className="text-xs text-gray-600 mt-1">Power consumption reduced</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartBar className="mr-2 text-green-500" />
            Task Status Distribution
          </h3>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No task data available
            </div>
          )}
        </div>

        {/* Completion Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-500" />
            Completion Trends (6 Months)
          </h3>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2}
                  name="Total Assigned"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaClock className="mr-2 text-purple-500" />
            Recent Tasks
          </h3>
          <button
            onClick={() => navigate('/sustainability-manager/tasks')}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Task</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <tr key={task._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{task.title}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {task.assignedTo?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {task.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed' || task.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {task.rewardPoints} pts
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No recent tasks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
