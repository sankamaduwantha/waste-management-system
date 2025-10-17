const Payment = require('../models/Payment');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN${timestamp}${random}`;
};

// Generate invoice number
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000);
  return `INV-${year}${month}-${random}`;
};

// @desc    Get all payments (Admin/City Manager)
// @route   GET /api/v1/payments
// @access  Private (Admin, City Manager)
exports.getAllPayments = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status = '',
    paymentType = '',
    paymentMethod = '',
    startDate = '',
    endDate = ''
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (status) filter.status = status;
  if (paymentType) filter.paymentType = paymentType;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const payments = await Payment.find(filter)
    .populate('user', 'name email phone')
    .populate('metadata.zone', 'name code')
    .populate('metadata.serviceRequest')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Payment.countDocuments(filter);

  // Calculate statistics
  const stats = await Payment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
          }
        },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      payments,
      stats: stats[0] || { totalAmount: 0, completedAmount: 0, pendingAmount: 0 },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user's payments
// @route   GET /api/v1/payments/my-payments
// @access  Private (Resident)
exports.getMyPayments = catchAsync(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('metadata.zone', 'name code')
    .populate('metadata.serviceRequest')
    .sort({ createdAt: -1 });

  // Calculate user statistics
  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  res.status(200).json({
    success: true,
    data: {
      payments,
      stats
    }
  });
});

// @desc    Get single payment
// @route   GET /api/v1/payments/:id
// @access  Private
exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('metadata.zone', 'name code')
    .populate('metadata.serviceRequest');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if user is authorized to view this payment
  if (
    req.user.role === 'resident' &&
    payment.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to view this payment', 403));
  }

  res.status(200).json({
    success: true,
    data: { payment }
  });
});

// @desc    Create payment
// @route   POST /api/v1/payments/create-payment
// @access  Private (Resident)
exports.createPayment = catchAsync(async (req, res, next) => {
  const {
    amount,
    paymentType,
    paymentMethod,
    description,
    billingPeriod,
    serviceRequest
  } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return next(new AppError('Please provide a valid amount', 400));
  }

  // Generate transaction ID
  const transactionId = generateTransactionId();

  // Create payment object
  const paymentData = {
    transactionId,
    user: req.user._id,
    amount,
    paymentType,
    paymentMethod,
    description,
    billingPeriod,
    status: 'pending',
    metadata: {
      zone: req.user.zone,
      serviceRequest
    }
  };

  // If it's a card payment, set gateway to stripe
  if (paymentMethod === 'card') {
    paymentData.paymentGateway = 'stripe';
  }

  const payment = await Payment.create(paymentData);

  // In real implementation, integrate with payment gateway here
  // For now, we'll simulate immediate completion for demo purposes
  payment.status = 'processing';
  await payment.save();

  res.status(201).json({
    success: true,
    message: 'Payment initiated successfully',
    data: { payment }
  });
});

// @desc    Update payment status
// @route   PATCH /api/v1/payments/:id/status
// @access  Private (Admin, City Manager)
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { status, gatewayTransactionId } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  payment.status = status;

  if (gatewayTransactionId) {
    payment.gatewayTransactionId = gatewayTransactionId;
  }

  // If payment is completed, generate invoice
  if (status === 'completed' && !payment.invoice.invoiceNumber) {
    payment.invoice = {
      invoiceNumber: generateInvoiceNumber(),
      generatedAt: new Date(),
      invoiceUrl: `/invoices/${payment.transactionId}.pdf`
    };
  }

  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    data: { payment }
  });
});

// @desc    Process refund
// @route   POST /api/v1/payments/:id/refund
// @access  Private (Admin)
exports.refundPayment = catchAsync(async (req, res, next) => {
  const { amount, reason } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.status !== 'completed') {
    return next(new AppError('Can only refund completed payments', 400));
  }

  if (amount > payment.amount) {
    return next(new AppError('Refund amount cannot exceed payment amount', 400));
  }

  payment.status = 'refunded';
  payment.refund = {
    amount,
    reason,
    refundedAt: new Date(),
    refundTransactionId: generateTransactionId()
  };

  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Payment refunded successfully',
    data: { payment }
  });
});

// @desc    Download invoice
// @route   GET /api/v1/payments/:id/invoice
// @access  Private
exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email phone address')
    .populate('metadata.zone', 'name code');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if user is authorized
  if (
    req.user.role === 'resident' &&
    payment.user._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('Not authorized to download this invoice', 403));
  }

  if (payment.status !== 'completed' && payment.status !== 'processing') {
    return next(new AppError('Invoice not available for this payment status', 400));
  }

  // Generate invoice data
  const invoiceData = {
    invoiceNumber: payment.invoice?.invoiceNumber || `INV-${Date.now()}`,
    transactionId: payment.transactionId,
    date: payment.invoice?.generatedAt || payment.createdAt,
    user: payment.user,
    amount: payment.amount,
    paymentType: payment.paymentType,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    billingPeriod: payment.billingPeriod,
    description: payment.description
  };

  // In real implementation, generate PDF invoice here
  // For now, return invoice data
  res.status(200).json({
    success: true,
    data: {
      invoice: invoiceData
    }
  });
});

// @desc    Payment webhook handler (for payment gateways)
// @route   POST /api/v1/payments/webhook
// @access  Public (called by payment gateway)
exports.handleWebhook = catchAsync(async (req, res, next) => {
  // This would handle webhooks from payment gateways like Stripe, Razorpay, etc.
  // Implementation depends on the gateway being used
  
  const { transactionId, status, gatewayTransactionId } = req.body;

  const payment = await Payment.findOne({ transactionId });

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  payment.status = status;
  payment.gatewayTransactionId = gatewayTransactionId;

  if (status === 'completed') {
    payment.invoice = {
      invoiceNumber: generateInvoiceNumber(),
      generatedAt: new Date(),
      invoiceUrl: `/invoices/${payment.transactionId}.pdf`
    };
  }

  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Webhook processed successfully'
  });
});

// @desc    Get payment statistics
// @route   GET /api/v1/payments/stats/overview
// @access  Private (Admin, City Manager)
exports.getPaymentStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const stats = await Payment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);

  // Get payment method breakdown
  const methodBreakdown = await Payment.aggregate([
    { $match: { ...filter, status: 'completed' } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    }
  ]);

  // Get payment type breakdown
  const typeBreakdown = await Payment.aggregate([
    { $match: { ...filter, status: 'completed' } },
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {},
      methodBreakdown,
      typeBreakdown
    }
  });
});

module.exports = exports;
