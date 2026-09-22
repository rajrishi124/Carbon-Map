const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../services/dashboardService');

/**
 * GET /api/dashboard
 * Returns aggregated statistics:
 * - Total CO₂ (all activities)
 * - This Week CO₂ (Monday to Sunday)
 * - Weekly Target & remaining
 * - Week info & progress (Day X of 7)
 * - Daily trend data (Mon - Sun)
 * - Category breakdown (Transport, Electricity, Food)
 * - DP1 Nudge status & personalized recommendations
 * - Recent activities
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await getDashboardData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
