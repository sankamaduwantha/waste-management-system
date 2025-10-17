/**
 * @fileoverview Admin Appointments Management Page
 * @description Interface for admins to manage all appointments
 */

import { useState, useEffect } from 'react';
import { 
  FaCalendar, FaSearch, FaFilter, FaEye, FaEdit, FaTimes, 
  FaCheck, FaSpinner, FaClock, FaMapMarkedAlt, FaUser, FaTrash, FaExchangeAlt
} from 'react-icons/fa';
import api from '../../services/api';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../components/common/ToastContainer';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    zone: ''
  });
  const [zones, setZones] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchZones();
    fetchAppointments();
  }, [filters]);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      setZones(response.data.data.zones || response.data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.zone) params.zone = filters.zone;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/appointments/admin/all', { params });
      setAppointments(response.data.data.appointments || response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewAppointment = async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      setSelectedAppointment(response.data.data.appointment);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch appointment details:', error);
      showErrorToast('Failed to load appointment details');
    }
  };

  const updateAppointmentStatus = async (id, action) => {
    const confirmMsg = {
      confirm: 'Confirm this appointment?',
      start: 'Mark this appointment as in progress?',
      complete: 'Mark this appointment as completed?',
      cancel: 'Cancel this appointment?'
    }[action];

    if (!confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      let endpoint = `/appointments/admin/${id}/${action}`;
      let data = {};

      if (action === 'cancel') {
        const reason = prompt('Cancellation reason:');
        if (!reason) {
          setActionLoading(false);
          return;
        }
        endpoint = `/appointments/${id}`;
        data = { reason };
        await api.delete(endpoint, { data });
        showSuccessToast('Appointment cancelled successfully');
      } else if (action === 'complete') {
        const actualAmount = prompt('Actual amount collected (kg):');
        if (!actualAmount) {
          setActionLoading(false);
          return;
        }
        data = { actualAmount: parseFloat(actualAmount) };
        await api.patch(endpoint, data);
        showSuccessToast(`Appointment completed! ${actualAmount}kg collected`);
      } else {
        await api.patch(endpoint, data);
        const successMessages = {
          confirm: 'Appointment confirmed successfully!',
          start: 'Collection started successfully!'
        };
        showSuccessToast(successMessages[action] || 'Appointment updated successfully');
      }

      fetchAppointments();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      showErrorToast(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
      timeSlot: appointment.timeSlot,
      wasteTypes: appointment.wasteTypes || [],
      estimatedAmount: appointment.estimatedAmount || '',
      specialInstructions: appointment.specialInstructions || '',
      zone: appointment.zone?._id || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/appointments/admin/${selectedAppointment._id}`, editFormData);
      showSuccessToast('Appointment updated successfully!');
      fetchAppointments();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      showErrorToast(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/appointments/admin/${id}`);
      showSuccessToast('Appointment deleted successfully!');
      fetchAppointments();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      showErrorToast(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.patch(`/appointments/admin/${selectedAppointment._id}/status`, {
        status: newStatus,
        reason: statusReason
      });
      showSuccessToast(`Appointment status changed to ${newStatus}!`);
      fetchAppointments();
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to change status:', error);
      showErrorToast(error.response?.data?.message || 'Failed to change status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaCalendar className="mr-3 text-primary-600" />
          Appointments Management
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage all appointments system-wide
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center mb-4">
          <FaFilter className="text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', search: '', startDate: '', endDate: '', zone: '' })}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
            <span className="ml-3 text-gray-600">Loading appointments...</span>
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
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waste Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <FaUser className="text-primary-600 text-xs" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {apt.resident?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {apt.resident?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {apt.timeSlot?.start} - {apt.timeSlot?.end}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkedAlt className="mr-1 text-gray-400" />
                        {apt.zone?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {apt.wasteTypes?.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewAppointment(apt._id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <FaEye className="inline" />
                        </button>
                        <button
                          onClick={() => openEditModal(apt)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Appointment"
                        >
                          <FaEdit className="inline" />
                        </button>
                        <button
                          onClick={() => openStatusModal(apt)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Change Status"
                        >
                          <FaExchangeAlt className="inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(apt._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Appointment"
                        >
                          <FaTrash className="inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <div className="text-center py-12">
                <FaCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Resident</p>
                      <p className="font-medium">{selectedAppointment.resident?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(selectedAppointment.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{selectedAppointment.timeSlot?.start} - {selectedAppointment.timeSlot?.end}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Zone</p>
                      <p className="font-medium">{selectedAppointment.zone?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Amount</p>
                      <p className="font-medium">{selectedAppointment.estimatedAmount} kg</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Waste Types</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.wasteTypes?.map((type, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedAppointment.specialInstructions && (
                    <div>
                      <p className="text-sm text-gray-500">Special Instructions</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedAppointment.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'confirm')}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FaCheck className="inline mr-2" />
                    Confirm
                  </button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'start')}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <FaClock className="inline mr-2" />
                    Start Collection
                  </button>
                )}
                {selectedAppointment.status === 'in_progress' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'complete')}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <FaCheck className="inline mr-2" />
                    Complete
                  </button>
                )}
                {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'cancel')}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowEditModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleEditSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Appointment</h3>
                    <button type="button" onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={editFormData.appointmentDate}
                          onChange={(e) => setEditFormData({...editFormData, appointmentDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                        <select
                          value={editFormData.zone}
                          onChange={(e) => setEditFormData({...editFormData, zone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Select Zone</option>
                          {zones.map(zone => (
                            <option key={zone._id} value={zone._id}>{zone.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount (kg)</label>
                      <input
                        type="number"
                        value={editFormData.estimatedAmount}
                        onChange={(e) => setEditFormData({...editFormData, estimatedAmount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <textarea
                        value={editFormData.specialInstructions}
                        onChange={(e) => setEditFormData({...editFormData, specialInstructions: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {actionLoading ? <FaSpinner className="inline animate-spin mr-2" /> : <FaCheck className="inline mr-2" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowStatusModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleStatusChange}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Change Appointment Status</h3>
                    <button type="button" onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                      <div className="mb-3">{getStatusBadge(selectedAppointment.status)}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                      <textarea
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        rows="3"
                        placeholder="Enter reason for status change..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {actionLoading ? <FaSpinner className="inline animate-spin mr-2" /> : <FaExchangeAlt className="inline mr-2" />}
                    Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
