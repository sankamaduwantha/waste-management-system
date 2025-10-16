import { useState } from 'react';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AppointmentBookingSection from '../../components/appointments/AppointmentBookingSection';

const Appointments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/resident/dashboard')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-3 text-green-600" />
                Appointment Booking
              </h1>
              <p className="text-gray-600 mt-2">
                Schedule waste collection appointments for your location
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Booking Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <AppointmentBookingSection />
        </div>
      </div>
    </div>
  );
};

export default Appointments;
