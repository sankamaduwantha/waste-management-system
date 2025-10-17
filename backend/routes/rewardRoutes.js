/**
 * @fileoverview Reward Routes
 * @description API routes for reward management
 * @module routes/rewardRoutes
 */

const express = require('express');
const router = express.Router();
const {
  getAllRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,
  claimReward,
  getAllClaims,
  getMyClaims,
  approveClaim,
  markDelivered,
  getStatistics,
  awardPoints
} = require('../controllers/rewardController');

const { protect, authorize } = require('../middleware/auth');

// Public/resident routes
router.use(protect); // All routes require authentication

router.get('/', getAllRewards);
router.get('/statistics', authorize('sustainability_manager', 'admin'), getStatistics);
router.get('/my-claims', getMyClaims);
router.get('/claims', authorize('sustainability_manager', 'admin'), getAllClaims);
router.get('/:id', getReward);

router.post('/', authorize('sustainability_manager', 'admin'), createReward);
router.post('/:id/claim', authorize('resident'), claimReward);
router.post('/award-points', authorize('sustainability_manager', 'admin'), awardPoints);

router.put('/:id', authorize('sustainability_manager', 'admin'), updateReward);
router.put('/claims/:id/approve', authorize('sustainability_manager', 'admin'), approveClaim);
router.put('/claims/:id/deliver', authorize('sustainability_manager', 'admin'), markDelivered);

router.delete('/:id', authorize('sustainability_manager', 'admin'), deleteReward);

module.exports = router;
