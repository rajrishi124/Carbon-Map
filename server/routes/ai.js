const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../services/dashboardService');
const { getEcoCoachAdvice } = require('../services/ecoCoachService');

/**
 * POST /api/ai/eco-coach
 * Analyzes the user's current week activity metrics and returns personalized suggestions.
 * Uses AI if AI_API_KEY is configured, or deterministic intelligent fallback.
 */
router.post('/eco-coach', async (req, res, next) => {
  try {
    const dashboardData = await getDashboardData();
    const coachAdvice = await getEcoCoachAdvice(dashboardData);

    res.json({
      success: true,
      data: coachAdvice,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
