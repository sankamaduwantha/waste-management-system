/**
 * @fileoverview Reward Claim Model
 * @description Mongoose model for tracking resident reward claims
 * @module models/RewardClaim
 */

const mongoose = require('mongoose');

const rewardClaimSchema = new mongoose.Schema(
  {
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: [true, 'Reward reference is required']
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident reference is required']
    },
    pointsUsed: {
      type: Number,
      required: [true, 'Points used is required'],
      min: [0, 'Points used cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'delivered', 'redeemed', 'cancelled', 'expired'],
      default: 'pending'
    },
    claimDate: {
      type: Date,
      default: Date.now
    },
    deliveryDate: {
      type: Date,
      default: null
    },
    redemptionDate: {
      type: Date,
      default: null
    },
    redemptionCode: {
      type: String,
      unique: true,
      sparse: true
    },
    notes: {
      type: String,
      default: ''
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvalDate: {
      type: Date,
      default: null
    },
    deliveryAddress: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
rewardClaimSchema.index({ resident: 1, status: 1 });
rewardClaimSchema.index({ reward: 1 });
rewardClaimSchema.index({ status: 1, claimDate: -1 });
rewardClaimSchema.index({ redemptionCode: 1 });

// Generate unique redemption code
rewardClaimSchema.pre('save', function(next) {
  if (this.isNew && !this.redemptionCode) {
    this.redemptionCode = generateRedemptionCode();
  }
  next();
});

function generateRedemptionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Methods
rewardClaimSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvalDate = new Date();
  return this.save();
};

rewardClaimSchema.methods.markDelivered = function() {
  this.status = 'delivered';
  this.deliveryDate = new Date();
  return this.save();
};

rewardClaimSchema.methods.markRedeemed = function() {
  this.status = 'redeemed';
  this.redemptionDate = new Date();
  return this.save();
};

rewardClaimSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

const RewardClaim = mongoose.model('RewardClaim', rewardClaimSchema);

module.exports = RewardClaim;
