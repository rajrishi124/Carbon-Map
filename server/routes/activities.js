const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { calculateCarbon } = require('../services/carbonCalculator');
const { validateActivityInput } = require('../middleware/validation');
const { getWeekBounds } = require('../services/dashboardService');

/**
 * GET /api/activities
 * Query filters:
 * - type: string (e.g. 'car', 'bus')
 * - period: 'today' | 'week' | 'month'
 * - startDate, endDate: YYYY-MM-DD
 */
router.get('/', async (req, res, next) => {
  try {
    const { type, period, startDate, endDate } = req.query;
    const filter = {};

    // Filter by type
    if (type && type !== 'all') {
      filter.type = type.toLowerCase();
    }

    // Filter by period or custom date range
    if (period) {
      const now = new Date();
      if (period === 'today') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      } else if (period === 'week') {
        const { monday, sunday } = getWeekBounds(now);
        filter.date = { $gte: monday, $lte: sunday };
      } else if (period === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const activities = await Activity.find(filter).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/activities/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.',
      });
    }
    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/activities
 * Form: Activity Type, Quantity, Date, Note
 * Backend determines: unit, emissionFactor, co2 (deterministic)
 */
router.post('/', validateActivityInput, async (req, res, next) => {
  try {
    const { type, quantity, date, note } = req.body;

    // Deterministic CO₂ calculation
    const calcResult = calculateCarbon(type, quantity);

    const newActivity = new Activity({
      type: calcResult.type,
      quantity: calcResult.quantity,
      unit: calcResult.unit,
      emissionFactor: calcResult.emissionFactor,
      co2: calcResult.co2,
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
    });

    const saved = await newActivity.save();

    res.status(201).json({
      success: true,
      message: `Activity logged successfully — ${saved.co2.toFixed(2)} kg CO₂ added.`,
      data: saved,
      calculationBreakdown: {
        formula: `${calcResult.quantity} ${calcResult.unit} × ${calcResult.emissionFactor.toFixed(2)} kg/${calcResult.unit} = ${calcResult.co2.toFixed(2)} kg CO₂`,
        quantity: calcResult.quantity,
        unit: calcResult.unit,
        factor: calcResult.emissionFactor,
        co2: calcResult.co2,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/activities/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or already deleted.',
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully.',
      data: { id: deleted._id, co2: deleted.co2 },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
