const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema(
  {
    weeklyTarget: {
      type: Number,
      required: true,
      default: 38.5,
      min: [1, 'Target must be at least 1 kg'],
      max: [5000, 'Target cannot exceed 5000 kg'],
    },
    dailyTarget: {
      type: Number,
      required: true,
      default: 5.5,
      min: [0.1, 'Daily target must be at least 0.1 kg'],
      max: [1000, 'Daily target cannot exceed 1000 kg'],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

module.exports = mongoose.model('Target', targetSchema);
