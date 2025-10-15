const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get all notifications' });
});

router.get('/unread', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get unread notifications' });
});

router.put('/:id/read', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Mark notification as read' });
});

router.put('/mark-all-read', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Mark all as read' });
});

router.delete('/:id', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Delete notification' });
});

module.exports = router;
