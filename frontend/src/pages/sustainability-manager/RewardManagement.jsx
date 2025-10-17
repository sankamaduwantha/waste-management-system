import React, { useState, useEffect } from 'react';
import {
  FaGift,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaTruck,
  FaAward,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import useRewardStore from '../../store/rewardStore';
import './RewardManagement.css';

const RewardManagement = () => {
  const {
    rewards,
    claims,
    statistics,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPage,
    fetchRewards,
    fetchClaims,
    fetchStatistics,
    createReward,
    updateReward,
    deleteReward,
    approveClaim,
    markDelivered,
    awardPoints,
    clearError
  } = useRewardStore();

  const [activeTab, setActiveTab] = useState('catalog'); // catalog, claims, award
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [claimFilters, setClaimFilters] = useState({ status: '' });

  // Form states
  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    pointsCost: '',
    category: 'gift_card',
    type: 'item',
    stockQuantity: '',
    imageUrl: '',
    expiryDate: '',
    termsAndConditions: '',
    value: ''
  });

  const [awardForm, setAwardForm] = useState({
    residentEmail: '',
    points: '',
    reason: ''
  });

  useEffect(() => {
    fetchStatistics();
    if (activeTab === 'catalog') {
      fetchRewards();
    } else if (activeTab === 'claims') {
      fetchClaims(claimFilters);
    }
  }, [activeTab, filters, pagination.currentPage, claimFilters]);

  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000);
    }
  }, [error]);

  // Reward form handlers
  const handleRewardFormChange = (e) => {
    const { name, value } = e.target;
    setRewardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      const rewardData = {
        ...rewardForm,
        pointsCost: parseInt(rewardForm.pointsCost),
        stockQuantity: parseInt(rewardForm.stockQuantity),
        value: parseFloat(rewardForm.value) || 0
      };

      if (editingReward) {
        await updateReward(editingReward._id, rewardData);
      } else {
        await createReward(rewardData);
      }

      setShowRewardModal(false);
      setEditingReward(null);
      resetRewardForm();
    } catch (error) {
      console.error('Error submitting reward:', error);
    }
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost.toString(),
      category: reward.category,
      type: reward.type,
      stockQuantity: reward.stockQuantity.toString(),
      imageUrl: reward.imageUrl || '',
      expiryDate: reward.expiryDate ? reward.expiryDate.split('T')[0] : '',
      termsAndConditions: reward.termsAndConditions || '',
      value: reward.value ? reward.value.toString() : ''
    });
    setShowRewardModal(true);
  };

  const handleDeleteReward = async (id) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await deleteReward(id);
      } catch (error) {
        console.error('Error deleting reward:', error);
      }
    }
  };

  const resetRewardForm = () => {
    setRewardForm({
      title: '',
      description: '',
      pointsCost: '',
      category: 'gift_card',
      type: 'item',
      stockQuantity: '',
      imageUrl: '',
      expiryDate: '',
      termsAndConditions: '',
      value: ''
    });
  };

  // Award points handlers
  const handleAwardFormChange = (e) => {
    const { name, value } = e.target;
    setAwardForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    try {
      await awardPoints(
        awardForm.residentEmail,
        parseInt(awardForm.points),
        awardForm.reason
      );
      setShowAwardModal(false);
      setAwardForm({ residentEmail: '', points: '', reason: '' });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  // Claim handlers
  const handleApproveClaim = async (claimId) => {
    try {
      await approveClaim(claimId);
    } catch (error) {
      console.error('Error approving claim:', error);
    }
  };

  const handleMarkDelivered = async (claimId) => {
    try {
      await markDelivered(claimId);
    } catch (error) {
      console.error('Error marking delivered:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'status-pending',
      approved: 'status-approved',
      delivered: 'status-delivered',
      redeemed: 'status-redeemed',
      cancelled: 'status-cancelled',
      expired: 'status-expired',
      active: 'status-active',
      inactive: 'status-inactive',
      out_of_stock: 'status-out-of-stock'
    };

    return (
      <span className={`status-badge ${statusColors[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      gift_card: '🎁',
      discount: '💰',
      service: '🔧',
      merchandise: '📦',
      recognition: '🏆',
      other: '✨'
    };
    return icons[category] || '🎁';
  };

  return (
    <div className="reward-management">
      <div className="reward-header">
        <h1>
          <FaGift className="header-icon" />
          Reward Management
        </h1>
        <p className="subtitle">Manage rewards and recognize sustainable behavior</p>
      </div>

      {error && (
        <div className="error-message">
          <FaTimes className="error-icon" />
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon gift-icon">
              <FaGift />
            </div>
            <div className="stat-content">
              <h3>{statistics.totalRewards || 0}</h3>
              <p>Total Rewards</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active-icon">
              <FaCheck />
            </div>
            <div className="stat-content">
              <h3>{statistics.activeRewards || 0}</h3>
              <p>Active Rewards</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon claims-icon">
              <FaTruck />
            </div>
            <div className="stat-content">
              <h3>{statistics.totalClaims || 0}</h3>
              <p>Total Claims</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon points-icon">
              <FaAward />
            </div>
            <div className="stat-content">
              <h3>{statistics.pointsDistributed || 0}</h3>
              <p>Points Distributed</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <FaGift /> Reward Catalog
        </button>
        <button
          className={`tab ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          <FaTruck /> Claim Management
        </button>
        <button
          className={`tab ${activeTab === 'award' ? 'active' : ''}`}
          onClick={() => setActiveTab('award')}
        >
          <FaAward /> Award Points
        </button>
      </div>

      {/* Reward Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="catalog-section">
          <div className="section-header">
            <div className="filters">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search rewards..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="gift_card">Gift Card</option>
                <option value="discount">Discount</option>
                <option value="service">Service</option>
                <option value="merchandise">Merchandise</option>
                <option value="recognition">Recognition</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingReward(null);
                resetRewardForm();
                setShowRewardModal(true);
              }}
            >
              <FaPlus /> Add Reward
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading rewards...</div>
          ) : (
            <>
              <div className="rewards-grid">
                {rewards.map((reward) => (
                  <div key={reward._id} className="reward-card">
                    <div className="reward-image">
                      {reward.imageUrl ? (
                        <img src={reward.imageUrl} alt={reward.title} />
                      ) : (
                        <div className="placeholder-image">
                          {getCategoryIcon(reward.category)}
                        </div>
                      )}
                    </div>
                    <div className="reward-content">
                      <h3>{reward.title}</h3>
                      <p className="reward-description">{reward.description}</p>
                      <div className="reward-meta">
                        <span className="points-cost">
                          <FaAward /> {reward.pointsCost} points
                        </span>
                        {reward.value > 0 && (
                          <span className="reward-value">Rs. {reward.value}</span>
                        )}
                      </div>
                      <div className="reward-details">
                        <span className="stock">Stock: {reward.stockQuantity}</span>
                        <span className="claimed">Claimed: {reward.totalClaimed}</span>
                      </div>
                      {getStatusBadge(reward.status)}
                      <div className="reward-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditReward(reward)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteReward(reward._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={pagination.currentPage === 1}
                    onClick={() => setPage(pagination.currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => setPage(pagination.currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Claims Management Tab */}
      {activeTab === 'claims' && (
        <div className="claims-section">
          <div className="section-header">
            <div className="filters">
              <FaFilter className="filter-icon" />
              <select
                value={claimFilters.status}
                onChange={(e) => setClaimFilters({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="redeemed">Redeemed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading claims...</div>
          ) : (
            <div className="claims-table">
              <table>
                <thead>
                  <tr>
                    <th>Resident</th>
                    <th>Reward</th>
                    <th>Points Used</th>
                    <th>Redemption Code</th>
                    <th>Status</th>
                    <th>Claim Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim._id}>
                      <td>
                        {claim.resident?.name || 'Unknown'}
                        <br />
                        <small>{claim.resident?.email}</small>
                      </td>
                      <td>{claim.reward?.title || 'Deleted Reward'}</td>
                      <td>
                        <FaAward className="points-icon" />
                        {claim.pointsUsed}
                      </td>
                      <td>
                        <code className="redemption-code">{claim.redemptionCode}</code>
                      </td>
                      <td>{getStatusBadge(claim.status)}</td>
                      <td>{new Date(claim.claimDate).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {claim.status === 'pending' && (
                            <button
                              className="btn-icon btn-approve"
                              onClick={() => handleApproveClaim(claim._id)}
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {claim.status === 'approved' && (
                            <button
                              className="btn-icon btn-deliver"
                              onClick={() => handleMarkDelivered(claim._id)}
                              title="Mark as Delivered"
                            >
                              <FaTruck />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No claims found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Award Points Tab */}
      {activeTab === 'award' && (
        <div className="award-section">
          <div className="award-info">
            <FaAward className="award-icon" />
            <h2>Award Points to Residents</h2>
            <p>
              Recognize residents for their sustainable practices by awarding them reward
              points.
            </p>
          </div>
          <button
            className="btn-primary btn-large"
            onClick={() => setShowAwardModal(true)}
          >
            <FaAward /> Award Points
          </button>
        </div>
      )}

      {/* Reward Form Modal */}
      {showRewardModal && (
        <div className="modal-overlay" onClick={() => setShowRewardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingReward ? 'Edit Reward' : 'Create New Reward'}</h2>
              <button className="close-btn" onClick={() => setShowRewardModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleRewardSubmit} className="reward-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={rewardForm.title}
                    onChange={handleRewardFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Points Cost *</label>
                  <input
                    type="number"
                    name="pointsCost"
                    value={rewardForm.pointsCost}
                    onChange={handleRewardFormChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={rewardForm.description}
                  onChange={handleRewardFormChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={rewardForm.category}
                    onChange={handleRewardFormChange}
                    required
                  >
                    <option value="gift_card">Gift Card</option>
                    <option value="discount">Discount</option>
                    <option value="service">Service</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="recognition">Recognition</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="type"
                    value={rewardForm.type}
                    onChange={handleRewardFormChange}
                    required
                  >
                    <option value="item">Item</option>
                    <option value="voucher">Voucher</option>
                    <option value="certificate">Certificate</option>
                    <option value="badge">Badge</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={rewardForm.stockQuantity}
                    onChange={handleRewardFormChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Value (Rs.)</label>
                  <input
                    type="number"
                    name="value"
                    value={rewardForm.value}
                    onChange={handleRewardFormChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={rewardForm.imageUrl}
                  onChange={handleRewardFormChange}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={rewardForm.expiryDate}
                  onChange={handleRewardFormChange}
                />
              </div>

              <div className="form-group">
                <label>Terms and Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={rewardForm.termsAndConditions}
                  onChange={handleRewardFormChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRewardModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingReward ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Points Modal */}
      {showAwardModal && (
        <div className="modal-overlay" onClick={() => setShowAwardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Award Points</h2>
              <button className="close-btn" onClick={() => setShowAwardModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAwardSubmit} className="award-form">
              <div className="form-group">
                <label>Resident Email *</label>
                <input
                  type="email"
                  name="residentEmail"
                  value={awardForm.residentEmail}
                  onChange={handleAwardFormChange}
                  placeholder="resident@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Points *</label>
                <input
                  type="number"
                  name="points"
                  value={awardForm.points}
                  onChange={handleAwardFormChange}
                  min="1"
                  placeholder="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  name="reason"
                  value={awardForm.reason}
                  onChange={handleAwardFormChange}
                  rows="3"
                  placeholder="Reason for awarding points..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAwardModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Awarding...' : 'Award Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardManagement;
