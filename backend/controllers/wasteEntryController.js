/**
 * @fileoverview Waste Entry Controller
 * @description HTTP request handlers for waste entry endpoints
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Controller Pattern: Handles HTTP requests/responses
 * - Dependency Injection: Service injected
 * - Command Pattern: Each method is a command
 * 
 * @solid-principles
 * - Single Responsibility: Handles only HTTP layer concerns
 * - Dependency Inversion: Depends on service abstraction
 */

const wasteEntryService = require('../services/wasteEntryService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Create new waste entry
 * @route   POST /api/v1/waste-entries
 * @access  Private (Resident)
 */
exports.createWasteEntry = catchAsync(async (req, res, next) => {
  const entry = await wasteEntryService.createEntry(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Waste entry created successfully',
    data: { entry }
  });
});

/**
 * @desc    Get waste entry by ID
 * @route   GET /api/v1/waste-entries/:id
 * @access  Private (Resident)
 */
exports.getWasteEntry = catchAsync(async (req, res, next) => {
  const entry = await wasteEntryService.getEntryById(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { entry }
  });
});

/**
 * @desc    Get all waste entries for logged-in user
 * @route   GET /api/v1/waste-entries
 * @access  Private (Resident)
 */
exports.getUserWasteEntries = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    location: req.query.location,
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy
  };

  const result = await wasteEntryService.getUserEntries(req.user.id, filters);

  res.status(200).json({
    status: 'success',
    results: result.entries.length,
    data: {
      entries: result.entries,
      pagination: result.pagination
    }
  });
});

/**
 * @desc    Update waste entry
 * @route   PUT /api/v1/waste-entries/:id
 * @access  Private (Resident)
 */
exports.updateWasteEntry = catchAsync(async (req, res, next) => {
  const entry = await wasteEntryService.updateEntry(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Waste entry updated successfully',
    data: { entry }
  });
});

/**
 * @desc    Delete waste entry
 * @route   DELETE /api/v1/waste-entries/:id
 * @access  Private (Resident)
 */
exports.deleteWasteEntry = catchAsync(async (req, res, next) => {
  await wasteEntryService.deleteEntry(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @desc    Get user waste statistics
 * @route   GET /api/v1/waste-entries/statistics
 * @access  Private (Resident)
 */
exports.getStatistics = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;

  const stats = await wasteEntryService.getUserStatistics(req.user.id, days);

  res.status(200).json({
    status: 'success',
    data: { statistics: stats }
  });
});

/**
 * @desc    Get waste trend data
 * @route   GET /api/v1/waste-entries/trend
 * @access  Private (Resident)
 */
exports.getWasteTrend = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 7;

  const trend = await wasteEntryService.getWasteTrend(req.user.id, days);

  res.status(200).json({
    status: 'success',
    data: { trend }
  });
});

/**
 * @desc    Get chart data for visualization
 * @route   GET /api/v1/waste-entries/chart-data
 * @access  Private (Resident)
 */
exports.getChartData = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;

  const chartData = await wasteEntryService.getChartData(req.user.id, days);

  res.status(200).json({
    status: 'success',
    data: { chartData }
  });
});

/**
 * @desc    Check if entry exists for today
 * @route   GET /api/v1/waste-entries/check-today
 * @access  Private (Resident)
 */
exports.checkTodayEntry = catchAsync(async (req, res, next) => {
  const hasEntry = await wasteEntryService.hasTodayEntry(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { hasEntry }
  });
});
