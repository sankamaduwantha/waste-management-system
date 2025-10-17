const Bin = require('../models/Bin');
const ServiceRequest = require('../models/ServiceRequest');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get urgent bins (fill level >= 80%)
// @route   GET /api/v1/bins/urgent
// @access  Private (Garbage Collector)
exports.getUrgentBins = catchAsync(async (req, res, next) => {
  const urgentBins = await Bin.find({
    currentFillLevel: { $gte: 80 },
    status: { $in: ['active', 'full'] }
  })
  .populate('zone', 'name')
  .sort({ currentFillLevel: -1 })
  .limit(10)
  .select('binId type location currentFillLevel status qrCode zone');
  
  res.status(200).json({
    success: true,
    count: urgentBins.length,
    data: urgentBins
  });
});

// @desc    Verify bin by QR code
// @route   GET /api/v1/bins/qr/:qrCode
// @access  Private (Garbage Collector)
exports.verifyBinByQR = catchAsync(async (req, res, next) => {
  const { qrCode } = req.params;
  
  const bin = await Bin.findOne({ qrCode })
    .populate('zone', 'name')
    .select('binId type location currentFillLevel status qrCode zone lastEmptied nextScheduledCollection');
  
  if (!bin) {
    return next(new AppError('Bin not found with this QR code', 404));
  }
  
  res.status(200).json({
    success: true,
    data: bin
  });
});

// @desc    Get bin by manual ID
// @route   GET /api/v1/bins/id/:binId
// @access  Private (Garbage Collector)
exports.getBinByManualId = catchAsync(async (req, res, next) => {
  const { binId } = req.params;
  
  const bin = await Bin.findOne({ binId: binId.toUpperCase() })
    .populate('zone', 'name')
    .select('binId type location currentFillLevel status qrCode zone lastEmptied nextScheduledCollection');
  
  if (!bin) {
    return next(new AppError('Bin not found with this ID', 404));
  }
  
  res.status(200).json({
    success: true,
    data: bin
  });
});

// @desc    Record bin collection
// @route   POST /api/v1/bins/:id/collect
// @access  Private (Garbage Collector)
exports.collectBin = catchAsync(async (req, res, next) => {
  const { notes, wasteCollected } = req.body;
  
  const bin = await Bin.findById(req.params.id);
  
  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }
  
  // Update bin
  bin.currentFillLevel = 0;
  bin.lastEmptied = new Date();
  bin.status = 'active';
  
  // Add to collection history
  bin.collectionHistory.push({
    date: new Date(),
    collectedBy: req.user._id,
    wasteCollected: wasteCollected || {}
  });
  
  await bin.save();
  
  res.status(200).json({
    success: true,
    message: 'Bin collection recorded successfully',
    data: bin
  });
});

// @desc    Report bin issue
// @route   POST /api/v1/bins/:id/report-issue
// @access  Private (Garbage Collector)
exports.reportBinIssue = catchAsync(async (req, res, next) => {
  const { issueType, description, priority } = req.body;
  
  const bin = await Bin.findById(req.params.id);
  
  if (!bin) {
    return next(new AppError('Bin not found', 404));
  }
  
  // Create service request
  const serviceRequest = await ServiceRequest.create({
    bin: bin._id,
    requestType: issueType,
    description,
    priority: priority || 'medium',
    reportedBy: req.user._id,
    status: 'pending'
  });
  
  res.status(201).json({
    success: true,
    message: 'Issue reported successfully',
    data: serviceRequest
  });
});

module.exports = exports;
