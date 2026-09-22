const express = require('express');
const router = express.Router();
const {
  COMMUTE_PRESETS,
  calculateRouteEmissions,
} = require('../services/routeService');

/**
 * GET /api/routes/presets
 * Returns popular preset origin/destination pairs.
 */
router.get('/presets', (req, res) => {
  res.json({
    success: true,
    data: COMMUTE_PRESETS,
  });
});

/**
 * POST /api/routes/calculate
 * Calculates multimodal emissions, best green route recommendation, and carbon shaved vs driving.
 */
router.post('/calculate', (req, res, next) => {
  try {
    const { source, destination, baselineMode, distanceKm } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both source and destination addresses.',
      });
    }

    const routeData = calculateRouteEmissions({
      source,
      destination,
      baselineMode: baselineMode || 'car',
      customDistanceKm: distanceKm,
    });

    res.json({
      success: true,
      data: routeData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
