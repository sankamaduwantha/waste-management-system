const express = require('express');
const router = express.Router();
const {
  getAllDrivers,
  getDriverStats,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
  getLicenseAlerts,
  updatePerformance
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats and overview routes
router.get('/stats/overview', authorize('admin', 'city_manager'), getDriverStats);
router.get('/alerts/license-expiry', authorize('admin', 'city_manager'), getLicenseAlerts);
router.get('/available', getAvailableDrivers);

// CRUD routes
router.route('/')
  .get(getAllDrivers)
  .post(authorize('admin', 'city_manager'), createDriver);

router.route('/:id')
  .get(getDriver)
  .put(authorize('admin', 'city_manager'), updateDriver)
  .delete(authorize('admin'), deleteDriver);

// Performance update
router.patch('/:id/performance', authorize('admin', 'city_manager'), updatePerformance);

module.exports = router;
