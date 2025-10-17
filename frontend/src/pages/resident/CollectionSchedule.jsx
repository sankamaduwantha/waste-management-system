/**
 * @fileoverview Collection Schedule Page for Residents
 * @description Displays waste collection schedules for the resident's zone
 */

import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaTruck, FaRecycle, FaMapMarkerAlt, 
  FaClock, FaCheckCircle, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { showErrorToast, showInfoToast } from '../../components/common/ToastContainer';

const CollectionSchedule = () => {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');

  const userZone = user?.zone;

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      if (!userZone) {
        showInfoToast('No zone assigned yet. Please contact administration.');
        setLoading(false);
        return;
      }

      // Fetch schedules for the user's zone
      const zoneId = userZone._id || userZone;
      const response = await api.get(`/schedules?zone=${zoneId}`);
      const schedulesData = response.data?.data || [];
      setSchedules(schedulesData);
      
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      showErrorToast(error.response?.data?.message || 'Failed to load collection schedules');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayString) => {
    if (typeof dayString === 'number') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[dayString] || 'Unknown';
    }
    // Handle string day names from backend
    return dayString.charAt(0).toUpperCase() + dayString.slice(1).toLowerCase();
  };

  const getDayNumber = (dayString) => {
    const days = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    return days[dayString.toLowerCase()] ?? 0;
  };

  const getWasteTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'organic':
        return '🍃';
      case 'recyclable':
        return '♻️';
      case 'plastic':
        return '🔷';
      case 'glass':
        return '🥃';
      case 'paper':
        return '📄';
      case 'metal':
        return '🔧';
      case 'electronic':
        return '💻';
      default:
        return '🗑️';
    }
  };

  const getWasteTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'organic':
        return 'bg-green-100 text-green-800';
      case 'recyclable':
        return 'bg-blue-100 text-blue-800';
      case 'plastic':
        return 'bg-purple-100 text-purple-800';
      case 'glass':
        return 'bg-cyan-100 text-cyan-800';
      case 'paper':
        return 'bg-yellow-100 text-yellow-800';
      case 'metal':
        return 'bg-gray-100 text-gray-800';
      case 'electronic':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isToday = (dayNumber) => {
    return new Date().getDay() === dayNumber;
  };

  const filteredSchedules = selectedDay === 'all' 
    ? schedules 
    : schedules.filter(s => {
        const dayNum = getDayNumber(s.collectionDay);
        return dayNum === parseInt(selectedDay);
      });

  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const day = getDayNumber(schedule.collectionDay);
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
          <FaCalendarAlt className="mr-3 text-green-600" />
          Collection Schedule
        </h1>
        <p className="text-gray-600">
          View your weekly waste collection schedule
        </p>
      </div>

      {/* Zone Information */}
      {userZone && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-green-600 text-2xl mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Your Zone</h3>
                <p className="text-gray-700">{userZone.name || 'Unknown Zone'}</p>
              </div>
            </div>
            {userZone.description && (
              <p className="text-sm text-gray-600">{userZone.description}</p>
            )}
          </div>
        </div>
      )}

      {/* No Zone Assigned */}
      {!userZone && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FaExclamationCircle className="text-yellow-600 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Zone Assigned</h3>
          <p className="text-yellow-700">
            You haven't been assigned to a collection zone yet. Please contact the administration.
          </p>
        </div>
      )}

      {/* Day Filter */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDay === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Days
            </button>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day.toString())}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedDay === day.toString()
                    ? 'bg-green-600 text-white'
                    : isToday(day)
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getDayName(day)}
                {isToday(day) && ' (Today)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schedules Display */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Schedules Available</h3>
          <p className="text-gray-500">
            {userZone 
              ? 'No collection schedules have been set for your zone yet.'
              : 'Please wait for zone assignment and schedule configuration.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedSchedules)
            .sort((a, b) => a - b)
            .map((dayNumber) => {
              const daySchedules = groupedSchedules[dayNumber];
              const day = parseInt(dayNumber);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                    today ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  {/* Day Header */}
                  <div className={`px-6 py-4 ${today ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaCalendarAlt className={`mr-2 ${today ? 'text-blue-600' : 'text-gray-600'}`} />
                        {getDayName(day)}
                        {today && (
                          <span className="ml-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Today
                          </span>
                        )}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {daySchedules.length} collection{daySchedules.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Items */}
                  <div className="divide-y divide-gray-200">
                    {daySchedules.map((schedule) => (
                      <div key={schedule._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold mr-3 ${getWasteTypeColor(schedule.wasteType)}`}>
                                {getWasteTypeIcon(schedule.wasteType)} {schedule.wasteType}
                              </span>
                              {schedule.frequency && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                                  <FaRecycle className="mr-1" />
                                  {schedule.frequency}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center text-gray-600 mb-2">
                              <FaClock className="mr-2 text-gray-400" />
                              <span className="font-medium">
                                {schedule.timeSlot?.start || 'N/A'} - {schedule.timeSlot?.end || 'N/A'}
                              </span>
                              {schedule.estimatedDuration && (
                                <span className="ml-3 text-sm text-gray-500">
                                  (~{schedule.estimatedDuration} mins)
                                </span>
                              )}
                            </div>

                            {schedule.route && (
                              <div className="flex items-center text-gray-600 mb-2">
                                <FaTruck className="mr-2 text-gray-400" />
                                <span>Route: {schedule.route}</span>
                              </div>
                            )}

                            {schedule.assignedVehicle && (
                              <div className="text-sm text-gray-500">
                                Vehicle: {schedule.assignedVehicle.vehicleNumber || schedule.assignedVehicle.registrationNumber || 'TBA'}
                                {schedule.assignedVehicle.type && ` (${schedule.assignedVehicle.type})`}
                              </div>
                            )}

                            {schedule.completionDetails?.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <FaInfoCircle className="inline mr-2 text-gray-400" />
                                {schedule.completionDetails.notes}
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            {schedule.status === 'scheduled' || schedule.isActive ? (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                                <FaCheckCircle className="mr-1" />
                                Active
                              </span>
                            ) : schedule.status === 'in-progress' ? (
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                In Progress
                              </span>
                            ) : schedule.status === 'completed' ? (
                              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Completed
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {schedule.status || 'Scheduled'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Quick Tips */}
      {schedules.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" />
            Collection Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
            <li>Place your bins outside before the scheduled collection time</li>
            <li>Ensure waste is properly sorted according to type</li>
            <li>Keep bins accessible and not blocked by vehicles</li>
            <li>Book appointments for special collections through the Appointments page</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollectionSchedule;
