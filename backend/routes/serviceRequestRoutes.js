const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequestStats,
  getRequest,
  createRequest,
  updateRequest,
  assignRequest,
  updateStatus,
  deleteRequest,
  getRequestsByZone,
  getUrgentRequests,
  submitFeedback
} = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Stats and special routes
router.get('/stats/overview', authorize('admin', 'city_manager'), getRequestStats);
router.get('/urgent', authorize('admin', 'city_manager'), getUrgentRequests);
router.get('/zone/:zoneId', authorize('admin', 'city_manager'), getRequestsByZone);

// CRUD routes
router.route('/')
  .get(getAllRequests)
  .post(createRequest);

router.route('/:id')
  .get(getRequest)
  .put(authorize('admin', 'city_manager'), updateRequest)
  .delete(authorize('admin', 'city_manager'), deleteRequest);

// Assignment and status routes
router.patch('/:id/assign', authorize('admin', 'city_manager'), assignRequest);
router.patch('/:id/status', authorize('admin', 'city_manager', 'garbage_collector'), updateStatus);

// Feedback route
router.post('/:id/feedback', submitFeedback);

module.exports = router;
