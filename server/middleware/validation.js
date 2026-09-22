const { getActivityDefinition } = require('../config/emissionFactors');

function validateActivityInput(req, res, next) {
  const { type, quantity, date } = req.body;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Activity type is required.',
    });
  }

  const definition = getActivityDefinition(type);
  if (!definition) {
    return res.status(400).json({
      success: false,
      message: `Invalid activity type "${type}". Allowed types: Car Travel, Bus Travel, Flight, Electricity, Vegetarian Meal, Non-Vegetarian Meal.`,
    });
  }

  if (quantity === undefined || quantity === null || quantity === '') {
    return res.status(400).json({
      success: false,
      message: 'Quantity is required.',
    });
  }

  const numQuantity = Number(quantity);
  if (isNaN(numQuantity) || !isFinite(numQuantity) || numQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive numeric value greater than zero.',
    });
  }

  // Decision Point 2 (DP2): Reject obviously unrealistic input
  if (numQuantity > definition.maxThreshold) {
    const unitLabel = definition.unit === 'km' ? 'distance' : 'quantity';
    return res.status(400).json({
      success: false,
      isAbsurdInput: true,
      maxThreshold: definition.maxThreshold,
      unit: definition.unit,
      message: `The entered ${unitLabel} (${numQuantity} ${definition.unit}) is unusually high. Maximum accepted is ${definition.maxThreshold} ${definition.unit}. Please check the value.`,
    });
  }

  // Validate date if provided
  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.',
      });
    }
  }

  // Normalize request body with validated definition
  req.validatedActivity = {
    type: definition.key,
    quantity: numQuantity,
    definition,
  };

  next();
}

module.exports = {
  validateActivityInput,
};
