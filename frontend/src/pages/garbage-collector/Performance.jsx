import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiCalendar
} from 'react-icons/fi';
import api from '../../services/api';

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week'); // week, month, year
  const [metrics, setMetrics] = useState({
    totalCollections: 0,
    completionRate: 0,
    averageTime: 0,
    distanceCovered: 0,
    rating: 0,
    efficiency: 0,
    onTimeRate: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchPerformanceData();
  }, [period]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const [metricsRes, weeklyRes, achievementsRes, leaderboardRes] = await Promise.all([
        api.get(`/collectors/performance?period=${period}`),
        api.get('/collectors/weekly-stats'),
        api.get('/collectors/achievements'),
        api.get('/collectors/leaderboard')
      ]);

      setMetrics(metricsRes.data.data || metrics);
      setWeeklyData(weeklyRes.data.data || []);
      setAchievements(achievementsRes.data.data || []);
      setLeaderboard(leaderboardRes.data.data || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value) => {
    if (value >= 90) return <FiTrendingUp className="text-green-600" />;
    if (value >= 70) return <FiTrendingUp className="text-yellow-600" />;
    return <FiTrendingDown className="text-red-600" />;
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
      <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Performance Metrics</h1>
            <p className="text-purple-100">Track your collection performance and achievements</p>
          </div>
          <FiTrendingUp className="text-5xl text-purple-200" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {['week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <FiCheckCircle className="text-2xl" />
            {getPerformanceIcon(metrics.completionRate)}
          </div>
          <p className="text-blue-100 text-sm">Completion Rate</p>
          <p className="text-3xl font-bold mt-1">{metrics.completionRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <FiAward className="text-2xl" />
            {getPerformanceIcon(metrics.efficiency)}
          </div>
          <p className="text-green-100 text-sm">Efficiency</p>
          <p className="text-3xl font-bold mt-1">{metrics.efficiency}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <FiClock className="text-2xl" />
          </div>
          <p className="text-purple-100 text-sm">Avg. Time/Bin</p>
          <p className="text-3xl font-bold mt-1">{metrics.averageTime} min</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <FiMapPin className="text-2xl" />
          </div>
          <p className="text-orange-100 text-sm">Distance</p>
          <p className="text-3xl font-bold mt-1">{metrics.distanceCovered} km</p>
        </div>
      </div>

      {/* Overall Rating */}
      <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center py-6">
          <FiAward className="text-6xl text-yellow-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.rating}/5.0
          </h2>
          <p className="text-gray-600">Overall Performance Rating</p>
          <div className="flex items-center justify-center space-x-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-8 h-8 ${
                  star <= metrics.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Detailed Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Collections</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalCollections}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.onTimeRate)}`}>
              {metrics.onTimeRate}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Efficiency Score</p>
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.efficiency)}`}>
              {metrics.efficiency}/100
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">This Week's Progress</h2>
        <div className="space-y-3">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">{day.day}</div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                    style={{ width: `${day.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-semibold text-gray-900">
                {day.completionRate}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No achievements yet. Keep up the good work!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300 text-center"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="font-bold text-gray-900">{achievement.title}</p>
                <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Team Leaderboard</h2>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((collector, index) => (
            <div
              key={collector._id}
              className={`flex items-center space-x-4 p-3 rounded-lg ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className={`text-2xl font-bold ${
                index === 0 ? 'text-yellow-600' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-orange-600' : 'text-gray-600'
              }`}>
                #{index + 1}
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {collector.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{collector.name}</p>
                <p className="text-sm text-gray-600">{collector.collections} collections</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">{collector.score}</p>
                <p className="text-xs text-gray-600">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Performance Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Complete collections on time to improve your on-time rate</li>
          <li>Use route optimization to reduce travel time</li>
          <li>Report issues promptly to maintain service quality</li>
          <li>Scan QR codes to verify collections accurately</li>
        </ul>
      </div>
    </div>
  );
};

export default Performance;
