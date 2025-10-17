import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaClock, FaExclamationTriangle, FaStar, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/v1/drivers';
const ZONE_API_URL = 'http://localhost:5000/api/v1/zones/list/active';
const VEHICLE_API_URL = 'http://localhost:5000/api/v1/vehicles/available';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});
  const [licenseAlerts, setLicenseAlerts] = useState({ expiring: [], expired: [] });
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterZone, setFilterZone] = useState('');

  const [formData, setFormData] = useState({
    // User fields
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Driver fields
    employeeId: '',
    licenseNumber: '',
    licenseType: '',
    licenseExpiry: '',
    dateOfBirth: '',
    joiningDate: '',
    assignedZone: '',
    assignedVehicle: '',
    shift: 'morning',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    bloodGroup: '',
    basicSalary: '',
    allowances: '',
    notes: ''
  });

  useEffect(() => {
    fetchDrivers();
    fetchStats();
    fetchLicenseAlerts();
    fetchZones();
    fetchVehicles();
  }, [searchTerm, filterStatus, filterShift, filterZone]);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}?search=${searchTerm}&status=${filterStatus}&shift=${filterShift}&zone=${filterZone}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
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

  const fetchLicenseAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/alerts/license-expiry`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLicenseAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch license alerts:', error);
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
      const response = await axios.get(VEHICLE_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const cleanedData = {
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        salary: {
          basic: formData.basicSalary || 0,
          allowances: formData.allowances || 0
        }
      };
      
      // Remove empty optional fields
      if (!cleanedData.assignedVehicle || cleanedData.assignedVehicle === '') {
        delete cleanedData.assignedVehicle;
      }
      if (!cleanedData.assignedZone || cleanedData.assignedZone === '') {
        delete cleanedData.assignedZone;
      }
      
      await axios.post(API_URL, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('👨‍✈️ Driver registered successfully!');
      setShowModal(false);
      resetForm();
      fetchDrivers();
      fetchStats();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const cleanedData = {
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        salary: {
          basic: formData.basicSalary || 0,
          allowances: formData.allowances || 0
        }
      };
      
      // Remove empty optional fields
      if (!cleanedData.assignedVehicle || cleanedData.assignedVehicle === '') {
        cleanedData.assignedVehicle = null;
      }
      if (!cleanedData.assignedZone || cleanedData.assignedZone === '') {
        delete cleanedData.assignedZone;
      }
      
      // Remove password field for updates
      delete cleanedData.password;
      
      await axios.put(`${API_URL}/${selectedDriver._id}`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Driver updated successfully!');
      setShowModal(false);
      resetForm();
      fetchDrivers();
      fetchStats();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update driver');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to terminate this driver?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Driver terminated successfully!');
      fetchDrivers();
      fetchStats();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to terminate driver');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.user?.name || '',
      email: driver.user?.email || '',
      password: '',
      phone: driver.user?.phone || '',
      street: driver.user?.address?.street || '',
      city: driver.user?.address?.city || '',
      state: driver.user?.address?.state || '',
      zipCode: driver.user?.address?.zipCode || '',
      employeeId: driver.employeeId || '',
      licenseNumber: driver.licenseNumber || '',
      licenseType: driver.licenseType || '',
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
      dateOfBirth: driver.dateOfBirth ? driver.dateOfBirth.split('T')[0] : '',
      joiningDate: driver.joiningDate ? driver.joiningDate.split('T')[0] : '',
      assignedZone: driver.assignedZone?._id || '',
      assignedVehicle: driver.assignedVehicle?._id || '',
      shift: driver.shift || 'morning',
      emergencyContactName: driver.contactDetails?.emergencyContact?.name || '',
      emergencyContactRelationship: driver.contactDetails?.emergencyContact?.relationship || '',
      emergencyContactPhone: driver.contactDetails?.emergencyContact?.phone || '',
      bloodGroup: driver.contactDetails?.bloodGroup || '',
      basicSalary: driver.salary?.basic || '',
      allowances: driver.salary?.allowances || '',
      notes: driver.notes || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      employeeId: '',
      licenseNumber: '',
      licenseType: '',
      licenseExpiry: '',
      dateOfBirth: '',
      joiningDate: '',
      assignedZone: '',
      assignedVehicle: '',
      shift: 'morning',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      bloodGroup: '',
      basicSalary: '',
      allowances: '',
      notes: ''
    });
    setSelectedDriver(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      terminated: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getShiftBadge = (shift) => {
    const badges = {
      morning: 'bg-blue-100 text-blue-800',
      afternoon: 'bg-orange-100 text-orange-800',
      night: 'bg-indigo-100 text-indigo-800',
      rotating: 'bg-purple-100 text-purple-800'
    };
    return badges[shift] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Driver Management</h1>
        <p className="text-gray-600">Manage garbage collection drivers and personnel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Drivers</p>
              <p className="text-3xl font-bold">{stats.total || 0}</p>
            </div>
            <FaUser className="text-5xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Active</p>
              <p className="text-3xl font-bold">{stats.byStatus?.active || 0}</p>
            </div>
            <FaIdCard className="text-5xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Licenses Expiring</p>
              <p className="text-3xl font-bold">{stats.expiringLicenses || 0}</p>
            </div>
            <FaClock className="text-5xl text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Average Rating</p>
              <p className="text-3xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
            <FaStar className="text-5xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* License Alerts */}
      {(licenseAlerts.expired?.length > 0 || licenseAlerts.expiring?.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <div>
              <p className="font-semibold text-red-800">License Alerts</p>
              {licenseAlerts.expired?.length > 0 && (
                <p className="text-sm text-red-700">{licenseAlerts.expired.length} driver(s) with expired licenses</p>
              )}
              {licenseAlerts.expiring?.length > 0 && (
                <p className="text-sm text-red-700">{licenseAlerts.expiring.length} driver(s) with licenses expiring soon</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, license..."
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
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Shifts</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
            <option value="rotating">Rotating</option>
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

        <div className="mt-4 flex justify-end">
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Register New Driver
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{driver.user?.name}</div>
                      <div className="text-sm text-gray-500">{driver.employeeId}</div>
                      <div className="text-sm text-gray-500">{driver.user?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.licenseNumber}</div>
                    <div className="text-sm text-gray-500">{driver.licenseType?.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">Exp: {new Date(driver.licenseExpiry).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.assignedZone?.name || 'Not Assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.assignedVehicle?.vehicleNumber || 'Not Assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadge(driver.shift)}`}>
                      {driver.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaUser className="mx-auto text-5xl mb-3 text-gray-300" />
            <p>No drivers found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Register New Driver' : 'Edit Driver'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={modalMode === 'create' ? handleCreateDriver : handleUpdateDriver} className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'edit'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'edit'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift *</label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="rotating">Rotating</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Zone</label>
                    <select
                      name="assignedZone"
                      value={formData.assignedZone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Zone</option>
                      {zones.map(zone => (
                        <option key={zone._id} value={zone._id}>{zone.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</label>
                    <select
                      name="assignedVehicle"
                      value={formData.assignedVehicle}
                      onChange={handleInputChange}
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
                </div>
              </div>

              {/* License Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">License Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type *</label>
                    <select
                      name="licenseType"
                      value={formData.licenseType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="light_vehicle">Light Vehicle</option>
                      <option value="medium_vehicle">Medium Vehicle</option>
                      <option value="heavy_vehicle">Heavy Vehicle</option>
                      <option value="specialized">Specialized</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry *</label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={formData.licenseExpiry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                    <input
                      type="number"
                      name="allowances"
                      value={formData.allowances}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Processing...' : modalMode === 'create' ? 'Register Driver' : 'Update Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
