import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiCamera,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiMapPin,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedBin, setScannedBin] = useState(null);
  const [manualBinId, setManualBinId] = useState('');
  const [action, setAction] = useState('verify'); // verify, collect, report
  const [loading, setLoading] = useState(false);
  const [collectionNotes, setCollectionNotes] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleScanQR = async (qrCode) => {
    try {
      setLoading(true);
      const response = await api.get(`/collectors/bins/qr/${qrCode}`);
      setScannedBin(response.data.data);
      stopCamera();
      toast.success('Bin verified successfully!');
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error(error.response?.data?.message || 'Failed to verify bin');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!manualBinId.trim()) {
      toast.error('Please enter a bin ID');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/collectors/bins/id/${manualBinId}`);
      setScannedBin(response.data.data);
      toast.success('Bin found!');
    } catch (error) {
      console.error('Error finding bin:', error);
      toast.error(error.response?.data?.message || 'Bin not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCollection = async () => {
    if (!scannedBin) return;

    try {
      setLoading(true);
      await api.post(`/collectors/bins/${scannedBin._id}/collect`, {
        notes: collectionNotes,
        collectedAt: new Date()
      });
      toast.success('Collection completed successfully!');
      setScannedBin(null);
      setCollectionNotes('');
      navigate('/collector/dashboard');
    } catch (error) {
      console.error('Error completing collection:', error);
      toast.error(error.response?.data?.message || 'Failed to complete collection');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!scannedBin || !issueType || !issueDescription) {
      toast.error('Please fill in all issue details');
      return;
    }

    try {
      setLoading(true);
      await api.post('/service-requests', {
        bin: scannedBin._id,
        issueType,
        description: issueDescription,
        priority: issueType === 'damaged' ? 'high' : 'medium',
        reportedBy: 'garbage_collector'
      });
      toast.success('Issue reported successfully!');
      setScannedBin(null);
      setIssueType('');
      setIssueDescription('');
      navigate('/garbage-collector/dashboard');
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h1 className="text-2xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-purple-100">Scan bin QR codes to verify and update status</p>
      </div>

      {/* Action Selection */}
      {!scannedBin && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Select Action</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setAction('verify')}
              className={`p-4 rounded-lg border-2 transition-all ${
                action === 'verify'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <FiInfo className="text-2xl mx-auto mb-2" />
              <p className="text-sm font-medium">Verify</p>
            </button>
            <button
              onClick={() => setAction('collect')}
              className={`p-4 rounded-lg border-2 transition-all ${
                action === 'collect'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <FiCheckCircle className="text-2xl mx-auto mb-2" />
              <p className="text-sm font-medium">Collect</p>
            </button>
            <button
              onClick={() => setAction('report')}
              className={`p-4 rounded-lg border-2 transition-all ${
                action === 'report'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <FiAlertTriangle className="text-2xl mx-auto mb-2" />
              <p className="text-sm font-medium">Report</p>
            </button>
          </div>
        </div>
      )}

      {/* Scanner Interface */}
      {!scannedBin && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Scan QR Code</h2>

          {/* Camera View */}
          {scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-white rounded-lg shadow-lg"></div>
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <FiCamera className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Tap to Start Camera</p>
            </button>
          )}

          {/* Manual Entry */}
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-4">Or enter bin ID manually</p>
            <form onSubmit={handleManualEntry} className="flex space-x-3">
              <input
                type="text"
                value={manualBinId}
                onChange={(e) => setManualBinId(e.target.value)}
                placeholder="Enter Bin ID (e.g., BIN001)"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scanned Bin Details */}
      {scannedBin && (
        <div className="space-y-4">
          <div className="card bg-green-50 border-2 border-green-500">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 text-white p-3 rounded-full">
                <FiCheckCircle className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-900">Bin Verified</h2>
                <p className="text-green-700">Bin ID: {scannedBin.binId}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{scannedBin.type || 'General'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fill Level:</span>
                <span className="font-medium">{scannedBin.fillLevel}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{scannedBin.status}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-right flex-1 ml-2">
                  <FiMapPin className="inline mr-1" />
                  {scannedBin.location?.address || 'Not available'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Based Forms */}
          {action === 'collect' && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Complete Collection</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Collection Notes (Optional)</label>
                  <textarea
                    value={collectionNotes}
                    onChange={(e) => setCollectionNotes(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Add any notes about this collection..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setScannedBin(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteCollection}
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Complete Collection'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {action === 'report' && (
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">Report Issue</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Issue Type *</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select issue type</option>
                    <option value="damaged">Bin Damaged</option>
                    <option value="malfunctioning">Malfunctioning</option>
                    <option value="overflowing">Overflowing</option>
                    <option value="blocked_access">Blocked Access</option>
                    <option value="missing">Bin Missing</option>
                    <option value="maintenance_needed">Maintenance Needed</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setScannedBin(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportIssue}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {action === 'verify' && (
            <div className="card">
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Bin verified successfully!</p>
                <button
                  onClick={() => setScannedBin(null)}
                  className="btn-primary"
                >
                  Scan Another Bin
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!scannedBin && !scanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Select the action you want to perform</li>
            <li>Tap to start camera and scan the QR code on the bin</li>
            <li>Position the QR code within the frame</li>
            <li>Or manually enter the bin ID if scanning fails</li>
            <li>Complete the selected action after verification</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
