const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all payments' });
});

router.post('/create-payment', (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create payment' });
});

router.post('/webhook', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Webhook handler' });
});

router.get('/my-payments', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get user payments' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get payment' });
});

module.exports = router;
