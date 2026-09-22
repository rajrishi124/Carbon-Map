const express = require('express');
const router = express.Router();
const Target = require('../models/Target');

const DEFAULT_WEEKLY = 38.5;
const DEFAULT_DAILY = 5.5;

/**
 * GET /api/target
 * Returns current carbon limits (defaults to Daily: 5.5 kg CO₂e, Weekly: 38.5 kg CO₂e)
 */
router.get('/', async (req, res, next) => {
  try {
    let targetDoc = await Target.findOne();
    if (!targetDoc) {
      targetDoc = await Target.create({ weeklyTarget: DEFAULT_WEEKLY, dailyTarget: DEFAULT_DAILY });
    } else if (targetDoc.weeklyTarget === 20.0 || !targetDoc.dailyTarget) {
      targetDoc.weeklyTarget = DEFAULT_WEEKLY;
      targetDoc.dailyTarget = DEFAULT_DAILY;
      await targetDoc.save();
    }

    res.json({
      success: true,
      data: {
        weeklyTarget: targetDoc.weeklyTarget,
        dailyTarget: targetDoc.dailyTarget || DEFAULT_DAILY,
        updatedAt: targetDoc.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/target
 * Updates the weekly and/or daily targets in MongoDB
 */
router.put('/', async (req, res, next) => {
  try {
    const { weeklyTarget, dailyTarget } = req.body;

    let targetDoc = await Target.findOne();
    if (!targetDoc) {
      targetDoc = new Target({ weeklyTarget: DEFAULT_WEEKLY, dailyTarget: DEFAULT_DAILY });
    }

    if (weeklyTarget !== undefined) {
      const numWeekly = Number(weeklyTarget);
      if (isNaN(numWeekly) || !isFinite(numWeekly) || numWeekly <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Weekly target must be a valid positive number greater than 0.',
        });
      }
      if (numWeekly > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Weekly target cannot exceed 5,000 kg.',
        });
      }
      targetDoc.weeklyTarget = numWeekly;
      if (dailyTarget === undefined) {
        targetDoc.dailyTarget = Number((numWeekly / 7).toFixed(2));
      }
    }

    if (dailyTarget !== undefined) {
      const numDaily = Number(dailyTarget);
      if (isNaN(numDaily) || !isFinite(numDaily) || numDaily <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Daily target must be a valid positive number greater than 0.',
        });
      }
      if (numDaily > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Daily target cannot exceed 1,000 kg.',
        });
      }
      targetDoc.dailyTarget = numDaily;
      if (weeklyTarget === undefined) {
        targetDoc.weeklyTarget = Number((numDaily * 7).toFixed(2));
      }
    }

    await targetDoc.save();

    res.json({
      success: true,
      message: `Carbon limits successfully updated to Daily: ${targetDoc.dailyTarget.toFixed(2)} kg CO₂e, Weekly: ${targetDoc.weeklyTarget.toFixed(2)} kg CO₂e.`,
      data: {
        weeklyTarget: targetDoc.weeklyTarget,
        dailyTarget: targetDoc.dailyTarget,
        updatedAt: targetDoc.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
