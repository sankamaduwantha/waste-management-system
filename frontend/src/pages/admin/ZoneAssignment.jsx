/**
 * @fileoverview Admin Zone Assignment Page
 * @description Interface for admins to assign zones to users
 */

import { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaUser, FaCheck, FaTimes, FaSpinner, FaUsers, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../components/common/ToastContainer';

const ZoneAssignment = () => {
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningUser, setAssigningUser] = useState(null);
  const [selectedZones, setSelectedZones] = useState({});
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    hasZone: 'all'
  });
  const [bulkAssignments, setBulkAssignments] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, zonesRes] = await Promise.all([
        api.get('/users', {
          params: {
            role: filters.role || undefined,
            search: filters.search || undefined
          }
        }),
        api.get('/zones')
      ]);

      let fetchedUsers = usersRes.data.data.users;

      // Filter by zone status
      if (filters.hasZone === 'with') {
        fetchedUsers = fetchedUsers.filter(u => u.zone);
      } else if (filters.hasZone === 'without') {
        fetchedUsers = fetchedUsers.filter(u => !u.zone);
      }

      setUsers(fetchedUsers);
      setZones(zonesRes.data.data.zones || zonesRes.data.data);

      // Initialize selected zones
      const initial = {};
      fetchedUsers.forEach(user => {
        if (user.zone) {
          initial[user._id] = user.zone._id || user.zone;
        }
      });
      setSelectedZones(initial);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (userId, zoneId) => {
    setSelectedZones(prev => ({
      ...prev,
      [userId]: zoneId
    }));
  };

  const assignZone = async (userId, zoneId) => {
    if (!zoneId) {
      showErrorToast('Please select a zone first');
      return;
    }

    setAssigningUser(userId);
    try {
      const response = await api.patch(`/users/${userId}/assign-zone`, {
        zoneId
      });

      showSuccessToast(response.data.message || 'Zone assigned successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign zone:', error);
      showErrorToast(error.response?.data?.message || 'Failed to assign zone');
    } finally {
      setAssigningUser(null);
    }
  };

  const toggleBulkSelection = (userId) => {
    setBulkAssignments(prev => {
      const exists = prev.find(a => a.userId === userId);
      if (exists) {
        return prev.filter(a => a.userId !== userId);
      } else {
        const zoneId = selectedZones[userId];
        if (!zoneId) {
          showErrorToast('Please select a zone for this user first');
          return prev;
        }
        return [...prev, { userId, zoneId }];
      }
    });
  };

  const executeBulkAssignment = async () => {
    if (bulkAssignments.length === 0) {
      showErrorToast('No users selected for bulk assignment');
      return;
    }

    if (!confirm(`Assign zones to ${bulkAssignments.length} users?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/bulk/assign-zones', {
        assignments: bulkAssignments
      });

      const { successful, failed, summary } = response.data.data;

      if (summary.successful > 0) {
        showSuccessToast(
          `Successfully assigned zones to ${summary.successful} user${summary.successful > 1 ? 's' : ''}!`
        );
      }

      if (summary.failed > 0) {
        showErrorToast(`Failed to assign ${summary.failed} zone${summary.failed > 1 ? 's' : ''}`);
        console.log('Failed assignments:', failed);
      }

      setBulkAssignments([]);
      setBulkMode(false);
      fetchData();
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      showErrorToast(error.response?.data?.message || 'Bulk assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z._id === zoneId);
    return zone ? zone.name : 'Unknown Zone';
  };

  const stats = {
    total: users.length,
    withZone: users.filter(u => u.zone).length,
    withoutZone: users.filter(u => !u.zone).length
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaMapMarkedAlt className="mr-3 text-primary-600" />
          Zone Assignment
        </h1>
        <p className="text-gray-600 mt-2">
          Assign zones to users to enable location-based services
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FaUsers className="text-4xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Zone</p>
              <p className="text-3xl font-bold text-green-600">{stats.withZone}</p>
            </div>
            <FaCheck className="text-4xl text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Without Zone</p>
              <p className="text-3xl font-bold text-red-600">{stats.withoutZone}</p>
            </div>
            <FaTimes className="text-4xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="resident">Resident</option>
              <option value="garbage_collector">Garbage Collector</option>
              <option value="city_manager">City Manager</option>
              <option value="sustainability_manager">Sustainability Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Status
            </label>
            <select
              value={filters.hasZone}
              onChange={(e) => setFilters({ ...filters, hasZone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Users</option>
              <option value="with">With Zone</option>
              <option value="without">Without Zone</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                bulkMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {bulkMode ? 'Cancel Bulk' : 'Bulk Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Bulk Assignment Mode
              </p>
              <p className="text-sm text-blue-700">
                {bulkAssignments.length} user(s) selected
              </p>
            </div>
            <button
              onClick={executeBulkAssignment}
              disabled={bulkAssignments.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Assign {bulkAssignments.length} Zone(s)
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {bulkMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assign Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isSelected = bulkAssignments.some(a => a.userId === user._id);
                const isAssigning = assigningUser === user._id;

                return (
                  <tr key={user._id} className={isSelected ? 'bg-blue-50' : ''}>
                    {bulkMode && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBulkSelection(user._id)}
                          className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <FaUser className="text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.zone ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <FaCheck className="mr-1" />
                          {user.zone.name || getZoneName(user.zone)}
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <FaTimes className="mr-1" />
                          No Zone
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={selectedZones[user._id] || ''}
                        onChange={(e) => handleZoneChange(user._id, e.target.value)}
                        disabled={isAssigning}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
                      >
                        <option value="">Select Zone</option>
                        {zones.map(zone => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name} ({zone.code || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!bulkMode && (
                        <button
                          onClick={() => assignZone(user._id, selectedZones[user._id])}
                          disabled={isAssigning || !selectedZones[user._id]}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigning ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <FaCheck className="mr-2" />
                              Assign
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneAssignment;
