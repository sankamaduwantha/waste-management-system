const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentType: {
    type: String,
    enum: ['monthly_fee', 'bulk_pickup', 'late_fee', 'bin_replacement', 'other'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'net_banking', 'wallet', 'cash', 'bank_transfer'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'manual'],
    default: 'stripe'
  },
  gatewayTransactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  billingPeriod: {
    startDate: Date,
    endDate: Date
  },
  description: {
    type: String,
    trim: true
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date
  },
  metadata: {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest'
    },
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone'
    },
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    upiId: String,
    bankName: String
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundTransactionId: String
  },
  paidAt: Date,
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate transaction ID
paymentSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.transactionId = `PAY${new Date().getFullYear()}${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Generate invoice number
paymentSchema.methods.generateInvoice = function() {
  if (!this.invoice.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.invoice.invoiceNumber = `INV${year}${month}${String(Math.random()).substring(2, 8)}`;
    this.invoice.generatedAt = date;
  }
  return this.invoice.invoiceNumber;
};

module.exports = mongoose.model('Payment', paymentSchema);
