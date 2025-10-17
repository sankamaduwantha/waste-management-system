/**
 * @fileoverview Performance Routes
 * @description API routes for performance analytics and monitoring
 * @author Waste Management System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

/**
 * Public routes (all authenticated users)
 */

// Get leaderboard
router.get('/leaderboard', performanceController.getLeaderboard);

// Get completion trends
router.get('/trends', performanceController.getCompletionTrends);

// Get top performers
router.get('/top-performers', performanceController.getTopPerformers);

// Get environmental impact
router.get('/environmental-impact', performanceController.getEnvironmentalImpact);

// Get single report
router.get('/:id', performanceController.getReport);

/**
 * Resident-only routes
 */

// Get my analytics
router.get(
  '/my/analytics',
  authorize('resident'),
  performanceController.getMyAnalytics
);

/**
 * Manager/Admin routes
 */

// Get dashboard statistics
router.get(
  '/dashboard/stats',
  authorize('sustainability_manager', 'admin'),
  performanceController.getDashboardStats
);

// Get all reports with filters
router.get(
  '/',
  authorize('sustainability_manager', 'admin'),
  performanceController.getAllReports
);

// Generate performance report
router.post(
  '/generate',
  authorize('sustainability_manager', 'admin'),
  performanceController.generateReport
);

// Get resident analytics
router.get(
  '/resident/:id/analytics',
  performanceController.getResidentAnalytics
);

// Get category analytics
router.get(
  '/analytics/categories',
  authorize('sustainability_manager', 'admin'),
  performanceController.getCategoryAnalytics
);

// Get zone comparison
router.get(
  '/zones/comparison',
  authorize('sustainability_manager', 'admin', 'city_manager'),
  performanceController.getZoneComparison
);

/**
 * Admin-only routes
 */

// Bulk generate reports
router.post(
  '/bulk-generate',
  authorize('admin'),
  performanceController.bulkGenerateReports
);

module.exports = router;
