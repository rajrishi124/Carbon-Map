const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: [
        'car',
        'bike',
        'bus',
        'train',
        'flight',
        'electricity',
        'lpg',
        'wood',
        'coal',
        'veg_meal',
        'non_veg_meal',
      ],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: true,
    },
    emissionFactor: {
      type: Number,
      required: true,
    },
    co2: {
      type: Number,
      required: true,
      min: [0, 'CO₂ cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index on date for efficient range queries (e.g. week, month)
activitySchema.index({ date: -1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
