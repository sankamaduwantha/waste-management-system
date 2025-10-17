import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaTrophy,
  FaUsers,
  FaDownload,
  FaFilter,
  FaCalendar,
  FaLeaf,
  FaRecycle,
  FaAward,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import axios from 'axios';
import {
  exportToCSV,
  exportToPDF,
  formatDateForExport,
  formatNumber,
  formatPercentage
} from '../../utils/exportUtils';
import './PerformanceMonitoring.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PerformanceMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState([]);
  const [zoneComparison, setZoneComparison] = useState([]);
  const [allReports, setAllReports] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    period: 'monthly',
    zone: '',
    category: '',
    dateRange: 'last30days'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, leaderboard, analytics, reports

  useEffect(() => {
    fetchData();
  }, [filters, pagination.currentPage, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === 'overview') {
        await fetchOverviewData(config);
      } else if (activeTab === 'leaderboard') {
        await fetchLeaderboardData(config);
      } else if (activeTab === 'analytics') {
        await fetchAnalyticsData(config);
      } else if (activeTab === 'reports') {
        await fetchReportsData(config);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewData = async (config) => {
    const [statsRes, topPerformersRes, trendsRes] = await Promise.all([
      axios.get(`${API_URL}/performance/dashboard/stats`, config),
      axios.get(`${API_URL}/performance/top-performers?limit=5`, config),
      axios.get(`${API_URL}/performance/trends?period=${filters.period}`, config)
    ]);

    setDashboardStats(statsRes.data.data);
    setTopPerformers(topPerformersRes.data.data);
    setTrends(trendsRes.data.data);
  };

  const fetchLeaderboardData = async (config) => {
    const params = new URLSearchParams();
    if (filters.period) params.append('period', filters.period);
    if (filters.zone) params.append('zone', filters.zone);
    if (filters.category) params.append('category', filters.category);
    params.append('limit', 50);

    const response = await axios.get(
      `${API_URL}/performance/leaderboard?${params.toString()}`,
      config
    );
    setLeaderboard(response.data.data);
  };

  const fetchAnalyticsData = async (config) => {
    const [categoryRes, zoneRes] = await Promise.all([
      axios.get(`${API_URL}/performance/analytics/categories`, config),
      axios.get(`${API_URL}/performance/zones/comparison`, config)
    ]);

    setCategoryAnalytics(categoryRes.data.data);
    setZoneComparison(zoneRes.data.data);
  };

  const fetchReportsData = async (config) => {
    const params = new URLSearchParams();
    params.append('page', pagination.currentPage);
    params.append('limit', pagination.limit);
    if (filters.period) params.append('period', filters.period);

    const response = await axios.get(
      `${API_URL}/performance?${params.toString()}`,
      config
    );

    setAllReports(response.data.data);
    setPagination({
      ...pagination,
      totalPages: response.data.pagination?.totalPages || 1
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExportLeaderboard = (format) => {
    const columns = [
      { header: 'Rank', key: 'rank' },
      { header: 'Resident Name', key: 'resident.name' },
      { header: 'Email', key: 'resident.email' },
      { header: 'Zone', key: 'resident.zone.name' },
      { header: 'Completion Rate (%)', key: 'completionRate' },
      { header: 'Total Tasks', key: 'totalTasks' },
      { header: 'Completed Tasks', key: 'completedTasks' },
      { header: 'Reward Points', key: 'resident.rewardPoints.current' }
    ];

    const dataWithRank = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    const filename = `performance-leaderboard-${filters.period}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(dataWithRank, columns, filename);
    } else if (format === 'pdf') {
      exportToPDF(dataWithRank, columns, 'Performance Leaderboard');
    }
  };

  const handleExportReports = (format) => {
    const columns = [
      { header: 'Resident', key: 'resident.name' },
      { header: 'Email', key: 'resident.email' },
      { header: 'Period', key: 'period' },
      { header: 'Completion Rate (%)', key: 'completionRate' },
      { header: 'Tasks Completed', key: 'tasksCompleted' },
      { header: 'Total Tasks', key: 'totalTasks' },
      { header: 'Generated Date', key: 'generatedAt' }
    ];

    const formattedData = allReports.map(report => ({
      ...report,
      generatedAt: formatDateForExport(report.generatedAt),
      completionRate: formatPercentage(report.completionRate)
    }));

    const filename = `performance-reports-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(formattedData, columns, filename);
    } else if (format === 'pdf') {
      exportToPDF(formattedData, columns, 'Performance Reports');
    }
  };

  const handleExportAnalytics = (format) => {
    const columns = [
      { header: 'Category', key: 'category' },
      { header: 'Total Tasks', key: 'totalTasks' },
      { header: 'Completed', key: 'completedTasks' },
      { header: 'Completion Rate (%)', key: 'completionRate' },
      { header: 'Average Score', key: 'averageScore' }
    ];

    const filename = `category-analytics-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(categoryAnalytics, columns, filename);
    } else if (format === 'pdf') {
      exportToPDF(categoryAnalytics, columns, 'Category Analytics');
    }
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getPerformanceIcon = (rate) => {
    if (rate >= 80) return <FaCheckCircle />;
    if (rate >= 60) return <FaExclamationTriangle />;
    return <FaExclamationTriangle />;
  };

  return (
    <div className="performance-monitoring">
      <div className="page-header">
        <div>
          <h1>
            <FaChartLine className="header-icon" />
            Performance Monitoring
          </h1>
          <p className="subtitle">
            Monitor and analyze resident sustainability performance
          </p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <FaTrophy /> Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaLeaf /> Analytics
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FaUsers /> Reports
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          {activeTab === 'leaderboard' && (
            <>
              <select
                value={filters.zone}
                onChange={(e) => handleFilterChange('zone', e.target.value)}
              >
                <option value="">All Zones</option>
                {/* Zone filtering will be enabled once zones are properly configured */}
              </select>

              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="recycling">Recycling</option>
                <option value="composting">Composting</option>
                <option value="reduction">Waste Reduction</option>
              </select>
            </>
          )}
        </div>

        <div className="export-buttons">
          {activeTab === 'leaderboard' && (
            <>
              <button
                className="btn-export"
                onClick={() => handleExportLeaderboard('csv')}
                disabled={leaderboard.length === 0}
              >
                <FaDownload /> Export CSV
              </button>
              <button
                className="btn-export"
                onClick={() => handleExportLeaderboard('pdf')}
                disabled={leaderboard.length === 0}
              >
                <FaDownload /> Export PDF
              </button>
            </>
          )}
          {activeTab === 'reports' && (
            <>
              <button
                className="btn-export"
                onClick={() => handleExportReports('csv')}
                disabled={allReports.length === 0}
              >
                <FaDownload /> Export CSV
              </button>
              <button
                className="btn-export"
                onClick={() => handleExportReports('pdf')}
                disabled={allReports.length === 0}
              >
                <FaDownload /> Export PDF
              </button>
            </>
          )}
          {activeTab === 'analytics' && (
            <>
              <button
                className="btn-export"
                onClick={() => handleExportAnalytics('csv')}
                disabled={categoryAnalytics.length === 0}
              >
                <FaDownload /> Export CSV
              </button>
              <button
                className="btn-export"
                onClick={() => handleExportAnalytics('pdf')}
                disabled={categoryAnalytics.length === 0}
              >
                <FaDownload /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading performance data...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && dashboardStats && (
            <div className="overview-content">
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                    <FaUsers />
                  </div>
                  <div className="stat-content">
                    <h3>Total Residents</h3>
                    <div className="stat-value">{formatNumber(dashboardStats.totalResidents || 0)}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                    <FaCheckCircle />
                  </div>
                  <div className="stat-content">
                    <h3>Avg Completion Rate</h3>
                    <div className="stat-value">
                      {formatPercentage(dashboardStats.averageCompletionRate || 0)}
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                    <FaAward />
                  </div>
                  <div className="stat-content">
                    <h3>Total Points Earned</h3>
                    <div className="stat-value">
                      {formatNumber(dashboardStats.totalPointsEarned || 0)}
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
                    <FaRecycle />
                  </div>
                  <div className="stat-content">
                    <h3>Tasks Completed</h3>
                    <div className="stat-value">
                      {formatNumber(dashboardStats.totalTasksCompleted || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="section-card">
                <h2>
                  <FaTrophy className="section-icon" />
                  Top Performers
                </h2>
                <div className="top-performers-grid">
                  {topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.resident?._id || index} className="performer-card">
                      <div className="performer-rank" style={{
                        backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : '#e5e7eb'
                      }}>
                        #{index + 1}
                      </div>
                      <div className="performer-info">
                        <h4>{performer.resident?.name || 'Unknown'}</h4>
                        <p>{performer.resident?.email || ''}</p>
                        <div className="performer-stats">
                          <span>
                            <FaCheckCircle style={{ color: getPerformanceColor(performer.completionRate) }} />
                            {formatPercentage(performer.completionRate || 0)}
                          </span>
                          <span>
                            <FaAward style={{ color: '#f59e0b' }} />
                            {formatNumber(performer.totalPoints || 0)} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trends Chart */}
              {trends.length > 0 && (
                <div className="section-card">
                  <h2>
                    <FaChartLine className="section-icon" />
                    Completion Trends
                  </h2>
                  <div className="trends-chart">
                    {trends.map((trend, index) => (
                      <div key={index} className="trend-bar">
                        <div className="trend-label">{trend.period}</div>
                        <div className="trend-bar-container">
                          <div
                            className="trend-bar-fill"
                            style={{
                              width: `${trend.completionRate || 0}%`,
                              backgroundColor: getPerformanceColor(trend.completionRate)
                            }}
                          >
                            <span>{formatPercentage(trend.completionRate || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="leaderboard-content">
              <div className="leaderboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Resident</th>
                      <th>Zone</th>
                      <th>Completion Rate</th>
                      <th>Tasks</th>
                      <th>Points</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.resident?._id || index}>
                        <td>
                          <div className="rank-badge" style={{
                            backgroundColor: index < 3 ? '#fbbf24' : '#e5e7eb',
                            color: index < 3 ? 'white' : '#6b7280'
                          }}>
                            #{index + 1}
                          </div>
                        </td>
                        <td>
                          <div className="resident-info">
                            <strong>{entry.resident?.name || 'Unknown'}</strong>
                            <small>{entry.resident?.email || ''}</small>
                          </div>
                        </td>
                        <td>{entry.resident?.zone?.name || 'N/A'}</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${entry.completionRate || 0}%`,
                                  backgroundColor: getPerformanceColor(entry.completionRate)
                                }}
                              />
                            </div>
                            <span>{formatPercentage(entry.completionRate || 0)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="task-count">
                            {entry.completedTasks || 0} / {entry.totalTasks || 0}
                          </span>
                        </td>
                        <td>
                          <span className="points-badge">
                            <FaAward /> {formatNumber(entry.resident?.rewardPoints?.current || 0)}
                          </span>
                        </td>
                        <td>
                          {getPerformanceIcon(entry.completionRate)}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No leaderboard data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-content">
              {/* Category Analytics */}
              {categoryAnalytics.length > 0 && (
                <div className="section-card">
                  <h2>
                    <FaLeaf className="section-icon" />
                    Category Performance
                  </h2>
                  <div className="category-grid">
                    {categoryAnalytics.map((category, index) => (
                      <div key={index} className="category-card">
                        <h4>{category.category || 'Unknown'}</h4>
                        <div className="category-stats">
                          <div className="stat-item">
                            <span className="stat-label">Total Tasks</span>
                            <span className="stat-value">{formatNumber(category.totalTasks || 0)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{formatNumber(category.completedTasks || 0)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Rate</span>
                            <span
                              className="stat-value"
                              style={{ color: getPerformanceColor(category.completionRate) }}
                            >
                              {formatPercentage(category.completionRate || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone Comparison */}
              {zoneComparison.length > 0 && (
                <div className="section-card">
                  <h2>
                    <FaUsers className="section-icon" />
                    Zone Comparison
                  </h2>
                  <div className="zone-comparison-chart">
                    {zoneComparison.map((zone, index) => (
                      <div key={index} className="zone-bar">
                        <div className="zone-info">
                          <strong>{zone.zone?.name || 'Unknown Zone'}</strong>
                          <small>{formatNumber(zone.totalResidents || 0)} residents</small>
                        </div>
                        <div className="zone-bar-container">
                          <div
                            className="zone-bar-fill"
                            style={{
                              width: `${zone.averageCompletionRate || 0}%`,
                              backgroundColor: getPerformanceColor(zone.averageCompletionRate)
                            }}
                          >
                            <span>{formatPercentage(zone.averageCompletionRate || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-content">
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Period</th>
                      <th>Completion Rate</th>
                      <th>Tasks</th>
                      <th>Generated Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReports.map((report, index) => (
                      <tr key={report._id || index}>
                        <td>
                          <div className="resident-info">
                            <strong>{report.resident?.name || 'Unknown'}</strong>
                            <small>{report.resident?.email || ''}</small>
                          </div>
                        </td>
                        <td>
                          <span className="period-badge">{report.period || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${report.completionRate || 0}%`,
                                  backgroundColor: getPerformanceColor(report.completionRate)
                                }}
                              />
                            </div>
                            <span>{formatPercentage(report.completionRate || 0)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="task-count">
                            {report.tasksCompleted || 0} / {report.totalTasks || 0}
                          </span>
                        </td>
                        <td>{formatDateForExport(report.generatedAt)}</td>
                      </tr>
                    ))}
                    {allReports.length === 0 && (
                      <tr>
                        <td colSpan="5" className="no-data">
                          No reports available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={pagination.currentPage === 1}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceMonitoring;
