import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiMapPin,
  FiNavigation,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiAlertCircle,
  FiRefreshCw,
  FiMaximize2
} from 'react-icons/fi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const RouteManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [bins, setBins] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchRoute();
    getCurrentLocation();
  }, []);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const response = await api.get('/collectors/my-route');
      setRoute(response.data.data.route);
      setBins(response.data.data.bins || []);
    } catch (error) {
      console.error('Error fetching route:', error);
      toast.error('Failed to load route');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get current location');
        }
      );
    }
  };

  const handleOptimizeRoute = async () => {
    try {
      setOptimizing(true);
      const response = await api.post('/collectors/optimize-route', {
        currentLocation,
        taskId: route?._id
      });
      toast.success('Route optimized successfully!');
      fetchRoute(); // Reload route to get updated sequence
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast.error('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  const handleNavigateToBin = (bin) => {
    const destination = `${bin.location?.coordinates?.latitude},${bin.location?.coordinates?.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const handleStartCollection = async (binId) => {
    try {
      await api.patch(`/collectors/bins/${binId}/start`);
      toast.success('Collection started!');
      fetchRoute();
    } catch (error) {
      console.error('Error starting collection:', error);
      toast.error('Failed to start collection');
    }
  };

  const handleCompleteCollection = async (binId) => {
    try {
      await api.patch(`/collectors/bins/${binId}/complete`);
      toast.success('Collection completed!');
      fetchRoute();
    } catch (error) {
      console.error('Error completing collection:', error);
      toast.error('Failed to complete collection');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      skipped: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 80) return 'text-red-600';
    if (fillLevel >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Collection Route</h1>
            <p className="text-blue-100">
              {bins.length} bins • {bins.filter(b => b.status === 'completed').length} completed
            </p>
          </div>
          <FiTruck className="text-5xl text-blue-200" />
        </div>
      </div>

      {/* Route Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Bins</p>
          <p className="text-2xl font-bold text-gray-900">{bins.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {bins.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {bins.filter(b => b.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {bins.filter(b => b.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Route Actions */}
      <div className="flex space-x-3">
        <button
          onClick={handleOptimizeRoute}
          disabled={optimizing}
          className="btn-primary flex items-center space-x-2 flex-1"
        >
          <FiRefreshCw className={optimizing ? 'animate-spin' : ''} />
          <span>{optimizing ? 'Optimizing...' : 'Optimize Route'}</span>
        </button>
        <button
          onClick={() => handleNavigateToBin(bins[0])}
          className="btn-secondary flex items-center space-x-2 flex-1"
        >
          <FiNavigation />
          <span>Start Navigation</span>
        </button>
      </div>

      {/* Bins List */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Collection Points</h2>
        
        {bins.length === 0 ? (
          <div className="text-center py-12">
            <FiMapPin className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600">No bins assigned to your route</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bins.map((bin, index) => (
              <div
                key={bin._id}
                className={`rounded-lg border-2 p-4 transition-all ${
                  bin.status === 'completed'
                    ? 'bg-green-50 border-green-300'
                    : bin.status === 'in_progress'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Number Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    bin.status === 'completed' ? 'bg-green-500' :
                    bin.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Bin Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">Bin #{bin.binId}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <FiMapPin className="inline mr-1" />
                          {bin.location?.address || 'Address not available'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bin.status)}`}>
                        {bin.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Bin Info */}
                    <div className="flex items-center space-x-4 text-sm mb-3">
                      <span className={`font-semibold ${getFillLevelColor(bin.fillLevel)}`}>
                        Fill: {bin.fillLevel}%
                      </span>
                      <span className="text-gray-600">
                        Type: {bin.type || 'General'}
                      </span>
                      {bin.estimatedTime && (
                        <span className="text-gray-600">
                          <FiClock className="inline mr-1" />
                          {bin.estimatedTime}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleNavigateToBin(bin)}
                        className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1"
                      >
                        <FiNavigation className="text-sm" />
                        <span>Navigate</span>
                      </button>

                      {bin.status === 'pending' && (
                        <button
                          onClick={() => handleStartCollection(bin._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-lg"
                        >
                          Start Collection
                        </button>
                      )}

                      {bin.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => navigate(`/garbage-collector/scanner`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded-lg"
                          >
                            Scan QR
                          </button>
                          <button
                            onClick={() => handleCompleteCollection(bin._id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-lg"
                          >
                            Complete
                          </button>
                        </>
                      )}

                      {bin.status === 'completed' && (
                        <button
                          onClick={() => setSelectedBin(bin)}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          View Details
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/garbage-collector/report?binId=${bin._id}`)}
                        className="text-red-600 hover:text-red-700 text-sm py-1 px-3"
                      >
                        <FiAlertCircle className="inline mr-1" />
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Map Placeholder */}
      <div className="card bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Route Map</h2>
        <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <FiMaximize2 className="text-5xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Map integration coming soon</p>
            <p className="text-sm text-gray-500 mt-1">Use navigation buttons to open in Google Maps</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteManagement;
