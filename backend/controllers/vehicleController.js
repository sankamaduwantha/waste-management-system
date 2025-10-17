const Vehicle = require('../models/Vehicle');
const Zone = require('../models/Zone');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all vehicles
// @route   GET /api/v1/vehicles
// @access  Private (City Manager, Admin)
exports.getAllVehicles = catchAsync(async (req, res, next) => {
  const { status, type, zone, search, sortBy = '-createdAt' } = req.query;

  // Build query
  const query = {};
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (zone) query.assignedZone = zone;
  if (search) {
    query.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const vehicles = await Vehicle.find(query)
    .populate({ path: 'assignedZone', select: 'name code city district', strictPopulate: false })
    .populate({ path: 'assignedDriver', select: 'name email phone', strictPopulate: false })
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await Vehicle.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: vehicles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get vehicle statistics
// @route   GET /api/v1/vehicles/stats/overview
// @access  Private (City Manager, Admin)
exports.getVehicleStats = catchAsync(async (req, res, next) => {
  const totalVehicles = await Vehicle.countDocuments();
  
  const statusStats = await Vehicle.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeStats = await Vehicle.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCapacity: { $sum: '$capacity' }
      }
    }
  ]);

  const maintenanceDue = await Vehicle.countDocuments({
    'maintenance.nextServiceDate': { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  });

  const stats = {
    available: 0,
    'on-route': 0,
    maintenance: 0,
    'out-of-service': 0
  };

  statusStats.forEach(item => {
    stats[item._id] = item.count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalVehicles,
      statusBreakdown: stats,
      typeBreakdown: typeStats,
      maintenanceDue,
      utilizationRate: totalVehicles > 0 ? ((stats['on-route'] / totalVehicles) * 100).toFixed(1) : 0
    }
  });
});

// @desc    Get single vehicle
// @route   GET /api/v1/vehicles/:id
// @access  Private
exports.getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate({ path: 'assignedZone', select: 'name code city district area population', strictPopulate: false })
    .populate({ path: 'assignedDriver', select: 'name email phone', strictPopulate: false });

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: vehicle
  });
});

// @desc    Create vehicle
// @route   POST /api/v1/vehicles
// @access  Private (City Manager, Admin)
exports.createVehicle = catchAsync(async (req, res, next) => {
  // Check if vehicle number already exists
  const existingVehicle = await Vehicle.findOne({ 
    vehicleNumber: req.body.vehicleNumber?.toUpperCase() 
  });

  if (existingVehicle) {
    return next(new AppError('Vehicle with this number already exists', 400));
  }

  // Validate assigned driver if provided
  if (req.body.assignedDriver) {
    const driver = await User.findById(req.body.assignedDriver);
    if (!driver) {
      return next(new AppError('Assigned driver not found', 404));
    }
  }

  // Validate assigned zone if provided
  if (req.body.assignedZone) {
    const zone = await Zone.findById(req.body.assignedZone);
    if (!zone) {
      return next(new AppError('Assigned zone not found', 404));
    }
  }

  const vehicle = await Vehicle.create(req.body);

  // Populate references
  await vehicle.populate([
    { path: 'assignedZone', select: 'name code', strictPopulate: false },
    { path: 'assignedDriver', select: 'name email', strictPopulate: false }
  ]);

  res.status(201).json({
    status: 'success',
    data: vehicle
  });
});

// @desc    Update vehicle
// @route   PUT /api/v1/vehicles/:id
// @access  Private (City Manager, Admin)
exports.updateVehicle = catchAsync(async (req, res, next) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Check if updating vehicle number and it already exists
  if (req.body.vehicleNumber && req.body.vehicleNumber !== vehicle.vehicleNumber) {
    const existingVehicle = await Vehicle.findOne({ 
      vehicleNumber: req.body.vehicleNumber.toUpperCase(),
      _id: { $ne: req.params.id }
    });

    if (existingVehicle) {
      return next(new AppError('Vehicle with this number already exists', 400));
    }
  }

  // Validate assigned driver if provided
  if (req.body.assignedDriver) {
    const driver = await User.findById(req.body.assignedDriver);
    if (!driver) {
      return next(new AppError('Assigned driver not found', 404));
    }
  }

  // Validate assigned zone if provided
  if (req.body.assignedZone) {
    const zone = await Zone.findById(req.body.assignedZone);
    if (!zone) {
      return next(new AppError('Assigned zone not found', 404));
    }
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate([
    { path: 'assignedZone', select: 'name code', strictPopulate: false },
    { path: 'assignedDriver', select: 'name email', strictPopulate: false }
  ]);

  res.status(200).json({
    status: 'success',
    data: vehicle
  });
});

// @desc    Delete vehicle (soft delete - set to out-of-service)
// @route   DELETE /api/v1/vehicles/:id
// @access  Private (Admin only)
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  // Soft delete by setting status to out-of-service
  vehicle.status = 'out-of-service';
  await vehicle.save();

  res.status(200).json({
    status: 'success',
    message: 'Vehicle marked as out of service',
    data: vehicle
  });
});

// @desc    Update vehicle location
// @route   PATCH /api/v1/vehicles/:id/location
// @access  Private (Driver, City Manager, Admin)
exports.updateLocation = catchAsync(async (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: new Date()
      }
    },
    { new: true }
  );

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: vehicle
  });
});

// @desc    Add maintenance record
// @route   POST /api/v1/vehicles/:id/maintenance
// @access  Private (City Manager, Admin)
exports.addMaintenanceRecord = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new AppError('Vehicle not found', 404));
  }

  const maintenanceRecord = {
    date: req.body.date || new Date(),
    type: req.body.type,
    description: req.body.description,
    cost: req.body.cost,
    odometer: req.body.odometer
  };

  vehicle.maintenance.maintenanceHistory.push(maintenanceRecord);
  vehicle.maintenance.lastServiceDate = maintenanceRecord.date;
  vehicle.maintenance.lastServiceOdometer = maintenanceRecord.odometer;

  // Update next service date (30 days from last service)
  const nextServiceDate = new Date(maintenanceRecord.date);
  nextServiceDate.setDate(nextServiceDate.getDate() + 30);
  vehicle.maintenance.nextServiceDate = nextServiceDate;

  await vehicle.save();

  res.status(200).json({
    status: 'success',
    data: vehicle
  });
});

// @desc    Get vehicles needing maintenance
// @route   GET /api/v1/vehicles/alerts/maintenance-due
// @access  Private (City Manager, Admin)
exports.getMaintenanceDue = catchAsync(async (req, res, next) => {
  const vehicles = await Vehicle.find({
    'maintenance.nextServiceDate': { 
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    }
  })
    .populate({ path: 'assignedZone', select: 'name code', strictPopulate: false })
    .populate({ path: 'assignedDriver', select: 'name email phone', strictPopulate: false })
    .sort('maintenance.nextServiceDate');

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: vehicles
  });
});

// @desc    Get available vehicles for assignment
// @route   GET /api/v1/vehicles/available
// @access  Private
exports.getAvailableVehicles = catchAsync(async (req, res, next) => {
  const { zone, type } = req.query;

  const query = { status: 'available' };
  if (zone) query.assignedZone = zone;
  if (type) query.type = type;

  const vehicles = await Vehicle.find(query)
    .select('vehicleNumber type capacity assignedZone')
    .populate({ path: 'assignedZone', select: 'name code', strictPopulate: false })
    .sort('vehicleNumber');

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: vehicles
  });
});
