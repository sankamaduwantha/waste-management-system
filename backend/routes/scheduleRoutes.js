const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleStats,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  assignResources,
  getSchedulesByZone,
  getSchedulesByDay,
  updateScheduleStatus,
  getAvailableVehicles,
  getAvailableDrivers
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats and special routes
router.get('/stats/overview', authorize('admin', 'city_manager'), getScheduleStats);
router.get('/available-vehicles', authorize('admin', 'city_manager'), getAvailableVehicles);
router.get('/available-drivers', authorize('admin', 'city_manager'), getAvailableDrivers);
router.get('/zone/:zoneId', getSchedulesByZone);
router.get('/day/:day', getSchedulesByDay);

// CRUD routes
router.route('/')
  .get(getAllSchedules)
  .post(authorize('admin', 'city_manager'), createSchedule);

router.route('/:id')
  .get(getSchedule)
  .put(authorize('admin', 'city_manager'), updateSchedule)
  .delete(authorize('admin', 'city_manager'), deleteSchedule);

// Assignment and status routes
router.patch('/:id/assign', authorize('admin', 'city_manager'), assignResources);
router.patch('/:id/status', authorize('admin', 'city_manager', 'garbage_collector'), updateScheduleStatus);

module.exports = router;
