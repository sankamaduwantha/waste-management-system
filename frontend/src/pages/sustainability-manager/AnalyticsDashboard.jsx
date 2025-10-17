/**
 * @fileoverview Analytics Dashboard for Performance Monitoring
 * @description Comprehensive analytics page for sustainability managers
 * @author Waste Management System
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import usePerformanceStore from '../../store/performanceStore';
import { showInfoToast } from '../../components/common/ToastContainer';
import {
  FaChartLine, FaTrophy, FaLeaf, FaUsers, FaFire,
  FaRecycle, FaFilter, FaDownload, FaSync
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AnalyticsDashboard = () => {
  const {
    dashboardStats,
    categoryAnalytics,
    trends,
    environmentalImpact,
    zoneComparison,
    loading,
    filters,
    setFilters,
    fetchDashboardStats,
    fetchCategoryAnalytics,
    fetchTrends,
    fetchEnvironmentalImpact,
    fetchZoneComparison
  } = usePerformanceStore();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    loadAllData();
  }, [selectedPeriod]);

  const loadAllData = async () => {
    await Promise.all([
      fetchDashboardStats(selectedPeriod),
      fetchCategoryAnalytics(selectedPeriod),
      fetchTrends(null, 6),
      fetchEnvironmentalImpact({ period: selectedPeriod }),
      fetchZoneComparison(selectedPeriod)
    ]);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setFilters({ period });
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    showInfoToast('Export functionality coming soon!');
  };

  // Chart colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Format month name
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Prepare trends data for chart
  const trendsChartData = trends.map(t => ({
    name: `${getMonthName(t.month)} ${t.year}`,
    'Completion Rate': t.avgCompletionRate,
    'Tasks Completed': t.totalCompleted,
    'CO2 Saved (kg)': t.avgCo2Saved
  }));

  // Prepare category data for pie chart
  const categoryPieData = categoryAnalytics.map((cat, index) => ({
    name: cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: cat.totalCompleted,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Performance monitoring and insights</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary flex items-center"
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Period:</span>
          {['weekly', 'monthly', 'quarterly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Summary Cards */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Leaderboard</p>
                <p className="text-3xl font-bold mt-1">
                  {dashboardStats.leaderboard?.length || 0}
                </p>
              </div>
              <FaUsers className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          {/* Top Performer Points */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Top Performer Points</p>
                <p className="text-3xl font-bold mt-1">
                  {dashboardStats.leaderboard?.[0]?.totalPoints || 0}
                </p>
              </div>
              <FaTrophy className="text-5xl text-yellow-200 opacity-50" />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Categories</p>
                <p className="text-3xl font-bold mt-1">
                  {dashboardStats.categoryAnalytics?.length || 0}
                </p>
              </div>
              <FaRecycle className="text-5xl text-purple-200 opacity-50" />
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">CO₂ Saved (kg)</p>
                <p className="text-3xl font-bold mt-1">
                  {dashboardStats.environmentalImpact?.totalCo2Saved?.toFixed(1) || 0}
                </p>
              </div>
              <FaLeaf className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {!loading && (
        <>
          {/* Trends Chart */}
          {trendsChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                Completion Trends (Last 6 Months)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Completion Rate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="Tasks Completed" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Performance and Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance Pie Chart */}
            {categoryPieData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Category Performance
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Leaderboard */}
            {dashboardStats?.leaderboard && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaTrophy className="mr-2 text-yellow-500" />
                  Top Performers
                </h2>
                <div className="space-y-3">
                  {dashboardStats.leaderboard.slice(0, 5).map((performer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-600' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{performer.name}</p>
                          <p className="text-xs text-gray-500">
                            {performer.tasksCompleted} tasks • {performer.completionRate?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{performer.totalPoints}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Bar Chart */}
          {categoryAnalytics.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Category Analytics
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tickFormatter={(value) => value.replace(/_/g, ' ').slice(0, 10)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCompleted" fill="#10b981" name="Completed" />
                  <Bar dataKey="totalAssigned" fill="#3b82f6" name="Assigned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Zone Comparison */}
          {zoneComparison.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Zone Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zoneName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgCompletionRate" fill="#10b981" name="Avg Completion Rate (%)" />
                  <Bar dataKey="totalTasks" fill="#3b82f6" name="Total Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Environmental Impact */}
          {environmentalImpact && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaLeaf className="mr-2 text-green-500" />
                Environmental Impact
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {environmentalImpact.totalCo2Saved?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">CO₂ Saved (kg)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {environmentalImpact.totalWasteRecycled?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Waste Recycled (kg)</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <p className="text-3xl font-bold text-cyan-600">
                    {environmentalImpact.totalWaterSaved?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Water Saved (L)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">
                    {environmentalImpact.totalEnergySaved?.toFixed(1) || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Energy Saved (kWh)</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
