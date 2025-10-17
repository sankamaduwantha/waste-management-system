import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaClipboardList,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserCog,
  FaTruck
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/v1/service-requests';
const USER_API_URL = 'http://localhost:5000/api/v1/users';
const VEHICLE_API_URL = 'http://localhost:5000/api/v1/vehicles';
const ZONE_API_URL = 'http://localhost:5000/api/v1/zones/list/active';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterZone, setFilterZone] = useState('');

  const [assignmentData, setAssignmentData] = useState({
    assignedTo: '',
    assignedVehicle: '',
    scheduledDate: ''
  });

  const [statusData, setStatusData] = useState({
    status: '',
    notes: '',
    resolutionNotes: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
    fetchUsers();
    fetchVehicles();
    fetchZones();
  }, [searchTerm, filterStatus, filterPriority, filterType, filterZone]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}?search=${searchTerm}&status=${filterStatus}&priority=${filterPriority}&type=${filterType}&zone=${filterZone}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stats/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${USER_API_URL}?role=garbage_collector&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${VEHICLE_API_URL}?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(ZONE_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setZones(response.data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const handleAssignRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/${selectedRequest._id}/assign`, assignmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Request assigned successfully!');
      setShowAssignModal(false);
      resetAssignmentForm();
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/${selectedRequest._id}/status`, statusData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Status updated successfully!');
      setShowStatusModal(false);
      resetStatusForm();
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Request cancelled successfully!');
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setAssignmentData({
      assignedTo: request.assignedTo?._id || '',
      assignedVehicle: request.assignedVehicle?._id || '',
      scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : ''
    });
    setShowAssignModal(true);
  };

  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setStatusData({
      status: request.status || '',
      notes: '',
      resolutionNotes: ''
    });
    setShowStatusModal(true);
  };

  const resetAssignmentForm = () => {
    setAssignmentData({
      assignedTo: '',
      assignedVehicle: '',
      scheduledDate: ''
    });
    setSelectedRequest(null);
  };

  const resetStatusForm = () => {
    setStatusData({
      status: '',
      notes: '',
      resolutionNotes: ''
    });
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const badges = {
      missed_collection: 'bg-red-100 text-red-800',
      bulk_pickup: 'bg-purple-100 text-purple-800',
      illegal_dumping: 'bg-orange-100 text-orange-800',
      bin_request: 'bg-blue-100 text-blue-800',
      bin_repair: 'bg-yellow-100 text-yellow-800',
      complaint: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Request Management</h1>
        <p className="text-gray-600">Manage and track service requests from residents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold">{stats.byStatus?.pending || 0}</p>
            </div>
            <FaClock className="text-5xl text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Assigned</p>
              <p className="text-3xl font-bold">{stats.byStatus?.assigned || 0}</p>
            </div>
            <FaClipboardList className="text-5xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-bold">{stats.byStatus?.['in-progress'] || 0}</p>
            </div>
            <FaExclamationCircle className="text-5xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Resolved</p>
              <p className="text-3xl font-bold">{stats.byStatus?.resolved || 0}</p>
            </div>
            <FaCheckCircle className="text-5xl text-green-200" />
          </div>
        </div>
      </div>

      {/* Alert Section */}
      {(stats.urgentUnassigned > 0 || stats.overdueRequests > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-3 text-xl" />
            <div>
              <p className="font-semibold text-red-800">Attention Required</p>
              {stats.urgentUnassigned > 0 && (
                <p className="text-sm text-red-700">{stats.urgentUnassigned} urgent request(s) unassigned</p>
              )}
              {stats.overdueRequests > 0 && (
                <p className="text-sm text-red-700">{stats.overdueRequests} request(s) pending for over 48 hours</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="missed_collection">Missed Collection</option>
            <option value="bulk_pickup">Bulk Pickup</option>
            <option value="illegal_dumping">Illegal Dumping</option>
            <option value="bin_request">Bin Request</option>
            <option value="bin_repair">Bin Repair</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone._id} value={zone._id}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.requestNumber}</div>
                      <div className="text-sm text-gray-500">{request.title}</div>
                      <div className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(request.type)}`}>
                      {request.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.assignedTo?.name || 'Unassigned'}</div>
                    {request.assignedVehicle && (
                      <div className="text-xs text-gray-500">{request.assignedVehicle.vehicleNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.zone?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openAssignModal(request)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Assign"
                    >
                      <FaUserCog />
                    </button>
                    <button
                      onClick={() => openStatusModal(request)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Update Status"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Cancel"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaClipboardList className="mx-auto text-5xl mb-3 text-gray-300" />
            <p>No service requests found</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Assign Request</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignRequest} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Request:</strong> {selectedRequest?.requestNumber} - {selectedRequest?.title}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Team Member</label>
                <select
                  value={assignmentData.assignedTo}
                  onChange={(e) => setAssignmentData({...assignmentData, assignedTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team Member</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
                <select
                  value={assignmentData.assignedVehicle}
                  onChange={(e) => setAssignmentData({...assignmentData, assignedVehicle: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber} - {vehicle.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={assignmentData.scheduledDate}
                  onChange={(e) => setAssignmentData({...assignmentData, scheduledDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Assigning...' : 'Assign Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Update Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Request:</strong> {selectedRequest?.requestNumber} - {selectedRequest?.title}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({...statusData, status: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Notes</label>
                <textarea
                  value={statusData.notes}
                  onChange={(e) => setStatusData({...statusData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this status update..."
                />
              </div>

              {statusData.status === 'resolved' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                  <textarea
                    value={statusData.resolutionNotes}
                    onChange={(e) => setStatusData({...statusData, resolutionNotes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
