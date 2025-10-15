const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Different dashboards based on role
router.get('/resident', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Resident dashboard data' });
});

router.get('/city-manager', authorize('city_manager', 'admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'City manager dashboard data' });
});

router.get('/admin', authorize('admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Admin dashboard data' });
});

router.get('/sustainability', authorize('sustainability_manager', 'admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Sustainability dashboard data' });
});

module.exports = router;
