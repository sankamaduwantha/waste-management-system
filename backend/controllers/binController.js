const Bin = require('../models/Bin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Check if qrcode package is available
let QRCode;
try {
  QRCode = require('qrcode');
} catch (error) {
  console.error('⚠️  Warning: qrcode package not installed. Run: npm install qrcode');
}

/**
 * Get all bins with filtering and pagination
 * @route GET /api/v1/bins
 * @access Private (City Manager, Admin)
 */
exports.getAllBins = catchAsync(async (req, res, next) => {
  const {
    type,
    status,
    zone,
    minFillLevel,
    maxFillLevel,
    search,
    page = 1,
    limit = 10,
    sortBy = '-createdAt'
  } = req.query;

  // Build filter
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (zone) filter.zone = zone;
  if (minFillLevel) filter.currentFillLevel = { $gte: parseInt(minFillLevel) };
  if (maxFillLevel) filter.currentFillLevel = { ...filter.currentFillLevel, $lte: parseInt(maxFillLevel) };
  if (search) {
    filter.$or = [
      { binId: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [bins, total] = await Promise.all([
    Bin.find(filter)
      .populate({
        path: 'zone',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'assignedTo',
        select: 'user',
        populate: { path: 'user', select: 'name email' },
        strictPopulate: false
      })
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit)),
    Bin.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: bins,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get bin by ID
 * @route GET /api/v1/bins/:id
 * @access Private
 */
exports.getBin = catchAsync(async (req, res, next) => {
  const bin = await Bin.findById(req.params.id)
    .populate({
      path: 'zone',
      select: 'name',
      strictPopulate: false
    })
    .populate({
      path: 'assignedTo',
      select: 'user',
      populate: { path: 'user', select: 'name email phone' },
      strictPopulate: false
    })
    .populate({
      path: 'maintenanceHistory.performedBy',
      select: 'name',
      strictPopulate: false
    })
    .populate({
      path: 'collectionHistory.collectedBy',
      select: 'vehicleId licensePlate',
      strictPopulate: false
    });

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: bin
  });
});

/**
 * Create new bin with QR code
 * @route POST /api/v1/bins
 * @access Private (City Manager, Admin)
 */
exports.createBin = catchAsync(async (req, res, next) => {
  const {
    binId,
    type,
    capacity,
    location,
    zone,
    assignedTo,
    iotSensor
  } = req.body;

  // Check if QRCode package is available
  if (!QRCode) {
    return next(new AppError('QR code generation not available. Please install qrcode package: npm install qrcode', 500));
  }

  // Generate QR code
  const qrData = {
    binId,
    type,
    zone,
    registeredAt: new Date().toISOString()
  };

  const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  });

  const bin = await Bin.create({
    binId,
    type,
    capacity,
    location,
    zone,
    assignedTo,
    iotSensor,
    qrCode: qrCodeDataURL,
    status: 'active'
  });

  await bin.populate({
    path: 'zone',
    select: 'name',
    strictPopulate: false
  });

  res.status(201).json({
    status: 'success',
    message: 'Bin created successfully with QR code',
    data: bin
  });
});

/**
 * Update bin
 * @route PUT /api/v1/bins/:id
 * @access Private (City Manager, Admin)
 */
exports.updateBin = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };
  delete updateData.qrCode; // Don't allow direct QR code updates

  const bin = await Bin.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate({
    path: 'zone',
    select: 'name',
    strictPopulate: false
  });

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Bin updated successfully',
    data: bin
  });
});

/**
 * Regenerate QR code for bin
 * @route POST /api/v1/bins/:id/regenerate-qr
 * @access Private (City Manager, Admin)
 */
exports.regenerateQRCode = catchAsync(async (req, res, next) => {
  const bin = await Bin.findById(req.params.id);

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  // Check if QRCode package is available
  if (!QRCode) {
    return next(new AppError('QR code generation not available. Please install qrcode package: npm install qrcode', 500));
  }

  const qrData = {
    binId: bin.binId,
    type: bin.type,
    zone: bin.zone,
    regeneratedAt: new Date().toISOString()
  };

  const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300
  });

  bin.qrCode = qrCodeDataURL;
  await bin.save();

  res.status(200).json({
    status: 'success',
    message: 'QR code regenerated successfully',
    data: { qrCode: qrCodeDataURL }
  });
});

/**
 * Decommission bin (soft delete)
 * @route DELETE /api/v1/bins/:id
 * @access Private (City Manager, Admin)
 */
exports.decommissionBin = catchAsync(async (req, res, next) => {
  const bin = await Bin.findByIdAndUpdate(
    req.params.id,
    { status: 'removed', decommissionedAt: new Date() },
    { new: true }
  );

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Bin decommissioned successfully',
    data: bin
  });
});

/**
 * Get bins needing attention (full or damaged)
 * @route GET /api/v1/bins/alerts/attention-needed
 * @access Private (City Manager, Admin)
 */
exports.getBinsNeedingAttention = catchAsync(async (req, res, next) => {
  const bins = await Bin.find({
    $or: [
      { currentFillLevel: { $gte: 80 } },
      { status: { $in: ['full', 'needs-maintenance', 'damaged'] } },
      { 'iotSensor.batteryLevel': { $lt: 20 } }
    ]
  })
    .populate({
      path: 'zone',
      select: 'name',
      strictPopulate: false
    })
    .sort('-currentFillLevel');

  res.status(200).json({
    status: 'success',
    data: bins
  });
});

/**
 * Get bin fill trends
 * @route GET /api/v1/bins/analytics/fill-trends
 * @access Private (City Manager, Admin)
 */
exports.getBinFillTrends = catchAsync(async (req, res, next) => {
  const { period = 'daily', days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await Bin.aggregate([
    {
      $match: {
        status: { $ne: 'removed' }
      }
    },
    {
      $group: {
        _id: '$type',
        avgFillLevel: { $avg: '$currentFillLevel' },
        maxFillLevel: { $max: '$currentFillLevel' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: trends
  });
});

/**
 * Get bin statistics
 * @route GET /api/v1/bins/stats
 * @access Private (City Manager, Admin)
 */
exports.getBinStatistics = catchAsync(async (req, res, next) => {
  const stats = await Bin.aggregate([
    {
      $facet: {
        byType: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              avgFillLevel: { $avg: '$currentFillLevel' }
            }
          }
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        overall: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgFillLevel: { $avg: '$currentFillLevel' },
              needsAttention: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $gte: ['$currentFillLevel', 80] },
                        { $in: ['$status', ['full', 'needs-maintenance', 'damaged']] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats[0]
  });
});

/**
 * Update bin fill level
 * @route PATCH /api/v1/bins/:id/fill-level
 * @access Private
 */
exports.updateFillLevel = catchAsync(async (req, res, next) => {
  const { fillLevel } = req.body;

  if (fillLevel < 0 || fillLevel > 100) {
    return next(new AppError('Fill level must be between 0 and 100', 400));
  }

  const bin = await Bin.findById(req.params.id);

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  bin.currentFillLevel = fillLevel;

  // Auto-update status based on fill level
  if (fillLevel >= 95) {
    bin.status = 'full';
  } else if (fillLevel >= 80) {
    bin.status = 'needs-maintenance';
  } else if (bin.status === 'full' || bin.status === 'needs-maintenance') {
    bin.status = 'active';
  }

  await bin.save();

  res.status(200).json({
    status: 'success',
    message: 'Fill level updated successfully',
    data: bin
  });
});

/**
 * Add maintenance record
 * @route POST /api/v1/bins/:id/maintenance
 * @access Private (City Manager, Admin)
 */
exports.addMaintenanceRecord = catchAsync(async (req, res, next) => {
  const { type, description } = req.body;

  const bin = await Bin.findById(req.params.id);

  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }

  bin.maintenanceHistory.push({
    date: new Date(),
    type,
    description,
    performedBy: req.user._id
  });

  // Update status if fixed
  if (type === 'repair' && bin.status === 'damaged') {
    bin.status = 'active';
  }

  await bin.save();

  res.status(200).json({
    status: 'success',
    message: 'Maintenance record added successfully',
    data: bin
  });
});

/**
 * Get bin statistics overview for dashboard
 * @route GET /api/v1/bins/stats/overview
 * @access Private (City Manager, Admin)
 */
exports.getBinStatsOverview = catchAsync(async (req, res, next) => {
  const [stats] = await Bin.aggregate([
    {
      $facet: {
        total: [
          { $count: 'count' }
        ],
        full: [
          { $match: { currentFillLevel: { $gte: 80 } } },
          { $count: 'count' }
        ],
        needsMaintenance: [
          { $match: { status: { $in: ['needs-maintenance', 'damaged'] } } },
          { $count: 'count' }
        ],
        byType: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      total: stats.total[0]?.count || 0,
      full: stats.full[0]?.count || 0,
      needsMaintenance: stats.needsMaintenance[0]?.count || 0,
      byType: stats.byType || []
    }
  });
});

module.exports = exports;
