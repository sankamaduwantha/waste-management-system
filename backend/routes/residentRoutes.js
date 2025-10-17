const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Resident = require('../models/Resident');
const catchAsync = require('../utils/catchAsync');

// Placeholder for resident routes
router.use(protect);

// Get all residents (for managers/admins to assign tasks)
router.get('/', 
  authorize('sustainability_manager', 'city_manager', 'admin'),
  catchAsync(async (req, res) => {
    const { status, search } = req.query;
    
    // Build query - removed zone filter as it doesn't exist in schema
    const query = {};
    
    if (status) {
      query['paymentInfo.paymentStatus'] = status;
    }
    
    // Populate user details
    let residents = await Resident.find(query)
      .populate('user', 'name email')
      .sort('-createdAt');
    
    // Apply search filter on populated data
    if (search) {
      residents = residents.filter(resident => {
        const userName = resident.user?.name?.toLowerCase() || '';
        const userEmail = resident.user?.email?.toLowerCase() || '';
        const searchLower = search.toLowerCase();
        return userName.includes(searchLower) || userEmail.includes(searchLower);
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: residents.length,
      data: {
        residents
      }
    });
  })
);

// Get resident by ID
router.get('/:id',
  catchAsync(async (req, res) => {
    const resident = await Resident.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!resident) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resident not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        resident
      }
    });
  })
);

router.get('/profile', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get resident profile' });
});

router.put('/profile', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Update resident profile' });
});

router.get('/stats', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Get resident statistics' });
});

module.exports = router;
