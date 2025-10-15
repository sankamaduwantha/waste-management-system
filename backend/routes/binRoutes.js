const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all bins' });
});

router.post('/', authorize('admin', 'city_manager'), (req, res) => {
  res.status(201).json({ status: 'success', message: 'Create bin' });
});

router.get('/smart-bins', authorize('city_manager', 'admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get smart bin data' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get bin' });
});

router.put('/:id', authorize('admin', 'city_manager'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update bin' });
});

module.exports = router;
