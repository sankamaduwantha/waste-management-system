const CollectorPerformance = require('../models/CollectorPerformance');
const CollectorTask = require('../models/CollectorTask');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get collector performance metrics
// @route   GET /api/v1/collectors/performance
// @access  Private (Garbage Collector)
exports.getPerformance = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  const { period = 'week' } = req.query;
  
  // Calculate date range based on period
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  startDate.setHours(0, 0, 0, 0);
  
  // Get tasks in the period
  const tasks = await CollectorTask.find({
    collector: collectorId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Calculate metrics
  let totalCollections = 0;
  let completedCollections = 0;
  let totalTime = 0;
  let totalDistance = 0;
  let onTimeCollections = 0;
  let totalScheduled = 0;
  
  tasks.forEach(task => {
    task.bins.forEach(bin => {
      totalCollections++;
      
      if (bin.status === 'completed') {
        completedCollections++;
        
        // Calculate time taken
        if (bin.startTime && bin.completionTime) {
          const timeTaken = (bin.completionTime - bin.startTime) / 1000 / 60; // minutes
          totalTime += timeTaken;
          
          // Check if on time (within 15 minutes of scheduled time)
          if (bin.scheduledTime) {
            totalScheduled++;
            const scheduledTime = new Date(bin.scheduledTime);
            const timeDiff = Math.abs(bin.completionTime - scheduledTime) / 1000 / 60;
            if (timeDiff <= 15) {
              onTimeCollections++;
            }
          }
        }
      }
    });
    
    totalDistance += task.totalDistance || 0;
  });
  
  // Calculate rates
  const completionRate = totalCollections > 0 
    ? Math.round((completedCollections / totalCollections) * 100) 
    : 0;
  
  const averageTime = completedCollections > 0 
    ? Math.round((totalTime / completedCollections) * 10) / 10 
    : 0;
  
  const onTimeRate = totalScheduled > 0 
    ? Math.round((onTimeCollections / totalScheduled) * 100) 
    : 0;
  
  // Calculate efficiency (weighted score)
  const efficiency = Math.round(
    (completionRate * 0.5) +
    (onTimeRate * 0.3) +
    (averageTime > 0 ? Math.min(100, (5 / averageTime) * 100) * 0.2 : 0)
  );
  
  // Calculate rating (1-5 scale)
  const rating = Math.min(5, Math.round((efficiency / 20) * 10) / 10);
  
  const metrics = {
    totalCollections,
    completionRate,
    averageTime,
    distanceCovered: Math.round(totalDistance * 10) / 10,
    rating,
    efficiency,
    onTimeRate
  };
  
  res.status(200).json({
    success: true,
    data: metrics
  });
});

// @desc    Get weekly stats for progress chart
// @route   GET /api/v1/collectors/weekly-stats
// @access  Private (Garbage Collector)
exports.getWeeklyStats = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  const weekData = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Get tasks for this day
    const tasks = await CollectorTask.find({
      collector: collectorId,
      date: { $gte: date, $lt: nextDate }
    });
    
    let totalBins = 0;
    let completed = 0;
    
    tasks.forEach(task => {
      totalBins += task.bins.length;
      completed += task.bins.filter(b => b.status === 'completed').length;
    });
    
    const completionRate = totalBins > 0 
      ? Math.round((completed / totalBins) * 100) 
      : 0;
    
    weekData.push({
      day: daysOfWeek[date.getDay()],
      date: date.toISOString().split('T')[0],
      completionRate,
      totalBins,
      completed
    });
  }
  
  res.status(200).json({
    success: true,
    data: weekData
  });
});

// @desc    Get collector achievements
// @route   GET /api/v1/collectors/achievements
// @access  Private (Garbage Collector)
exports.getAchievements = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  const achievements = await Achievement.find({ collector: collectorId })
    .sort({ earnedAt: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements
  });
});

// @desc    Get team leaderboard
// @route   GET /api/v1/collectors/leaderboard
// @access  Private (Garbage Collector)
exports.getLeaderboard = catchAsync(async (req, res, next) => {
  const { period = 'week' } = req.query;
  
  // Calculate date range
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  startDate.setHours(0, 0, 0, 0);
  
  // Get all garbage collectors
  const collectors = await User.find({ 
    role: 'garbage_collector',
    isActive: true 
  }).select('name email');
  
  // Calculate scores for each collector
  const leaderboardData = [];
  
  for (const collector of collectors) {
    const tasks = await CollectorTask.find({
      collector: collector._id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    let totalCollections = 0;
    let completedCollections = 0;
    let totalDistance = 0;
    
    tasks.forEach(task => {
      task.bins.forEach(bin => {
        totalCollections++;
        if (bin.status === 'completed') {
          completedCollections++;
        }
      });
      totalDistance += task.totalDistance || 0;
    });
    
    const completionRate = totalCollections > 0 
      ? Math.round((completedCollections / totalCollections) * 100) 
      : 0;
    
    // Calculate score (weighted)
    const score = Math.round(
      (completedCollections * 10) +
      (completionRate * 5) +
      (totalDistance * 2)
    );
    
    leaderboardData.push({
      _id: collector._id,
      name: collector.name,
      collections: completedCollections,
      completionRate,
      distance: Math.round(totalDistance * 10) / 10,
      score
    });
  }
  
  // Sort by score (highest first)
  leaderboardData.sort((a, b) => b.score - a.score);
  
  res.status(200).json({
    success: true,
    count: leaderboardData.length,
    data: leaderboardData
  });
});

// @desc    Check and award achievements (internal function)
// @route   POST /api/v1/collectors/check-achievements
// @access  Private (Garbage Collector)
exports.checkAchievements = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  // Get all tasks
  const allTasks = await CollectorTask.find({ collector: collectorId });
  
  let totalCompleted = 0;
  allTasks.forEach(task => {
    totalCompleted += task.bins.filter(b => b.status === 'completed').length;
  });
  
  const newAchievements = [];
  
  // Check milestone achievements
  if (totalCompleted === 1) {
    const achievement = await Achievement.awardAchievement(
      collectorId, 
      'first_collection',
      { value: 1, metric: 'collections' }
    );
    if (achievement) newAchievements.push(achievement);
  }
  
  if (totalCompleted >= 100) {
    const achievement = await Achievement.awardAchievement(
      collectorId,
      'milestone_100',
      { value: 100, metric: 'collections' }
    );
    if (achievement) newAchievements.push(achievement);
  }
  
  if (totalCompleted >= 500) {
    const achievement = await Achievement.awardAchievement(
      collectorId,
      'milestone_500',
      { value: 500, metric: 'collections' }
    );
    if (achievement) newAchievements.push(achievement);
  }
  
  if (totalCompleted >= 1000) {
    const achievement = await Achievement.awardAchievement(
      collectorId,
      'milestone_1000',
      { value: 1000, metric: 'collections' }
    );
    if (achievement) newAchievements.push(achievement);
  }
  
  // Check today's perfect day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTasks = await CollectorTask.find({
    collector: collectorId,
    date: { $gte: today, $lt: tomorrow }
  });
  
  const todayStats = todayTasks[0]?.getStatistics();
  if (todayStats && todayStats.completionRate === 100 && todayStats.totalBins > 0) {
    const achievement = await Achievement.awardAchievement(
      collectorId,
      'perfect_day',
      { value: 100, metric: 'completion_rate' }
    );
    if (achievement) newAchievements.push(achievement);
  }
  
  res.status(200).json({
    success: true,
    message: `Checked achievements. ${newAchievements.length} new achievements awarded.`,
    data: newAchievements
  });
});

module.exports = exports;
