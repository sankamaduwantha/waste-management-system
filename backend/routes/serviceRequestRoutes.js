const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all service requests' });
});

router.post('/', (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create service request' });
});

router.get('/my-requests', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get user requests' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get service request' });
});

router.put('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update service request' });
});

router.post('/:id/feedback', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Submit feedback' });
});

module.exports = router;
