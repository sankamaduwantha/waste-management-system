import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaQrcode,
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaBatteryHalf,
  FaRecycle,
  FaTrashAlt
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const BinManagement = () => {
  const [bins, setBins] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view, qr
  const [selectedBin, setSelectedBin] = useState(null);
  const [stats, setStats] = useState(null);
  const [alertBins, setAlertBins] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    zone: '',
    search: '',
    minFillLevel: '',
    maxFillLevel: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Form state
  const [formData, setFormData] = useState({
    binId: '',
    type: 'general',
    capacity: '',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    zone: '',
    iotSensor: {
      sensorId: '',
      isActive: false
    }
  });

  useEffect(() => {
    fetchBins();
    fetchStats();
    fetchAlertBins();
    fetchZones();
  }, [filters, pagination.page]);

  const fetchBins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(`${API_URL}/bins?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBins(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to fetch bins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bins/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAlertBins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bins/alerts/attention-needed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertBins(response.data.data);
    } catch (error) {
      console.error('Failed to fetch alert bins:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/zones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setZones(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const handleCreateBin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/bins`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🎉 Bin created successfully with QR code!');
      setShowModal(false);
      resetForm();
      fetchBins();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/bins/${selectedBin._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Bin updated successfully!');
      setShowModal(false);
      resetForm();
      fetchBins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bin');
    } finally {
      setLoading(false);
    }
  };

  const handleDecommissionBin = async (binId) => {
    if (!window.confirm('Are you sure you want to decommission this bin?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/bins/${binId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Bin decommissioned successfully!');
      fetchBins();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decommission bin');
    }
  };

  const handleRegenerateQR = async (binId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/bins/${binId}/regenerate-qr`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('📱 QR code regenerated successfully!');
      
      // Update the bin in the list
      setBins(bins.map(bin => 
        bin._id === binId ? { ...bin, qrCode: response.data.data.qrCode } : bin
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate QR code');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (bin) => {
    setSelectedBin(bin);
    setFormData({
      binId: bin.binId,
      type: bin.type,
      capacity: bin.capacity,
      location: bin.location,
      zone: bin.zone?._id || '',
      iotSensor: bin.iotSensor || { sensorId: '', isActive: false }
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openViewModal = (bin) => {
    setSelectedBin(bin);
    setModalMode('view');
    setShowModal(true);
  };

  const openQRModal = (bin) => {
    setSelectedBin(bin);
    setModalMode('qr');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      binId: '',
      type: 'general',
      capacity: '',
      location: {
        address: '',
        latitude: '',
        longitude: ''
      },
      zone: '',
      iotSensor: {
        sensorId: '',
        isActive: false
      }
    });
    setSelectedBin(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      zone: '',
      search: '',
      minFillLevel: '',
      maxFillLevel: ''
    });
  };

  const downloadQRCode = (qrCode, binId) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `bin-${binId}-qr.png`;
    link.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      full: 'red',
      'needs-maintenance': 'orange',
      damaged: 'red',
      removed: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getFillLevelColor = (level) => {
    if (level >= 90) return '#ef4444';
    if (level >= 75) return '#f97316';
    if (level >= 50) return '#eab308';
    return '#22c55e';
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaRecycle /> Bin Management System
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
          <FaPlus /> Register New Bin
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
              <FaRecycle />
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overall[0]?.total || 0}</h3>
              <p style={{ color: '#666', margin: 0 }}>Total Bins</p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overall[0]?.needsAttention || 0}</h3>
              <p style={{ color: '#666', margin: 0 }}>Needs Attention</p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
              <FaCheckCircle />
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{Math.round(stats.overall[0]?.avgFillLevel || 0)}%</h3>
              <p style={{ color: '#666', margin: 0 }}>Avg Fill Level</p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
              <FaTrashAlt />
            </div>
            <div>
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{alertBins.length}</h3>
              <p style={{ color: '#666', margin: 0 }}>Critical Alerts</p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Bins */}
      {alertBins.length > 0 && (
        <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#d97706' }}>
            <FaExclamationTriangle /> Bins Requiring Immediate Attention
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {alertBins.slice(0, 4).map(bin => (
              <div key={bin._id} style={{ background: 'white', borderRadius: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>{bin.binId}</span>
                  <span style={{ 
                    background: getStatusColor(bin.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {bin.status}
                  </span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${bin.currentFillLevel}%`,
                      height: '100%',
                      background: getFillLevelColor(bin.currentFillLevel)
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>{bin.currentFillLevel}% Full</span>
                </div>
                <p style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', margin: '5px 0' }}>
                  <FaMapMarkerAlt /> {bin.location?.address}
                </p>
                {bin.iotSensor?.batteryLevel < 20 && (
                  <p style={{ fontSize: '14px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', margin: '5px 0' }}>
                    <FaBatteryHalf /> Low Battery: {bin.iotSensor.batteryLevel}%
                  </p>
                )}
                <button 
                  onClick={() => openViewModal(bin)}
                  style={{ 
                    width: '100%',
                    marginTop: '10px',
                    padding: '8px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by Bin ID or Address..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
            value={filters.type} 
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{ 
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="recyclable">Recyclable</option>
            <option value="organic">Organic</option>
            <option value="hazardous">Hazardous</option>
          </select>

          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ 
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="full">Full</option>
            <option value="needs-maintenance">Needs Maintenance</option>
            <option value="damaged">Damaged</option>
          </select>

          <select 
            value={filters.zone} 
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            style={{ 
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone._id} value={zone._id}>{zone.name}</option>
            ))}
          </select>

          <button 
            onClick={clearFilters}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaTimes /> Clear
          </button>
        </div>
      </div>

      {/* Bins Table */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading bins...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Bin ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Fill Level</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Zone</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>QR Code</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bins.map(bin => (
                  <tr key={bin._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{bin.binId}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: bin.type === 'recyclable' ? '#10b981' : bin.type === 'organic' ? '#f59e0b' : bin.type === 'hazardous' ? '#ef4444' : '#6b7280',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {bin.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <FaMapMarkerAlt style={{ display: 'inline', marginRight: '5px' }} />
                      {bin.location?.address || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ width: '100px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ 
                            width: `${bin.currentFillLevel}%`,
                            height: '100%',
                            background: getFillLevelColor(bin.currentFillLevel)
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#666' }}>{bin.currentFillLevel}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: getStatusColor(bin.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {bin.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{bin.zone?.name || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => openQRModal(bin)}
                        style={{ 
                          background: 'none',
                          border: 'none',
                          color: '#667eea',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                        title="View QR Code"
                      >
                        <FaQrcode />
                      </button>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => openViewModal(bin)}
                          style={{ 
                            background: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="View Details"
                        >
                          <FaSearch />
                        </button>
                        <button 
                          onClick={() => openEditModal(bin)}
                          style={{ 
                            background: '#f59e0b',
                            border: 'none',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Edit Bin"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDecommissionBin(bin._id)}
                          style={{ 
                            background: '#ef4444',
                            border: 'none',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Decommission"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bins.length === 0 && !loading && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <FaRecycle size={64} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No bins found</h3>
            <p>Register your first bin to get started</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            style={{
              padding: '8px 16px',
              background: pagination.page === 1 ? '#e5e7eb' : '#667eea',
              color: pagination.page === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ color: '#666' }}>Page {pagination.page} of {pagination.pages}</span>
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            style={{
              padding: '8px 16px',
              background: pagination.page === pagination.pages ? '#e5e7eb' : '#667eea',
              color: pagination.page === pagination.pages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

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
              maxWidth: '800px',
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
                {modalMode === 'create' && 'Register New Bin'}
                {modalMode === 'edit' && 'Edit Bin'}
                {modalMode === 'view' && 'Bin Details'}
                {modalMode === 'qr' && 'QR Code'}
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

            <div style={{ padding: '20px' }}>
              {modalMode === 'qr' && selectedBin && (
                <div style={{ textAlign: 'center' }}>
                  {selectedBin.qrCode ? (
                    <>
                      <img 
                        src={selectedBin.qrCode} 
                        alt="QR Code"
                        style={{ 
                          maxWidth: '300px',
                          width: '100%',
                          margin: '20px auto',
                          display: 'block',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px'
                        }}
                      />
                      <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                        Bin ID: {selectedBin.binId}
                      </p>
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => downloadQRCode(selectedBin.qrCode, selectedBin.binId)}
                          style={{
                            padding: '12px 24px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '16px'
                          }}
                        >
                          <FaDownload /> Download QR
                        </button>
                        <button 
                          onClick={() => handleRegenerateQR(selectedBin._id)}
                          style={{
                            padding: '12px 24px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '16px'
                          }}
                        >
                          <FaQrcode /> Regenerate
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ padding: '40px', color: '#9ca3af' }}>No QR code available</p>
                  )}
                </div>
              )}

              {modalMode === 'view' && selectedBin && (
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>Bin ID:</strong> <span>{selectedBin.binId}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px' }}>
                    <strong>Type:</strong>
                    <span style={{ 
                      background: selectedBin.type === 'recyclable' ? '#10b981' : selectedBin.type === 'organic' ? '#f59e0b' : selectedBin.type === 'hazardous' ? '#ef4444' : '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      display: 'inline-block'
                    }}>
                      {selectedBin.type}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>Capacity:</strong> <span>{selectedBin.capacity} L</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px' }}>
                    <strong>Fill Level:</strong> <span>{selectedBin.currentFillLevel}%</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>Status:</strong>
                    <span style={{ color: getStatusColor(selectedBin.status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {selectedBin.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px' }}>
                    <strong>Location:</strong> <span>{selectedBin.location?.address}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>Coordinates:</strong> <span>{selectedBin.location?.latitude}, {selectedBin.location?.longitude}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px' }}>
                    <strong>Zone:</strong> <span>{selectedBin.zone?.name || 'N/A'}</span>
                  </div>
                  {selectedBin.iotSensor?.sensorId && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                        <strong>Sensor ID:</strong> <span>{selectedBin.iotSensor.sensorId}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', padding: '10px' }}>
                        <strong>Battery Level:</strong> <span>{selectedBin.iotSensor.batteryLevel}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {(modalMode === 'create' || modalMode === 'edit') && (
                <form onSubmit={modalMode === 'create' ? handleCreateBin : handleUpdateBin}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bin ID *</label>
                      <input
                        type="text"
                        value={formData.binId}
                        onChange={(e) => setFormData({...formData, binId: e.target.value})}
                        required
                        disabled={modalMode === 'edit'}
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
                        <option value="general">General</option>
                        <option value="recyclable">Recyclable</option>
                        <option value="organic">Organic</option>
                        <option value="hazardous">Hazardous</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Capacity (Liters) *</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        required
                        min="1"
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
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Zone *</label>
                      <select
                        value={formData.zone}
                        onChange={(e) => setFormData({...formData, zone: e.target.value})}
                        required
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

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Address *</label>
                      <input
                        type="text"
                        value={formData.location.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value }
                        })}
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
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Latitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.location.latitude}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, latitude: e.target.value }
                        })}
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
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.location.longitude}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, longitude: e.target.value }
                        })}
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
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>IoT Sensor ID</label>
                      <input
                        type="text"
                        value={formData.iotSensor.sensorId}
                        onChange={(e) => setFormData({
                          ...formData,
                          iotSensor: { ...formData.iotSensor, sensorId: e.target.value }
                        })}
                        style={{ 
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.iotSensor.isActive}
                          onChange={(e) => setFormData({
                            ...formData,
                            iotSensor: { ...formData.iotSensor, isActive: e.target.checked }
                          })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: '500' }}>IoT Sensor Active</span>
                      </label>
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
                      {loading ? 'Processing...' : (modalMode === 'create' ? 'Register Bin' : 'Update Bin')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinManagement;
