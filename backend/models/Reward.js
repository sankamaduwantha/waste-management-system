/**
 * @fileoverview Reward Model
 * @description Mongoose model for reward system and resident recognition
 * @module models/Reward
 */

const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reward title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Reward description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    pointsCost: {
      type: Number,
      required: [true, 'Points cost is required'],
      min: [0, 'Points cost cannot be negative'],
      default: 0
    },
    category: {
      type: String,
      enum: ['gift_card', 'discount', 'service', 'merchandise', 'recognition', 'other'],
      required: [true, 'Category is required'],
      default: 'other'
    },
    type: {
      type: String,
      enum: ['item', 'voucher', 'certificate', 'badge', 'service'],
      required: [true, 'Type is required'],
      default: 'item'
    },
    stockQuantity: {
      type: Number,
      default: null, // null means unlimited
      min: [0, 'Stock quantity cannot be negative']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active'
    },
    expiryDate: {
      type: Date,
      default: null
    },
    termsAndConditions: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalClaimed: {
      type: Number,
      default: 0,
      min: 0
    },
    value: {
      type: Number, // Monetary value in LKR
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if reward is available
rewardSchema.virtual('isAvailable').get(function() {
  if (this.status !== 'active') return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  if (this.stockQuantity !== null && this.stockQuantity <= 0) return false;
  return true;
});

// Indexes
rewardSchema.index({ status: 1, category: 1 });
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ createdBy: 1 });
rewardSchema.index({ expiryDate: 1 });

// Methods
rewardSchema.methods.claim = function() {
  if (this.stockQuantity !== null) {
    this.stockQuantity -= 1;
    if (this.stockQuantity === 0) {
      this.status = 'out_of_stock';
    }
  }
  this.totalClaimed += 1;
  return this.save();
};

rewardSchema.methods.toDisplayFormat = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    pointsCost: this.pointsCost,
    category: this.category,
    type: this.type,
    imageUrl: this.imageUrl,
    status: this.status,
    isAvailable: this.isAvailable,
    stockQuantity: this.stockQuantity,
    value: `Rs. ${this.value.toFixed(2)}`,
    totalClaimed: this.totalClaimed
  };
};

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
