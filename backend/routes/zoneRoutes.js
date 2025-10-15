const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'city_manager'));

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all zones' });
});

router.post('/', authorize('admin'), (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create zone' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get zone' });
});

router.put('/:id', authorize('admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update zone' });
});

router.delete('/:id', authorize('admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Delete zone' });
});

module.exports = router;
