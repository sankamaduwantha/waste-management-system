/**
 * @fileoverview Appointment Controller
 * @description HTTP request handlers for appointment endpoints
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response
 * - Dependency Inversion: Depends on service abstractions
 * 
 * @module controllers/appointmentController
 */

const appointmentService = require('../services/appointmentService');
const availabilityService = require('../services/availabilityService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Resident = require('../models/Resident');

/**
 * Helper function to get zone for a user
 * @param {Object} user - User object from req.user
 * @returns {Promise<string>} Zone ID
 */
const getZoneForUser = async (user) => {
  console.log(' Getting zone for user:', {
    userId: user._id,
    role: user.role,
    hasZone: !!user.zone,
    zoneValue: user.zone
  });

  // Zone is stored in the User model, not Resident model
  if (user.zone) {
    // Zone could be an ObjectId or populated object
    const zoneId = user.zone._id || user.zone;
    console.log('✅ Found zone from user:', zoneId);
    return zoneId;
  }

  console.log('❌ No zone found for user');
  return null;
};

/**
 * Get available appointment slots
 * @route GET /api/v1/appointments/availability
 * @access Private (Resident)
 */
exports.getAvailability = catchAsync(async (req, res, next) => {
  const { date, zoneId } = req.query;

  if (!date) {
    return next(new AppError('Date parameter is required', 400));
  }

  // Use provided zoneId or get user's zone
  let zone = zoneId;
  if (!zone) {
    zone = await getZoneForUser(req.user);
  }

  // If no zone, return empty slots (zone is now optional)
  if (!zone) {
    return res.status(200).json({
      success: true,
      data: {
        date,
        zone: null,
        slots: [],
      },
    });
  }

  const availability = await availabilityService.getAvailableSlots(zone, date);

  res.status(200).json({
    success: true,
    data: {
      date,
      zone,
      slots: availability,
    },
  });
});

/**
 * Get available dates
 * @route GET /api/v1/appointments/available-dates
 * @access Private (Resident)
 */
exports.getAvailableDates = catchAsync(async (req, res, next) => {
  const { days = 30, zoneId } = req.query;
  
  // Use provided zoneId or get user's zone
  let zone = zoneId;
  if (!zone) {
    zone = await getZoneForUser(req.user);
  }

  // If no zone, return empty dates (zone is now optional)
  if (!zone) {
    return res.status(200).json({
      success: true,
      data: { dates: [] },
    });
  }

  const dates = await availabilityService.getAvailableDates(zone, parseInt(days));

  res.status(200).json({
    success: true,
    data: { dates },
  });
});

/**
 * Create a new appointment
 * @route POST /api/v1/appointments
 * @access Private (Resident)
 */
exports.createAppointment = catchAsync(async (req, res, next) => {
  const residentId = req.user.resident || req.user._id;

  // Add zone if not provided (zone is now optional)
  if (!req.body.zone) {
    const zone = await getZoneForUser(req.user);
    if (zone) {
      req.body.zone = zone;
    }
    // If no zone, appointment will be created without zone
  }

  const appointment = await appointmentService.createAppointment(
    residentId,
    req.body
  );

  res.status(201).json({
    success: true,
    data: { appointment },
    message: 'Appointment booked successfully',
  });
});

/**
 * Get resident's appointments
 * @route GET /api/v1/appointments/my-appointments
 * @access Private (Resident)
 */
exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const residentId = req.user.resident || req.user._id;

  const result = await appointmentService.getMyAppointments(residentId, req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get appointment details
 * @route GET /api/v1/appointments/:id
 * @access Private (Resident/Admin/City Manager)
 */
exports.getAppointmentDetails = catchAsync(async (req, res, next) => {
  // Admins and city managers can view any appointment
  const isAdminOrManager = ['admin', 'city_manager'].includes(req.user.role);
  const residentId = isAdminOrManager ? null : (req.user.resident || req.user._id);

  const appointment = await appointmentService.getAppointmentDetails(
    req.params.id,
    residentId
  );

  res.status(200).json({
    success: true,
    data: { appointment },
  });
});

/**
 * Update appointment
 * @route PATCH /api/v1/appointments/:id
 * @access Private (Resident/Admin/City Manager)
 */
exports.updateAppointment = catchAsync(async (req, res, next) => {
  // Admins and city managers can update any appointment
  const isAdminOrManager = ['admin', 'city_manager'].includes(req.user.role);
  const residentId = isAdminOrManager ? null : (req.user.resident || req.user._id);

  const appointment = await appointmentService.updateAppointment(
    req.params.id,
    residentId,
    req.body
  );

  res.status(200).json({
    success: true,
    data: { appointment },
    message: 'Appointment updated successfully',
  });
});

/**
 * Cancel appointment
 * @route DELETE /api/v1/appointments/:id
 * @access Private (Resident/Admin/City Manager)
 */
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  // Admins and city managers can cancel any appointment
  const isAdminOrManager = ['admin', 'city_manager'].includes(req.user.role);
  const residentId = isAdminOrManager ? null : (req.user.resident || req.user._id);
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Cancellation reason is required', 400));
  }

  await appointmentService.cancelAppointment(
    req.params.id,
    residentId,
    reason
  );

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
  });
});

/**
 * Get appointment statistics
 * @route GET /api/v1/appointments/statistics
 * @access Private (Resident)
 */
exports.getStatistics = catchAsync(async (req, res, next) => {
  const residentId = req.user.resident || req.user._id;

  const statistics = await appointmentService.getStatistics(residentId);

  res.status(200).json({
    success: true,
    data: statistics,
  });
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Get all appointments (admin)
 * @route GET /api/v1/appointments/admin/all
 * @access Private (Admin)
 */
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const result = await appointmentService.getAllAppointments(
    req.query,
    {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    }
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Confirm appointment (admin)
 * @route PATCH /api/v1/appointments/admin/:id/confirm
 * @access Private (Admin)
 */
exports.confirmAppointment = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.confirmAppointment(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: { appointment },
    message: 'Appointment confirmed successfully',
  });
});

/**
 * Start collection (driver)
 * @route PATCH /api/v1/appointments/admin/:id/start
 * @access Private (Admin/Driver)
 */
exports.startCollection = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.startCollection(req.params.id);

  res.status(200).json({
    success: true,
    data: { appointment },
    message: 'Collection started',
  });
});

/**
 * Complete appointment (driver)
 * @route PATCH /api/v1/appointments/admin/:id/complete
 * @access Private (Admin/Driver)
 */
exports.completeAppointment = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.completeAppointment(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: { appointment },
    message: 'Appointment completed successfully',
  });
});

/**
 * Get dashboard data (admin)
 * @route GET /api/v1/appointments/admin/dashboard
 * @access Private (Admin)
 */
exports.getDashboardData = catchAsync(async (req, res, next) => {
  const data = await appointmentService.getDashboardData(req.query);

  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * Get next available slot
 * @route GET /api/v1/appointments/next-available
 * @access Private (Resident)
 */
exports.getNextAvailableSlot = catchAsync(async (req, res, next) => {
  const { zoneId, afterDate } = req.query;
  const zone = zoneId || req.user.zone;

  // If no zone, return null slot (zone is now optional)
  if (!zone) {
    return res.status(200).json({
      success: true,
      data: { slot: null },
      message: 'Zone not configured. Please set your zone in profile for better service.',
    });
  }

  const slot = await availabilityService.findNextAvailableSlot(
    zone,
    afterDate ? new Date(afterDate) : new Date()
  );

  if (!slot) {
    return res.status(200).json({
      success: true,
      data: { slot: null },
      message: 'No available slots found in the next 30 days',
    });
  }

  res.status(200).json({
    success: true,
    data: { slot },
  });
});

/**
 * Update appointment (admin)
 * @route PUT /api/v1/appointments/admin/:id
 * @access Private (Admin)
 */
exports.updateAppointmentAdmin = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.updateAppointment(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: { appointment },
    message: 'Appointment updated successfully',
  });
});

/**
 * Delete appointment (admin)
 * @route DELETE /api/v1/appointments/admin/:id
 * @access Private (Admin)
 */
exports.deleteAppointmentAdmin = catchAsync(async (req, res, next) => {
  await appointmentService.deleteAppointment(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: 'Appointment deleted successfully',
  });
});

/**
 * Change appointment status (admin)
 * @route PATCH /api/v1/appointments/admin/:id/status
 * @access Private (Admin)
 */
exports.changeAppointmentStatus = catchAsync(async (req, res, next) => {
  const { status, reason } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const appointment = await appointmentService.changeStatus(
    req.params.id,
    status,
    reason
  );

  res.status(200).json({
    success: true,
    data: { appointment },
    message: `Appointment status changed to ${status}`,
  });
});

module.exports = exports;
