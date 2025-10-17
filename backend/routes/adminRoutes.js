const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// System Health & Monitoring
router.get('/health', adminController.getSystemHealth);
router.get('/monitor/sessions', adminController.getActiveSessions);
router.get('/monitor/performance', adminController.getPerformanceMetrics);

// Database Management
router.get('/database/stats', adminController.getDatabaseStats);
router.post('/database/cleanup', adminController.cleanupOldRecords);
router.get('/database/backup-info', adminController.getBackupInfo);

// Reports & Analytics
router.get('/reports/usage', adminController.getUsageReport);
router.get('/audit', adminController.getAuditTrail);

// Logs
router.get('/logs/errors', adminController.getErrorLogs);

module.exports = router;
