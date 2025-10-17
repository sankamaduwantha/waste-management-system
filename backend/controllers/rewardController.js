/**
 * @fileoverview Reward Controller
 * @description Handle reward CRUD operations and reward claims
 * @module controllers/rewardController
 */

const Reward = require('../models/Reward');
const RewardClaim = require('../models/RewardClaim');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all rewards
 * @route   GET /api/rewards
 * @access  Private
 */
exports.getAllRewards = catchAsync(async (req, res, next) => {
  const {
    category,
    status,
    minPoints,
    maxPoints,
    search,
    sortBy = '-createdAt',
    page = 1,
    limit = 10
  } = req.query;

  // Build filter
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (minPoints || maxPoints) {
    filter.pointsCost = {};
    if (minPoints) filter.pointsCost.$gte = parseInt(minPoints);
    if (maxPoints) filter.pointsCost.$lte = parseInt(maxPoints);
  }

  // Execute query
  const rewards = await Reward.find(filter)
    .populate('createdBy', 'name email')
    .sort(sortBy)
    .limit(parseInt(limit))
    .skip((page - 1) * parseInt(limit));

  const total = await Reward.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      rewards,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Get single reward
 * @route   GET /api/rewards/:id
 * @access  Private
 */
exports.getReward = catchAsync(async (req, res, next) => {
  const reward = await Reward.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { reward }
  });
});

/**
 * @desc    Create new reward
 * @route   POST /api/rewards
 * @access  Private (Sustainability Manager, Admin)
 */
exports.createReward = catchAsync(async (req, res, next) => {
  const rewardData = {
    ...req.body,
    createdBy: req.user.id
  };

  const reward = await Reward.create(rewardData);

  res.status(201).json({
    success: true,
    data: { reward }
  });
});

/**
 * @desc    Update reward
 * @route   PUT /api/rewards/:id
 * @access  Private (Sustainability Manager, Admin)
 */
exports.updateReward = catchAsync(async (req, res, next) => {
  let reward = await Reward.findById(req.params.id);

  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: { reward }
  });
});

/**
 * @desc    Delete reward
 * @route   DELETE /api/rewards/:id
 * @access  Private (Sustainability Manager, Admin)
 */
exports.deleteReward = catchAsync(async (req, res, next) => {
  const reward = await Reward.findById(req.params.id);

  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  // Check if there are pending claims
  const pendingClaims = await RewardClaim.countDocuments({
    reward: req.params.id,
    status: { $in: ['pending', 'approved'] }
  });

  if (pendingClaims > 0) {
    return next(new AppError('Cannot delete reward with pending claims', 400));
  }

  await reward.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Claim a reward
 * @route   POST /api/rewards/:id/claim
 * @access  Private (Resident)
 */
exports.claimReward = catchAsync(async (req, res, next) => {
  const reward = await Reward.findById(req.params.id);

  if (!reward) {
    return next(new AppError('Reward not found', 404));
  }

  if (!reward.isAvailable) {
    return next(new AppError('Reward is not available', 400));
  }

  const user = await User.findById(req.user.id);

  if (user.rewardPoints.current < reward.pointsCost) {
    return next(new AppError('Insufficient reward points', 400));
  }

  // Create claim
  const claim = await RewardClaim.create({
    reward: reward._id,
    resident: req.user.id,
    pointsUsed: reward.pointsCost,
    deliveryAddress: req.body.deliveryAddress || user.address?.street || '',
    contactPhone: req.body.contactPhone || user.phone || '',
    notes: req.body.notes || ''
  });

  // Deduct points from user
  user.rewardPoints.current -= reward.pointsCost;
  user.rewardPoints.spent += reward.pointsCost;
  await user.save();

  // Update reward stock
  await reward.claim();

  // Populate claim for response
  await claim.populate('reward', 'title description pointsCost');

  res.status(201).json({
    success: true,
    data: { claim }
  });
});

/**
 * @desc    Get all claims
 * @route   GET /api/rewards/claims
 * @access  Private (Sustainability Manager, Admin)
 */
exports.getAllClaims = catchAsync(async (req, res, next) => {
  const {
    status,
    resident,
    sortBy = '-claimDate',
    page = 1,
    limit = 10
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (resident) filter.resident = resident;

  const claims = await RewardClaim.find(filter)
    .populate('reward', 'title description pointsCost')
    .populate('resident', 'name email phone')
    .populate('approvedBy', 'name')
    .sort(sortBy)
    .limit(parseInt(limit))
    .skip((page - 1) * parseInt(limit));

  const total = await RewardClaim.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      claims,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Get my claims (resident)
 * @route   GET /api/rewards/my-claims
 * @access  Private (Resident)
 */
exports.getMyClaims = catchAsync(async (req, res, next) => {
  const claims = await RewardClaim.find({ resident: req.user.id })
    .populate('reward', 'title description pointsCost imageUrl')
    .sort('-claimDate');

  res.status(200).json({
    success: true,
    data: { claims }
  });
});

/**
 * @desc    Approve a claim
 * @route   PUT /api/rewards/claims/:id/approve
 * @access  Private (Sustainability Manager, Admin)
 */
exports.approveClaim = catchAsync(async (req, res, next) => {
  const claim = await RewardClaim.findById(req.params.id);

  if (!claim) {
    return next(new AppError('Claim not found', 404));
  }

  if (claim.status !== 'pending') {
    return next(new AppError('Only pending claims can be approved', 400));
  }

  await claim.approve(req.user.id);

  await claim.populate('reward', 'title');
  await claim.populate('resident', 'name email');

  res.status(200).json({
    success: true,
    data: { claim }
  });
});

/**
 * @desc    Mark claim as delivered
 * @route   PUT /api/rewards/claims/:id/deliver
 * @access  Private (Sustainability Manager, Admin)
 */
exports.markDelivered = catchAsync(async (req, res, next) => {
  const claim = await RewardClaim.findById(req.params.id);

  if (!claim) {
    return next(new AppError('Claim not found', 404));
  }

  await claim.markDelivered();

  res.status(200).json({
    success: true,
    data: { claim }
  });
});

/**
 * @desc    Get reward statistics
 * @route   GET /api/rewards/statistics
 * @access  Private (Sustainability Manager, Admin)
 */
exports.getStatistics = catchAsync(async (req, res, next) => {
  const [
    totalRewards,
    activeRewards,
    totalClaims,
    pendingClaims,
    approvedClaims,
    deliveredClaims,
    totalPointsDistributed
  ] = await Promise.all([
    Reward.countDocuments(),
    Reward.countDocuments({ status: 'active' }),
    RewardClaim.countDocuments(),
    RewardClaim.countDocuments({ status: 'pending' }),
    RewardClaim.countDocuments({ status: 'approved' }),
    RewardClaim.countDocuments({ status: 'delivered' }),
    RewardClaim.aggregate([
      { $group: { _id: null, total: { $sum: '$pointsUsed' } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRewards,
      activeRewards,
      totalClaims,
      pendingClaims,
      approvedClaims,
      deliveredClaims,
      totalPointsDistributed: totalPointsDistributed[0]?.total || 0
    }
  });
});

/**
 * @desc    Award points to resident
 * @route   POST /api/rewards/award-points
 * @access  Private (Sustainability Manager, Admin)
 */
exports.awardPoints = catchAsync(async (req, res, next) => {
  const { residentId, points, reason } = req.body;

  if (!residentId || !points || points <= 0) {
    return next(new AppError('Resident ID and positive points amount required', 400));
  }

  const user = await User.findById(residentId);

  if (!user) {
    return next(new AppError('Resident not found', 404));
  }

  if (user.role !== 'resident') {
    return next(new AppError('Can only award points to residents', 400));
  }

  user.rewardPoints.current += points;
  user.rewardPoints.total += points;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        rewardPoints: user.rewardPoints
      },
      message: `Awarded ${points} points. Reason: ${reason || 'N/A'}`
    }
  });
});

module.exports = exports;
