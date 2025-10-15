const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all schedules' });
});

router.post('/', authorize('admin', 'city_manager'), (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create schedule' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get schedule' });
});

router.put('/:id', authorize('admin', 'city_manager'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update schedule' });
});

router.delete('/:id', authorize('admin', 'city_manager'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Delete schedule' });
});

module.exports = router;
