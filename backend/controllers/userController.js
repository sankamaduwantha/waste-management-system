const User = require('../models/User');
const Resident = require('../models/Resident');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all users with filters and pagination
 * @route   GET /api/v1/users
 * @access  Private (Admin, City Manager)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const {
    role,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);

  // Get users
  const users = await User.find(query)
    .select('-password')
    .populate('zone', 'name')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin, City Manager)
 */
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('zone', 'name code');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // If resident, get resident profile
  let residentProfile = null;
  if (user.role === 'resident') {
    residentProfile = await Resident.findOne({ user: user._id })
      .populate('binAssigned')
      .populate('collectionSchedule');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
      residentProfile
    }
  });
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Private (Admin only)
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, address, zone, status } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'resident',
    phone,
    address,
    zone,
    status: status || 'active'
  });

  // If resident, create resident profile
  if (user.role === 'resident') {
    await Resident.create({
      user: user._id
    });
  }

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    data: { user },
    message: 'User created successfully'
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin, City Manager)
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, zone, status, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (address) user.address = address;
  if (zone !== undefined) user.zone = zone;
  if (status) user.status = status;
  if (role && req.user.role === 'admin') user.role = role; // Only admin can change roles

  await user.save();

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'User updated successfully'
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  // If resident, delete resident profile
  if (user.role === 'resident') {
    await Resident.findOneAndDelete({ user: user._id });
  }

  await user.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

/**
 * @desc    Activate user
 * @route   PATCH /api/v1/users/:id/activate
 * @access  Private (Admin only)
 */
exports.activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'User activated successfully'
  });
});

/**
 * @desc    Deactivate user
 * @route   PATCH /api/v1/users/:id/deactivate
 * @access  Private (Admin only)
 */
exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot deactivate your own account', 400));
  }

  user.status = 'inactive';
  await user.save();

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'User deactivated successfully'
  });
});

/**
 * @desc    Reset user password
 * @route   PATCH /api/v1/users/:id/reset-password
 * @access  Private (Admin only)
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully'
  });
});

/**
 * @desc    Assign role to user
 * @route   PATCH /api/v1/users/:id/assign-role
 * @access  Private (Admin only)
 */
exports.assignRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  const validRoles = ['resident', 'city_manager', 'admin', 'sustainability_manager', 'garbage_collector'];
  if (!validRoles.includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
    message: 'Role assigned successfully'
  });
});

/**
 * @desc    Assign zone to user/resident
 * @route   PATCH /api/v1/users/:id/assign-zone
 * @access  Private (Admin, City Manager)
 */
exports.assignZone = catchAsync(async (req, res, next) => {
  const { zoneId } = req.body;

  if (!zoneId) {
    return next(new AppError('Zone ID is required', 400));
  }

  // Verify zone exists
  const Zone = require('../models/Zone');
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  // Update user with zone
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { zone: zoneId },
    { new: true, runValidators: true }
  )
    .select('-password')
    .populate('zone', 'name code');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // If user is a resident, also update the Resident model
  if (user.role === 'resident') {
    await Resident.findOneAndUpdate(
      { user: user._id },
      { zone: zoneId },
      { new: true }
    );
  }

  res.status(200).json({
    status: 'success',
    data: { 
      user,
      zone: {
        id: zone._id,
        name: zone.name,
        code: zone.code
      }
    },
    message: `Zone "${zone.name}" assigned successfully`
  });
});

/**
 * @desc    Get user activity log
 * @route   GET /api/v1/users/:id/activity
 * @access  Private (Admin only)
 */
exports.getUserActivity = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get recent activity (this could be expanded with an Activity model)
  const activity = {
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    status: user.status
  };

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

/**
 * @desc    Bulk assign zones to multiple users
 * @route   POST /api/v1/users/bulk/assign-zones
 * @access  Private (Admin, City Manager)
 */
exports.bulkAssignZones = catchAsync(async (req, res, next) => {
  const { assignments } = req.body;

  // Validate input
  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    return next(new AppError('Assignments array is required', 400));
  }

  // Validate each assignment has userId and zoneId
  for (const assignment of assignments) {
    if (!assignment.userId || !assignment.zoneId) {
      return next(new AppError('Each assignment must have userId and zoneId', 400));
    }
  }

  const Zone = require('../models/Zone');
  const results = {
    successful: [],
    failed: []
  };

  // Process each assignment
  for (const assignment of assignments) {
    try {
      const { userId, zoneId } = assignment;

      // Verify zone exists
      const zone = await Zone.findById(zoneId);
      if (!zone) {
        results.failed.push({
          userId,
          zoneId,
          reason: 'Zone not found'
        });
        continue;
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        { zone: zoneId },
        { new: true, runValidators: true }
      )
        .select('name email role zone')
        .populate('zone', 'name code');

      if (!user) {
        results.failed.push({
          userId,
          zoneId,
          reason: 'User not found'
        });
        continue;
      }

      // If user is a resident, also update Resident model
      if (user.role === 'resident') {
        await Resident.findOneAndUpdate(
          { user: user._id },
          { zone: zoneId }
        );
      }

      results.successful.push({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        zoneId: zone._id,
        zoneName: zone.name
      });

    } catch (error) {
      results.failed.push({
        userId: assignment.userId,
        zoneId: assignment.zoneId,
        reason: error.message
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      successful: results.successful,
      failed: results.failed,
      summary: {
        total: assignments.length,
        successful: results.successful.length,
        failed: results.failed.length
      }
    },
    message: `${results.successful.length} zone(s) assigned successfully, ${results.failed.length} failed`
  });
});

/**
 * @desc    Get user statistics (for dashboard)
 * @route   GET /api/v1/users/stats/overview
 * @access  Private (Admin only)
 */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $facet: {
        total: [
          { $count: 'count' }
        ],
        byRole: [
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
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
        recentUsers: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              email: 1,
              role: 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      total: stats[0].total[0]?.count || 0,
      byRole: stats[0].byRole,
      byStatus: stats[0].byStatus,
      recentUsers: stats[0].recentUsers
    }
  });
});

module.exports = exports;
