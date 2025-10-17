const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const binController = require('../controllers/binController');

router.use(protect);

// Statistics and analytics
router.get('/stats/overview', authorize('city_manager', 'admin'), binController.getBinStatsOverview);
router.get('/stats', authorize('city_manager', 'admin'), binController.getBinStatistics);
router.get('/analytics/fill-trends', authorize('city_manager', 'admin'), binController.getBinFillTrends);
router.get('/alerts/attention-needed', authorize('city_manager', 'admin'), binController.getBinsNeedingAttention);

// CRUD operations
router.get('/', binController.getAllBins);
router.post('/', authorize('admin', 'city_manager'), binController.createBin);
router.get('/:id', binController.getBin);
router.put('/:id', authorize('admin', 'city_manager'), binController.updateBin);
router.delete('/:id', authorize('admin', 'city_manager'), binController.decommissionBin);

// QR Code management
router.post('/:id/regenerate-qr', authorize('city_manager', 'admin'), binController.regenerateQRCode);

// Bin operations
router.patch('/:id/fill-level', binController.updateFillLevel);
router.post('/:id/maintenance', authorize('city_manager', 'admin'), binController.addMaintenanceRecord);

module.exports = router;
