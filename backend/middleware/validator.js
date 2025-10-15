const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  // Password validation temporarily disabled
  // body('password')
  //   .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  //   .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['resident', 'city_manager', 'admin', 'sustainability_manager'])
    .withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  validate
];

// Login validation
const validateLogin = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Service request validation
const validateServiceRequest = [
  body('type').isIn(['missed_collection', 'bulk_pickup', 'illegal_dumping', 'bin_request', 'complaint'])
    .withMessage('Invalid request type'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  validate
];

// Schedule validation
const validateSchedule = [
  body('zoneId').notEmpty().withMessage('Zone ID is required'),
  body('wasteType').isIn(['general', 'recyclable', 'organic', 'hazardous'])
    .withMessage('Invalid waste type'),
  body('collectionDay').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid collection day'),
  body('timeSlot').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  validate
];

// Zone validation
const validateZone = [
  body('name').trim().notEmpty().withMessage('Zone name is required'),
  body('code').trim().notEmpty().withMessage('Zone code is required')
    .isLength({ min: 2, max: 10 }).withMessage('Zone code must be 2-10 characters'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('coordinates').optional().isArray({ min: 3 })
    .withMessage('Coordinates must be an array of at least 3 points'),
  validate
];

// Vehicle validation
const validateVehicle = [
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('type').isIn(['truck', 'compactor', 'tipper', 'mini_truck'])
    .withMessage('Invalid vehicle type'),
  body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('assignedZone').optional().isMongoId().withMessage('Invalid zone ID'),
  validate
];

// Bin validation
const validateBin = [
  body('binId').trim().notEmpty().withMessage('Bin ID is required'),
  body('type').isIn(['general', 'recyclable', 'organic', 'hazardous'])
    .withMessage('Invalid bin type'),
  body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('location.latitude').isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude').isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  validate
];

// Payment validation
const validatePayment = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isIn(['card', 'upi', 'net_banking', 'wallet'])
    .withMessage('Invalid payment method'),
  validate
];

// Waste data validation
const validateWasteData = [
  body('zoneId').notEmpty().withMessage('Zone ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('wasteCollected').isObject().withMessage('Waste collected data must be an object'),
  body('wasteCollected.general').optional().isFloat({ min: 0 })
    .withMessage('General waste must be a positive number'),
  body('wasteCollected.recyclable').optional().isFloat({ min: 0 })
    .withMessage('Recyclable waste must be a positive number'),
  body('wasteCollected.organic').optional().isFloat({ min: 0 })
    .withMessage('Organic waste must be a positive number'),
  body('wasteCollected.hazardous').optional().isFloat({ min: 0 })
    .withMessage('Hazardous waste must be a positive number'),
  validate
];

// ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  validate
];

module.exports = {
  validate,
  validateUserRegistration,
  validateLogin,
  validateServiceRequest,
  validateSchedule,
  validateZone,
  validateVehicle,
  validateBin,
  validatePayment,
  validateWasteData,
  validateObjectId
};
