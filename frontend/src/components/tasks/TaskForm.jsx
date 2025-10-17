import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaSave, FaPlus, FaMinus } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const TaskForm = ({ taskId, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'recycling',
    assignedTo: '',
    dueDate: '',
    rewardPoints: 50,
    priority: 'medium',
    difficulty: 'medium',
    tags: [],
    recurring: {
      isRecurring: false,
      frequency: 'daily',
      endDate: ''
    },
    metadata: {
      estimatedTime: '',
      impactScore: 5
    }
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'recycling', label: 'Recycling' },
    { value: 'composting', label: 'Composting' },
    { value: 'waste_reduction', label: 'Waste Reduction' },
    { value: 'plastic_free', label: 'Plastic Free' },
    { value: 'energy_saving', label: 'Energy Saving' },
    { value: 'water_conservation', label: 'Water Conservation' },
    { value: 'community_cleanup', label: 'Community Cleanup' },
    { value: 'education', label: 'Education' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    fetchResidents();
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchResidents = async () => {
    try {
      const response = await api.get('/residents');
      // Handle both possible response structures
      const residentsData = response.data.data?.residents || response.data.data || [];
      setResidents(residentsData);
      
      if (residentsData.length === 0) {
        console.warn('No residents found');
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to load residents');
      setResidents([]); // Set empty array to prevent undefined errors
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}`);
      const task = response.data.data;
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'recycling',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        rewardPoints: task.rewardPoints || 50,
        priority: task.priority || 'medium',
        difficulty: task.difficulty || 'medium',
        tags: task.tags || [],
        recurring: {
          isRecurring: task.recurring?.isRecurring || false,
          frequency: task.recurring?.frequency || 'daily',
          endDate: task.recurring?.endDate ? new Date(task.recurring.endDate).toISOString().split('T')[0] : ''
        },
        metadata: {
          estimatedTime: task.metadata?.estimatedTime || '',
          impactScore: task.metadata?.impactScore || 5
        }
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    if (!formData.assignedTo) {
      toast.error('Please select a resident');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        recurring: formData.recurring.isRecurring ? formData.recurring : undefined
      };

      if (taskId) {
        await api.patch(`/tasks/${taskId}`, submitData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', submitData);
        toast.success('Task created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      } else {
        navigate('/sustainability-manager/tasks');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (loading && taskId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {taskId ? 'Edit Task' : 'Create New Task'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe the task in detail"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To *
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select a resident</option>
                {residents.map(resident => (
                  <option key={resident._id} value={resident.user?._id || resident._id}>
                    {resident.user?.name || 'Unknown Resident'} {resident.user?.email ? `(${resident.user.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {priorities.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {difficulties.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Points (0-1000)
              </label>
              <input
                type="number"
                name="rewardPoints"
                value={formData.rewardPoints}
                onChange={handleChange}
                min="0"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                name="metadata.estimatedTime"
                value={formData.metadata.estimatedTime}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impact Score (1-10)
            </label>
            <input
              type="range"
              name="metadata.impactScore"
              value={formData.metadata.impactScore}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low Impact</span>
              <span className="font-semibold text-green-600">{formData.metadata.impactScore}</span>
              <span>High Impact</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add tags (press Enter)"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FaPlus />
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recurring Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="recurring.isRecurring"
              checked={formData.recurring.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Make this a recurring task
            </label>
          </div>

          {formData.recurring.isRecurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  name="recurring.frequency"
                  value={formData.recurring.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {frequencies.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="recurring.endDate"
                  value={formData.recurring.endDate}
                  onChange={handleChange}
                  min={formData.dueDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <FaSave />
            {loading ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
