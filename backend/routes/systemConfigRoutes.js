const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const systemConfigController = require('../controllers/systemConfigController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Initialize default configurations
router.post('/initialize', systemConfigController.initializeDefaults);

// Bulk update
router.put('/bulk-update', systemConfigController.bulkUpdate);

// Get configs by category
router.get('/category/:category', systemConfigController.getConfigsByCategory);

// CRUD operations
router.route('/')
  .get(systemConfigController.getAllConfigs);

router.route('/:category/:key')
  .get(systemConfigController.getConfig)
  .put(systemConfigController.updateConfig)
  .delete(systemConfigController.deleteConfig);

module.exports = router;
