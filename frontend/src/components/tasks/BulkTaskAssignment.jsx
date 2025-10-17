import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaSearch, FaCheckSquare, FaSquare } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import useTaskStore from '../../store/taskStore';

const BulkTaskAssignment = ({ onClose }) => {
  const { bulkAssignTasks } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'recycling',
    dueDate: '',
    rewardPoints: 50,
    priority: 'medium',
    difficulty: 'medium',
    tags: [],
    metadata: {
      estimatedTime: '',
      impactScore: 5
    }
  });

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

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await api.get('/residents');
      const residentsData = response.data.data?.residents || response.data.data || [];
      setResidents(residentsData);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to load residents');
      setResidents([]); // Set empty array on error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const toggleResident = (userId) => {
    setSelectedResidents(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedResidents([]);
    } else {
      // Select all user IDs instead of resident IDs
      setSelectedResidents(filteredResidents.map(r => r.user?._id).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const filteredResidents = residents.filter(resident => {
    const name = resident.user?.name?.toLowerCase() || '';
    const email = resident.user?.email?.toLowerCase() || '';
    const address = resident.address?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || email.includes(query) || address.includes(query);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    if (selectedResidents.length === 0) {
      toast.error('Please select at least one resident');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please select a due date');
      return;
    }

    try {
      setLoading(true);
      
      // Separate taskData from residentIds
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        difficulty: formData.difficulty,
        dueDate: formData.dueDate,
        rewardPoints: formData.rewardPoints,
        estimatedTime: formData.estimatedTime,
        impactScore: formData.impactScore,
        tags: formData.tags,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern
      };
      
      await bulkAssignTasks(taskData, selectedResidents);
      
      toast.success(`Task assigned to ${selectedResidents.length} resident(s)`);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error assigning tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to assign tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bulk Task Assignment
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
        {/* Task Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Information</h3>
          
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
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe the task"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
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
              <div className="flex flex-wrap gap-2 mt-2">
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
        </div>

        {/* Resident Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Residents ({selectedResidents.length} selected)
            </h3>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              {selectAll ? <FaCheckSquare /> : <FaSquare />}
              Select All
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search residents by name, email, or address..."
            />
          </div>

          {/* Resident List */}
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
            {filteredResidents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No residents found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredResidents.map((resident) => (
                  <label
                    key={resident._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedResidents.includes(resident.user?._id)}
                      onChange={() => toggleResident(resident.user?._id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      disabled={!resident.user?._id}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {resident.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {resident.user?.email}
                      </div>
                      {resident.address && (
                        <div className="text-xs text-gray-400">
                          {resident.address}
                        </div>
                      )}
                    </div>
                    {resident.gamification?.level && (
                      <div className="text-sm text-green-600">
                        Level {resident.gamification.level}
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
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
            disabled={loading || selectedResidents.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <FaSave />
            {loading ? 'Assigning...' : `Assign to ${selectedResidents.length} Resident(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkTaskAssignment;
