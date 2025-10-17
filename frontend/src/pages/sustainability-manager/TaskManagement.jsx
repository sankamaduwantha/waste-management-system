/**
 * @fileoverview Task Management Page
 * @description Main page for sustainability managers to manage resident tasks
 * @author Waste Management System
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTaskStore from '../../store/taskStore';
import TaskForm from '../../components/tasks/TaskForm';
import BulkTaskAssignment from '../../components/tasks/BulkTaskAssignment';
import { 
  FaPlus, FaTasks, FaCheckCircle, FaClock, FaTimesCircle,
  FaFilter, FaSearch, FaChartBar, FaUsers
} from 'react-icons/fa';

const TaskManagement = () => {
  const navigate = useNavigate();
  const {
    tasks,
    loading,
    pagination,
    filters,
    statistics,
    fetchTasks,
    fetchStatistics,
    setFilters,
    clearFilters,
    deleteTask,
    verifyTask,
    rejectTask
  } = useTaskStore();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    fetchTasks({ [key]: value, page: 1 });
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setFilters({ search });
    if (search.length >= 3 || search.length === 0) {
      fetchTasks({ search, page: 1 });
    }
  };

  const handlePageChange = (newPage) => {
    fetchTasks({ page: newPage });
  };

  const handleCreateTask = () => {
    setEditingTaskId(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (taskId) => {
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  };

  const handleTaskFormClose = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
    fetchTasks();
    fetchStatistics();
  };

  const handleBulkAssignClose = () => {
    setShowBulkAssignment(false);
    fetchTasks();
    fetchStatistics();
  };

  const handleVerify = async () => {
    try {
      await verifyTask(selectedTask._id, verificationNotes);
      setShowVerifyModal(false);
      setVerificationNotes('');
      setSelectedTask(null);
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await rejectTask(selectedTask._id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedTask(null);
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              taskId={editingTaskId}
              onClose={handleTaskFormClose}
              onSuccess={handleTaskFormClose}
            />
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showBulkAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BulkTaskAssignment onClose={handleBulkAssignClose} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Assign and manage tasks for residents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkAssignment(true)}
            className="btn-secondary flex items-center"
          >
            <FaUsers className="mr-2" />
            Bulk Assign
          </button>
          <button
            onClick={handleCreateTask}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Task
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.byStatus?.reduce((sum, s) => sum + s.count, 0) || 0}
                </p>
              </div>
              <FaTasks className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.byStatus?.find(s => s._id === 'completed')?.count || 0}
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.overdueTasks || 0}
                </p>
              </div>
              <FaClock className="text-3xl text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-primary-600">
                  {statistics.completionRate || 0}%
                </p>
              </div>
              <FaChartBar className="text-3xl text-primary-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                <option value="waste_reduction">Waste Reduction</option>
                <option value="recycling">Recycling</option>
                <option value="composting">Composting</option>
                <option value="plastic_reduction">Plastic Reduction</option>
                <option value="energy_saving">Energy Saving</option>
                <option value="water_conservation">Water Conservation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={() => {
                  clearFilters();
                  fetchTasks();
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <FaTasks className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-600">No tasks found</p>
            <button
              onClick={() => navigate('/sustainability-manager/tasks/create')}
              className="mt-4 btn-primary"
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{task.title}</span>
                            <span className={`ml-2 ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'high' && '🔥'}
                              {task.priority === 'medium' && '⚠️'}
                              {task.priority === 'low' && '📌'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{task.category?.replace('_', ' ')}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {task.assignedTo?.profileImage ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${task.assignedTo.profileImage}`}
                              alt={task.assignedTo.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                              <span className="text-primary-600 font-semibold">
                                {task.assignedTo?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{task.assignedTo?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(task.dueDate).toLocaleDateString()}
                        {task.isOverdue && (
                          <span className="ml-2 text-red-600 text-xs">(Overdue)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                        {task.rewardPoints} pts
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/sustainability-manager/tasks/${task._id}`)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            View
                          </button>
                          {task.status === 'completed' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowVerifyModal(true);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {task.status === 'assigned' && (
                            <button
                              onClick={() => handleEditTask(task._id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tasks
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Task Completion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Task: <strong>{selectedTask?.title}</strong>
            </p>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add verification notes (optional)"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerificationNotes('');
                  setSelectedTask(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleVerify} className="btn-primary">
                Verify Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Task Completion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Task: <strong>{selectedTask?.title}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide reason for rejection (required)"
              rows="4"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedTask(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Reject Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
