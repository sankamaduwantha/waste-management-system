const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all vehicles' });
});

router.post('/', authorize('admin', 'city_manager'), (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create vehicle' });
});

router.get('/tracking', authorize('city_manager', 'admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get vehicle tracking data' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get vehicle' });
});

router.put('/:id', authorize('admin', 'city_manager'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update vehicle' });
});

module.exports = router;
