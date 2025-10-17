const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const zoneController = require('../controllers/zoneController');

router.use(protect);

// Public routes (all authenticated users can view zones)
router.get('/list/active', zoneController.getActiveZones);
router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZone);
router.get('/:id/statistics', zoneController.getZoneStatistics);

// Admin and City Manager routes
router.post(
  '/', 
  authorize('admin', 'city_manager'), 
  zoneController.createZone
);

router.put(
  '/:id', 
  authorize('admin', 'city_manager'), 
  zoneController.updateZone
);

// Admin only routes
router.delete(
  '/:id', 
  authorize('admin'), 
  zoneController.deleteZone
);

router.post(
  '/bulk', 
  authorize('admin'), 
  zoneController.bulkCreateZones
);

module.exports = router;
