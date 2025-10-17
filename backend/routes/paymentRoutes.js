const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllPayments,
  getMyPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  refundPayment,
  downloadInvoice,
  handleWebhook,
  getPaymentStats
} = require('../controllers/paymentController');

// Webhook route (no auth required - called by payment gateway)
router.post('/webhook', handleWebhook);

// All other routes require authentication
router.use(protect);

// Statistics (Admin/City Manager only)
router.get('/stats/overview', authorize('admin', 'city_manager'), getPaymentStats);

// User's payments
router.get('/my-payments', getMyPayments);

// Create payment (Residents)
router.post('/create-payment', createPayment);

// Get all payments (Admin/City Manager)
router.get('/', authorize('admin', 'city_manager'), getAllPayments);

// Single payment operations
router.route('/:id')
  .get(getPayment);

// Payment actions
router.patch('/:id/status', authorize('admin', 'city_manager'), updatePaymentStatus);
router.post('/:id/refund', authorize('admin'), refundPayment);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
