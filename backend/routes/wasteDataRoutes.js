const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('sustainability_manager', 'admin'));

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all waste data' });
});

router.post('/', (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create waste data entry' });
});

router.get('/analytics', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get waste analytics' });
});

router.get('/environmental-impact', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get environmental impact' });
});

module.exports = router;
