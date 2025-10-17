/**
 * @fileoverview Performance Controller
 * @description HTTP handlers for performance analytics endpoints
 * @author Waste Management System
 * @version 1.0.0
 */

const performanceService = require('../services/performanceService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Generate performance report for a resident
 * @route POST /api/v1/performance/generate
 * @access Private (Manager, Admin)
 */
exports.generateReport = catchAsync(async (req, res, next) => {
  const { residentId, period = 'monthly' } = req.body;

  if (!residentId) {
    return next(new AppError('Resident ID is required', 400));
  }

  const report = await performanceService.generatePerformanceReport(residentId, period);

  res.status(201).json({
    status: 'success',
    data: report
  });
});

/**
 * Get performance report by ID
 * @route GET /api/v1/performance/:id
 * @access Private
 */
exports.getReport = catchAsync(async (req, res, next) => {
  const report = await performanceService.getPerformanceReport(req.params.id);

  res.status(200).json({
    status: 'success',
    data: report
  });
});

/**
 * Get all performance reports
 * @route GET /api/v1/performance
 * @access Private (Manager, Admin)
 */
exports.getAllReports = catchAsync(async (req, res, next) => {
  const filters = {
    resident: req.query.resident,
    period: req.query.period,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    minCompletionRate: req.query.minCompletionRate,
    maxCompletionRate: req.query.maxCompletionRate,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy
  };

  const result = await performanceService.getPerformanceReports(filters);

  res.status(200).json({
    status: 'success',
    data: result.reports,
    pagination: result.pagination
  });
});

/**
 * Get leaderboard
 * @route GET /api/v1/performance/leaderboard
 * @access Private
 */
exports.getLeaderboard = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';
  const limit = parseInt(req.query.limit) || 50;

  // Calculate date range
  const startDate = new Date();
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  // Get leaderboard from real task data
  const leaderboard = await require('../models/Task').aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'residents',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'resident'
      }
    },
    { $unwind: '$resident' },
    {
      $lookup: {
        from: 'users',
        localField: 'resident.user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$assignedTo',
        name: { $first: '$user.name' },
        email: { $first: '$user.email' },
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        points: { $sum: '$rewardPoints' }
      }
    },
    {
      $project: {
        _id: 0,
        resident: '$_id',
        name: 1,
        email: 1,
        totalTasks: 1,
        completedTasks: 1,
        completionRate: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
            0
          ]
        },
        points: 1
      }
    },
    { $sort: { points: -1 } },
    { $limit: limit }
  ]);

  res.status(200).json({
    status: 'success',
    data: leaderboard
  });
});

/**
 * Get resident analytics
 * @route GET /api/v1/performance/resident/:id/analytics
 * @access Private
 */
exports.getResidentAnalytics = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const period = req.query.period || 'monthly';

  // Check if user is viewing their own analytics or is a manager/admin
  if (req.user.role === 'resident') {
    const Resident = require('../models/Resident');
    const resident = await Resident.findOne({ user: req.user._id });
    
    if (!resident || resident._id.toString() !== id) {
      return next(new AppError('You can only view your own analytics', 403));
    }
  }

  const analytics = await performanceService.getResidentAnalytics(id, period);

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

/**
 * Get category analytics
 * @route GET /api/v1/performance/analytics/categories
 * @access Private (Manager, Admin)
 */
exports.getCategoryAnalytics = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';

  // Calculate date range
  const startDate = new Date();
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  // Get category stats from real tasks
  const categoryStats = await require('../models/Task').aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalPoints: { $sum: '$rewardPoints' }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalTasks: 1,
        completedTasks: 1,
        completionRate: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 2] },
            0
          ]
        },
        totalPoints: 1
      }
    },
    { $sort: { completedTasks: -1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: categoryStats
  });
});

/**
 * Get completion trends
 * @route GET /api/v1/performance/trends
 * @access Private
 */
exports.getCompletionTrends = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';
  const months = parseInt(req.query.months) || 6;

  // Calculate trends from real task data
  const trends = await require('../models/Task').aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 1,
        total: '$totalTasks',
        completed: '$completedTasks',
        completionRate: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 2] },
            0
          ]
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: trends
  });
});

/**
 * Get zone comparison
 * @route GET /api/v1/performance/zones/comparison
 * @access Private (Manager, Admin)
 */
exports.getZoneComparison = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';

  // For now, return empty array since zones aren't fully configured
  // This will be populated once zone management is implemented
  res.status(200).json({
    status: 'success',
    data: []
  });
});

/**
 * Get top performers
 * @route GET /api/v1/performance/top-performers
 * @access Private
 */
exports.getTopPerformers = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';
  const limit = parseInt(req.query.limit) || 5;

  // Calculate date range
  const startDate = new Date();
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  // Get top performers from real task data
  const topPerformers = await require('../models/Task').aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'residents',
        localField: 'assignedTo',
        foreignField: '_id',
        as: 'resident'
      }
    },
    { $unwind: '$resident' },
    {
      $lookup: {
        from: 'users',
        localField: 'resident.user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$assignedTo',
        name: { $first: '$user.name' },
        completedTasks: { $sum: 1 },
        points: { $sum: '$rewardPoints' }
      }
    },
    {
      $project: {
        _id: 0,
        resident: '$_id',
        name: 1,
        completedTasks: 1,
        points: 1
      }
    },
    { $sort: { points: -1 } },
    { $limit: limit }
  ]);

  res.status(200).json({
    status: 'success',
    data: topPerformers
  });
});

/**
 * Get environmental impact summary
 * @route GET /api/v1/performance/environmental-impact
 * @access Private
 */
exports.getEnvironmentalImpact = catchAsync(async (req, res, next) => {
  const options = {
    period: req.query.period || 'monthly',
    residentId: req.query.residentId,
    zone: req.query.zone
  };

  // Check authorization for resident-specific impact
  if (options.residentId && req.user.role === 'resident') {
    const Resident = require('../models/Resident');
    const resident = await Resident.findOne({ user: req.user._id });
    
    if (!resident || resident._id.toString() !== options.residentId) {
      return next(new AppError('You can only view your own impact', 403));
    }
  }

  const impact = await performanceService.getEnvironmentalImpact(options);

  res.status(200).json({
    status: 'success',
    data: impact
  });
});

/**
 * Bulk generate reports for all residents
 * @route POST /api/v1/performance/bulk-generate
 * @access Private (Admin only)
 */
exports.bulkGenerateReports = catchAsync(async (req, res, next) => {
  const { period = 'monthly' } = req.body;

  const result = await performanceService.bulkGenerateReports(period);

  res.status(201).json({
    status: 'success',
    message: `Generated ${result.generated} out of ${result.total} reports`,
    data: result
  });
});

/**
 * Get my analytics (for logged-in resident)
 * @route GET /api/v1/performance/my-analytics
 * @access Private (Resident)
 */
exports.getMyAnalytics = catchAsync(async (req, res, next) => {
  const Resident = require('../models/Resident');
  
  const resident = await Resident.findOne({ user: req.user._id });
  if (!resident) {
    return next(new AppError('Resident profile not found', 404));
  }

  const period = req.query.period || 'monthly';
  const analytics = await performanceService.getResidentAnalytics(resident._id, period);

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

/**
 * Get dashboard statistics
 * @route GET /api/v1/performance/dashboard-stats
 * @access Private (Manager, Admin)
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const period = req.query.period || 'monthly';

  // Calculate date range
  const startDate = new Date();
  const endDate = new Date();
  
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  // Get real-time stats from Tasks and Residents
  const [totalResidents, taskStats, userPoints] = await Promise.all([
    require('../models/Resident').countDocuments(),
    require('../models/Task').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalPoints: { $sum: '$rewardPoints' }
        }
      }
    ]),
    require('../models/User').aggregate([
      {
        $match: {
          role: 'resident'
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$rewardPoints.total' }
        }
      }
    ])
  ]);

  const stats = taskStats[0] || { totalTasks: 0, completedTasks: 0, totalPoints: 0 };
  const points = userPoints[0] || { totalPoints: 0 };

  res.status(200).json({
    status: 'success',
    data: {
      totalResidents,
      avgCompletionRate: stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0,
      totalPointsEarned: points.totalPoints,
      tasksCompleted: stats.completedTasks
    }
  });
});

module.exports = exports;
