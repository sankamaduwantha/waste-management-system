/**
 * @fileoverview Task Service
 * @description Business logic for task management operations
 * @author Waste Management System
 * @version 1.0.0
 */

const Task = require('../models/Task');
const User = require('../models/User');
const Resident = require('../models/Resident');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');

/**
 * Create a new task
 */
exports.createTask = async (taskData, managerId) => {
  // Validate resident exists
  const resident = await User.findById(taskData.assignedTo);
  if (!resident || resident.role !== 'resident') {
    throw new AppError('Invalid resident ID', 400);
  }

  const task = await Task.create({
    ...taskData,
    assignedBy: managerId
  });

  await task.populate('assignedTo', 'name email');
  await task.populate('assignedBy', 'name');

  // Send notification to resident
  await createNotification({
    recipient: taskData.assignedTo,
    title: 'New Task Assigned',
    message: `You have been assigned a new task: ${task.title}`,
    type: 'task_assignment',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  // Send email notification
  if (resident.email) {
    await sendEmail({
      to: resident.email,
      subject: 'New Task Assigned',
      html: `
        <h2>New Task Assigned</h2>
        <p>Hello ${resident.name},</p>
        <p>You have been assigned a new task:</p>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        <p><strong>Reward Points:</strong> ${task.rewardPoints}</p>
        <p>Please login to view and complete your task.</p>
      `
    });
  }

  return task;
};

/**
 * Get all tasks with filters and pagination
 */
exports.getTasks = async (filters = {}, options = {}) => {
  const {
    status,
    category,
    assignedTo,
    assignedBy,
    priority,
    isOverdue,
    search,
    page = 1,
    limit = 10,
    sortBy = '-createdAt'
  } = { ...filters, ...options };

  const query = { isActive: true };

  if (status) query.status = status;
  if (category) query.category = category;
  if (assignedTo) query.assignedTo = assignedTo;
  if (assignedBy) query.assignedBy = assignedBy;
  if (priority) query.priority = priority;

  if (isOverdue === 'true' || isOverdue === true) {
    query.dueDate = { $lt: new Date() };
    query.status = { $nin: ['completed', 'verified', 'cancelled'] };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email profileImage')
      .populate('assignedBy', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

/**
 * Get task by ID
 */
exports.getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignedTo', 'name email profileImage zone')
    .populate('assignedBy', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

/**
 * Update task
 */
exports.updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is the assignor
  if (task.assignedBy.toString() !== userId) {
    throw new AppError('You are not authorized to update this task', 403);
  }

  // Prevent updating completed/verified tasks
  if (task.status === 'verified') {
    throw new AppError('Cannot update verified tasks', 400);
  }

  Object.assign(task, updateData);
  await task.save();

  await task.populate('assignedTo', 'name email');
  await task.populate('assignedBy', 'name');

  // Notify resident of changes
  await createNotification({
    recipient: task.assignedTo._id,
    title: 'Task Updated',
    message: `Task "${task.title}" has been updated`,
    type: 'task_update',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  return task;
};

/**
 * Delete task (soft delete)
 */
exports.deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is the assignor
  if (task.assignedBy.toString() !== userId) {
    throw new AppError('You are not authorized to delete this task', 403);
  }

  task.isActive = false;
  task.status = 'cancelled';
  await task.save();

  // Notify resident
  await createNotification({
    recipient: task.assignedTo,
    title: 'Task Cancelled',
    message: `Task "${task.title}" has been cancelled`,
    type: 'task_cancellation',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  return { message: 'Task deleted successfully' };
};

/**
 * Bulk assign tasks to multiple residents
 */
exports.bulkAssignTasks = async (taskData, residentIds, managerId) => {
  // Validate residents
  const residents = await User.find({
    _id: { $in: residentIds },
    role: 'resident'
  });

  if (residents.length !== residentIds.length) {
    throw new AppError('Some resident IDs are invalid', 400);
  }

  const tasks = [];

  for (const residentId of residentIds) {
    const task = await Task.create({
      ...taskData,
      assignedTo: residentId,
      assignedBy: managerId
    });

    await task.populate('assignedTo', 'name email');
    tasks.push(task);

    // Send notification
    await createNotification({
      recipient: residentId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${task.title}`,
      type: 'task_assignment',
      relatedId: task._id,
      relatedModel: 'Task'
    });
  }

  return {
    message: `Successfully assigned task to ${tasks.length} residents`,
    tasks
  };
};

/**
 * Mark task as completed by resident
 */
exports.completeTask = async (taskId, userId, proofData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is the assigned resident
  if (task.assignedTo.toString() !== userId) {
    throw new AppError('You are not authorized to complete this task', 403);
  }

  if (task.status === 'completed' || task.status === 'verified') {
    throw new AppError('Task is already completed', 400);
  }

  await task.markCompleted(proofData);
  await task.populate('assignedBy', 'name email');

  // Notify manager
  await createNotification({
    recipient: task.assignedBy._id,
    title: 'Task Completed',
    message: `Resident completed task: ${task.title}`,
    type: 'task_completion',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  return task;
};

/**
 * Verify task completion by manager
 */
exports.verifyTask = async (taskId, userId, verificationData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is the assignor
  if (task.assignedBy.toString() !== userId) {
    throw new AppError('You are not authorized to verify this task', 403);
  }

  if (task.status !== 'completed') {
    throw new AppError('Task must be completed before verification', 400);
  }

  await task.verify(verificationData.notes);
  await task.populate('assignedTo', 'name email');

  // Award points to resident
  const resident = await Resident.findOne({ user: task.assignedTo._id });
  if (resident) {
    resident.gamification.points += task.rewardPoints;
    await resident.save();
  }

  // Notify resident
  await createNotification({
    recipient: task.assignedTo._id,
    title: 'Task Verified',
    message: `Your task "${task.title}" has been verified! You earned ${task.rewardPoints} points.`,
    type: 'task_verification',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  return task;
};

/**
 * Reject task completion
 */
exports.rejectTask = async (taskId, userId, rejectionData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is the assignor
  if (task.assignedBy.toString() !== userId) {
    throw new AppError('You are not authorized to reject this task', 403);
  }

  if (task.status !== 'completed') {
    throw new AppError('Only completed tasks can be rejected', 400);
  }

  await task.reject(rejectionData.reason);
  await task.populate('assignedTo', 'name email');

  // Notify resident
  await createNotification({
    recipient: task.assignedTo._id,
    title: 'Task Rejected',
    message: `Your task "${task.title}" was rejected. Reason: ${rejectionData.reason}`,
    type: 'task_rejection',
    relatedId: task._id,
    relatedModel: 'Task'
  });

  return task;
};

/**
 * Get task statistics for manager
 */
/**
 * Get task statistics
 */
exports.getStatistics = async (managerId) => {
  // Get all active tasks statistics (not filtered by manager for dashboard view)
  const stats = await Task.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$rewardPoints' }
      }
    }
  ]);

  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'verified', 'cancelled'] },
    isActive: true
  });

  const completionRate = await Task.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $in: ['$status', ['completed', 'verified']] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalTasks = stats.reduce((sum, s) => sum + s.count, 0);
  const completedTasks = stats.find(s => ['completed', 'verified'].includes(s._id))?.count || 0;

  return {
    byStatus: stats,
    overdueTasks,
    totalTasks,
    completedTasks,
    completionRate: completionRate[0]
      ? ((completionRate[0].completed / completionRate[0].total) * 100).toFixed(2)
      : 0
  };
};

/**
 * Get tasks for resident dashboard
 */
exports.getResidentTasks = async (residentId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;
  
  const query = { assignedTo: residentId, isActive: true };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};
