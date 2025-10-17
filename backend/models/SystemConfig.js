const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  // Configuration category
  category: {
    type: String,
    required: true,
    enum: ['notifications', 'waste_thresholds', 'rewards', 'api', 'general'],
    index: true
  },

  // Configuration key
  key: {
    type: String,
    required: true,
    index: true
  },

  // Configuration value (flexible type)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Description
  description: {
    type: String
  },

  // Data type for validation
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },

  // Is editable by admin
  isEditable: {
    type: Boolean,
    default: true
  },

  // Last modified by
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  metadata: {
    unit: String, // e.g., 'percentage', 'minutes', 'days'
    min: Number,
    max: Number,
    options: [String] // For select/dropdown values
  }
}, {
  timestamps: true
});

// Compound index for category + key (unique combination)
systemConfigSchema.index({ category: 1, key: 1 }, { unique: true });

// Static method to get config by category and key
systemConfigSchema.statics.getConfig = async function(category, key) {
  const config = await this.findOne({ category, key });
  return config ? config.value : null;
};

// Static method to set config
systemConfigSchema.statics.setConfig = async function(category, key, value, userId) {
  return await this.findOneAndUpdate(
    { category, key },
    { value, lastModifiedBy: userId },
    { new: true, upsert: true }
  );
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
