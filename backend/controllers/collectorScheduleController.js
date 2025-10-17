const CollectorTask = require('../models/CollectorTask');
const CollectorPerformance = require('../models/CollectorPerformance');
const Bin = require('../models/Bin');
const Schedule = require('../models/Schedule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get collector's tasks for today
// @route   GET /api/v1/schedules/my-tasks
// @access  Private (Garbage Collector)
exports.getMyTasks = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Find tasks for today
  const tasks = await CollectorTask.find({
    collector: collectorId,
    date: { $gte: today, $lt: tomorrow }
  })
  .populate({
    path: 'bins.bin',
    select: 'binId type location currentFillLevel status qrCode'
  })
  .populate('schedule', 'zone wasteType timeSlot')
  .sort({ priority: -1, 'bins.sequence': 1 });
  
  // Flatten bins with task info
  const taskList = [];
  tasks.forEach(task => {
    task.bins.forEach(binTask => {
      if (binTask.bin) {
        taskList.push({
          _id: binTask._id,
          taskId: task._id,
          binId: binTask.bin.binId,
          bin: binTask.bin._id,
          type: binTask.bin.type,
          location: binTask.bin.location,
          fillLevel: binTask.bin.currentFillLevel,
          status: binTask.status,
          sequence: binTask.sequence,
          priority: task.priority,
          scheduledTime: binTask.scheduledTime,
          qrCode: binTask.bin.qrCode
        });
      }
    });
  });
  
  res.status(200).json({
    success: true,
    count: taskList.length,
    data: taskList
  });
});

// @desc    Get collector's performance stats
// @route   GET /api/v1/schedules/my-stats
// @access  Private (Garbage Collector)
exports.getMyStats = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get today's tasks
  const todayTasks = await CollectorTask.find({
    collector: collectorId,
    date: { $gte: today, $lt: tomorrow }
  });
  
  // Calculate stats
  let todayAssignments = 0;
  let completedToday = 0;
  let pendingTasks = 0;
  let totalDistance = 0;
  
  todayTasks.forEach(task => {
    todayAssignments += task.bins.length;
    completedToday += task.bins.filter(b => b.status === 'completed').length;
    pendingTasks += task.bins.filter(b => b.status === 'pending').length;
    totalDistance += task.totalDistance || 0;
  });
  
  // Get urgent bins count
  const urgentBins = await Bin.countDocuments({
    currentFillLevel: { $gte: 80 },
    status: { $in: ['active', 'full'] }
  });
  
  res.status(200).json({
    success: true,
    data: {
      todayAssignments,
      completedToday,
      pendingTasks,
      totalDistance: Math.round(totalDistance * 10) / 10,
      urgentBins,
      completionRate: todayAssignments > 0 
        ? Math.round((completedToday / todayAssignments) * 100) 
        : 0
    }
  });
});

// @desc    Get collector's route for today
// @route   GET /api/v1/schedules/my-route
// @access  Private (Garbage Collector)
exports.getMyRoute = catchAsync(async (req, res, next) => {
  const collectorId = req.user._id;
  
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Find route for today
  const tasks = await CollectorTask.find({
    collector: collectorId,
    date: { $gte: today, $lt: tomorrow }
  })
  .populate({
    path: 'bins.bin',
    select: 'binId type location currentFillLevel status qrCode'
  })
  .sort({ priority: -1 });
  
  if (tasks.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        route: null,
        bins: []
      }
    });
  }
  
  // Get the main task (combine if multiple)
  const mainTask = tasks[0];
  
  // Prepare bins with full details
  const bins = [];
  tasks.forEach(task => {
    task.bins.forEach(binTask => {
      if (binTask.bin) {
        bins.push({
          _id: binTask.bin._id,
          taskBinId: binTask._id,
          taskId: task._id,
          binId: binTask.bin.binId,
          type: binTask.bin.type,
          location: binTask.bin.location,
          fillLevel: binTask.bin.currentFillLevel,
          status: binTask.status,
          sequence: binTask.sequence,
          qrCode: binTask.bin.qrCode,
          scheduledTime: binTask.scheduledTime,
          startTime: binTask.startTime,
          completionTime: binTask.completionTime
        });
      }
    });
  });
  
  // Sort by sequence
  bins.sort((a, b) => a.sequence - b.sequence);
  
  // Calculate route stats
  const totalBins = bins.length;
  const completed = bins.filter(b => b.status === 'completed').length;
  const inProgress = bins.filter(b => b.status === 'in_progress').length;
  const pending = bins.filter(b => b.status === 'pending').length;
  
  res.status(200).json({
    success: true,
    data: {
      route: {
        _id: mainTask._id,
        date: mainTask.date,
        totalDistance: mainTask.totalDistance,
        estimatedTime: mainTask.estimatedTime,
        status: mainTask.status,
        priority: mainTask.priority,
        optimizedRoute: mainTask.optimizedRoute
      },
      bins,
      stats: {
        totalBins,
        completed,
        inProgress,
        pending,
        completionRate: totalBins > 0 ? Math.round((completed / totalBins) * 100) : 0
      }
    }
  });
});

// @desc    Optimize route based on current location
// @route   POST /api/v1/schedules/optimize-route
// @access  Private (Garbage Collector)
exports.optimizeRoute = catchAsync(async (req, res, next) => {
  const { currentLocation, taskId } = req.body;
  
  if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
    return next(new AppError('Please provide current location', 400));
  }
  
  // Find the task
  const task = await CollectorTask.findOne({
    _id: taskId,
    collector: req.user._id
  }).populate('bins.bin');
  
  if (!task) {
    return next(new AppError('Task not found', 404));
  }
  
  // Get pending bins
  const pendingBins = task.bins.filter(b => 
    b.status === 'pending' && b.bin
  );
  
  if (pendingBins.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No pending bins to optimize',
      data: task
    });
  }
  
  // Simple optimization: sort by distance from current location
  const binsWithDistance = pendingBins.map(binTask => {
    const binLat = binTask.bin.location.latitude;
    const binLng = binTask.bin.location.longitude;
    
    // Calculate distance using Haversine formula (simplified)
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      binLat,
      binLng
    );
    
    return {
      binTask,
      distance,
      lat: binLat,
      lng: binLng
    };
  });
  
  // Sort by distance (nearest first)
  binsWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Update sequences
  let sequence = 1;
  const optimizedRoute = [];
  
  for (const item of binsWithDistance) {
    const binIndex = task.bins.findIndex(b => 
      b._id.toString() === item.binTask._id.toString()
    );
    
    if (binIndex !== -1) {
      task.bins[binIndex].sequence = sequence++;
      optimizedRoute.push({
        lat: item.lat,
        lng: item.lng,
        binId: item.binTask.bin._id
      });
    }
  }
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < optimizedRoute.length - 1; i++) {
    totalDistance += calculateDistance(
      optimizedRoute[i].lat,
      optimizedRoute[i].lng,
      optimizedRoute[i + 1].lat,
      optimizedRoute[i + 1].lng
    );
  }
  
  task.optimizedRoute = optimizedRoute;
  task.totalDistance = totalDistance;
  await task.save();
  
  res.status(200).json({
    success: true,
    message: 'Route optimized successfully',
    data: {
      totalDistance: Math.round(totalDistance * 10) / 10,
      optimizedRoute
    }
  });
});

// @desc    Start bin collection
// @route   PATCH /api/v1/schedules/bins/:id/start
// @access  Private (Garbage Collector)
exports.startBinCollection = catchAsync(async (req, res, next) => {
  const binTaskId = req.params.id;
  
  // Find task containing this bin
  const task = await CollectorTask.findOne({
    'bins._id': binTaskId,
    collector: req.user._id
  });
  
  if (!task) {
    return next(new AppError('Bin task not found', 404));
  }
  
  // Find the specific bin in the task
  const binTask = task.bins.id(binTaskId);
  
  if (!binTask) {
    return next(new AppError('Bin not found in task', 404));
  }
  
  if (binTask.status !== 'pending') {
    return next(new AppError('Bin collection already started or completed', 400));
  }
  
  // Update status
  binTask.status = 'in_progress';
  binTask.startTime = new Date();
  
  // Update task status
  if (task.status === 'assigned') {
    task.status = 'in_progress';
  }
  
  await task.save();
  
  res.status(200).json({
    success: true,
    message: 'Bin collection started',
    data: binTask
  });
});

// @desc    Complete bin collection
// @route   PATCH /api/v1/schedules/bins/:id/complete
// @access  Private (Garbage Collector)
exports.completeBinCollection = catchAsync(async (req, res, next) => {
  const binTaskId = req.params.id;
  const { notes, wasteCollected } = req.body;
  
  // Find task containing this bin
  const task = await CollectorTask.findOne({
    'bins._id': binTaskId,
    collector: req.user._id
  }).populate('bins.bin');
  
  if (!task) {
    return next(new AppError('Bin task not found', 404));
  }
  
  // Find the specific bin in the task
  const binTask = task.bins.id(binTaskId);
  
  if (!binTask) {
    return next(new AppError('Bin not found in task', 404));
  }
  
  if (binTask.status === 'completed') {
    return next(new AppError('Bin collection already completed', 400));
  }
  
  // Update bin task
  binTask.status = 'completed';
  binTask.completionTime = new Date();
  binTask.notes = notes;
  
  if (wasteCollected) {
    binTask.wasteCollected = wasteCollected;
  }
  
  // Update the actual bin
  if (binTask.bin) {
    await Bin.findByIdAndUpdate(binTask.bin._id, {
      currentFillLevel: 0,
      lastEmptied: new Date(),
      status: 'active',
      $push: {
        collectionHistory: {
          date: new Date(),
          collectedBy: req.user._id,
          wasteCollected: wasteCollected || {}
        }
      }
    });
  }
  
  // Check if all bins completed
  task.updateStatus();
  await task.save();
  
  res.status(200).json({
    success: true,
    message: 'Bin collection completed',
    data: binTask
  });
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = exports;
