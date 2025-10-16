/**
 * @fileoverview Appointment Routes
 * @description API endpoints for appointment operations
 * 
 * @module routes/appointmentRoutes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (REQUIRE AUTHENTICATION)
// ============================================

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/appointments/availability
 * @desc    Get available appointment slots for a date
 * @access  Private (Resident)
 * @query   {string} date - Date in YYYY-MM-DD format (required)
 * @query   {string} zoneId - Zone ID (optional, uses user's zone if not provided)
 */
router.get('/availability', appointmentController.getAvailability);

/**
 * @route   GET /api/v1/appointments/available-dates
 * @desc    Get list of available dates
 * @access  Private (Resident)
 * @query   {number} days - Number of days to check (default: 30)
 * @query   {string} zoneId - Zone ID (optional)
 */
router.get('/available-dates', appointmentController.getAvailableDates);

/**
 * @route   GET /api/v1/appointments/next-available
 * @desc    Find next available appointment slot
 * @access  Private (Resident)
 * @query   {string} afterDate - Search after this date (optional)
 * @query   {string} zoneId - Zone ID (optional)
 */
router.get('/next-available', appointmentController.getNextAvailableSlot);

/**
 * @route   GET /api/v1/appointments/statistics
 * @desc    Get resident's appointment statistics
 * @access  Private (Resident)
 */
router.get('/statistics', appointmentController.getStatistics);

/**
 * @route   GET /api/v1/appointments/my-appointments
 * @desc    Get resident's appointments
 * @access  Private (Resident)
 * @query   {string} status - Filter by status (optional)
 * @query   {string} startDate - Start date filter (optional)
 * @query   {string} endDate - End date filter (optional)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get('/my-appointments', appointmentController.getMyAppointments);

/**
 * @route   POST /api/v1/appointments
 * @desc    Create a new appointment
 * @access  Private (Resident)
 * @body    {Object} appointmentData - Appointment details
 * @body    {string} appointmentData.appointmentDate - Date in ISO format
 * @body    {Object} appointmentData.timeSlot - {start, end}
 * @body    {Array<string>} appointmentData.wasteTypes - Waste types
 * @body    {number} appointmentData.estimatedAmount - Estimated amount in kg
 * @body    {string} appointmentData.specialInstructions - Special instructions (optional)
 */
router.post('/', appointmentController.createAppointment);

/**
 * @route   GET /api/v1/appointments/:id
 * @desc    Get appointment details
 * @access  Private (Resident/Admin)
 * @params  {string} id - Appointment ID
 */
router.get('/:id', appointmentController.getAppointmentDetails);

/**
 * @route   PATCH /api/v1/appointments/:id
 * @desc    Update/reschedule appointment
 * @access  Private (Resident)
 * @params  {string} id - Appointment ID
 * @body    {Object} updateData - Fields to update
 */
router.patch('/:id', appointmentController.updateAppointment);

/**
 * @route   DELETE /api/v1/appointments/:id
 * @desc    Cancel appointment
 * @access  Private (Resident)
 * @params  {string} id - Appointment ID
 * @body    {string} reason - Cancellation reason
 */
router.delete('/:id', appointmentController.cancelAppointment);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/v1/appointments/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin)
 * @query   {string} zone - Filter by zone (optional)
 * @query   {string} startDate - Start date filter (optional)
 * @query   {string} endDate - End date filter (optional)
 */
router.get(
  '/admin/dashboard',
  authorize('admin', 'manager'),
  appointmentController.getDashboardData
);

/**
 * @route   GET /api/v1/appointments/admin/all
 * @desc    Get all appointments (with filters)
 * @access  Private (Admin)
 * @query   {string} zone - Filter by zone (optional)
 * @query   {string} status - Filter by status (optional)
 * @query   {string} startDate - Start date filter (optional)
 * @query   {string} endDate - End date filter (optional)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20)
 */
router.get(
  '/admin/all',
  authorize('admin', 'manager'),
  appointmentController.getAllAppointments
);

/**
 * @route   PATCH /api/v1/appointments/admin/:id/confirm
 * @desc    Confirm appointment and assign vehicle/driver
 * @access  Private (Admin)
 * @params  {string} id - Appointment ID
 * @body    {string} vehicleId - Vehicle ID (optional)
 * @body    {string} driverId - Driver ID (optional)
 */
router.patch(
  '/admin/:id/confirm',
  authorize('admin', 'manager'),
  appointmentController.confirmAppointment
);

/**
 * @route   PATCH /api/v1/appointments/admin/:id/start
 * @desc    Mark appointment collection as started
 * @access  Private (Admin/Driver)
 * @params  {string} id - Appointment ID
 */
router.patch(
  '/admin/:id/start',
  authorize('admin', 'manager', 'driver'),
  appointmentController.startCollection
);

/**
 * @route   PATCH /api/v1/appointments/admin/:id/complete
 * @desc    Mark appointment as completed
 * @access  Private (Admin/Driver)
 * @params  {string} id - Appointment ID
 * @body    {number} actualAmount - Actual waste collected in kg
 * @body    {string} notes - Completion notes (optional)
 */
router.patch(
  '/admin/:id/complete',
  authorize('admin', 'manager', 'driver'),
  appointmentController.completeAppointment
);

module.exports = router;
