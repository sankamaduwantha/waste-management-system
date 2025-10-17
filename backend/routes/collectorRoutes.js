const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/collectorScheduleController');
const performanceController = require('../controllers/collectorPerformanceController');
const binController = require('../controllers/collectorBinController');

// Protect all routes - only garbage collectors can access
router.use(protect);
router.use(authorize('garbage_collector'));

// Schedule routes
router.get('/my-tasks', scheduleController.getMyTasks);
router.get('/my-stats', scheduleController.getMyStats);
router.get('/my-route', scheduleController.getMyRoute);
router.post('/optimize-route', scheduleController.optimizeRoute);

// Bin collection routes
router.patch('/bins/:id/start', scheduleController.startBinCollection);
router.patch('/bins/:id/complete', scheduleController.completeBinCollection);

// Performance routes
router.get('/performance', performanceController.getPerformance);
router.get('/weekly-stats', performanceController.getWeeklyStats);
router.get('/achievements', performanceController.getAchievements);
router.get('/leaderboard', performanceController.getLeaderboard);
router.post('/check-achievements', performanceController.checkAchievements);

// Bin operations routes
router.get('/urgent-bins', binController.getUrgentBins);
router.get('/bins/qr/:qrCode', binController.verifyBinByQR);
router.get('/bins/id/:binId', binController.getBinByManualId);
router.post('/bins/:id/collect', binController.collectBin);
router.post('/bins/:id/report-issue', binController.reportBinIssue);

module.exports = router;
