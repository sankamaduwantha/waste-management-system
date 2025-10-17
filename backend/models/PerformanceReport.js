/**
 * @fileoverview Performance Report Model
 * @description Tracks resident performance metrics and analytics
 * @author Waste Management System
 * @version 1.0.0
 */

const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Resident is required'],
      index: true
    },
    reportPeriod: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required']
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required']
      },
      type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
        default: 'monthly'
      }
    },
    taskMetrics: {
      totalAssigned: {
        type: Number,
        default: 0,
        min: 0
      },
      totalCompleted: {
        type: Number,
        default: 0,
        min: 0
      },
      totalVerified: {
        type: Number,
        default: 0,
        min: 0
      },
      totalRejected: {
        type: Number,
        default: 0,
        min: 0
      },
      totalOverdue: {
        type: Number,
        default: 0,
        min: 0
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      verificationRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      avgCompletionTime: {
        type: Number, // in hours
        default: 0,
        min: 0
      }
    },
    categoryBreakdown: [{
      category: {
        type: String,
        enum: [
          'recycling',
          'composting',
          'waste_reduction',
          'plastic_free',
          'energy_saving',
          'water_conservation',
          'community_cleanup',
          'education'
        ],
        required: true
      },
      tasksCompleted: {
        type: Number,
        default: 0,
        min: 0
      },
      tasksAssigned: {
        type: Number,
        default: 0,
        min: 0
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      pointsEarned: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    pointsMetrics: {
      totalEarned: {
        type: Number,
        default: 0,
        min: 0
      },
      fromTasks: {
        type: Number,
        default: 0,
        min: 0
      },
      fromBonuses: {
        type: Number,
        default: 0,
        min: 0
      },
      averagePerTask: {
        type: Number,
        default: 0,
        min: 0
      },
      rank: {
        type: Number,
        min: 1
      },
      percentile: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    streakMetrics: {
      currentStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      longestStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActivityDate: Date
    },
    comparisonMetrics: {
      vsAverage: {
        type: Number, // percentage difference
        default: 0
      },
      vsTopPerformer: {
        type: Number, // percentage difference
        default: 0
      },
      zoneRank: {
        type: Number,
        min: 1
      },
      totalResidentsInZone: {
        type: Number,
        min: 1
      }
    },
    achievements: [{
      name: String,
      earnedDate: Date,
      category: String,
      points: Number
    }],
    trends: {
      weekOverWeek: {
        type: Number, // percentage change
        default: 0
      },
      monthOverMonth: {
        type: Number, // percentage change
        default: 0
      },
      isImproving: {
        type: Boolean,
        default: false
      }
    },
    environmentalImpact: {
      co2Saved: {
        type: Number, // in kg
        default: 0,
        min: 0
      },
      wasteRecycled: {
        type: Number, // in kg
        default: 0,
        min: 0
      },
      waterSaved: {
        type: Number, // in liters
        default: 0,
        min: 0
      },
      energySaved: {
        type: Number, // in kWh
        default: 0,
        min: 0
      }
    },
    metadata: {
      generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      generatedAt: {
        type: Date,
        default: Date.now
      },
      notes: String,
      isPublic: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
performanceReportSchema.index({ resident: 1, 'reportPeriod.startDate': -1 });
performanceReportSchema.index({ 'reportPeriod.type': 1, 'reportPeriod.startDate': -1 });
performanceReportSchema.index({ 'pointsMetrics.totalEarned': -1 });
performanceReportSchema.index({ 'taskMetrics.completionRate': -1 });

// Virtual for period duration
performanceReportSchema.virtual('periodDuration').get(function() {
  if (!this.reportPeriod.startDate || !this.reportPeriod.endDate) return 0;
  return Math.ceil(
    (this.reportPeriod.endDate - this.reportPeriod.startDate) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for performance grade
performanceReportSchema.virtual('performanceGrade').get(function() {
  const rate = this.taskMetrics.completionRate;
  if (rate >= 90) return 'A+';
  if (rate >= 80) return 'A';
  if (rate >= 70) return 'B';
  if (rate >= 60) return 'C';
  if (rate >= 50) return 'D';
  return 'F';
});

// Virtual for engagement level
performanceReportSchema.virtual('engagementLevel').get(function() {
  const completed = this.taskMetrics.totalCompleted;
  if (completed >= 50) return 'Very High';
  if (completed >= 30) return 'High';
  if (completed >= 15) return 'Medium';
  if (completed >= 5) return 'Low';
  return 'Very Low';
});

// Static method to get leaderboard
performanceReportSchema.statics.getLeaderboard = async function(options = {}) {
  const {
    period = 'monthly',
    startDate = new Date(new Date().setDate(1)), // First day of current month
    endDate = new Date(),
    limit = 10,
    zone = null
  } = options;

  const matchStage = {
    'reportPeriod.type': period,
    'reportPeriod.startDate': { $gte: startDate },
    'reportPeriod.endDate': { $lte: endDate }
  };

  const pipeline = [
    { $match: matchStage },
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
        from: 'users',
        localField: 'residentData.user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    { $unwind: '$userData' }
  ];

  // Filter by zone if specified (only if it's a valid ObjectId)
  if (zone && mongoose.Types.ObjectId.isValid(zone)) {
    pipeline.push({
      $match: { 'residentData.zone': new mongoose.Types.ObjectId(zone) }
    });
  }

  pipeline.push(
    {
      $sort: { 'pointsMetrics.totalEarned': -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        resident: '$residentData._id',
        name: '$userData.name',
        email: '$userData.email',
        avatar: '$userData.avatar',
        totalPoints: '$pointsMetrics.totalEarned',
        tasksCompleted: '$taskMetrics.totalCompleted',
        completionRate: '$taskMetrics.completionRate',
        rank: '$pointsMetrics.rank',
        level: '$residentData.gamification.level',
        badge: '$residentData.gamification.badge',
        zone: '$residentData.zone'
      }
    }
  );

  return this.aggregate(pipeline);
};

// Static method to get category performance
performanceReportSchema.statics.getCategoryPerformance = async function(residentId, period = 'monthly') {
  return this.aggregate([
    {
      $match: {
        resident: new mongoose.Types.ObjectId(residentId),
        'reportPeriod.type': period
      }
    },
    { $sort: { 'reportPeriod.startDate': -1 } },
    { $limit: 1 },
    { $unwind: '$categoryBreakdown' },
    {
      $project: {
        category: '$categoryBreakdown.category',
        completed: '$categoryBreakdown.tasksCompleted',
        assigned: '$categoryBreakdown.tasksAssigned',
        completionRate: '$categoryBreakdown.completionRate',
        points: '$categoryBreakdown.pointsEarned'
      }
    }
  ]);
};

// Static method to get trends
performanceReportSchema.statics.getTrends = async function(residentId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        resident: new mongoose.Types.ObjectId(residentId),
        'reportPeriod.type': 'monthly',
        'reportPeriod.startDate': { $gte: startDate }
      }
    },
    { $sort: { 'reportPeriod.startDate': 1 } },
    {
      $project: {
        month: { $month: '$reportPeriod.startDate' },
        year: { $year: '$reportPeriod.startDate' },
        tasksCompleted: '$taskMetrics.totalCompleted',
        completionRate: '$taskMetrics.completionRate',
        pointsEarned: '$pointsMetrics.totalEarned',
        co2Saved: '$environmentalImpact.co2Saved'
      }
    }
  ]);
};

// Static method to generate report for resident
performanceReportSchema.statics.generateReport = async function(residentId, period = 'monthly') {
  const Task = mongoose.model('Task');
  const Resident = mongoose.model('Resident');

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
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

  // Get tasks for period
  const tasks = await Task.find({
    assignedTo: residentId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  // Calculate metrics
  const totalAssigned = tasks.length;
  const completedTasks = tasks.filter(t => ['completed', 'verified'].includes(t.status));
  const totalCompleted = completedTasks.length;
  const totalVerified = tasks.filter(t => t.status === 'verified').length;
  const totalRejected = tasks.filter(t => t.status === 'rejected').length;
  const totalOverdue = tasks.filter(t => t.isOverdue && !['completed', 'verified'].includes(t.status)).length;

  const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
  const verificationRate = totalCompleted > 0 ? (totalVerified / totalCompleted) * 100 : 0;

  // Calculate average completion time
  let totalCompletionTime = 0;
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const completionTime = (task.completedAt - task.createdAt) / (1000 * 60 * 60); // hours
      totalCompletionTime += completionTime;
    }
  });
  const avgCompletionTime = completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0;

  // Category breakdown
  const categoryMap = {};
  tasks.forEach(task => {
    if (!categoryMap[task.category]) {
      categoryMap[task.category] = {
        category: task.category,
        tasksAssigned: 0,
        tasksCompleted: 0,
        pointsEarned: 0
      };
    }
    categoryMap[task.category].tasksAssigned++;
    if (['completed', 'verified'].includes(task.status)) {
      categoryMap[task.category].tasksCompleted++;
      if (task.status === 'verified') {
        categoryMap[task.category].pointsEarned += task.rewardPoints || 0;
      }
    }
  });

  const categoryBreakdown = Object.values(categoryMap).map(cat => ({
    ...cat,
    completionRate: cat.tasksAssigned > 0 ? (cat.tasksCompleted / cat.tasksAssigned) * 100 : 0
  }));

  // Points metrics
  const totalPointsEarned = tasks
    .filter(t => t.status === 'verified')
    .reduce((sum, t) => sum + (t.rewardPoints || 0), 0);

  const averagePerTask = totalVerified > 0 ? totalPointsEarned / totalVerified : 0;

  // Get resident for additional data
  const resident = await Resident.findById(residentId).populate('user');

  // Environmental impact calculations (simplified)
  const co2Saved = totalVerified * 2.5; // 2.5 kg per task
  const wasteRecycled = totalVerified * 5; // 5 kg per task
  const waterSaved = totalVerified * 50; // 50 liters per task
  const energySaved = totalVerified * 3; // 3 kWh per task

  // Create report
  const report = await this.create({
    resident: residentId,
    reportPeriod: {
      startDate,
      endDate,
      type: period
    },
    taskMetrics: {
      totalAssigned,
      totalCompleted,
      totalVerified,
      totalRejected,
      totalOverdue,
      completionRate: Math.round(completionRate * 100) / 100,
      verificationRate: Math.round(verificationRate * 100) / 100,
      avgCompletionTime: Math.round(avgCompletionTime * 100) / 100
    },
    categoryBreakdown,
    pointsMetrics: {
      totalEarned: totalPointsEarned,
      fromTasks: totalPointsEarned,
      fromBonuses: 0,
      averagePerTask: Math.round(averagePerTask * 100) / 100
    },
    environmentalImpact: {
      co2Saved: Math.round(co2Saved * 100) / 100,
      wasteRecycled: Math.round(wasteRecycled * 100) / 100,
      waterSaved: Math.round(waterSaved * 100) / 100,
      energySaved: Math.round(energySaved * 100) / 100
    },
    streakMetrics: {
      currentStreak: resident?.gamification?.currentStreak || 0,
      longestStreak: resident?.gamification?.longestStreak || 0,
      lastActivityDate: new Date()
    },
    metadata: {
      generatedAt: new Date(),
      isPublic: false
    }
  });

  return report;
};

// Pre-save middleware to calculate rates
performanceReportSchema.pre('save', function(next) {
  // Calculate completion rate
  if (this.taskMetrics.totalAssigned > 0) {
    this.taskMetrics.completionRate = 
      (this.taskMetrics.totalCompleted / this.taskMetrics.totalAssigned) * 100;
  }

  // Calculate verification rate
  if (this.taskMetrics.totalCompleted > 0) {
    this.taskMetrics.verificationRate = 
      (this.taskMetrics.totalVerified / this.taskMetrics.totalCompleted) * 100;
  }

  // Calculate average points per task
  if (this.taskMetrics.totalVerified > 0) {
    this.pointsMetrics.averagePerTask = 
      this.pointsMetrics.totalEarned / this.taskMetrics.totalVerified;
  }

  next();
});

const PerformanceReport = mongoose.model('PerformanceReport', performanceReportSchema);

module.exports = PerformanceReport;
