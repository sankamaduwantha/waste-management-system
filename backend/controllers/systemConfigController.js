const SystemConfig = require('../models/SystemConfig');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all system configurations
 * @route   GET /api/v1/system-config
 * @access  Private (Admin only)
 */
exports.getAllConfigs = catchAsync(async (req, res, next) => {
  const { category } = req.query;

  const query = category ? { category } : {};
  const configs = await SystemConfig.find(query)
    .populate('lastModifiedBy', 'name email')
    .sort({ category: 1, key: 1 });

  res.status(200).json({
    status: 'success',
    data: { configs }
  });
});

/**
 * @desc    Get single configuration
 * @route   GET /api/v1/system-config/:category/:key
 * @access  Private (Admin only)
 */
exports.getConfig = catchAsync(async (req, res, next) => {
  const { category, key } = req.params;

  const config = await SystemConfig.findOne({ category, key });
  if (!config) {
    return next(new AppError('Configuration not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { config }
  });
});

/**
 * @desc    Create or update configuration
 * @route   PUT /api/v1/system-config/:category/:key
 * @access  Private (Admin only)
 */
exports.updateConfig = catchAsync(async (req, res, next) => {
  const { category, key } = req.params;
  const { value, description, dataType, metadata } = req.body;

  // Check if config exists and is editable
  const existing = await SystemConfig.findOne({ category, key });
  if (existing && !existing.isEditable) {
    return next(new AppError('This configuration is not editable', 403));
  }

  const config = await SystemConfig.findOneAndUpdate(
    { category, key },
    {
      value,
      description,
      dataType: dataType || 'string',
      metadata,
      lastModifiedBy: req.user._id
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: { config },
    message: 'Configuration updated successfully'
  });
});

/**
 * @desc    Delete configuration
 * @route   DELETE /api/v1/system-config/:category/:key
 * @access  Private (Admin only)
 */
exports.deleteConfig = catchAsync(async (req, res, next) => {
  const { category, key } = req.params;

  const config = await SystemConfig.findOne({ category, key });
  if (!config) {
    return next(new AppError('Configuration not found', 404));
  }

  if (!config.isEditable) {
    return next(new AppError('This configuration cannot be deleted', 403));
  }

  await config.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Configuration deleted successfully'
  });
});

/**
 * @desc    Initialize default configurations
 * @route   POST /api/v1/system-config/initialize
 * @access  Private (Admin only)
 */
exports.initializeDefaults = catchAsync(async (req, res, next) => {
  const defaultConfigs = [
    // Notification Templates
    {
      category: 'notifications',
      key: 'collection_reminder_template',
      value: 'Hi {{name}}, your {{wasteType}} collection is scheduled for {{date}}. Please place bins outside by 7 AM.',
      description: 'Template for collection reminder notifications',
      dataType: 'string',
      isEditable: true
    },
    {
      category: 'notifications',
      key: 'payment_reminder_template',
      value: 'Payment of ${{amount}} is due on {{dueDate}}. Please pay to avoid late fees.',
      description: 'Template for payment reminder notifications',
      dataType: 'string',
      isEditable: true
    },
    {
      category: 'notifications',
      key: 'reminder_time',
      value: '18:00',
      description: 'Time to send daily collection reminders (24-hour format)',
      dataType: 'string',
      isEditable: true,
      metadata: { unit: 'time' }
    },

    // Waste Level Thresholds
    {
      category: 'waste_thresholds',
      key: 'bin_full_threshold',
      value: 80,
      description: 'Bin fill level percentage to trigger full status',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'percentage', min: 50, max: 100 }
    },
    {
      category: 'waste_thresholds',
      key: 'bin_alert_threshold',
      value: 70,
      description: 'Bin fill level percentage to send alerts',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'percentage', min: 50, max: 100 }
    },
    {
      category: 'waste_thresholds',
      key: 'collection_frequency_days',
      value: 7,
      description: 'Default collection frequency in days',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'days', min: 1, max: 30 }
    },

    // Reward System
    {
      category: 'rewards',
      key: 'points_per_kg_recycled',
      value: 10,
      description: 'Reward points awarded per kg of waste recycled',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'points', min: 1, max: 100 }
    },
    {
      category: 'rewards',
      key: 'bonus_streak_days',
      value: 30,
      description: 'Days of consistent recycling to earn bonus points',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'days', min: 7, max: 365 }
    },
    {
      category: 'rewards',
      key: 'bonus_points_amount',
      value: 100,
      description: 'Bonus points awarded for streak achievement',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'points', min: 10, max: 1000 }
    },

    // API Configuration
    {
      category: 'api',
      key: 'rate_limit_requests',
      value: 100,
      description: 'Maximum API requests per window',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'requests', min: 10, max: 1000 }
    },
    {
      category: 'api',
      key: 'rate_limit_window',
      value: 15,
      description: 'Rate limit window in minutes',
      dataType: 'number',
      isEditable: true,
      metadata: { unit: 'minutes', min: 1, max: 60 }
    },

    // General Settings
    {
      category: 'general',
      key: 'system_name',
      value: 'Urban Waste Management System',
      description: 'System display name',
      dataType: 'string',
      isEditable: true
    },
    {
      category: 'general',
      key: 'support_email',
      value: 'support@wastemanagement.com',
      description: 'Support contact email',
      dataType: 'string',
      isEditable: true
    },
    {
      category: 'general',
      key: 'maintenance_mode',
      value: false,
      description: 'Enable maintenance mode',
      dataType: 'boolean',
      isEditable: true
    }
  ];

  const results = [];
  for (const config of defaultConfigs) {
    const existing = await SystemConfig.findOne({
      category: config.category,
      key: config.key
    });

    if (!existing) {
      const created = await SystemConfig.create({
        ...config,
        lastModifiedBy: req.user._id
      });
      results.push(created);
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      initialized: results.length,
      configs: results
    },
    message: `Initialized ${results.length} default configurations`
  });
});

/**
 * @desc    Get configurations by category
 * @route   GET /api/v1/system-config/category/:category
 * @access  Private (Admin only)
 */
exports.getConfigsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  const configs = await SystemConfig.find({ category })
    .populate('lastModifiedBy', 'name email')
    .sort({ key: 1 });

  res.status(200).json({
    status: 'success',
    data: { configs }
  });
});

/**
 * @desc    Bulk update configurations
 * @route   PUT /api/v1/system-config/bulk-update
 * @access  Private (Admin only)
 */
exports.bulkUpdate = catchAsync(async (req, res, next) => {
  const { configs } = req.body; // Array of { category, key, value }

  if (!Array.isArray(configs) || configs.length === 0) {
    return next(new AppError('Please provide an array of configurations', 400));
  }

  const results = [];
  for (const { category, key, value } of configs) {
    const config = await SystemConfig.findOneAndUpdate(
      { category, key },
      { value, lastModifiedBy: req.user._id },
      { new: true }
    );
    if (config) results.push(config);
  }

  res.status(200).json({
    status: 'success',
    data: {
      updated: results.length,
      configs: results
    },
    message: `Updated ${results.length} configurations`
  });
});

module.exports = exports;
