/**
 * @fileoverview Admin Collectors Management Page
 * @description Interface for admins to manage garbage collectors, their tasks, and performance
 */

import { useState, useEffect } from 'react';
import { 
  FaQrcode, FaSearch, FaTrophy, FaTasks, FaChartLine, 
  FaUser, FaSpinner, FaRoute, FaCheckCircle, FaClock
} from 'react-icons/fa';
import api from '../../services/api';

const CollectorsManagement = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'performance' | 'tasks' | 'achievements'
  const [filters, setFilters] = useState({
    search: '',
    zone: '',
    status: 'active'
  });
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchZones();
    fetchCollectors();
  }, [filters]);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      setZones(response.data.data.zones || response.data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: {
          role: 'garbage_collector',
          ...filters
        }
      });
      setCollectors(response.data.data.users || response.data.data);
    } catch (error) {
      console.error('Failed to fetch collectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCollectorDetails = async (collector, type) => {
    setSelectedCollector(collector);
    setModalType(type);
    setShowModal(true);

    if (type === 'performance') {
      await fetchCollectorPerformance(collector._id);
    } else if (type === 'tasks') {
      await fetchCollectorTasks(collector._id);
    } else if (type === 'achievements') {
      await fetchCollectorAchievements(collector._id);
    }
  };

  const fetchCollectorPerformance = async (collectorId) => {
    try {
      const response = await api.get(`/collectors/${collectorId}/performance`);
      setSelectedCollector(prev => ({
        ...prev,
        performance: response.data.data.performance || response.data.data
      }));
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const fetchCollectorTasks = async (collectorId) => {
    try {
      const response = await api.get(`/collectors/${collectorId}/tasks`);
      setSelectedCollector(prev => ({
        ...prev,
        tasks: response.data.data.tasks || response.data.data
      }));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchCollectorAchievements = async (collectorId) => {
    try {
      const response = await api.get(`/collectors/${collectorId}/achievements`);
      setSelectedCollector(prev => ({
        ...prev,
        achievements: response.data.data.achievements || response.data.data
      }));
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const filteredCollectors = collectors.filter(collector => {
    const matchesSearch = !filters.search || 
      collector.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      collector.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesZone = !filters.zone || collector.zone?._id === filters.zone;
    
    return matchesSearch && matchesZone;
  });

  const stats = {
    total: filteredCollectors.length,
    active: filteredCollectors.filter(c => c.isActive).length,
    inactive: filteredCollectors.filter(c => !c.isActive).length,
    zones: [...new Set(filteredCollectors.map(c => c.zone?._id).filter(Boolean))].length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaQrcode className="mr-3 text-primary-600" />
          Collectors Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage garbage collectors, monitor performance, and track achievements
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Collectors</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Zones</p>
          <p className="text-2xl font-bold text-blue-600">{stats.zones}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone._id} value={zone._id}>{zone.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', zone: '', status: 'active' })}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Collectors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
            <span className="ml-3 text-gray-600">Loading collectors...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCollectors.map((collector) => (
                  <tr key={collector._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FaUser className="text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {collector.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {collector._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {collector.zone?.name || 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(collector.isActive !== false)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collector.email}</div>
                      <div className="text-sm text-gray-500">{collector.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewCollectorDetails(collector, 'performance')}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Performance"
                      >
                        <FaChartLine className="inline mr-1" />
                        Performance
                      </button>
                      <button
                        onClick={() => viewCollectorDetails(collector, 'tasks')}
                        className="text-green-600 hover:text-green-900"
                        title="View Tasks"
                      >
                        <FaTasks className="inline mr-1" />
                        Tasks
                      </button>
                      <button
                        onClick={() => viewCollectorDetails(collector, 'achievements')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="View Achievements"
                      >
                        <FaTrophy className="inline mr-1" />
                        Achievements
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCollectors.length === 0 && (
              <div className="text-center py-12">
                <FaQrcode className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No collectors found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedCollector && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCollector.name} - {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    ×
                  </button>
                </div>
                
                {modalType === 'performance' && (
                  <div className="space-y-4">
                    {selectedCollector.performance ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Collections</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {selectedCollector.performance.totalCollections || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Waste (kg)</p>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedCollector.performance.totalWasteCollected || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Recycled (kg)</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedCollector.performance.totalRecycled || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Efficiency Score</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedCollector.performance.efficiencyScore || 0}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No performance data available</p>
                    )}
                  </div>
                )}

                {modalType === 'tasks' && (
                  <div className="space-y-3">
                    {selectedCollector.tasks && selectedCollector.tasks.length > 0 ? (
                      selectedCollector.tasks.map((task, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{task.title || 'Task'}</h4>
                              <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No tasks assigned</p>
                    )}
                  </div>
                )}

                {modalType === 'achievements' && (
                  <div className="space-y-3">
                    {selectedCollector.achievements && selectedCollector.achievements.length > 0 ? (
                      selectedCollector.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4">
                          <FaTrophy className="text-yellow-500 text-2xl" />
                          <div>
                            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No achievements yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorsManagement;
