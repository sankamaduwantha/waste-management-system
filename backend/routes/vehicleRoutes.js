const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllVehicles,
  getVehicleStats,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateLocation,
  addMaintenanceRecord,
  getMaintenanceDue,
  getAvailableVehicles
} = require('../controllers/vehicleController');

router.use(protect);

// Statistics and alerts - must come before /:id routes
router.get('/stats/overview', authorize('city_manager', 'admin'), getVehicleStats);
router.get('/alerts/maintenance-due', authorize('city_manager', 'admin'), getMaintenanceDue);
router.get('/available', getAvailableVehicles);

// CRUD routes
router
  .route('/')
  .get(getAllVehicles)
  .post(authorize('admin', 'city_manager'), createVehicle);

router
  .route('/:id')
  .get(getVehicle)
  .put(authorize('admin', 'city_manager'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

// Location and maintenance
router.patch('/:id/location', updateLocation);
router.post('/:id/maintenance', authorize('city_manager', 'admin'), addMaintenanceRecord);

module.exports = router;
