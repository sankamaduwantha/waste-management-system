/**
 * @fileoverview Waste Entry Routes
 * @description RESTful API routes for waste entry management
 * @author Waste Management System
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const {
  createWasteEntry,
  getWasteEntry,
  getUserWasteEntries,
  updateWasteEntry,
  deleteWasteEntry,
  getStatistics,
  getWasteTrend,
  getChartData,
  checkTodayEntry
} = require('../controllers/wasteEntryController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes - require authentication
router.use(protect);

// Only residents can access waste entry routes
router.use(authorize('resident'));

// Special routes (must come before /:id routes)
router.get('/statistics', getStatistics);
router.get('/trend', getWasteTrend);
router.get('/chart-data', getChartData);
router.get('/check-today', checkTodayEntry);

// CRUD routes
router.route('/')
  .get(getUserWasteEntries)
  .post(createWasteEntry);

router.route('/:id')
  .get(getWasteEntry)
  .put(updateWasteEntry)
  .delete(deleteWasteEntry);

module.exports = router;
