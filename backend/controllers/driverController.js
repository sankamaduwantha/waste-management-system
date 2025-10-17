const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all drivers with filters and pagination
exports.getAllDrivers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    zone = '',
    shift = '',
    licenseType = ''
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (status) filter.status = status;
  if (zone) filter.assignedZone = zone;
  if (shift) filter.shift = shift;
  if (licenseType) filter.licenseType = licenseType;

  // Build search query for user fields
  let userIds = [];
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    userIds = users.map(u => u._id);
    
    filter.$or = [
      { user: { $in: userIds } },
      { employeeId: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const drivers = await Driver.find(filter)
    .populate('user', 'name email phone profileImage')
    .populate('assignedZone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Driver.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: drivers,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get driver statistics
exports.getDriverStats = catchAsync(async (req, res, next) => {
  const totalDrivers = await Driver.countDocuments();
  
  const statusStats = await Driver.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const shiftStats = await Driver.aggregate([
    {
      $group: {
        _id: '$shift',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get drivers with expiring licenses (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringLicenses = await Driver.countDocuments({
    licenseExpiry: {
      $gte: new Date(),
      $lte: thirtyDaysFromNow
    }
  });

  // Get expired licenses
  const expiredLicenses = await Driver.countDocuments({
    licenseExpiry: { $lt: new Date() }
  });

  // Calculate average rating
  const ratingStats = await Driver.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$performance.rating' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalDrivers,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byShift: shiftStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      expiringLicenses,
      expiredLicenses,
      averageRating: ratingStats[0]?.avgRating || 0
    }
  });
});

// Get single driver
exports.getDriver = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
    .populate('user', 'name email phone address profileImage')
    .populate('assignedZone', 'name code boundaries')
    .populate('assignedVehicle', 'vehicleNumber type make model');

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  res.status(200).json({
    success: true,
    data: driver
  });
});

// Create new driver
exports.createDriver = catchAsync(async (req, res, next) => {
  const {
    // User details
    name,
    email,
    password,
    phone,
    address,
    
    // Driver details
    employeeId,
    licenseNumber,
    licenseType,
    licenseExpiry,
    dateOfBirth,
    joiningDate,
    assignedZone,
    assignedVehicle,
    shift,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactPhone,
    bloodGroup,
    salary
  } = req.body;

  // Check if driver with same employee ID exists
  const existingDriver = await Driver.findOne({ employeeId });
  if (existingDriver) {
    return next(new AppError('Driver with this employee ID already exists', 400));
  }

  // Check if license number already exists
  const existingLicense = await Driver.findOne({ licenseNumber });
  if (existingLicense) {
    return next(new AppError('Driver with this license number already exists', 400));
  }

  // Create user account first
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: 'garbage_collector', // This role should be added to User model enum
    zone: assignedZone,
    status: 'active'
  });

  // Create driver profile
  const driver = await Driver.create({
    user: user._id,
    employeeId,
    licenseNumber,
    licenseType,
    licenseExpiry,
    dateOfBirth,
    joiningDate: joiningDate || Date.now(),
    assignedZone,
    assignedVehicle,
    shift,
    contactDetails: {
      emergencyContact: {
        name: emergencyContactName,
        relationship: emergencyContactRelationship,
        phone: emergencyContactPhone
      },
      bloodGroup
    },
    salary
  });

  // If vehicle is assigned, update the vehicle
  if (assignedVehicle) {
    await Vehicle.findByIdAndUpdate(assignedVehicle, {
      assignedDriver: driver._id
    });
  }

  const populatedDriver = await Driver.findById(driver._id)
    .populate('user', 'name email phone')
    .populate('assignedZone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type');

  res.status(201).json({
    success: true,
    data: populatedDriver
  });
});

// Update driver
exports.updateDriver = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);
  
  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  const {
    // User updates
    name,
    phone,
    address,
    
    // Driver updates
    employeeId,
    licenseNumber,
    licenseType,
    licenseExpiry,
    dateOfBirth,
    assignedZone,
    assignedVehicle,
    status,
    shift,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactPhone,
    bloodGroup,
    salary,
    notes
  } = req.body;

  // Check for duplicate employee ID (if changing)
  if (employeeId && employeeId !== driver.employeeId) {
    const existing = await Driver.findOne({ employeeId });
    if (existing) {
      return next(new AppError('Driver with this employee ID already exists', 400));
    }
  }

  // Check for duplicate license number (if changing)
  if (licenseNumber && licenseNumber !== driver.licenseNumber) {
    const existing = await Driver.findOne({ licenseNumber });
    if (existing) {
      return next(new AppError('Driver with this license number already exists', 400));
    }
  }

  // Update user info
  if (name || phone || address) {
    await User.findByIdAndUpdate(driver.user, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(assignedZone && { zone: assignedZone })
    });
  }

  // Handle vehicle assignment changes
  if (assignedVehicle !== undefined) {
    // Remove driver from old vehicle
    if (driver.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(driver.assignedVehicle, {
        assignedDriver: null
      });
    }
    
    // Assign driver to new vehicle
    if (assignedVehicle) {
      await Vehicle.findByIdAndUpdate(assignedVehicle, {
        assignedDriver: driver._id
      });
    }
  }

  // Update driver info
  const updateData = {
    ...(employeeId && { employeeId }),
    ...(licenseNumber && { licenseNumber }),
    ...(licenseType && { licenseType }),
    ...(licenseExpiry && { licenseExpiry }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(assignedZone && { assignedZone }),
    ...(assignedVehicle !== undefined && { assignedVehicle }),
    ...(status && { status }),
    ...(shift && { shift }),
    ...(notes !== undefined && { notes })
  };

  if (emergencyContactName || emergencyContactRelationship || emergencyContactPhone || bloodGroup) {
    updateData.contactDetails = {
      emergencyContact: {
        name: emergencyContactName || driver.contactDetails?.emergencyContact?.name,
        relationship: emergencyContactRelationship || driver.contactDetails?.emergencyContact?.relationship,
        phone: emergencyContactPhone || driver.contactDetails?.emergencyContact?.phone
      },
      bloodGroup: bloodGroup || driver.contactDetails?.bloodGroup
    };
  }

  if (salary) {
    updateData.salary = salary;
  }

  const updatedDriver = await Driver.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'name email phone')
    .populate('assignedZone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type');

  res.status(200).json({
    success: true,
    data: updatedDriver
  });
});

// Delete driver (soft delete)
exports.deleteDriver = catchAsync(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);
  
  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  // Remove driver from assigned vehicle
  if (driver.assignedVehicle) {
    await Vehicle.findByIdAndUpdate(driver.assignedVehicle, {
      assignedDriver: null
    });
  }

  // Update driver status
  await Driver.findByIdAndUpdate(req.params.id, {
    status: 'terminated',
    assignedVehicle: null
  });

  // Update user status
  await User.findByIdAndUpdate(driver.user, {
    status: 'inactive'
  });

  res.status(200).json({
    success: true,
    data: null,
    message: 'Driver terminated successfully'
  });
});

// Get available drivers (not assigned to any vehicle)
exports.getAvailableDrivers = catchAsync(async (req, res, next) => {
  const drivers = await Driver.find({
    status: 'active',
    assignedVehicle: null
  })
    .populate('user', 'name email phone')
    .populate('assignedZone', 'name code')
    .select('employeeId licenseNumber licenseType user assignedZone shift');

  res.status(200).json({
    success: true,
    data: drivers
  });
});

// Get drivers with expiring licenses
exports.getLicenseAlerts = catchAsync(async (req, res, next) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringLicenses = await Driver.find({
    licenseExpiry: {
      $gte: new Date(),
      $lte: thirtyDaysFromNow
    },
    status: 'active'
  })
    .populate('user', 'name email phone')
    .select('employeeId licenseNumber licenseExpiry user')
    .sort({ licenseExpiry: 1 });

  const expiredLicenses = await Driver.find({
    licenseExpiry: { $lt: new Date() },
    status: 'active'
  })
    .populate('user', 'name email phone')
    .select('employeeId licenseNumber licenseExpiry user')
    .sort({ licenseExpiry: 1 });

  res.status(200).json({
    success: true,
    data: {
      expiring: expiringLicenses,
      expired: expiredLicenses
    }
  });
});

// Update driver performance
exports.updatePerformance = catchAsync(async (req, res, next) => {
  const { rating, complaint, award } = req.body;

  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  const updateData = {};

  if (rating !== undefined) {
    updateData['performance.rating'] = rating;
  }

  if (complaint) {
    updateData.$inc = { 'performance.totalComplaints': 1 };
  }

  if (award) {
    updateData.$push = {
      'performance.awards': {
        title: award.title,
        date: award.date || Date.now(),
        description: award.description
      }
    };
  }

  const updatedDriver = await Driver.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate('user', 'name email');

  res.status(200).json({
    success: true,
    data: updatedDriver
  });
});
