/**
 * @fileoverview Plastic Reduction Suggestion Controller
 * @description Handles HTTP requests for plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @design-patterns
 * - Controller Pattern: Handles HTTP requests and responses
 * - Async/Await Error Handling: Consistent error handling with catchAsync
 * 
 * @solid-principles
 * - Single Responsibility: Only handles HTTP request/response logic
 * - Dependency Inversion: Depends on service abstraction
 */

const plasticReductionService = require('../services/plasticReductionService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all plastic reduction suggestions
 * @route   GET /api/v1/plastic-suggestions
 * @access  Public (Residents)
 */
exports.getAllSuggestions = catchAsync(async (req, res, next) => {
  // Extract query parameters
  const filters = {
    category: req.query.category,
    difficulty: req.query.difficulty,
    minImpactScore: req.query.minImpactScore,
    tags: req.query.tags,
    search: req.query.search
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || '-impactScore'
  };

  const result = await plasticReductionService.getAllSuggestions(filters, pagination);

  res.status(200).json(result);
});

/**
 * @desc    Get single suggestion by ID
 * @route   GET /api/v1/plastic-suggestions/:id
 * @access  Public (Residents)
 */
exports.getSuggestion = catchAsync(async (req, res, next) => {
  // Validate ID parameter
  const id = req.params.id;
  
  if (!id || id === 'undefined' || id === 'null') {
    return next(new AppError('Invalid suggestion ID provided', 400));
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid suggestion ID format', 400));
  }

  const result = await plasticReductionService.getSuggestionById(
    id,
    true // increment view count
  );

  if (!result || !result.data) {
    return next(new AppError('Suggestion not found', 404));
  }

  res.status(200).json(result);
});

/**
 * @desc    Create new plastic reduction suggestion
 * @route   POST /api/v1/plastic-suggestions
 * @access  Private (Admin only)
 */
exports.createSuggestion = catchAsync(async (req, res, next) => {
  // Only admin and sustainability_manager can create suggestions
  if (!['admin', 'sustainability_manager'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to create suggestions', 403));
  }

  const suggestionData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    plasticSavedGrams: req.body.plasticSavedGrams,
    moneySaved: req.body.moneySaved,
    difficulty: req.body.difficulty,
    source: req.body.source,
    tags: req.body.tags,
    imageUrl: req.body.imageUrl,
    implementationSteps: req.body.implementationSteps
  };

  const result = await plasticReductionService.createSuggestion(
    suggestionData,
    req.user._id
  );

  res.status(201).json({
    success: true,
    data: result,
    message: 'Suggestion created successfully'
  });
});

/**
 * @desc    Update plastic reduction suggestion
 * @route   PUT /api/v1/plastic-suggestions/:id
 * @access  Private (Admin/Creator only)
 */
exports.updateSuggestion = catchAsync(async (req, res, next) => {
  // Validate ID parameter
  const id = req.params.id;
  
  if (!id || id === 'undefined' || id === 'null') {
    return next(new AppError('Invalid suggestion ID provided', 400));
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid suggestion ID format', 400));
  }

  // Only admin, sustainability_manager, or creator can update
  if (!['admin', 'sustainability_manager'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to update suggestions', 403));
  }

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    plasticSavedGrams: req.body.plasticSavedGrams,
    moneySaved: req.body.moneySaved,
    difficulty: req.body.difficulty,
    source: req.body.source,
    tags: req.body.tags,
    imageUrl: req.body.imageUrl,
    implementationSteps: req.body.implementationSteps,
    isActive: req.body.isActive
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => 
    updateData[key] === undefined && delete updateData[key]
  );

  const result = await plasticReductionService.updateSuggestion(
    id,
    updateData,
    req.user._id
  );

  res.status(200).json(result);
});

/**
 * @desc    Delete plastic reduction suggestion (soft delete)
 * @route   DELETE /api/v1/plastic-suggestions/:id
 * @access  Private (Admin/Creator only)
 */
exports.deleteSuggestion = catchAsync(async (req, res, next) => {
  // Validate ID parameter
  const id = req.params.id;
  
  if (!id || id === 'undefined' || id === 'null') {
    return next(new AppError('Invalid suggestion ID provided', 400));
  }

  // Check if ID is a valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError('Invalid suggestion ID format', 400));
  }

  // Only admin, sustainability_manager, or creator can delete
  if (!['admin', 'sustainability_manager'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete suggestions', 403));
  }

  const result = await plasticReductionService.deleteSuggestion(
    id,
    req.user._id
  );

  res.status(200).json(result);
});

/**
 * @desc    Get suggestions by category
 * @route   GET /api/v1/plastic-suggestions/category/:category
 * @access  Public (Residents)
 */
exports.getSuggestionsByCategory = catchAsync(async (req, res, next) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || '-impactScore'
  };

  const result = await plasticReductionService.getSuggestionsByCategory(
    req.params.category,
    options
  );

  res.status(200).json(result);
});

/**
 * @desc    Get top suggestions
 * @route   GET /api/v1/plastic-suggestions/top/:limit
 * @access  Public (Residents)
 */
exports.getTopSuggestions = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.params.limit) || 10;

  if (limit > 50) {
    return next(new AppError('Limit cannot exceed 50', 400));
  }

  const result = await plasticReductionService.getTopSuggestions(limit);

  res.status(200).json(result);
});

/**
 * @desc    Search suggestions
 * @route   GET /api/v1/plastic-suggestions/search
 * @access  Public (Residents)
 */
exports.searchSuggestions = catchAsync(async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  const result = await plasticReductionService.searchSuggestions(query, options);

  res.status(200).json(result);
});

/**
 * @desc    Mark suggestion as implemented
 * @route   POST /api/v1/plastic-suggestions/:id/implement
 * @access  Private (Authenticated users)
 */
exports.markAsImplemented = catchAsync(async (req, res, next) => {
  const result = await plasticReductionService.markAsImplemented(
    req.params.id,
    req.user._id
  );

  res.status(200).json(result);
});

/**
 * @desc    Get statistics
 * @route   GET /api/v1/plastic-suggestions/statistics
 * @access  Public (Residents)
 */
exports.getStatistics = catchAsync(async (req, res, next) => {
  const result = await plasticReductionService.getStatistics();

  res.status(200).json(result);
});
