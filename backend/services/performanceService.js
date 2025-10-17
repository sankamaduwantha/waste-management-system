/**
 * @fileoverview Performance Service
 * @description Business logic for performance analytics and monitoring
 * @author Waste Management System
 * @version 1.0.0
 */

const PerformanceReport = require('../models/PerformanceReport');
const Task = require('../models/Task');
const Resident = require('../models/Resident');
const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Generate performance report for a resident
 */
exports.generatePerformanceReport = async (residentId, period = 'monthly') => {
  // Check if resident exists
  const resident = await Resident.findById(residentId);
  if (!resident) {
    throw new AppError('Resident not found', 404);
  }

  // Generate report using model static method
  const report = await PerformanceReport.generateReport(residentId, period);
  
  // Calculate rank and percentile
  await exports.calculateRankings(report._id);

  return report;
};

/**
 * Get performance report by ID
 */
exports.getPerformanceReport = async (reportId) => {
  const report = await PerformanceReport.findById(reportId)
    .populate('resident', 'user zone address')
    .populate({
      path: 'resident',
      populate: {
        path: 'user',
        select: 'name email avatar'
      }
    });

  if (!report) {
    throw new AppError('Performance report not found', 404);
  }

  return report;
};

/**
 * Get all performance reports with filters
 */
exports.getPerformanceReports = async (filters = {}) => {
  const {
    resident,
    period,
    startDate,
    endDate,
    minCompletionRate,
    maxCompletionRate,
    page = 1,
    limit = 10,
    sortBy = '-reportPeriod.startDate'
  } = filters;

  const query = {};

  if (resident) query.resident = resident;
  if (period) query['reportPeriod.type'] = period;
  if (startDate) query['reportPeriod.startDate'] = { $gte: new Date(startDate) };
  if (endDate) query['reportPeriod.endDate'] = { $lte: new Date(endDate) };
  if (minCompletionRate) {
    query['taskMetrics.completionRate'] = { 
      ...query['taskMetrics.completionRate'],
      $gte: minCompletionRate 
    };
  }
  if (maxCompletionRate) {
    query['taskMetrics.completionRate'] = { 
      ...query['taskMetrics.completionRate'],
      $lte: maxCompletionRate 
    };
  }

  const skip = (page - 1) * limit;

  const reports = await PerformanceReport.find(query)
    .populate('resident', 'user zone address')
    .populate({
      path: 'resident',
      populate: {
        path: 'user',
        select: 'name email avatar'
      }
    })
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await PerformanceReport.countDocuments(query);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get leaderboard
 */
exports.getLeaderboard = async (options = {}) => {
  const {
    period = 'monthly',
    zone = null,
    limit = 10,
    category = null
  } = options;

  const startDate = new Date();
  const endDate = new Date();

  // Calculate date range based on period
  switch (period) {
    case 'daily':
      startDate.setDate(startDate.getDate() - 1);
      break;
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

  const leaderboard = await PerformanceReport.getLeaderboard({
    period,
    startDate,
    endDate,
    limit,
    zone
  });

  // Add rank numbers
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};

/**
 * Get resident analytics
 */
exports.getResidentAnalytics = async (residentId, period = 'monthly') => {
  // Get latest report
  const latestReport = await PerformanceReport.findOne({
    resident: residentId,
    'reportPeriod.type': period
  })
    .sort('-reportPeriod.startDate')
    .populate('resident', 'user zone');

  if (!latestReport) {
    // Generate one if doesn't exist
    return await exports.generatePerformanceReport(residentId, period);
  }

  // Get category performance
  const categoryPerformance = await PerformanceReport.getCategoryPerformance(residentId, period);

  // Get trends
  const trends = await PerformanceReport.getTrends(residentId, 6);

  return {
    report: latestReport,
    categoryPerformance,
    trends
  };
};

/**
 * Get category performance across all residents
 */
exports.getCategoryAnalytics = async (period = 'monthly') => {
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

  const categoryStats = await PerformanceReport.aggregate([
    {
      $match: {
        'reportPeriod.type': period,
        'reportPeriod.startDate': { $gte: startDate }
      }
    },
    { $unwind: '$categoryBreakdown' },
    {
      $group: {
        _id: '$categoryBreakdown.category',
        totalAssigned: { $sum: '$categoryBreakdown.tasksAssigned' },
        totalCompleted: { $sum: '$categoryBreakdown.tasksCompleted' },
        totalPoints: { $sum: '$categoryBreakdown.pointsEarned' },
        avgCompletionRate: { $avg: '$categoryBreakdown.completionRate' },
        residentCount: { $sum: 1 }
      }
    },
    {
      $project: {
        category: '$_id',
        totalAssigned: 1,
        totalCompleted: 1,
        totalPoints: 1,
        avgCompletionRate: { $round: ['$avgCompletionRate', 2] },
        residentCount: 1,
        _id: 0
      }
    },
    { $sort: { totalCompleted: -1 } }
  ]);

  return categoryStats;
};

/**
 * Get completion trends over time
 */
exports.getCompletionTrends = async (residentId = null, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const matchStage = {
    'reportPeriod.type': 'monthly',
    'reportPeriod.startDate': { $gte: startDate }
  };

  if (residentId) {
    matchStage.resident = residentId;
  }

  const trends = await PerformanceReport.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$reportPeriod.startDate' },
          month: { $month: '$reportPeriod.startDate' }
        },
        avgCompletionRate: { $avg: '$taskMetrics.completionRate' },
        totalCompleted: { $sum: '$taskMetrics.totalCompleted' },
        totalPoints: { $sum: '$pointsMetrics.totalEarned' },
        avgCo2Saved: { $avg: '$environmentalImpact.co2Saved' }
      }
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        avgCompletionRate: { $round: ['$avgCompletionRate', 2] },
        totalCompleted: 1,
        totalPoints: 1,
        avgCo2Saved: { $round: ['$avgCo2Saved', 2] },
        _id: 0
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);

  return trends;
};

/**
 * Get zone comparison
 */
exports.getZoneComparison = async (period = 'monthly') => {
  const startDate = new Date();
  
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const zoneStats = await PerformanceReport.aggregate([
    {
      $match: {
        'reportPeriod.type': period,
        'reportPeriod.startDate': { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'residents',
        localField: 'resident',
        foreignField: '_id',
        as: 'residentData'
      }
    },
    { $unwind: '$residentData' },
    {
      $lookup: {
        from: 'zones',
        localField: 'residentData.zone',
        foreignField: '_id',
        as: 'zoneData'
      }
    },
    { $unwind: '$zoneData' },
    {
      $group: {
        _id: '$zoneData._id',
        zoneName: { $first: '$zoneData.name' },
        avgCompletionRate: { $avg: '$taskMetrics.completionRate' },
        totalTasks: { $sum: '$taskMetrics.totalCompleted' },
        totalPoints: { $sum: '$pointsMetrics.totalEarned' },
        totalCo2Saved: { $sum: '$environmentalImpact.co2Saved' },
        residentCount: { $sum: 1 }
      }
    },
    {
      $project: {
        zone: '$_id',
        zoneName: 1,
        avgCompletionRate: { $round: ['$avgCompletionRate', 2] },
        totalTasks: 1,
        totalPoints: 1,
        totalCo2Saved: { $round: ['$totalCo2Saved', 2] },
        residentCount: 1,
        avgTasksPerResident: { 
          $round: [{ $divide: ['$totalTasks', '$residentCount'] }, 2] 
        },
        _id: 0
      }
    },
    { $sort: { avgCompletionRate: -1 } }
  ]);

  return zoneStats;
};

/**
 * Get top performers
 */
exports.getTopPerformers = async (options = {}) => {
  const {
    period = 'monthly',
    limit = 5,
    metric = 'points' // points, completion_rate, tasks
  } = options;

  const startDate = new Date();
  
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  let sortField;
  switch (metric) {
    case 'completion_rate':
      sortField = { 'taskMetrics.completionRate': -1 };
      break;
    case 'tasks':
      sortField = { 'taskMetrics.totalCompleted': -1 };
      break;
    default:
      sortField = { 'pointsMetrics.totalEarned': -1 };
  }

  const topPerformers = await PerformanceReport.find({
    'reportPeriod.type': period,
    'reportPeriod.startDate': { $gte: startDate }
  })
    .populate({
      path: 'resident',
      populate: {
        path: 'user',
        select: 'name email avatar'
      }
    })
    .sort(sortField)
    .limit(limit);

  return topPerformers;
};

/**
 * Calculate rankings for a report
 */
exports.calculateRankings = async (reportId) => {
  const report = await PerformanceReport.findById(reportId);
  if (!report) return;

  // Get all reports for the same period
  const allReports = await PerformanceReport.find({
    'reportPeriod.type': report.reportPeriod.type,
    'reportPeriod.startDate': report.reportPeriod.startDate,
    'reportPeriod.endDate': report.reportPeriod.endDate
  }).sort('-pointsMetrics.totalEarned');

  // Calculate rank
  const rank = allReports.findIndex(r => r._id.toString() === reportId.toString()) + 1;
  const totalReports = allReports.length;
  const percentile = totalReports > 1 ? ((totalReports - rank) / (totalReports - 1)) * 100 : 100;

  // Calculate comparison metrics
  const avgPoints = allReports.reduce((sum, r) => sum + r.pointsMetrics.totalEarned, 0) / totalReports;
  const topPerformer = allReports[0];
  
  const vsAverage = avgPoints > 0 ? ((report.pointsMetrics.totalEarned - avgPoints) / avgPoints) * 100 : 0;
  const vsTopPerformer = topPerformer && topPerformer.pointsMetrics.totalEarned > 0
    ? ((report.pointsMetrics.totalEarned - topPerformer.pointsMetrics.totalEarned) / topPerformer.pointsMetrics.totalEarned) * 100
    : 0;

  // Update report
  report.pointsMetrics.rank = rank;
  report.pointsMetrics.percentile = Math.round(percentile * 100) / 100;
  report.comparisonMetrics.vsAverage = Math.round(vsAverage * 100) / 100;
  report.comparisonMetrics.vsTopPerformer = Math.round(vsTopPerformer * 100) / 100;

  await report.save();
  
  return report;
};

/**
 * Get environmental impact summary
 */
exports.getEnvironmentalImpact = async (options = {}) => {
  const {
    period = 'monthly',
    residentId = null,
    zone = null
  } = options;

  const startDate = new Date();
  
  switch (period) {
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const matchStage = {
    'reportPeriod.type': period,
    'reportPeriod.startDate': { $gte: startDate }
  };

  if (residentId) matchStage.resident = residentId;

  const pipeline = [
    { $match: matchStage }
  ];

  // Add zone filter if specified
  if (zone) {
    pipeline.push(
      {
        $lookup: {
          from: 'residents',
          localField: 'resident',
          foreignField: '_id',
          as: 'residentData'
        }
      },
      { $unwind: '$residentData' },
      { $match: { 'residentData.zone': zone } }
    );
  }

  pipeline.push({
    $group: {
      _id: null,
      totalCo2Saved: { $sum: '$environmentalImpact.co2Saved' },
      totalWasteRecycled: { $sum: '$environmentalImpact.wasteRecycled' },
      totalWaterSaved: { $sum: '$environmentalImpact.waterSaved' },
      totalEnergySaved: { $sum: '$environmentalImpact.energySaved' },
      residentCount: { $sum: 1 }
    }
  });

  const result = await PerformanceReport.aggregate(pipeline);

  if (result.length === 0) {
    return {
      totalCo2Saved: 0,
      totalWasteRecycled: 0,
      totalWaterSaved: 0,
      totalEnergySaved: 0,
      residentCount: 0
    };
  }

  return {
    ...result[0],
    _id: undefined
  };
};

/**
 * Bulk generate reports for all residents
 */
exports.bulkGenerateReports = async (period = 'monthly') => {
  const residents = await Resident.find({ isActive: true });
  const reports = [];
  
  for (const resident of residents) {
    try {
      const report = await exports.generatePerformanceReport(resident._id, period);
      reports.push(report);
    } catch (error) {
      console.error(`Failed to generate report for resident ${resident._id}:`, error);
    }
  }

  return {
    generated: reports.length,
    total: residents.length,
    reports
  };
};

module.exports = exports;
