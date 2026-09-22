const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Target = require('../models/Target');
const { calculateCarbon } = require('../services/carbonCalculator');
const { getWeekBounds } = require('../services/dashboardService');

/**
 * POST /api/demo/seed
 * Populates realistic demo activities within the current week.
 * Avoids duplicate duplication if demo activities are already present.
 */
router.post('/seed', async (req, res, next) => {
  try {
    const { monday } = getWeekBounds();

    // Check if demo activities already exist for this week
    const existingDemo = await Activity.find({
      note: { $regex: /\[Demo\]/i },
    });

    if (existingDemo.length > 0 && !req.query.force) {
      return res.json({
        success: true,
        message: 'Demo data is already loaded for the current week.',
        data: existingDemo,
      });
    }

    // Days within current week:
    // Mon: Car 10km (commute)
    // Tue: Bus 8km (transit)
    // Wed: Electricity 5kWh
    // Thu: Vegetarian meal 2
    // Fri: Non-vegetarian meal 1
    const d1 = new Date(monday);
    d1.setHours(9, 15, 0, 0); // Monday

    const d2 = new Date(monday);
    d2.setDate(monday.getDate() + 1);
    d2.setHours(8, 45, 0, 0); // Tuesday

    const d3 = new Date(monday);
    d3.setDate(monday.getDate() + 2);
    d3.setHours(18, 30, 0, 0); // Wednesday

    const d4 = new Date(monday);
    d4.setDate(monday.getDate() + 3);
    d4.setHours(13, 0, 0, 0); // Thursday

    const d5 = new Date(monday);
    d5.setDate(monday.getDate() + 4);
    d5.setHours(20, 0, 0, 0); // Friday

    const demoItems = [
      { type: 'car', quantity: 10, date: d1, note: '[Demo] Morning office commute' },
      { type: 'bus', quantity: 8, date: d2, note: '[Demo] City center transit' },
      { type: 'electricity', quantity: 5, date: d3, note: '[Demo] Evening lighting and computing' },
      { type: 'veg_meal', quantity: 2, date: d4, note: '[Demo] Team plant-based lunch & dinner' },
      { type: 'non_veg_meal', quantity: 1, date: d5, note: '[Demo] Weekend family dinner' },
    ];

    const activitiesToSave = demoItems.map((item) => {
      const calc = calculateCarbon(item.type, item.quantity);
      return {
        type: calc.type,
        quantity: calc.quantity,
        unit: calc.unit,
        emissionFactor: calc.emissionFactor,
        co2: calc.co2,
        date: item.date,
        note: item.note,
      };
    });

    const savedActivities = await Activity.insertMany(activitiesToSave);

    // Ensure default weekly target (38.5 kg) and daily target (5.5 kg)
    let target = await Target.findOne();
    if (!target) {
      target = await Target.create({ weeklyTarget: 38.5, dailyTarget: 5.5 });
    } else {
      target.weeklyTarget = 38.5;
      target.dailyTarget = 5.5;
      await target.save();
    }

    res.status(201).json({
      success: true,
      message: 'Realistic demo activities successfully loaded!',
      count: savedActivities.length,
      data: savedActivities,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/demo/clear
 * Clears demo or all activities for quick re-testing
 */
router.delete('/clear', async (req, res, next) => {
  try {
    await Activity.deleteMany({});
    res.json({
      success: true,
      message: 'All activities cleared.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
