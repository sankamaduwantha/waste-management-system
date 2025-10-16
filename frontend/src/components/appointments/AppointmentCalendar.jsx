/**
 * @fileoverview Appointment Calendar Component
 * @description Interactive calendar for selecting appointment dates with availability indicators
 */

import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { useAppointmentCalendar } from '../../hooks/useAppointments';
import {
  formatDateToISO,
  isToday,
  isPastDate,
  getDayName,
  formatDateForDisplay,
} from '../../utils/appointmentUtils';

/**
 * AppointmentCalendar Component
 * @param {Object} props - Component props
 * @param {Function} props.onDateSelect - Callback when date is selected
 * @param {Function} props.onSlotSelect - Callback when slot is selected
 * @returns {JSX.Element}
 */
const AppointmentCalendar = ({ onDateSelect, onSlotSelect }) => {
  const {
    calendarMonth,
    selectedDate,
    selectedDaySlots,
    minDate,
    maxDate,
    loading,
    selectDate,
    changeMonth,
    isDateSelectable,
  } = useAppointmentCalendar();

  const [selectedSlot, setSelectedSlot] = useState(null);

  // Get calendar days for the month
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month's days to fill
    const prevMonthDays = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: prevMonthLastDay - i,
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month's days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month's days to fill
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = [];
    const daysNeeded = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    for (let i = 1; i <= daysNeeded; i++) {
      nextMonthDays.push({
        day: i,
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [calendarMonth]);

  // Handle date selection
  const handleDateClick = async (dayObj) => {
    if (!dayObj.isCurrentMonth || !isDateSelectable(dayObj.date)) {
      return;
    }
    
    setSelectedSlot(null);
    await selectDate(dayObj.date);
    onDateSelect?.(dayObj.date);
  };

  // Handle slot selection
  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    onSlotSelect?.(slot);
  };

  // Get day cell classes
  const getDayCellClasses = (dayObj) => {
    const baseClasses = 'h-12 w-full flex items-center justify-center rounded-lg cursor-pointer transition-all';
    
    if (!dayObj.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }
    
    if (isPastDate(dayObj.date) || !isDateSelectable(dayObj.date)) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`;
    }
    
    const isSelected = selectedDate && 
      formatDateToISO(dayObj.date) === formatDateToISO(selectedDate);
    
    const isTodayDate = isToday(dayObj.date);
    
    if (isSelected) {
      return `${baseClasses} bg-green-600 text-white font-bold shadow-lg`;
    }
    
    if (isTodayDate) {
      return `${baseClasses} bg-green-100 text-green-900 font-semibold hover:bg-green-200`;
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-100`;
  };

  // Format month/year header
  const monthYearText = calendarMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Check if can go to previous/next month
  const canGoPrevious = useMemo(() => {
    const firstDayOfMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1
    );
    return firstDayOfMonth > minDate;
  }, [calendarMonth, minDate]);

  const canGoNext = useMemo(() => {
    const lastDayOfMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0
    );
    return lastDayOfMonth < maxDate;
  }, [calendarMonth, maxDate]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <FiCalendar className="mr-2" />
          Select Date
        </h3>
        
        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            disabled={!canGoPrevious}
            className={`p-2 rounded-lg ${
              canGoPrevious
                ? 'hover:bg-gray-100 text-gray-600'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <FiChevronLeft size={20} />
          </button>
          
          <span className="text-lg font-medium text-gray-700 min-w-[180px] text-center">
            {monthYearText}
          </span>
          
          <button
            onClick={() => changeMonth(1)}
            disabled={!canGoNext}
            className={`p-2 rounded-lg ${
              canGoNext
                ? 'hover:bg-gray-100 text-gray-600'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayObj, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(dayObj)}
              className={getDayCellClasses(dayObj)}
            >
              {dayObj.day}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="border-t pt-4 mt-4">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">
              Selected Date
            </h4>
            <p className="text-lg font-medium text-gray-800">
              {getDayName(selectedDate)}, {formatDateForDisplay(selectedDate)}
            </p>
          </div>

          {/* Time Slots */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading slots...</span>
            </div>
          ) : selectedDaySlots.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Available Time Slots ({selectedDaySlots.length})
              </h4>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {selectedDaySlots.map((slot, index) => {
                  const isSlotSelected = selectedSlot &&
                    selectedSlot.start === slot.start &&
                    selectedSlot.end === slot.end;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotClick(slot)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSlotSelected
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-green-300 text-gray-700 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        {slot.availableCapacity !== undefined && (
                          <span className="text-xs text-gray-500 mt-1">
                            {slot.availableCapacity} spots left
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No time slots available for this date
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Please select a different date
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="border-t pt-4 mt-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Format time for display
 * @param {string} time - Time string (HH:mm format)
 * @returns {string} Formatted time
 */
const formatTime = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};

export default AppointmentCalendar;
