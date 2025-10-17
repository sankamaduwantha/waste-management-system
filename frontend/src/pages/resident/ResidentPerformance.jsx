/**
 * @fileoverview Resident Performance Page
 * @description Personal performance analytics for residents
 * @author Waste Management System
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import usePerformanceStore from '../../store/performanceStore';
import {
  FaTasks, FaCheckCircle, FaTrophy, FaFire, FaLeaf, FaChartLine
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

const ResidentPerformance = () => {
  const {
    analytics,
    trends,
    loading,
    fetchMyAnalytics,
    fetchTrends
  } = usePerformanceStore();

  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    await Promise.all([
      fetchMyAnalytics(period),
      fetchTrends(null, 6)
    ]);
  };

  // Format month name
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Prepare trends data
  const trendsChartData = trends.map(t => ({
    name: `${getMonthName(t.month)}`,
    'Completion Rate': t.avgCompletionRate,
    'Tasks': t.totalCompleted,
    'Points': t.totalPoints
  }));

  // Prepare category radar data
  const categoryRadarData = analytics?.categoryPerformance?.map(cat => ({
    category: cat.category.replace(/_/g, ' ').slice(0, 10),
    rate: cat.completionRate || 0
  })) || [];

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600';
    if (grade === 'B') return 'text-blue-600';
    if (grade === 'C') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
          <p className="text-gray-600 mt-1">Track your sustainability journey</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          {['weekly', 'monthly', 'quarterly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
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

      {/* Performance Summary */}
      {analytics?.report && !loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.report.taskMetrics.totalCompleted}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {analytics.report.taskMetrics.totalAssigned} assigned
                  </p>
                </div>
                <FaCheckCircle className="text-4xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.report.taskMetrics.completionRate?.toFixed(1)}%
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${getGradeColor(analytics.report.performanceGrade)}`}>
                    Grade: {analytics.report.performanceGrade}
                  </p>
                </div>
                <FaTasks className="text-4xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Points Earned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.report.pointsMetrics.totalEarned}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rank: #{analytics.report.pointsMetrics.rank || 'N/A'}
                  </p>
                </div>
                <FaTrophy className="text-4xl text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {analytics.report.streakMetrics.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Best: {analytics.report.streakMetrics.longestStreak} days
                  </p>
                </div>
                <FaFire className="text-4xl text-orange-500" />
              </div>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">vs Average</h3>
              <div className="flex items-center justify-center">
                <div className={`text-4xl font-bold ${
                  analytics.report.comparisonMetrics.vsAverage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.report.comparisonMetrics.vsAverage >= 0 ? '+' : ''}
                  {analytics.report.comparisonMetrics.vsAverage?.toFixed(1)}%
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {analytics.report.comparisonMetrics.vsAverage >= 0 ? 'Above' : 'Below'} average
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Percentile</h3>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold text-blue-600">
                  {analytics.report.pointsMetrics.percentile?.toFixed(0)}
                  <span className="text-2xl">th</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Top {(100 - analytics.report.pointsMetrics.percentile).toFixed(0)}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
              <div className="flex items-center justify-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.report.engagementLevel}
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Activity level
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends Chart */}
            {trendsChartData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-blue-500" />
                  Performance Trends
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Completion Rate" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Points" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category Radar */}
            {categoryRadarData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Category Performance</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={categoryRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Completion Rate" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Environmental Impact */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaLeaf className="mr-2" />
              Your Environmental Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{analytics.report.environmentalImpact.co2Saved?.toFixed(1)}</p>
                <p className="text-green-100 text-sm mt-1">kg CO₂ Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{analytics.report.environmentalImpact.wasteRecycled?.toFixed(1)}</p>
                <p className="text-green-100 text-sm mt-1">kg Waste Recycled</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{analytics.report.environmentalImpact.waterSaved?.toFixed(1)}</p>
                <p className="text-green-100 text-sm mt-1">L Water Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{analytics.report.environmentalImpact.energySaved?.toFixed(1)}</p>
                <p className="text-green-100 text-sm mt-1">kWh Energy Saved</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!analytics && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaChartLine className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-500">
            Complete tasks to see your performance analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResidentPerformance;
