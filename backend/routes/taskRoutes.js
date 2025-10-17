/**
 * @fileoverview Task Routes
 * @description API endpoints for task management operations
 * @author Waste Management System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PROTECTED ROUTES (REQUIRE AUTHENTICATION)
// ============================================

router.use(protect);

/**
 * @route   GET /api/v1/tasks/statistics
 * @desc    Get task statistics for manager
 * @access  Private (Sustainability Manager, Admin)
 */
router.get('/statistics', authorize('sustainability_manager', 'admin'), taskController.getStatistics);

/**
 * @route   GET /api/v1/tasks/my-tasks
 * @desc    Get tasks for logged-in resident
 * @access  Private (Resident)
 */
router.get('/my-tasks', authorize('resident'), taskController.getMyTasks);

/**
 * @route   POST /api/v1/tasks/bulk-assign
 * @desc    Bulk assign tasks to multiple residents
 * @access  Private (Sustainability Manager, Admin)
 * @body    {Object} taskData - Task details
 * @body    {Array<string>} residentIds - Array of resident IDs
 */
router.post('/bulk-assign', authorize('sustainability_manager', 'admin'), taskController.bulkAssignTasks);

/**
 * @route   PATCH /api/v1/tasks/:id/complete
 * @desc    Mark task as completed by resident
 * @access  Private (Resident)
 * @params  {string} id - Task ID
 * @body    {Object} proof - Completion proof (optional)
 */
router.patch('/:id/complete', authorize('resident'), taskController.completeTask);

/**
 * @route   PATCH /api/v1/tasks/:id/verify
 * @desc    Verify task completion by manager
 * @access  Private (Sustainability Manager, Admin)
 * @params  {string} id - Task ID
 * @body    {string} notes - Verification notes (optional)
 */
router.patch('/:id/verify', authorize('sustainability_manager', 'admin'), taskController.verifyTask);

/**
 * @route   PATCH /api/v1/tasks/:id/reject
 * @desc    Reject task completion by manager
 * @access  Private (Sustainability Manager, Admin)
 * @params  {string} id - Task ID
 * @body    {string} reason - Rejection reason (required)
 */
router.patch('/:id/reject', authorize('sustainability_manager', 'admin'), taskController.rejectTask);

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks with filters and pagination
 * @access  Private (Sustainability Manager, Admin)
 * @query   {string} status - Filter by status (optional)
 * @query   {string} category - Filter by category (optional)
 * @query   {string} assignedTo - Filter by resident (optional)
 * @query   {string} priority - Filter by priority (optional)
 * @query   {boolean} isOverdue - Filter overdue tasks (optional)
 * @query   {string} search - Search in title/description/tags (optional)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} sortBy - Sort field (default: -createdAt)
 */
router.get('/', authorize('sustainability_manager', 'admin'), taskController.getAllTasks);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get single task by ID
 * @access  Private (All authenticated users)
 * @params  {string} id - Task ID
 */
router.get('/:id', taskController.getTask);

/**
 * @route   POST /api/v1/tasks
 * @desc    Create new task
 * @access  Private (Sustainability Manager, Admin)
 * @body    {string} title - Task title (required)
 * @body    {string} description - Task description (required)
 * @body    {string} category - Task category (required)
 * @body    {string} assignedTo - Resident ID (required)
 * @body    {Date} dueDate - Due date (required)
 * @body    {number} rewardPoints - Reward points (required)
 * @body    {string} priority - Priority level (optional)
 * @body    {string} difficulty - Difficulty level (optional)
 * @body    {Object} recurring - Recurring settings (optional)
 * @body    {Array<string>} tags - Task tags (optional)
 */
router.post('/', authorize('sustainability_manager', 'admin'), taskController.createTask);

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update task
 * @access  Private (Sustainability Manager, Admin)
 * @params  {string} id - Task ID
 * @body    {Object} updateData - Fields to update
 */
router.put('/:id', authorize('sustainability_manager', 'admin'), taskController.updateTask);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete task (soft delete)
 * @access  Private (Sustainability Manager, Admin)
 * @params  {string} id - Task ID
 */
router.delete('/:id', authorize('sustainability_manager', 'admin'), taskController.deleteTask);

module.exports = router;
