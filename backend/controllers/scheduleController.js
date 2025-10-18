const Schedule = require('../models/Schedule');
const Zone = require('../models/Zone');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all schedules with filters and pagination
exports.getAllSchedules = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    zone = '',
    wasteType = '',
    collectionDay = '',
    status = '',
    isActive = ''
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (zone) filter.zone = zone;
  if (wasteType) filter.wasteType = wasteType;
  if (collectionDay) filter.collectionDay = collectionDay;
  if (status) filter.status = status;
  if (isActive !== '') filter.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const schedules = await Schedule.find(filter)
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email phone')
    .sort({ collectionDay: 1, 'timeSlot.start': 1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Schedule.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: schedules,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get schedule statistics
exports.getScheduleStats = catchAsync(async (req, res, next) => {
  const totalSchedules = await Schedule.countDocuments({ isActive: true });

  // Group by status
  const statusStats = await Schedule.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Group by waste type
  const wasteTypeStats = await Schedule.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$wasteType', count: { $sum: 1 } } }
  ]);

  // Group by collection day
  const dayStats = await Schedule.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$collectionDay', count: { $sum: 1 } } }
  ]);

  // Today's schedules
  const today = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = days[today.getDay()];
  
  const todaySchedules = await Schedule.countDocuments({
    isActive: true,
    collectionDay: todayName
  });

  // Schedules without assigned vehicles
  const unassignedVehicles = await Schedule.countDocuments({
    isActive: true,
    assignedVehicle: null
  });

  // Schedules without assigned crew
  const unassignedCrew = await Schedule.countDocuments({
    isActive: true,
    $or: [
      { assignedCrew: { $exists: false } },
      { assignedCrew: { $size: 0 } }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      total: totalSchedules,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byWasteType: wasteTypeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byDay: dayStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      todaySchedules,
      unassignedVehicles,
      unassignedCrew
    }
  });
});

// Get single schedule
exports.getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('zone', 'name code boundaries')
    .populate('assignedVehicle', 'vehicleNumber type make model capacity')
    .populate('assignedCrew', 'name email phone role');

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  res.status(200).json({
    success: true,
    data: schedule
  });
});

// Create new schedule
exports.createSchedule = catchAsync(async (req, res, next) => {
  const {
    zone,
    wasteType,
    collectionDay,
    timeSlot,
    route,
    assignedVehicle,
    assignedCrew,
    frequency,
    estimatedDuration
  } = req.body;

  // Verify zone exists
  const zoneExists = await Zone.findById(zone);
  if (!zoneExists) {
    return next(new AppError('Zone not found', 404));
  }

  // Verify vehicle exists if provided
  if (assignedVehicle) {
    const vehicleExists = await Vehicle.findById(assignedVehicle);
    if (!vehicleExists) {
      return next(new AppError('Vehicle not found', 404));
    }
  }

  // Check for conflicting schedules (same zone, day, and overlapping time)
  const existingSchedule = await Schedule.findOne({
    zone,
    collectionDay,
    isActive: true,
    $or: [
      {
        'timeSlot.start': { $lte: timeSlot.start },
        'timeSlot.end': { $gt: timeSlot.start }
      },
      {
        'timeSlot.start': { $lt: timeSlot.end },
        'timeSlot.end': { $gte: timeSlot.end }
      }
    ]
  });

  if (existingSchedule) {
    return next(new AppError('A schedule already exists for this zone and time slot', 400));
  }

  // Process assignedCrew to ensure it's an array of ObjectIds
  let processedAssignedCrew = [];
  if (assignedCrew) {
    if (Array.isArray(assignedCrew)) {
      // If it's already an array, use it directly
      processedAssignedCrew = assignedCrew;
    } else if (typeof assignedCrew === 'string') {
      // Check if the string looks like a stringified array: "[ '01', '02' ]" or similar
      if (assignedCrew.trim().startsWith('[') && assignedCrew.trim().endsWith(']')) {
        try {
          // Try to parse it using a more robust approach
          // First, convert single quotes to double quotes for proper JSON parsing
          const jsonStr = assignedCrew.replace(/'/g, '"');
          const parsed = JSON.parse(jsonStr);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          console.log('Error parsing assignedCrew:', e);
          // If parsing fails, try to extract IDs manually
          const matches = assignedCrew.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            processedAssignedCrew = matches.map(m => m.replace(/['"]/g, ''));
          } else {
            // If all else fails, treat as a single ID
            processedAssignedCrew = [assignedCrew];
          }
        }
      } else {
        try {
          // Try to parse if it's a JSON string of an array
          const parsed = JSON.parse(assignedCrew);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          // If not a JSON string, treat as a single ID
          processedAssignedCrew = [assignedCrew];
        }
      }
    }
  }

  const schedule = await Schedule.create({
    zone,
    wasteType,
    collectionDay,
    timeSlot,
    route,
    assignedVehicle: assignedVehicle || undefined,
    assignedCrew: processedAssignedCrew,
    frequency: frequency || 'weekly',
    estimatedDuration: estimatedDuration || 60
  });

  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email');

  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: populatedSchedule
  });
});

// Update schedule
exports.updateSchedule = catchAsync(async (req, res, next) => {
  const {
    zone,
    wasteType,
    collectionDay,
    timeSlot,
    route,
    assignedVehicle,
    assignedCrew,
    frequency,
    estimatedDuration,
    status
  } = req.body;

  let schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  // Verify zone exists if being updated
  if (zone && zone !== schedule.zone.toString()) {
    const zoneExists = await Zone.findById(zone);
    if (!zoneExists) {
      return next(new AppError('Zone not found', 404));
    }
  }

  // Verify vehicle exists if being updated
  if (assignedVehicle) {
    const vehicleExists = await Vehicle.findById(assignedVehicle);
    if (!vehicleExists) {
      return next(new AppError('Vehicle not found', 404));
    }
  }

  // Process assignedCrew to ensure it's an array of ObjectIds
  let processedAssignedCrew = [];
  if (assignedCrew !== undefined) {
    if (Array.isArray(assignedCrew)) {
      // If it's already an array, use it directly
      processedAssignedCrew = assignedCrew;
    } else if (typeof assignedCrew === 'string') {
      // Check if the string looks like a stringified array: "[ '01', '02' ]" or similar
      if (assignedCrew.trim().startsWith('[') && assignedCrew.trim().endsWith(']')) {
        try {
          // Try to parse it using a more robust approach
          // First, convert single quotes to double quotes for proper JSON parsing
          const jsonStr = assignedCrew.replace(/'/g, '"');
          const parsed = JSON.parse(jsonStr);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          console.log('Error parsing assignedCrew:', e);
          // If parsing fails, try to extract IDs manually
          const matches = assignedCrew.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            processedAssignedCrew = matches.map(m => m.replace(/['"]/g, ''));
          } else {
            // If all else fails, treat as a single ID
            processedAssignedCrew = [assignedCrew];
          }
        }
      } else {
        try {
          // Try to parse if it's a JSON string of an array
          const parsed = JSON.parse(assignedCrew);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          // If not a JSON string, treat as a single ID
          processedAssignedCrew = [assignedCrew];
        }
      }
    }
  }

  // Update fields
  if (zone) schedule.zone = zone;
  if (wasteType) schedule.wasteType = wasteType;
  if (collectionDay) schedule.collectionDay = collectionDay;
  if (timeSlot) schedule.timeSlot = timeSlot;
  if (route !== undefined) schedule.route = route;
  if (assignedVehicle !== undefined) schedule.assignedVehicle = assignedVehicle || null;
  if (assignedCrew !== undefined) schedule.assignedCrew = processedAssignedCrew;
  if (frequency) schedule.frequency = frequency;
  if (estimatedDuration) schedule.estimatedDuration = estimatedDuration;
  if (status) schedule.status = status;

  await schedule.save();

  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email');

  res.status(200).json({
    success: true,
    message: 'Schedule updated successfully',
    data: populatedSchedule
  });
});

// Delete schedule (soft delete by setting isActive to false)
exports.deleteSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  schedule.isActive = false;
  await schedule.save();

  res.status(200).json({
    success: true,
    message: 'Schedule deleted successfully',
    data: null
  });
});

// Assign vehicle and crew to schedule
exports.assignResources = catchAsync(async (req, res, next) => {
  const { assignedVehicle, assignedCrew } = req.body;

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  // Verify vehicle exists
  if (assignedVehicle) {
    const vehicleExists = await Vehicle.findById(assignedVehicle);
    if (!vehicleExists) {
      return next(new AppError('Vehicle not found', 404));
    }
    schedule.assignedVehicle = assignedVehicle;
  }

  // Process assignedCrew to ensure it's an array of ObjectIds
  if (assignedCrew !== undefined) {
    let processedAssignedCrew = [];
    
    if (Array.isArray(assignedCrew)) {
      // If it's already an array, use it directly
      processedAssignedCrew = assignedCrew;
    } else if (typeof assignedCrew === 'string') {
      // Check if the string looks like a stringified array: "[ '01', '02' ]" or similar
      if (assignedCrew.trim().startsWith('[') && assignedCrew.trim().endsWith(']')) {
        try {
          // Try to parse it using a more robust approach
          // First, convert single quotes to double quotes for proper JSON parsing
          const jsonStr = assignedCrew.replace(/'/g, '"');
          const parsed = JSON.parse(jsonStr);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          console.log('Error parsing assignedCrew:', e);
          // If parsing fails, try to extract IDs manually
          const matches = assignedCrew.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            processedAssignedCrew = matches.map(m => m.replace(/['"]/g, ''));
          } else {
            // If all else fails, treat as a single ID
            processedAssignedCrew = [assignedCrew];
          }
        }
      } else {
        try {
          // Try to parse if it's a standard JSON string of an array
          const parsed = JSON.parse(assignedCrew);
          processedAssignedCrew = Array.isArray(parsed) ? parsed : [assignedCrew];
        } catch (e) {
          // If not a JSON string, treat as a single ID
          processedAssignedCrew = [assignedCrew];
        }
      }
    }
    schedule.assignedCrew = processedAssignedCrew;
  }

  await schedule.save();

  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email');

  res.status(200).json({
    success: true,
    message: 'Resources assigned successfully',
    data: populatedSchedule
  });
});

// Get schedules by zone
exports.getSchedulesByZone = catchAsync(async (req, res, next) => {
  const schedules = await Schedule.find({
    zone: req.params.zoneId,
    isActive: true
  })
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email')
    .sort({ collectionDay: 1, 'timeSlot.start': 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// Get schedules by day
exports.getSchedulesByDay = catchAsync(async (req, res, next) => {
  const { day } = req.params;
  
  const schedules = await Schedule.find({
    collectionDay: day.toLowerCase(),
    isActive: true
  })
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email')
    .sort({ 'timeSlot.start': 1 });

  res.status(200).json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// Update schedule status
exports.updateScheduleStatus = catchAsync(async (req, res, next) => {
  const { status, completionDetails } = req.body;

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  schedule.status = status;

  if (status === 'completed' && completionDetails) {
    schedule.completionDetails = completionDetails;
  }

  await schedule.save();

  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate('zone', 'name code')
    .populate('assignedVehicle', 'vehicleNumber type')
    .populate('assignedCrew', 'name email');

  res.status(200).json({
    success: true,
    message: 'Schedule status updated successfully',
    data: populatedSchedule
  });
});

// Get available vehicles for a specific day and time slot
exports.getAvailableVehicles = catchAsync(async (req, res, next) => {
  const { collectionDay, timeSlotStart, timeSlotEnd } = req.query;

  if (!collectionDay || !timeSlotStart || !timeSlotEnd) {
    return next(new AppError('Please provide collectionDay, timeSlotStart, and timeSlotEnd', 400));
  }

  // Find all vehicles assigned to schedules on that day and time
  const busySchedules = await Schedule.find({
    collectionDay: collectionDay.toLowerCase(),
    isActive: true,
    assignedVehicle: { $ne: null },
    $or: [
      {
        'timeSlot.start': { $lte: timeSlotStart },
        'timeSlot.end': { $gt: timeSlotStart }
      },
      {
        'timeSlot.start': { $lt: timeSlotEnd },
        'timeSlot.end': { $gte: timeSlotEnd }
      }
    ]
  }).select('assignedVehicle');

  const busyVehicleIds = busySchedules.map(s => s.assignedVehicle);

  // Find available vehicles
  const availableVehicles = await Vehicle.find({
    _id: { $nin: busyVehicleIds },
    status: 'available'
  }).select('vehicleNumber type make model capacity');

  res.status(200).json({
    success: true,
    count: availableVehicles.length,
    data: availableVehicles
  });
});

// Get available drivers for a specific day and time slot
exports.getAvailableDrivers = catchAsync(async (req, res, next) => {
  const { collectionDay, timeSlotStart, timeSlotEnd } = req.query;

  if (!collectionDay || !timeSlotStart || !timeSlotEnd) {
    return next(new AppError('Please provide collectionDay, timeSlotStart, and timeSlotEnd', 400));
  }

  // Find all crew members assigned to schedules on that day and time
  const busySchedules = await Schedule.find({
    collectionDay: collectionDay.toLowerCase(),
    isActive: true,
    assignedCrew: { $exists: true, $ne: [] },
    $or: [
      {
        'timeSlot.start': { $lte: timeSlotStart },
        'timeSlot.end': { $gt: timeSlotStart }
      },
      {
        'timeSlot.start': { $lt: timeSlotEnd },
        'timeSlot.end': { $gte: timeSlotEnd }
      }
    ]
  }).select('assignedCrew');

  const busyCrewIds = busySchedules.flatMap(s => s.assignedCrew);

  // Find available drivers
  const availableDrivers = await Driver.find({
    user: { $nin: busyCrewIds },
    status: 'active'
  })
    .populate('user', 'name email phone')
    .select('employeeId licenseNumber shift');

  res.status(200).json({
    success: true,
    count: availableDrivers.length,
    data: availableDrivers
  });
});
