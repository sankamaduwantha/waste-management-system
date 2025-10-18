import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaCalendarAlt,
  FaRoute,
  FaTruck,
  FaUsers,
  FaEdit,
  FaTrash,
  FaUserCog,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/v1/schedules';
const ZONE_API_URL = 'http://localhost:5000/api/v1/zones/list/active';
const VEHICLE_API_URL = 'http://localhost:5000/api/v1/vehicles';
const DRIVER_API_URL = 'http://localhost:5000/api/v1/drivers';

const RouteManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({});
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterDay, setFilterDay] = useState('');
  const [filterWasteType, setFilterWasteType] = useState('');
  const [filterZone, setFilterZone] = useState('');

  const [formData, setFormData] = useState({
    zone: '',
    wasteType: 'general',
    collectionDay: 'monday',
    timeSlot: {
      start: '08:00',
      end: '12:00'
    },
    route: '',
    assignedVehicle: '',
    assignedCrew: [],
    frequency: 'weekly',
    estimatedDuration: 60
  });

  const [assignmentData, setAssignmentData] = useState({
    assignedVehicle: '',
    assignedCrew: []
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const wasteTypes = ['general', 'recyclable', 'organic', 'hazardous'];

  useEffect(() => {
    fetchSchedules();
    fetchStats();
    fetchZones();
    fetchVehicles();
    fetchDrivers();
  }, [filterDay, filterWasteType, filterZone]);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}?collectionDay=${filterDay}&wasteType=${filterWasteType}&zone=${filterZone}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
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

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${DRIVER_API_URL}?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleCreateOrUpdateSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Clean up empty values and ensure proper data types
      const cleanedData = { ...formData };
      if (!cleanedData.assignedVehicle) delete cleanedData.assignedVehicle;
      if (!cleanedData.assignedCrew || cleanedData.assignedCrew.length === 0) {
        delete cleanedData.assignedCrew;
      } else {
        // Ensure assignedCrew is sent as an array
        cleanedData.assignedCrew = Array.isArray(cleanedData.assignedCrew) ? cleanedData.assignedCrew : [];
      }

      if (isEditMode) {
        await axios.put(`${API_URL}/${selectedSchedule._id}`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Schedule updated successfully!');
      } else {
        await axios.post(API_URL, cleanedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('📅 Schedule created successfully!');
      }

      setShowCreateModal(false);
      resetForm();
      fetchSchedules();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResources = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Ensure proper data types
      const cleanedAssignmentData = { ...assignmentData };
      
      // Make sure assignedCrew is sent as an array
      if (cleanedAssignmentData.assignedCrew && cleanedAssignmentData.assignedCrew.length > 0) {
        cleanedAssignmentData.assignedCrew = Array.isArray(cleanedAssignmentData.assignedCrew) 
          ? cleanedAssignmentData.assignedCrew 
          : [];
      }
      
      await axios.patch(`${API_URL}/${selectedSchedule._id}/assign`, cleanedAssignmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Resources assigned successfully!');
      setShowAssignModal(false);
      resetAssignmentForm();
      fetchSchedules();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Schedule deleted successfully!');
      fetchSchedules();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      zone: schedule.zone?._id || '',
      wasteType: schedule.wasteType,
      collectionDay: schedule.collectionDay,
      timeSlot: schedule.timeSlot,
      route: schedule.route || '',
      assignedVehicle: schedule.assignedVehicle?._id || '',
      assignedCrew: schedule.assignedCrew?.map(c => c._id) || [],
      frequency: schedule.frequency,
      estimatedDuration: schedule.estimatedDuration || 60
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const openAssignModal = (schedule) => {
    setSelectedSchedule(schedule);
    setAssignmentData({
      assignedVehicle: schedule.assignedVehicle?._id || '',
      assignedCrew: schedule.assignedCrew?.map(c => c._id) || []
    });
    setShowAssignModal(true);
  };

  const resetForm = () => {
    setFormData({
      zone: '',
      wasteType: 'general',
      collectionDay: 'monday',
      timeSlot: {
        start: '08:00',
        end: '12:00'
      },
      route: '',
      assignedVehicle: '',
      assignedCrew: [],
      frequency: 'weekly',
      estimatedDuration: 60
    });
    setSelectedSchedule(null);
    setIsEditMode(false);
  };

  const resetAssignmentForm = () => {
    setAssignmentData({
      assignedVehicle: '',
      assignedCrew: []
    });
    setSelectedSchedule(null);
  };

  const getWasteTypeBadge = (type) => {
    const badges = {
      general: 'bg-gray-100 text-gray-800',
      recyclable: 'bg-green-100 text-green-800',
      organic: 'bg-yellow-100 text-yellow-800',
      hazardous: 'bg-red-100 text-red-800'
    };
    return badges[type] || badges.general;
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.scheduled;
  };

  const getDayShort = (day) => {
    const days = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    return days[day] || day;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Route Management</h1>
          <p className="text-gray-600">Manage collection schedules and routes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg transition-all"
        >
          <FaPlus /> New Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Schedules</p>
              <p className="text-3xl font-bold">{stats.total || 0}</p>
            </div>
            <FaCalendarAlt className="text-5xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Today's Routes</p>
              <p className="text-3xl font-bold">{stats.todaySchedules || 0}</p>
            </div>
            <FaRoute className="text-5xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Unassigned Vehicles</p>
              <p className="text-3xl font-bold">{stats.unassignedVehicles || 0}</p>
            </div>
            <FaTruck className="text-5xl text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Unassigned Crew</p>
              <p className="text-3xl font-bold">{stats.unassignedCrew || 0}</p>
            </div>
            <FaUsers className="text-5xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.unassignedVehicles > 0 || stats.unassignedCrew > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-3 text-xl" />
            <div>
              <p className="font-semibold text-yellow-800">Attention Required</p>
              {stats.unassignedVehicles > 0 && (
                <p className="text-sm text-yellow-700">{stats.unassignedVehicles} schedule(s) without assigned vehicles</p>
              )}
              {stats.unassignedCrew > 0 && (
                <p className="text-sm text-yellow-700">{stats.unassignedCrew} schedule(s) without assigned crew</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Days</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Waste Type</label>
            <select
              value={filterWasteType}
              onChange={(e) => setFilterWasteType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {wasteTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Zone</label>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone._id} value={zone._id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map(schedule => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{getDayShort(schedule.collectionDay)}</div>
                      <div className="text-sm text-gray-500">{schedule.timeSlot.start} - {schedule.timeSlot.end}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{schedule.zone?.name}</div>
                    <div className="text-xs text-gray-500">{schedule.zone?.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getWasteTypeBadge(schedule.wasteType)}`}>
                      {schedule.wasteType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{schedule.assignedVehicle?.vehicleNumber || 'Unassigned'}</div>
                    {schedule.assignedVehicle && (
                      <div className="text-xs text-gray-500">{schedule.assignedVehicle.type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {schedule.assignedCrew && schedule.assignedCrew.length > 0
                        ? `${schedule.assignedCrew.length} member(s)`
                        : 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openAssignModal(schedule)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Assign Resources"
                    >
                      <FaUserCog />
                    </button>
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaCalendarAlt className="mx-auto text-5xl mb-3 text-gray-300" />
            <p>No schedules found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Edit Schedule' : 'Create New Schedule'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateSchedule} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type *</label>
                  <select
                    value={formData.wasteType}
                    onChange={(e) => setFormData({...formData, wasteType: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {wasteTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Day *</label>
                  <select
                    value={formData.collectionDay}
                    onChange={(e) => setFormData({...formData, collectionDay: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.timeSlot.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeSlot: {...formData.timeSlot, start: e.target.value}
                    })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.timeSlot.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeSlot: {...formData.timeSlot, end: e.target.value}
                    })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration || 60}
                  onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 60})}
                  min="15"
                  step="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Description (Optional)</label>
                <textarea
                  value={formData.route}
                  onChange={(e) => setFormData({...formData, route: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the collection route..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle (Optional)</label>
                  <select
                    value={formData.assignedVehicle}
                    onChange={(e) => setFormData({...formData, assignedVehicle: e.target.value})}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Crew (Optional)</label>
                  <select
                    multiple
                    value={formData.assignedCrew}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({...formData, assignedCrew: selected});
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    size="4"
                  >
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver.user?._id}>
                        {driver.user?.name || driver.employeeId}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
                  {loading ? 'Saving...' : isEditMode ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Resources Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Assign Resources</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignResources} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Schedule:</strong> {selectedSchedule?.zone?.name} - {selectedSchedule?.collectionDay} ({selectedSchedule?.timeSlot?.start} - {selectedSchedule?.timeSlot?.end})
                </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Crew Members</label>
                <select
                  multiple
                  value={assignmentData.assignedCrew}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setAssignmentData({...assignmentData, assignedCrew: selected});
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  size="6"
                >
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver.user?._id}>
                      {driver.user?.name || driver.employeeId} - {driver.licenseType}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple crew members</p>
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
                  {loading ? 'Assigning...' : 'Assign Resources'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
