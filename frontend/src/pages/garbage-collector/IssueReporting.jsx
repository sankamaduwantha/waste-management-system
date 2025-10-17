import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCamera,
  FiMapPin,
  FiSend,
  FiX,
  FiCheckCircle
} from 'react-icons/fi';
import api from '../../services/api';

const IssueReporting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const binId = searchParams.get('binId');

  const [loading, setLoading] = useState(false);
  const [bins, setBins] = useState([]);
  const [formData, setFormData] = useState({
    bin: binId || '',
    issueType: '',
    description: '',
    priority: 'medium',
    location: ''
  });
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const response = await api.get('/bins');
      setBins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bin || !formData.issueType || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('bin', formData.bin);
      submitData.append('issueType', formData.issueType);
      submitData.append('description', formData.description);
      submitData.append('priority', formData.priority);
      submitData.append('reportedBy', 'garbage_collector');
      
      if (formData.location) {
        submitData.append('location', formData.location);
      }

      // Append photos
      photos.forEach((photo, index) => {
        submitData.append('photos', photo);
      });

      await api.post('/service-requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitted(true);
      toast.success('Issue reported successfully!');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        navigate('/garbage-collector/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="card text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-5xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Reported!</h2>
          <p className="text-gray-600 mb-6">
            Your report has been submitted successfully. The maintenance team will be notified.
          </p>
          <button
            onClick={() => navigate('/garbage-collector/dashboard')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="card bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="flex items-center space-x-3">
          <FiAlertTriangle className="text-4xl" />
          <div>
            <h1 className="text-2xl font-bold">Report Issue</h1>
            <p className="text-red-100">Report bin problems or collection issues</p>
          </div>
        </div>
      </div>

      {/* Issue Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-bold mb-6">Issue Details</h2>

        <div className="space-y-4">
          {/* Bin Selection */}
          <div>
            <label className="label">Select Bin *</label>
            <select
              name="bin"
              value={formData.bin}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Choose a bin...</option>
              {bins.map((bin) => (
                <option key={bin._id} value={bin._id}>
                  {bin.binId} - {bin.location?.address || 'No address'}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="label">Issue Type *</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select issue type...</option>
              <option value="damaged">Bin Damaged/Broken</option>
              <option value="malfunctioning">Sensor Malfunctioning</option>
              <option value="overflowing">Overflowing/Overfilled</option>
              <option value="blocked_access">Blocked Access</option>
              <option value="missing">Bin Missing/Stolen</option>
              <option value="lid_problem">Lid Problem</option>
              <option value="contamination">Contamination Issue</option>
              <option value="odor">Odor/Sanitation Issue</option>
              <option value="maintenance_needed">General Maintenance Needed</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="label">Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="low">Low - Can wait</option>
              <option value="medium">Medium - Should be addressed soon</option>
              <option value="high">High - Needs immediate attention</option>
              <option value="urgent">Urgent - Critical issue</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              rows="5"
              placeholder="Provide detailed information about the issue..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be as specific as possible. Include details like damage extent, safety concerns, etc.
            </p>
          </div>

          {/* Location Notes */}
          <div>
            <label className="label">Additional Location Info (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="input-field"
              placeholder="e.g., 'Behind the building', 'Near the parking lot'"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label">Photos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <FiCamera className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Add photos of the issue</p>
              <label className="btn-secondary cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                Choose Photos
              </label>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 flex-1"
          >
            <FiSend />
            <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </form>

      {/* Quick Issue Templates */}
      <div className="card bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-3">Quick Issue Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              issueType: 'damaged',
              priority: 'high',
              description: 'The bin is severely damaged and needs immediate replacement. Cannot be used for collection.'
            })}
            className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-sm"
          >
            <p className="font-medium text-gray-900">Damaged Bin</p>
            <p className="text-xs text-gray-600">Severe damage</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              issueType: 'blocked_access',
              priority: 'medium',
              description: 'Cannot access the bin due to obstruction. Bin location is blocked by parked vehicles/objects.'
            })}
            className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-sm"
          >
            <p className="font-medium text-gray-900">Blocked Access</p>
            <p className="text-xs text-gray-600">Cannot reach bin</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              issueType: 'overflowing',
              priority: 'high',
              description: 'Bin is overflowing with waste. Immediate collection required to prevent environmental issues.'
            })}
            className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-sm"
          >
            <p className="font-medium text-gray-900">Overflowing</p>
            <p className="text-xs text-gray-600">Needs immediate collection</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              issueType: 'missing',
              priority: 'urgent',
              description: 'Bin is missing from its designated location. Possible theft or relocation.'
            })}
            className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors text-sm"
          >
            <p className="font-medium text-gray-900">Missing Bin</p>
            <p className="text-xs text-gray-600">Bin not found</p>
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900 mb-2">Reporting Tips:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Include photos when possible for faster resolution</li>
          <li>Mark as "Urgent" only for safety hazards or critical issues</li>
          <li>Provide specific location details if the bin is hard to find</li>
          <li>You'll receive updates on your report via notifications</li>
        </ul>
      </div>
    </div>
  );
};

export default IssueReporting;
