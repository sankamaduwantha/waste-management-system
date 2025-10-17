import { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaCalendar, FaFilter, FaSpinner, FaChartBar } from 'react-icons/fa';
import usePerformanceStore from '../../store/performanceStore';
import { toast } from 'react-toastify';

const Reports = () => {
  const { 
    reports, 
    loading, 
    fetchReports, 
    generateReport,
    filters,
    setFilters 
  } = usePerformanceStore();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = () => {
    setFilters({ period: selectedPeriod });
    fetchReports({ period: selectedPeriod });
  };

  const handleGenerateReport = async (residentId) => {
    try {
      setGenerating(true);
      await generateReport({
        residentId,
        period: selectedPeriod
      });
      toast.success('Report generated successfully!');
      loadReports();
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Reports</h1>
          <p className="text-gray-600 mt-1">View and generate resident performance reports</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="all-time">All Time</option>
          </select>
          <button
            onClick={loadReports}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FaFilter />
            Filter
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Reports</p>
              <p className="text-3xl font-bold mt-2">{reports.length}</p>
            </div>
            <FaFileAlt className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Completion</p>
              <p className="text-3xl font-bold mt-2">
                {reports.length > 0
                  ? Math.round(
                      reports.reduce((acc, r) => acc + (r.taskMetrics?.completionRate || 0), 0) /
                        reports.length
                    )
                  : 0}%
              </p>
            </div>
            <FaChartBar className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Points</p>
              <p className="text-3xl font-bold mt-2">
                {reports.reduce((acc, r) => acc + (r.taskMetrics?.totalPoints || 0), 0).toLocaleString()}
              </p>
            </div>
            <FaCalendar className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Period</p>
              <p className="text-2xl font-bold mt-2 capitalize">{selectedPeriod}</p>
            </div>
            <FaFilter className="text-5xl text-orange-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Generated Reports</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No reports found</p>
            <p className="text-gray-400 mt-2">Generate reports to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.resident?.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.resident?.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {report.reportPeriod?.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.taskMetrics?.completed || 0} / {report.taskMetrics?.assigned || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${report.taskMetrics?.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">
                          {Math.round(report.taskMetrics?.completionRate || 0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(report.performanceGrade || 'F')}`}>
                        {report.performanceGrade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {report.taskMetrics?.totalPoints?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                        title="Download Report"
                      >
                        <FaDownload />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
