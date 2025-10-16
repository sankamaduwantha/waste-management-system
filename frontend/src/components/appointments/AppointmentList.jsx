/**
 * @fileoverview Appointment List Component
 * @description Display list of appointments with filters, sorting, and pagination
 */

import { useState } from 'react';
import { FiFilter, FiX, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import AppointmentCard from './AppointmentCard';
import {
  APPOINTMENT_STATUS,
  STATUS_LABELS,
} from '../../utils/appointmentUtils';

/**
 * AppointmentList Component
 * @param {Object} props - Component props
 * @param {Array} props.appointments - Array of appointments
 * @param {Object} props.filters - Current filters
 * @param {Object} props.pagination - Pagination data
 * @param {Function} props.onFilterChange - Filter change callback
 * @param {Function} props.onClearFilters - Clear filters callback
 * @param {Function} props.onPageChange - Page change callback
 * @param {Function} props.onView - View appointment callback
 * @param {Function} props.onUpdate - Update appointment callback
 * @param {Function} props.onCancel - Cancel appointment callback
 * @param {boolean} props.loading - Loading state
 * @param {number} props.totalPages - Total pages
 * @returns {JSX.Element}
 */
const AppointmentList = ({
  appointments = [],
  filters = {},
  pagination = { page: 1, limit: 10 },
  onFilterChange,
  onClearFilters,
  onPageChange,
  onView,
  onUpdate,
  onCancel,
  loading = false,
  totalPages = 1,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  // Handle temporary filter change
  const handleTempFilterChange = (filterName, value) => {
    setTempFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value !== filters[key]) {
        onFilterChange?.(key, value);
      }
    });
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setTempFilters({});
    onClearFilters?.();
    setShowFilters(false);
  };

  // Check if filters are active
  const hasActiveFilters = Object.keys(filters).some(key => filters[key]);

  return (
    <div className="space-y-4">
      {/* Header with Filter Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <FiCalendar className="mr-2" />
          My Appointments
          {appointments.length > 0 && (
            <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {appointments.length}
            </span>
          )}
        </h3>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
            hasActiveFilters
              ? 'border-green-600 bg-green-50 text-green-900'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiFilter className="mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-green-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={tempFilters.status || ''}
                onChange={(e) => handleTempFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={tempFilters.startDate || ''}
                onChange={(e) => handleTempFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={tempFilters.endDate || ''}
                onChange={(e) => handleTempFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex space-x-3">
            <button
              onClick={applyFilters}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <FiX className="mr-2" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-4 text-gray-600 text-lg">Loading appointments...</span>
        </div>
      )}

      {/* Appointments List */}
      {!loading && appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onView={onView}
              onUpdate={onUpdate}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && appointments.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? 'No appointments found' : 'No appointments yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results'
              : 'Book your first waste collection appointment to get started'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && appointments.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {totalPages}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
