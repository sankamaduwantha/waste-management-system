const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// User statistics (Admin only)
router.get('/stats/overview', authorize('admin'), userController.getUserStats);

// User management routes (Admin and City Manager)
router.route('/')
  .get(authorize('admin', 'city_manager'), userController.getAllUsers)
  .post(authorize('admin'), userController.createUser);

// User actions (Admin only)
router.patch('/:id/activate', authorize('admin'), userController.activateUser);
router.patch('/:id/deactivate', authorize('admin'), userController.deactivateUser);
router.patch('/:id/reset-password', authorize('admin'), userController.resetPassword);
router.patch('/:id/assign-role', authorize('admin'), userController.assignRole);
router.patch('/:id/assign-zone', authorize('admin', 'city_manager'), userController.assignZone);
router.post('/bulk/assign-zones', authorize('admin', 'city_manager'), userController.bulkAssignZones);
router.get('/:id/activity', authorize('admin'), userController.getUserActivity);

// Single user routes (Admin and City Manager)
router.route('/:id')
  .get(authorize('admin', 'city_manager'), userController.getUser)
  .put(authorize('admin', 'city_manager'), userController.updateUser)
  .delete(authorize('admin'), userController.deleteUser);

module.exports = router;
