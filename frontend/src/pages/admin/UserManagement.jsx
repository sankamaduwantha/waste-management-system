import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiCheck,
  FiXCircle,
  FiRefreshCw,
  FiKey,
  FiUserCheck,
  FiUserX,
  FiEye
} from 'react-icons/fi';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    phone: '',
    status: 'active',
    zone: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchZones();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      const response = await api.get(`/users?${params}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      setZones(response.data.data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success('User created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser._id}`, formData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${selectedUser._id}/reset-password`, { newPassword });
      toast.success('Password reset successfully!');
      setShowResetPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const endpoint = user.status === 'active' ? 'deactivate' : 'activate';
      await api.patch(`/users/${user._id}/${endpoint}`);
      toast.success(`User ${endpoint}d successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      zone: user.zone?._id || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'resident',
      phone: '',
      status: 'active',
      zone: ''
    });
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      city_manager: 'bg-green-100 text-green-800',
      sustainability_manager: 'bg-purple-100 text-purple-800',
      garbage_collector: 'bg-yellow-100 text-yellow-800',
      resident: 'bg-blue-100 text-blue-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all system users and their roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 input-field"
            />
          </div>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="input-field"
          >
            <option value="">All Roles</option>
            <option value="resident">Resident</option>
            <option value="city_manager">City Manager</option>
            <option value="admin">Admin</option>
            <option value="sustainability_manager">Sustainability Manager</option>
            <option value="garbage_collector">Garbage Collector</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', role: '', status: '' })}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <FiX />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.zone?.name || 'No zone'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FiEye className="inline" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <FiEdit2 className="inline" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? <FiUserX className="inline" /> : <FiUserCheck className="inline" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Reset Password"
                        >
                          <FiKey className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.pages}</span> ({pagination.total} total users)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="resident">Resident</option>
                      <option value="city_manager">City Manager</option>
                      <option value="admin">Admin</option>
                      <option value="sustainability_manager">Sustainability Manager</option>
                      <option value="garbage_collector">Garbage Collector</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Zone</label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone._id} value={zone._id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Similar structure to Create Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="resident">Resident</option>
                      <option value="city_manager">City Manager</option>
                      <option value="admin">Admin</option>
                      <option value="sustainability_manager">Sustainability Manager</option>
                      <option value="garbage_collector">Garbage Collector</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Zone</label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone._id} value={zone._id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button onClick={() => { setShowViewModal(false); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Zone</p>
                    <p className="font-medium">{selectedUser.zone?.name || 'No zone'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => { setShowViewModal(false); setSelectedUser(null); }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <button onClick={() => { setShowResetPasswordModal(false); setNewPassword(''); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Reset password for <span className="font-medium">{selectedUser.name}</span>
              </p>

              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="label">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowResetPasswordModal(false); setNewPassword(''); setSelectedUser(null); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
                <button onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
