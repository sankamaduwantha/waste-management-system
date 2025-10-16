/**
 * @fileoverview Appointment Booking Section Component
 * @description Main container for appointment booking with tabs for booking, viewing, and history
 */

import { useState } from 'react';
import { FiCalendar, FiList, FiClock, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAppointments from '../../hooks/useAppointments';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentForm from './AppointmentForm';
import AppointmentList from './AppointmentList';
import AppointmentModal from './AppointmentModal';

/**
 * AppointmentBookingSection Component
 * Main component integrating all appointment features
 * @returns {JSX.Element}
 */
const AppointmentBookingSection = () => {
  const {
    upcomingAppointments,
    pastAppointments,
    paginatedAppointments,
    statistics,
    filters,
    pagination,
    totalPages,
    loading,
    bookAppointment,
    updateAppointment,
    rescheduleAppointment,
    cancelAppointment,
    setFilters,
    clearFilters,
    changePage,
    refresh,
  } = useAppointments();

  // Local state
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'appointments', 'history'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    appointment: null,
    mode: 'view', // 'view', 'update', 'cancel'
  });

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowBookingForm(false);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  // Handle booking submission
  const handleBookingSubmit = async (formData) => {
    const result = await bookAppointment(formData);
    
    if (result.success) {
      // Reset form
      setSelectedDate(null);
      setSelectedSlot(null);
      setShowBookingForm(false);
      
      // Switch to appointments tab
      setActiveTab('appointments');
      
      toast.success('Appointment booked successfully! 🎉');
    }
  };

  // Handle view appointment
  const handleViewAppointment = (appointment) => {
    setModalState({
      isOpen: true,
      appointment,
      mode: 'view',
    });
  };

  // Handle update appointment
  const handleUpdateAppointment = (appointment) => {
    setModalState({
      isOpen: true,
      appointment,
      mode: 'update',
    });
  };

  // Handle cancel appointment
  const handleCancelAppointment = (appointment) => {
    setModalState({
      isOpen: true,
      appointment,
      mode: 'cancel',
    });
  };

  // Handle modal update submit
  const handleModalUpdateSubmit = async (appointmentId, updates) => {
    const result = await rescheduleAppointment(
      appointmentId,
      updates.date,
      updates.timeSlot
    );
    
    if (result.success) {
      setModalState({ isOpen: false, appointment: null, mode: 'view' });
      toast.success('Appointment updated successfully! ✅');
    }
  };

  // Handle modal cancel submit
  const handleModalCancelSubmit = async (appointmentId, reason) => {
    const result = await cancelAppointment(appointmentId, reason);
    
    if (result.success) {
      setModalState({ isOpen: false, appointment: null, mode: 'view' });
      toast.success('Appointment cancelled successfully');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalState({ isOpen: false, appointment: null, mode: 'view' });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refresh();
    toast.success('Data refreshed! 🔄');
  };

  // Tab configuration
  const tabs = [
    {
      id: 'book',
      label: 'Book New',
      icon: FiCalendar,
      count: null,
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: FiList,
      count: upcomingAppointments.length,
    },
    {
      id: 'history',
      label: 'History',
      icon: FiClock,
      count: pastAppointments.length,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Appointment Booking
            </h2>
            <p className="text-gray-600 mt-1">
              Schedule waste collection appointments at your convenience
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading.appointments}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading.appointments ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {statistics.totalAppointments}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {statistics.completedAppointments}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Upcoming</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {statistics.upcomingAppointments}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Waste Collected</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {statistics.totalWasteCollected} kg
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium transition-colors ${
                  isActive
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2" size={20} />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Book New Tab */}
        {activeTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <AppointmentCalendar
                onDateSelect={handleDateSelect}
                onSlotSelect={handleSlotSelect}
              />
            </div>

            {/* Form */}
            <div>
              {showBookingForm && selectedDate && selectedSlot ? (
                <AppointmentForm
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => setShowBookingForm(false)}
                  loading={loading.booking}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Select Date & Time
                    </h3>
                    <p className="text-gray-600">
                      Choose a date and time slot from the calendar to continue booking
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === 'appointments' && (
          <AppointmentList
            appointments={upcomingAppointments}
            filters={filters}
            pagination={pagination}
            totalPages={totalPages}
            loading={loading.appointments}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            onPageChange={changePage}
            onView={handleViewAppointment}
            onUpdate={handleUpdateAppointment}
            onCancel={handleCancelAppointment}
          />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <AppointmentList
            appointments={pastAppointments}
            filters={filters}
            pagination={pagination}
            totalPages={totalPages}
            loading={loading.appointments}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            onPageChange={changePage}
            onView={handleViewAppointment}
            onUpdate={null} // Can't update past appointments
            onCancel={null} // Can't cancel past appointments
          />
        )}
      </div>

      {/* Modal */}
      <AppointmentModal
        appointment={modalState.appointment}
        mode={modalState.mode}
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onUpdate={handleModalUpdateSubmit}
        onCancel={handleModalCancelSubmit}
        loading={loading.updating || loading.cancelling}
      />
    </div>
  );
};

export default AppointmentBookingSection;
