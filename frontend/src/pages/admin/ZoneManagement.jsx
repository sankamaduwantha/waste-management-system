import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkedAlt,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedZone, setSelectedZone] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    district: '',
    city: '',
    state: '',
    area: '',
    population: '',
    pricing: {
      residentialMonthly: 25,
      commercialMonthly: 150,
      bulkPickupFee: 50
    }
  });

  useEffect(() => {
    fetchZones();
  }, [search]);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/zones?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setZones(response.data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/zones`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🎉 Zone created successfully!');
      setShowModal(false);
      resetForm();
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/zones/${selectedZone._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Zone updated successfully!');
      setShowModal(false);
      resetForm();
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update zone');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to deactivate this zone?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/zones/${zoneId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Zone deactivated successfully!');
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate zone');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      code: zone.code,
      district: zone.district,
      city: zone.city,
      state: zone.state,
      area: zone.area,
      population: zone.population,
      pricing: zone.pricing || {
        residentialMonthly: 25,
        commercialMonthly: 150,
        bulkPickupFee: 50
      }
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      district: '',
      city: '',
      state: '',
      area: '',
      population: '',
      pricing: {
        residentialMonthly: 25,
        commercialMonthly: 150,
        bulkPickupFee: 50
      }
    });
    setSelectedZone(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaMapMarkedAlt /> Zone Management
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
          <FaPlus /> Create New Zone
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search zones..."
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
      </div>

      {/* Zones Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading zones...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {zones.map(zone => (
            <div 
              key={zone._id}
              style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{zone.name}</h3>
                  <span style={{ 
                    background: zone.status === 'active' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {zone.code}
                  </span>
                </div>
                <span style={{ 
                  background: zone.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: zone.status === 'active' ? '#166534' : '#991b1b',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {zone.status}
                </span>
              </div>

              <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>District:</strong> {zone.district}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>City:</strong> {zone.city}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>State:</strong> {zone.state}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{zone.area}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>sq km</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    {(zone.population / 1000).toFixed(1)}K
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>population</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                <button 
                  onClick={() => openEditModal(zone)}
                  style={{ 
                    flex: 1,
                    padding: '8px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontSize: '14px'
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteZone(zone._id)}
                  style={{ 
                    flex: 1,
                    padding: '8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    fontSize: '14px'
                  }}
                >
                  <FaTrash /> Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {zones.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <FaMapMarkedAlt size={64} style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No zones found</h3>
          <p>Create your first zone to get started</p>
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
              maxWidth: '600px',
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
                {modalMode === 'create' ? 'Create New Zone' : 'Edit Zone'}
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

            <form onSubmit={modalMode === 'create' ? handleCreateZone : handleUpdateZone} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Zone Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Zone Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                    disabled={modalMode === 'edit'}
                    placeholder="e.g., DT-01"
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Area (sq km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Population *</label>
                  <input
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({...formData, population: e.target.value})}
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
                  {loading ? 'Processing...' : (modalMode === 'create' ? 'Create Zone' : 'Update Zone')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;
