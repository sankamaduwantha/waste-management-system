const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Zone = require('../models/Zone');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generate unique request number
const generateRequestNumber = async () => {
  const prefix = 'SR';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Get count of requests this month
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const count = await ServiceRequest.countDocuments({
    createdAt: { $gte: startOfMonth }
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `${prefix}${year}${month}${sequence}`;
};

// Get all service requests with filters and pagination
exports.getAllRequests = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    priority = '',
    type = '',
    zone = '',
    assignedTo = ''
  } = req.query;

  // Build filter object
  const filter = {};
  
  // If user is a resident, only show their own requests
  if (req.user.role === 'resident') {
    filter.resident = req.user._id;
  }
  
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (type) filter.type = type;
  if (zone) filter.zone = zone;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Search in request number, title, description
  if (search) {
    filter.$or = [
      { requestNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const requests = await ServiceRequest.find(filter)
    .populate('resident', 'name email phone')
    .populate('zone', 'name code')
    .populate('assignedTo', 'name email')
    .populate('assignedTeam', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await ServiceRequest.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: requests,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get request statistics
exports.getRequestStats = catchAsync(async (req, res, next) => {
  const totalRequests = await ServiceRequest.countDocuments();
  
  const statusStats = await ServiceRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityStats = await ServiceRequest.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeStats = await ServiceRequest.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get pending requests older than 48 hours
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
  
  const overdueRequests = await ServiceRequest.countDocuments({
    status: 'pending',
    createdAt: { $lt: twoDaysAgo }
  });

  // Get urgent unassigned requests
  const urgentUnassigned = await ServiceRequest.countDocuments({
    priority: 'urgent',
    status: 'pending',
    assignedTo: null
  });

  // Average resolution time (in hours)
  const resolvedRequests = await ServiceRequest.find({
    status: 'resolved',
    completedDate: { $exists: true }
  }).select('createdAt completedDate');

  let avgResolutionTime = 0;
  if (resolvedRequests.length > 0) {
    const totalTime = resolvedRequests.reduce((sum, req) => {
      const diff = req.completedDate - req.createdAt;
      return sum + (diff / (1000 * 60 * 60)); // Convert to hours
    }, 0);
    avgResolutionTime = totalTime / resolvedRequests.length;
  }

  res.status(200).json({
    success: true,
    data: {
      total: totalRequests,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      overdueRequests,
      urgentUnassigned,
      avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10
    }
  });
});

// Get single service request
exports.getRequest = catchAsync(async (req, res, next) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate('resident', 'name email phone address profileImage')
    .populate('zone', 'name code boundaries')
    .populate('assignedTo', 'name email phone')
    .populate('assignedTeam', 'name email phone')
    .populate('assignedVehicle', 'vehicleNumber type make model')
    .populate('timeline.updatedBy', 'name email');

  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

// Create new service request
exports.createRequest = catchAsync(async (req, res, next) => {
  const {
    type,
    title,
    description,
    location,
    zone,
    priority,
    images
  } = req.body;

  // Generate request number
  const requestNumber = await generateRequestNumber();

  // Create request - resident is set from authenticated user
  const request = await ServiceRequest.create({
    requestNumber,
    resident: req.user._id, // Automatically set from authenticated user
    type,
    title,
    description,
    location,
    zone,
    priority: priority || 'medium',
    images: images || [],
    timeline: [{
      status: 'pending',
      timestamp: Date.now(),
      updatedBy: req.user._id,
      notes: 'Request created'
    }]
  });

  const populatedRequest = await ServiceRequest.findById(request._id)
    .populate('resident', 'name email phone')
    .populate('zone', 'name code');

  // Emit socket event for new request
  const io = req.app.get('io');
  if (io) {
    io.emit('new-service-request', populatedRequest);
  }

  res.status(201).json({
    success: true,
    data: populatedRequest
  });
});

// Update service request
exports.updateRequest = catchAsync(async (req, res, next) => {
  const request = await ServiceRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  const {
    title,
    description,
    type,
    priority,
    location,
    scheduledDate,
    resolutionNotes,
    resolutionImages
  } = req.body;

  const updateData = {
    ...(title && { title }),
    ...(description && { description }),
    ...(type && { type }),
    ...(priority && { priority }),
    ...(location && { location }),
    ...(scheduledDate && { scheduledDate }),
    ...(resolutionNotes !== undefined && { resolutionNotes }),
    ...(resolutionImages && { resolutionImages })
  };

  const updatedRequest = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('resident', 'name email phone')
    .populate('zone', 'name code')
    .populate('assignedTo', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type');

  res.status(200).json({
    success: true,
    data: updatedRequest
  });
});

// Assign request to team/vehicle
exports.assignRequest = catchAsync(async (req, res, next) => {
  const request = await ServiceRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  const { assignedTo, assignedTeam, assignedVehicle, scheduledDate } = req.body;

  // Validate assigned user exists
  if (assignedTo) {
    const user = await User.findById(assignedTo);
    if (!user) {
      return next(new AppError('Assigned user not found', 404));
    }
  }

  // Validate vehicle exists
  if (assignedVehicle) {
    const vehicle = await Vehicle.findById(assignedVehicle);
    if (!vehicle) {
      return next(new AppError('Assigned vehicle not found', 404));
    }
  }

  // Update request
  const updateData = {
    status: 'assigned',
    ...(assignedTo && { assignedTo }),
    ...(assignedTeam && { assignedTeam }),
    ...(assignedVehicle && { assignedVehicle }),
    ...(scheduledDate && { scheduledDate }),
    $push: {
      timeline: {
        status: 'assigned',
        timestamp: Date.now(),
        updatedBy: req.user._id,
        notes: `Request assigned${assignedTo ? ' to team member' : ''}${assignedVehicle ? ' with vehicle' : ''}`
      }
    }
  };

  const updatedRequest = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  )
    .populate('resident', 'name email phone')
    .populate('zone', 'name code')
    .populate('assignedTo', 'name email')
    .populate('assignedTeam', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type');

  res.status(200).json({
    success: true,
    data: updatedRequest
  });
});

// Update request status
exports.updateStatus = catchAsync(async (req, res, next) => {
  const request = await ServiceRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  const { status, notes, resolutionNotes, resolutionImages } = req.body;

  if (!status) {
    return next(new AppError('Please provide a status', 400));
  }

  const updateData = {
    status,
    $push: {
      timeline: {
        status,
        timestamp: Date.now(),
        updatedBy: req.user._id,
        notes: notes || `Status updated to ${status}`
      }
    }
  };

  // If status is resolved, add completion date
  if (status === 'resolved') {
    updateData.completedDate = Date.now();
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (resolutionImages) updateData.resolutionImages = resolutionImages;
  }

  const updatedRequest = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  )
    .populate('resident', 'name email phone')
    .populate('zone', 'name code')
    .populate('assignedTo', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type');

  res.status(200).json({
    success: true,
    data: updatedRequest
  });
});

// Delete service request (soft delete)
exports.deleteRequest = catchAsync(async (req, res, next) => {
  const request = await ServiceRequest.findById(req.params.id);
  
  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  // Update status to cancelled
  await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      $push: {
        timeline: {
          status: 'cancelled',
          timestamp: Date.now(),
          updatedBy: req.user._id,
          notes: 'Request cancelled'
        }
      }
    }
  );

  res.status(200).json({
    success: true,
    data: null,
    message: 'Service request cancelled successfully'
  });
});

// Get requests by zone
exports.getRequestsByZone = catchAsync(async (req, res, next) => {
  const { zoneId } = req.params;
  const { status } = req.query;

  const filter = { zone: zoneId };
  if (status) filter.status = status;

  const requests = await ServiceRequest.find(filter)
    .populate('resident', 'name email phone')
    .populate('assignedTo', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// Get urgent/high priority requests
exports.getUrgentRequests = catchAsync(async (req, res, next) => {
  const requests = await ServiceRequest.find({
    priority: { $in: ['urgent', 'high'] },
    status: { $in: ['pending', 'assigned'] }
  })
    .populate('resident', 'name email phone')
    .populate('zone', 'name code')
    .populate('assignedTo', 'name email')
    .populate('assignedVehicle', 'vehicleNumber type')
    .sort({ priority: -1, createdAt: 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// Submit feedback for resolved request
exports.submitFeedback = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Please provide a valid rating between 1 and 5', 400));
  }

  const request = await ServiceRequest.findById(req.params.id);

  if (!request) {
    return next(new AppError('Service request not found', 404));
  }

  // Check if request is resolved
  if (request.status !== 'resolved') {
    return next(new AppError('Feedback can only be submitted for resolved requests', 400));
  }

  // Check if user is the request owner
  if (request.resident.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only submit feedback for your own requests', 403));
  }

  // Update feedback
  request.feedback = {
    rating,
    comment: comment || '',
    submittedAt: new Date()
  };

  await request.save();

  res.status(200).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: request
  });
});
