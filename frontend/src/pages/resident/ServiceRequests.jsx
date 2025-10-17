import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaMapMarkerAlt,
  FaImage,
  FaStar,
  FaTimesCircle
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/v1/service-requests';
const ZONE_API_URL = 'http://localhost:5000/api/v1/zones/list/active';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    zone: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchZones();
  }, [filterStatus, filterType]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}?status=${filterStatus}&type=${filterType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
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

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Clean up location data - remove empty lat/long
      const requestData = { ...formData };
      if (!requestData.location.latitude || !requestData.location.longitude) {
        delete requestData.location.latitude;
        delete requestData.location.longitude;
      }

      await axios.post(API_URL, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('📝 Service request created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/${selectedRequest._id}/feedback`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('⭐ Feedback submitted successfully!');
      setShowFeedbackModal(false);
      resetFeedbackForm();
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (request) => {
    setSelectedRequest(request);
    setFeedbackData({
      rating: request.feedback?.rating || 5,
      comment: request.feedback?.comment || ''
    });
    setShowFeedbackModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      description: '',
      priority: 'medium',
      location: {
        address: '',
        latitude: '',
        longitude: ''
      },
      zone: ''
    });
  };

  const resetFeedbackForm = () => {
    setFeedbackData({
      rating: 5,
      comment: ''
    });
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock /> },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaClipboardList /> },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FaExclamationCircle /> },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle /> },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FaTimesCircle /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimesCircle /> }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {status?.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return badges[priority] || badges.medium;
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
    return badges[type] || badges.other;
  };

  const getStatusCount = (status) => {
    return requests.filter(req => req.status === status).length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Service Requests</h1>
          <p className="text-gray-600">Submit and track your service requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg transition-all"
        >
          <FaPlus /> New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{getStatusCount('pending')}</p>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Assigned</p>
              <p className="text-2xl font-bold text-gray-800">{getStatusCount('assigned')}</p>
            </div>
            <FaClipboardList className="text-4xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">{getStatusCount('in-progress')}</p>
            </div>
            <FaExclamationCircle className="text-4xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Resolved</p>
              <p className="text-2xl font-bold text-gray-800">{getStatusCount('resolved')}</p>
            </div>
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-6">
        {requests.map(request => (
          <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{request.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(request.type)}`}>
                    {request.type?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaMapMarkerAlt />
                  <span>{request.location?.address || 'No address provided'}</span>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(request.status)}
                <p className="text-xs text-gray-500 mt-2">#{request.requestNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Zone</p>
                <p className="text-sm font-medium text-gray-800">{request.zone?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-800">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {request.assignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Assigned To</p>
                <p className="text-sm font-medium text-gray-800">{request.assignedTo.name}</p>
                {request.scheduledDate && (
                  <p className="text-xs text-gray-500">Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {request.status === 'resolved' && (
              <div>
                {request.resolutionNotes && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">Resolution Notes</p>
                    <p className="text-sm text-gray-800">{request.resolutionNotes}</p>
                  </div>
                )}
                
                {request.feedback ? (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-gray-600">Your Feedback:</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < request.feedback.rating ? 'text-yellow-500' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    {request.feedback.comment && (
                      <p className="text-sm text-gray-800">{request.feedback.comment}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openFeedbackModal(request)}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaStar /> Submit Feedback
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No service requests found</p>
          <p className="text-gray-400 text-sm">Create your first request to get started</p>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Create Service Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="missed_collection">Missed Collection</option>
                    <option value="bulk_pickup">Bulk Pickup</option>
                    <option value="illegal_dumping">Illegal Dumping</option>
                    <option value="bin_request">Bin Request</option>
                    <option value="bin_repair">Bin Repair</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  maxLength={1000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed information about the request"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Address *</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: {...formData.location, address: e.target.value}
                  })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the address where service is needed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.latitude || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {...formData.location, latitude: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6.9271"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.longitude || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {...formData.location, longitude: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 79.8612"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Submit Feedback</h2>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Request:</strong> {selectedRequest?.requestNumber} - {selectedRequest?.title}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({...feedbackData, rating: star})}
                      className="text-3xl focus:outline-none transition-colors"
                    >
                      <FaStar className={star <= feedbackData.rating ? 'text-yellow-500' : 'text-gray-300'} />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">({feedbackData.rating}/5)</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with the service..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
