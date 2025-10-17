/**
 * @fileoverview Admin Reports Generation Page
 * @description Interface for admins to generate and download various system reports
 */

import { useState } from 'react';
import { 
  FaFileAlt, FaDownload, FaCalendar, FaChartBar, FaUsers, 
  FaTruck, FaRecycle, FaCreditCard, FaSpinner, FaCheckCircle
} from 'react-icons/fa';
import api from '../../services/api';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../components/common/ToastContainer';

const ReportsManagement = () => {
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    type: 'waste-collection',
    format: 'pdf',
    startDate: '',
    endDate: '',
    zone: '',
    includeCharts: true,
    includeDetails: true
  });

  const reportTypes = [
    {
      id: 'waste-collection',
      name: 'Waste Collection Report',
      description: 'Detailed waste collection statistics by zone and date range',
      icon: FaRecycle,
      color: 'green'
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Payment transactions, revenue, and financial summaries',
      icon: FaCreditCard,
      color: 'blue'
    },
    {
      id: 'collectors-performance',
      name: 'Collectors Performance',
      description: 'Performance metrics for all garbage collectors',
      icon: FaTruck,
      color: 'purple'
    },
    {
      id: 'residents-activity',
      name: 'Residents Activity',
      description: 'User engagement, appointments, and participation rates',
      icon: FaUsers,
      color: 'yellow'
    },
    {
      id: 'sustainability',
      name: 'Sustainability Report',
      description: 'Recycling rates, environmental impact, and sustainability metrics',
      icon: FaChartBar,
      color: 'teal'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive System Report',
      description: 'All-inclusive system overview with all metrics',
      icon: FaFileAlt,
      color: 'indigo'
    }
  ];

  const generateReport = async () => {
    setGenerating(true);
    setGeneratedReport(null);

    try {
      // Simulate report generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock report data
      const mockReport = {
        id: `REPORT-${Date.now()}`,
        type: reportConfig.type,
        generatedAt: new Date().toISOString(),
        format: reportConfig.format,
        dateRange: {
          start: reportConfig.startDate,
          end: reportConfig.endDate
        },
        summary: {
          totalRecords: Math.floor(Math.random() * 1000) + 100,
          processed: true
        }
      };

      setGeneratedReport(mockReport);

      // In real implementation, call API
      // const response = await api.post('/reports/generate', reportConfig);
      // setGeneratedReport(response.data.data.report);

    } catch (error) {
      console.error('Failed to generate report:', error);
      showErrorToast(error.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async () => {
    if (!generatedReport) return;

    try {
      // In real implementation, download from API
      // const response = await api.get(`/reports/${generatedReport.id}/download`, {
      //   responseType: 'blob'
      // });

      // For now, create a mock download
      const reportContent = `
${reportTypes.find(r => r.id === reportConfig.type)?.name}
Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}
Date Range: ${reportConfig.startDate} to ${reportConfig.endDate}

Report Details:
- Total Records: ${generatedReport.summary.totalRecords}
- Format: ${reportConfig.format.toUpperCase()}
- Zone: ${reportConfig.zone || 'All Zones'}

This is a sample report. Implement actual report generation in the backend.
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportConfig.type}-${Date.now()}.${reportConfig.format === 'pdf' ? 'txt' : reportConfig.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccessToast(`${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} report downloaded successfully!`);
    } catch (error) {
      console.error('Failed to download report:', error);
      showErrorToast('Failed to download report. Please try again.');
    }
  };

  const quickReports = [
    { name: 'Today\'s Collections', action: () => generateQuickReport('today-collections') },
    { name: 'This Week Summary', action: () => generateQuickReport('week-summary') },
    { name: 'Monthly Overview', action: () => generateQuickReport('month-overview') },
    { name: 'Zone Performance', action: () => generateQuickReport('zone-performance') }
  ];

  const generateQuickReport = async (type) => {
    showInfoToast(`Generating ${type.replace(/-/g, ' ')} report...`);
    // Implement quick report generation
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaFileAlt className="mr-3 text-primary-600" />
          Reports Management
        </h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = reportConfig.type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportConfig({ ...reportConfig, type: type.id })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <IconComponent className={`text-2xl text-${type.color}-600 mr-3 mt-1`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportConfig.startDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={reportConfig.endDate}
                    onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Format</label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="xlsx">Excel Spreadsheet</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Charts & Visualizations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeDetails}
                    onChange={(e) => setReportConfig({ ...reportConfig, includeDetails: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Detailed Data</span>
                </label>
              </div>

              <button
                onClick={generateReport}
                disabled={generating || !reportConfig.startDate || !reportConfig.endDate}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
              >
                {generating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FaFileAlt className="mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Report Preview */}
          {generatedReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Generated Report</h2>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Report ID:</span>
                  <span className="font-mono text-sm">{generatedReport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{reportTypes.find(r => r.id === generatedReport.type)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Generated:</span>
                  <span className="text-sm">{new Date(generatedReport.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Records:</span>
                  <span className="text-sm font-semibold">{generatedReport.summary.totalRecords}</span>
                </div>
              </div>
              <button
                onClick={downloadReport}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Quick Reports */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h2>
            <div className="space-y-2">
              {quickReports.map((report, idx) => (
                <button
                  key={idx}
                  onClick={report.action}
                  className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{report.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-900">Daily Operations</h4>
                <p className="text-xs text-gray-600 mt-1">Collections, routes, and issues</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-900">Weekly Summary</h4>
                <p className="text-xs text-gray-600 mt-1">Performance and achievements</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-900">Monthly Analytics</h4>
                <p className="text-xs text-gray-600 mt-1">Trends and insights</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-primary-900 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-primary-800">
              Schedule automated reports to be sent via email on a regular basis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
