const Zone = require('../models/Zone');
const Bin = require('../models/Bin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get all zones
 * @route GET /api/v1/zones
 * @access Private (City Manager, Admin)
 */
exports.getAllZones = catchAsync(async (req, res, next) => {
  const {
    status,
    city,
    district,
    search,
    page = 1,
    limit = 50,
    sortBy = 'name'
  } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (district) filter.district = { $regex: district, $options: 'i' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [zones, total] = await Promise.all([
    Zone.find(filter)
      .populate('assignedManager', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit)),
    Zone.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    data: zones,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get single zone
 * @route GET /api/v1/zones/:id
 * @access Private
 */
exports.getZone = catchAsync(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id)
    .populate('assignedManager', 'name email phone')
    .populate('assignedVehicles', 'vehicleId licensePlate type');

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  // Get bin count for this zone
  const binCount = await Bin.countDocuments({ zone: zone._id });
  
  res.status(200).json({
    status: 'success',
    data: {
      ...zone.toObject(),
      binCount
    }
  });
});

/**
 * Create new zone
 * @route POST /api/v1/zones
 * @access Private (Admin only)
 */
exports.createZone = catchAsync(async (req, res, next) => {
  const {
    name,
    code,
    district,
    city,
    state,
    area,
    population,
    coordinates,
    assignedManager,
    pricing,
    stats
  } = req.body;

  // Check if zone code already exists
  const existingZone = await Zone.findOne({ code: code.toUpperCase() });
  if (existingZone) {
    return next(new AppError('Zone with this code already exists', 400));
  }

  const zone = await Zone.create({
    name,
    code: code.toUpperCase(),
    district,
    city,
    state,
    area,
    population,
    coordinates,
    assignedManager,
    pricing,
    stats,
    status: 'active'
  });

  await zone.populate('assignedManager', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Zone created successfully',
    data: zone
  });
});

/**
 * Update zone
 * @route PUT /api/v1/zones/:id
 * @access Private (Admin, City Manager)
 */
exports.updateZone = catchAsync(async (req, res, next) => {
  const zone = await Zone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('assignedManager', 'name email');

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Zone updated successfully',
    data: zone
  });
});

/**
 * Delete zone
 * @route DELETE /api/v1/zones/:id
 * @access Private (Admin only)
 */
exports.deleteZone = catchAsync(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  // Check if zone has bins
  const binCount = await Bin.countDocuments({ zone: zone._id });
  if (binCount > 0) {
    return next(new AppError(`Cannot delete zone with ${binCount} active bins. Please reassign or remove bins first.`, 400));
  }

  // Soft delete - mark as inactive instead of removing
  zone.status = 'inactive';
  await zone.save();

  res.status(200).json({
    status: 'success',
    message: 'Zone deactivated successfully',
    data: zone
  });
});

/**
 * Get zone statistics
 * @route GET /api/v1/zones/:id/statistics
 * @access Private
 */
exports.getZoneStatistics = catchAsync(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  // Get bin statistics
  const binStats = await Bin.aggregate([
    { $match: { zone: zone._id } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgFillLevel: { $avg: '$currentFillLevel' },
        fullBins: {
          $sum: { $cond: [{ $gte: ['$currentFillLevel', 90] }, 1, 0] }
        }
      }
    }
  ]);

  const totalBins = await Bin.countDocuments({ zone: zone._id });
  const fullBins = await Bin.countDocuments({ 
    zone: zone._id, 
    currentFillLevel: { $gte: 90 } 
  });
  const damagedBins = await Bin.countDocuments({ 
    zone: zone._id, 
    status: 'damaged' 
  });

  res.status(200).json({
    status: 'success',
    data: {
      zone: {
        id: zone._id,
        name: zone.name,
        code: zone.code
      },
      bins: {
        total: totalBins,
        full: fullBins,
        damaged: damagedBins,
        byType: binStats
      },
      area: zone.area,
      population: zone.population,
      density: zone.area > 0 ? (zone.population / zone.area).toFixed(2) : 0
    }
  });
});

/**
 * Get zones summary for dropdown
 * @route GET /api/v1/zones/list/active
 * @access Private
 */
exports.getActiveZones = catchAsync(async (req, res, next) => {
  const zones = await Zone.find({ status: 'active' })
    .select('_id name code city district')
    .sort('name');

  res.status(200).json({
    status: 'success',
    data: zones
  });
});

/**
 * Bulk create zones (for seeding)
 * @route POST /api/v1/zones/bulk
 * @access Private (Admin only)
 */
exports.bulkCreateZones = catchAsync(async (req, res, next) => {
  const { zones } = req.body;

  if (!Array.isArray(zones) || zones.length === 0) {
    return next(new AppError('Please provide an array of zones', 400));
  }

  // Validate and create zones
  const createdZones = [];
  const errors = [];

  for (const zoneData of zones) {
    try {
      const zone = await Zone.create({
        ...zoneData,
        code: zoneData.code.toUpperCase(),
        status: 'active'
      });
      createdZones.push(zone);
    } catch (error) {
      errors.push({
        zone: zoneData.name,
        error: error.message
      });
    }
  }

  res.status(201).json({
    status: 'success',
    message: `Created ${createdZones.length} zones successfully`,
    data: createdZones,
    errors: errors.length > 0 ? errors : undefined
  });
});

module.exports = exports;
