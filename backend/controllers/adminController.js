const mongoose = require('mongoose');
const os = require('os');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/User');
const Resident = require('../models/Resident');
const Bin = require('../models/Bin');
const Appointment = require('../models/Appointment');
const WasteEntry = require('../models/WasteEntry');
const Notification = require('../models/Notification');
const Zone = require('../models/Zone');
const Vehicle = require('../models/Vehicle');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin only)
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    activeUsers,
    totalResidents,
    totalBins,
    fullBins,
    totalAppointments,
    pendingAppointments,
    totalZones,
    totalVehicles,
    activeVehicles,
    unreadNotifications,
    totalWasteCollected
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    Resident.countDocuments(),
    Bin.countDocuments(),
    Bin.countDocuments({ currentFillLevel: { $gte: 80 } }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Zone.countDocuments(),
    Vehicle.countDocuments(),
    Vehicle.countDocuments({ status: 'active' }),
    Notification.countDocuments({ read: false }),
    WasteEntry.aggregate([
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ])
  ]);

  // Users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent activities (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = {
    newUsers: await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    newAppointments: await Appointment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    completedAppointments: await Appointment.countDocuments({
      status: 'completed',
      updatedAt: { $gte: sevenDaysAgo }
    })
  };

  // Appointment status distribution
  const appointmentsByStatus = await Appointment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // System health check
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalUsers,
        activeUsers,
        totalResidents,
        totalBins,
        fullBins,
        totalAppointments,
        pendingAppointments,
        totalZones,
        totalVehicles,
        activeVehicles,
        unreadNotifications,
        totalWasteCollected: totalWasteCollected[0]?.total || 0
      },
      usersByRole,
      recentActivity,
      appointmentsByStatus,
      systemHealth: {
        database: dbStatus,
        uptime: Math.floor(process.uptime()) + ' seconds'
      }
    }
  });
});

/**
 * @desc    Get system health status
 * @route   GET /api/v1/admin/health
 * @access  Private (Admin only)
 */
exports.getSystemHealth = catchAsync(async (req, res, next) => {
  // Database status
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  // Database statistics
  const dbStats = await mongoose.connection.db.stats();
  
  // Server metrics
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    database: {
      status: dbStatus,
      collections: dbStats.collections,
      dataSize: (dbStats.dataSize / (1024 * 1024)).toFixed(2) + ' MB',
      storageSize: (dbStats.storageSize / (1024 * 1024)).toFixed(2) + ' MB',
      indexes: dbStats.indexes,
      indexSize: (dbStats.indexSize / (1024 * 1024)).toFixed(2) + ' MB'
    },
    server: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: Math.floor(process.uptime()) + ' seconds',
      memory: {
        total: (totalMemory / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        free: (freeMemory / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        used: (usedMemory / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
        usagePercent: ((usedMemory / totalMemory) * 100).toFixed(2) + '%'
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model
      }
    }
  };

  res.status(200).json({
    status: 'success',
    data: health
  });
});

/**
 * @desc    Get database statistics
 * @route   GET /api/v1/admin/database/stats
 * @access  Private (Admin only)
 */
exports.getDatabaseStats = catchAsync(async (req, res, next) => {
  const stats = await Promise.all([
    User.countDocuments(),
    Resident.countDocuments(),
    Bin.countDocuments(),
    Appointment.countDocuments(),
    WasteEntry.countDocuments(),
    Notification.countDocuments()
  ]);

  const [users, residents, bins, appointments, wasteEntries, notifications] = stats;

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentStats = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Appointment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    WasteEntry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
  ]);

  const [newUsers, newAppointments, newWasteEntries] = recentStats;

  res.status(200).json({
    status: 'success',
    data: {
      total: {
        users,
        residents,
        bins,
        appointments,
        wasteEntries,
        notifications
      },
      recent30Days: {
        newUsers,
        newAppointments,
        newWasteEntries
      }
    }
  });
});

/**
 * @desc    Cleanup old records
 * @route   POST /api/v1/admin/database/cleanup
 * @access  Private (Admin only)
 */
exports.cleanupOldRecords = catchAsync(async (req, res, next) => {
  const { days = 90, collections = [] } = req.body;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const results = {};

  // Clean old notifications
  if (collections.length === 0 || collections.includes('notifications')) {
    const deletedNotifications = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });
    results.notifications = deletedNotifications.deletedCount;
  }

  // Clean old completed appointments
  if (collections.length === 0 || collections.includes('appointments')) {
    const deletedAppointments = await Appointment.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'completed'
    });
    results.appointments = deletedAppointments.deletedCount;
  }

  res.status(200).json({
    status: 'success',
    data: {
      deleted: results,
      cutoffDate
    },
    message: 'Old records cleaned successfully'
  });
});

/**
 * @desc    Get system usage report
 * @route   GET /api/v1/admin/reports/usage
 * @access  Private (Admin only)
 */
exports.getUsageReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const filter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // User activity
  const userActivity = await User.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    }
  ]);

  // Appointment statistics
  const appointmentStats = await Appointment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Waste entry statistics
  const wasteStats = await WasteEntry.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$wasteType',
        totalWeight: { $sum: '$weight' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      period: { startDate, endDate },
      userActivity,
      appointmentStats,
      wasteStats
    }
  });
});

/**
 * @desc    Get error logs (last 100)
 * @route   GET /api/v1/admin/logs/errors
 * @access  Private (Admin only)
 */
exports.getErrorLogs = catchAsync(async (req, res, next) => {
  // This would typically read from a log file or logging service
  // For now, returning a placeholder structure
  const logs = [
    {
      timestamp: new Date(),
      level: 'info',
      message: 'Error logging is not fully implemented yet',
      stack: null
    }
  ];

  res.status(200).json({
    status: 'success',
    data: { logs }
  });
});

/**
 * @desc    Get active user sessions
 * @route   GET /api/v1/admin/monitor/sessions
 * @access  Private (Admin only)
 */
exports.getActiveSessions = catchAsync(async (req, res, next) => {
  // Get users who logged in within last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const activeSessions = await User.aggregate([
    {
      $match: {
        lastLogin: { $gte: oneDayAgo },
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        users: {
          $push: {
            name: '$name',
            email: '$email',
            lastLogin: '$lastLogin'
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      activeSessions,
      period: 'Last 24 hours'
    }
  });
});

/**
 * @desc    Get performance metrics
 * @route   GET /api/v1/admin/monitor/performance
 * @access  Private (Admin only)
 */
exports.getPerformanceMetrics = catchAsync(async (req, res, next) => {
  // Database query performance
  const startTime = Date.now();
  await User.findOne().limit(1);
  const queryTime = Date.now() - startTime;

  // Memory usage
  const memUsage = process.memoryUsage();

  const metrics = {
    database: {
      queryTime: queryTime + 'ms',
      connectionPool: mongoose.connection.db.serverConfig.s.poolSize || 'N/A'
    },
    memory: {
      rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
    },
    process: {
      pid: process.pid,
      uptime: Math.floor(process.uptime()) + ' seconds',
      nodeVersion: process.version
    }
  };

  res.status(200).json({
    status: 'success',
    data: metrics
  });
});

/**
 * @desc    Get audit trail (recent user activities)
 * @route   GET /api/v1/admin/audit
 * @access  Private (Admin only)
 */
exports.getAuditTrail = catchAsync(async (req, res, next) => {
  const { limit = 50, userId, action } = req.query;

  // Get recent system changes
  const recentUsers = await User.find()
    .select('name email role status updatedAt')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

  const recentAppointments = await Appointment.find()
    .select('resident status appointmentDate updatedAt')
    .populate('resident', 'user')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      recentUsers,
      recentAppointments
    }
  });
});

/**
 * @desc    Export database backup info
 * @route   GET /api/v1/admin/database/backup-info
 * @access  Private (Admin only)
 */
exports.getBackupInfo = catchAsync(async (req, res, next) => {
  const dbStats = await mongoose.connection.db.stats();
  
  const info = {
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    collections: dbStats.collections,
    totalSize: (dbStats.dataSize / (1024 * 1024)).toFixed(2) + ' MB',
    backupCommand: `mongodump --db=${mongoose.connection.name} --out=./backups/${new Date().toISOString().split('T')[0]}`,
    restoreCommand: `mongorestore --db=${mongoose.connection.name} ./backups/[backup-folder]/${mongoose.connection.name}`
  };

  res.status(200).json({
    status: 'success',
    data: info,
    message: 'Use the provided commands in your terminal to backup/restore the database'
  });
});

module.exports = exports;
