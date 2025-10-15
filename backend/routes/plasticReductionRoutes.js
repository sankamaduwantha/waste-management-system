/**
 * @fileoverview Plastic Reduction Suggestion Routes
 * @description RESTful API routes for plastic reduction suggestions
 * @author Waste Management System
 * @version 1.0.0
 * 
 * @api-design
 * - RESTful: Following REST conventions
 * - Resource-based: URLs represent resources
 * - HTTP Methods: GET, POST, PUT, DELETE used appropriately
 */

const express = require('express');
const router = express.Router();
const plasticReductionController = require('../controllers/plasticReductionController');
const { protect, authorize } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/plastic-suggestions/statistics
 * @desc    Get statistics dashboard
 * @access  Public
 */
router.get('/statistics', plasticReductionController.getStatistics);

/**
 * @route   GET /api/v1/plastic-suggestions/top/:limit?
 * @desc    Get top suggestions by impact score
 * @access  Public
 */
router.get('/top/:limit?', plasticReductionController.getTopSuggestions);

/**
 * @route   GET /api/v1/plastic-suggestions/search
 * @desc    Search suggestions by text
 * @access  Public
 * @query   q - Search query (required)
 * @query   page - Page number (optional, default: 1)
 * @query   limit - Results per page (optional, default: 10)
 */
router.get('/search', plasticReductionController.searchSuggestions);

/**
 * @route   GET /api/v1/plastic-suggestions/category/:category
 * @desc    Get suggestions by category
 * @access  Public
 */
router.get('/category/:category', plasticReductionController.getSuggestionsByCategory);

/**
 * @route   GET /api/v1/plastic-suggestions/:id
 * @desc    Get single suggestion by ID
 * @access  Public
 */
router.get('/:id', plasticReductionController.getSuggestion);

/**
 * @route   GET /api/v1/plastic-suggestions
 * @desc    Get all suggestions with filters and pagination
 * @access  Public
 * @query   category - Filter by category
 * @query   difficulty - Filter by difficulty (easy/medium/hard)
 * @query   minImpactScore - Filter by minimum impact score
 * @query   tags - Filter by tags (comma-separated or array)
 * @query   search - Full-text search
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 10)
 * @query   sortBy - Sort field (default: -impactScore)
 */
router.get('/', plasticReductionController.getAllSuggestions);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication

router.use(protect);

/**
 * @route   POST /api/v1/plastic-suggestions/:id/implement
 * @desc    Mark suggestion as implemented by user
 * @access  Private (Authenticated users)
 */
router.post('/:id/implement', plasticReductionController.markAsImplemented);

// ==================== ADMIN/SUSTAINABILITY MANAGER ROUTES ====================

/**
 * @route   POST /api/v1/plastic-suggestions
 * @desc    Create new suggestion
 * @access  Private (Admin, Sustainability Manager)
 * @body    {title, description, category, plasticSavedGrams, moneySaved, difficulty, ...}
 */
router.post(
  '/',
  authorize('admin', 'sustainability_manager'),
  plasticReductionController.createSuggestion
);

/**
 * @route   PUT /api/v1/plastic-suggestions/:id
 * @desc    Update suggestion
 * @access  Private (Admin, Sustainability Manager, Creator)
 */
router.put(
  '/:id',
  authorize('admin', 'sustainability_manager'),
  plasticReductionController.updateSuggestion
);

/**
 * @route   DELETE /api/v1/plastic-suggestions/:id
 * @desc    Delete suggestion (soft delete)
 * @access  Private (Admin, Sustainability Manager, Creator)
 */
router.delete(
  '/:id',
  authorize('admin', 'sustainability_manager'),
  plasticReductionController.deleteSuggestion
);

module.exports = router;
