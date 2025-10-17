/**
 * @fileoverview Task Controller
 * @description HTTP request handlers for task endpoints
 * @author Waste Management System
 * @version 1.0.0
 */

const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Create new task
 * @route   POST /api/v1/tasks
 * @access  Private (Sustainability Manager, Admin)
 */
exports.createTask = catchAsync(async (req, res, next) => {
  const task = await taskService.createTask(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: { task }
  });
});

/**
 * @desc    Get all tasks with filters
 * @route   GET /api/v1/tasks
 * @access  Private (Sustainability Manager, Admin)
 */
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const result = await taskService.getTasks(req.query, {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy
  });

  res.status(200).json({
    status: 'success',
    results: result.tasks.length,
    data: {
      tasks: result.tasks,
      pagination: result.pagination
    }
  });
});

/**
 * @desc    Get task by ID
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
exports.getTask = catchAsync(async (req, res, next) => {
  const task = await taskService.getTaskById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { task }
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private (Sustainability Manager, Admin)
 */
exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully',
    data: { task }
  });
});

/**
 * @desc    Delete task (soft delete)
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private (Sustainability Manager, Admin)
 */
exports.deleteTask = catchAsync(async (req, res, next) => {
  const result = await taskService.deleteTask(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

/**
 * @desc    Bulk assign tasks to multiple residents
 * @route   POST /api/v1/tasks/bulk-assign
 * @access  Private (Sustainability Manager, Admin)
 */
exports.bulkAssignTasks = catchAsync(async (req, res, next) => {
  const { taskData, residentIds } = req.body;

  if (!residentIds || !Array.isArray(residentIds) || residentIds.length === 0) {
    return next(new AppError('Please provide an array of resident IDs', 400));
  }

  const result = await taskService.bulkAssignTasks(taskData, residentIds, req.user.id);

  res.status(201).json({
    status: 'success',
    message: result.message,
    data: { tasks: result.tasks }
  });
});

/**
 * @desc    Mark task as completed (by resident)
 * @route   PATCH /api/v1/tasks/:id/complete
 * @access  Private (Resident)
 */
exports.completeTask = catchAsync(async (req, res, next) => {
  const task = await taskService.completeTask(req.params.id, req.user.id, req.body.proof);

  res.status(200).json({
    status: 'success',
    message: 'Task marked as completed',
    data: { task }
  });
});

/**
 * @desc    Verify task completion (by manager)
 * @route   PATCH /api/v1/tasks/:id/verify
 * @access  Private (Sustainability Manager, Admin)
 */
exports.verifyTask = catchAsync(async (req, res, next) => {
  const task = await taskService.verifyTask(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Task verified successfully',
    data: { task }
  });
});

/**
 * @desc    Reject task completion (by manager)
 * @route   PATCH /api/v1/tasks/:id/reject
 * @access  Private (Sustainability Manager, Admin)
 */
exports.rejectTask = catchAsync(async (req, res, next) => {
  if (!req.body.reason) {
    return next(new AppError('Please provide a rejection reason', 400));
  }

  const task = await taskService.rejectTask(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Task rejected',
    data: { task }
  });
});

/**
 * @desc    Get task statistics
 * @route   GET /api/v1/tasks/statistics
 * @access  Private (Sustainability Manager, Admin)
 */
exports.getStatistics = catchAsync(async (req, res, next) => {
  const stats = await taskService.getStatistics(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { statistics: stats }
  });
});

/**
 * @desc    Get tasks for logged-in resident
 * @route   GET /api/v1/tasks/my-tasks
 * @access  Private (Resident)
 */
exports.getMyTasks = catchAsync(async (req, res, next) => {
  const result = await taskService.getResidentTasks(req.user.id, req.query);

  res.status(200).json({
    status: 'success',
    results: result.tasks.length,
    data: {
      tasks: result.tasks,
      pagination: result.pagination
    }
  });
});
