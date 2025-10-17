import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTruck,
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaWrench,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    statusBreakdown: {},
    maintenanceDue: 0,
    utilizationRate: 0
  });
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    zone: ''
  });

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'truck',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
    fuelType: 'diesel',
    assignedZone: '',
    assignedDriver: '',
    status: 'available'
  });

  const vehicleTypes = [
    { value: 'truck', label: 'Truck' },
    { value: 'compactor', label: 'Compactor' },
    { value: 'tipper', label: 'Tipper' },
    { value: 'mini_truck', label: 'Mini Truck' },
    { value: 'specialized', label: 'Specialized' }
  ];

  const fuelTypes = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'cng', label: 'CNG' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const statusTypes = [
    { value: 'available', label: 'Available', color: '#10b981' },
    { value: 'on-route', label: 'On Route', color: '#3b82f6' },
    { value: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
    { value: 'out-of-service', label: 'Out of Service', color: '#ef4444' }
  ];

  useEffect(() => {
    fetchVehicles();
    fetchStats();
    fetchZones();
    fetchDrivers();
    fetchMaintenanceAlerts();
  }, [search, filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search,
        ...filters
      });
      const response = await axios.get(`${API_URL}/vehicles?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vehicles/stats/overview`, {
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
      const response = await axios.get(`${API_URL}/zones/list/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setZones(response.data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/drivers/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const fetchMaintenanceAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vehicles/alerts/maintenance-due`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenanceAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch maintenance alerts:', error);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Clean up empty strings for optional fields
      const cleanedData = { ...formData };
      if (!cleanedData.assignedDriver || cleanedData.assignedDriver === '') {
        delete cleanedData.assignedDriver;
      }
      if (!cleanedData.assignedZone || cleanedData.assignedZone === '') {
        delete cleanedData.assignedZone;
      }
      
      await axios.post(`${API_URL}/vehicles`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🚛 Vehicle registered successfully!');
      setShowModal(false);
      resetForm();
      fetchVehicles();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Clean up empty strings for optional fields
      const cleanedData = { ...formData };
      if (!cleanedData.assignedDriver || cleanedData.assignedDriver === '') {
        delete cleanedData.assignedDriver;
      }
      if (!cleanedData.assignedZone || cleanedData.assignedZone === '') {
        delete cleanedData.assignedZone;
      }
      
      await axios.put(`${API_URL}/vehicles/${selectedVehicle._id}`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Vehicle updated successfully!');
      setShowModal(false);
      resetForm();
      fetchVehicles();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to mark this vehicle as out of service?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Vehicle marked as out of service!');
      fetchVehicles();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decommission vehicle');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      capacity: vehicle.capacity,
      fuelType: vehicle.fuelType || 'diesel',
      assignedZone: vehicle.assignedZone?._id || '',
      assignedDriver: vehicle.assignedDriver?._id || '',
      status: vehicle.status
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      type: 'truck',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: '',
      fuelType: 'diesel',
      assignedZone: '',
      assignedDriver: '',
      status: 'available'
    });
    setSelectedVehicle(null);
  };

  const getStatusColor = (status) => {
    const statusObj = statusTypes.find(s => s.value === status);
    return statusObj?.color || '#6b7280';
  };

  const getTypeIcon = (type) => {
    return <FaTruck />;
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTruck /> Fleet Management
        </h1>
        <button 
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500',
            fontSize: '16px'
          }}
        >
          <FaPlus /> Register Vehicle
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <FaTruck size={32} style={{ marginBottom: '10px', opacity: 0.9 }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.totalVehicles}</h3>
          <p style={{ opacity: 0.9, margin: 0 }}>Total Vehicles</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <FaCheckCircle size={32} style={{ marginBottom: '10px', opacity: 0.9 }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.statusBreakdown?.available || 0}</h3>
          <p style={{ opacity: 0.9, margin: 0 }}>Available</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <FaMapMarkerAlt size={32} style={{ marginBottom: '10px', opacity: 0.9 }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.statusBreakdown?.['on-route'] || 0}</h3>
          <p style={{ opacity: 0.9, margin: 0 }}>On Route</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '25px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <FaWrench size={32} style={{ marginBottom: '10px', opacity: 0.9 }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.maintenanceDue}</h3>
          <p style={{ opacity: 0.9, margin: 0 }}>Maintenance Due</p>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {maintenanceAlerts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaExclamationTriangle color="#f59e0b" /> Maintenance Alerts
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {maintenanceAlerts.slice(0, 4).map(vehicle => (
              <div 
                key={vehicle._id}
                style={{ 
                  background: '#fff7ed',
                  border: '2px solid #fed7aa',
                  borderRadius: '12px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <FaTruck color="#f59e0b" size={20} />
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{vehicle.vehicleNumber}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                  Next Service: {new Date(vehicle.maintenance?.nextServiceDate).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  {vehicle.type} • {vehicle.assignedZone?.name || 'Unassigned'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by vehicle number, make, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Status</option>
            {statusTypes.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Types</option>
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <select
            value={filters.zone}
            onChange={(e) => setFilters({...filters, zone: e.target.value})}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone._id} value={zone._id}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <FaTruck size={64} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No vehicles found</h3>
            <p>Register your first vehicle to get started</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Vehicle</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Zone</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Driver</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Capacity</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getTypeIcon(vehicle.type)}
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{vehicle.vehicleNumber}</div>
                        <div style={{ fontSize: '13px', color: '#666' }}>{vehicle.make} {vehicle.model}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textTransform: 'capitalize' }}>{vehicle.type.replace('_', ' ')}</td>
                  <td style={{ padding: '15px' }}>{vehicle.assignedZone?.name || <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>
                  <td style={{ padding: '15px' }}>{vehicle.assignedDriver?.name || <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>
                  <td style={{ padding: '15px' }}>{vehicle.capacity} m³</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: `${getStatusColor(vehicle.status)}20`,
                      color: getStatusColor(vehicle.status),
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {vehicle.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => openEditModal(vehicle)}
                        style={{ 
                          padding: '6px 12px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        style={{ 
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                {modalMode === 'create' ? 'Register New Vehicle' : 'Edit Vehicle'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={modalMode === 'create' ? handleCreateVehicle : handleUpdateVehicle} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Vehicle Number *</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})}
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="e.g., ABC-1234"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Capacity (m³) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    required
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    placeholder="e.g., Tata"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g., LPT 1613"
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {fuelTypes.map(fuel => (
                      <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assigned Zone</label>
                  <select
                    value={formData.assignedZone}
                    onChange={(e) => setFormData({...formData, assignedZone: e.target.value})}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Zone</option>
                    {zones.map(zone => (
                      <option key={zone._id} value={zone._id}>{zone.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assigned Driver</label>
                  <select
                    value={formData.assignedDriver}
                    onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.employeeId} - {driver.user?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {statusTypes.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? '#9ca3af' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Processing...' : (modalMode === 'create' ? 'Register Vehicle' : 'Update Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
