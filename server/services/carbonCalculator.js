const { getActivityDefinition } = require('../config/emissionFactors');

/**
 * Service to calculate carbon emissions deterministically using the official hackathon factors.
 * Never trusts frontend CO₂ values.
 *
 * @param {string} type - Activity type (e.g. 'car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal')
 * @param {number|string} quantity - Quantity of activity
 * @returns {object} { type, label, quantity, unit, emissionFactor, co2, category }
 */
function calculateCarbon(type, quantity) {
  const definition = getActivityDefinition(type);
  if (!definition) {
    throw new Error(`Unsupported activity type: "${type}". Supported types are Car Travel, Bus Travel, Flight, Electricity, Vegetarian Meal, and Non-Vegetarian Meal.`);
  }

  const numQuantity = parseFloat(quantity);

  if (isNaN(numQuantity) || !isFinite(numQuantity) || numQuantity <= 0) {
    throw new Error('Quantity must be a valid positive number greater than 0.');
  }

  // DP2: Absurd Input Detection
  if (numQuantity > definition.maxThreshold) {
    const error = new Error(`The entered ${definition.unit === 'km' ? 'distance' : 'quantity'} (${numQuantity} ${definition.unit}) is unusually high. Maximum accepted is ${definition.maxThreshold} ${definition.unit}. Please check the value.`);
    error.isAbsurdInput = true;
    error.maxThreshold = definition.maxThreshold;
    throw error;
  }

  // Calculate CO₂: quantity × emission factor rounded strictly to 2 decimal places
  const rawCo2 = numQuantity * definition.factor;
  const co2 = Number(rawCo2.toFixed(2));

  return {
    type: definition.key,
    label: definition.label,
    quantity: numQuantity,
    unit: definition.unit,
    emissionFactor: definition.factor,
    co2,
    category: definition.category,
  };
}

module.exports = {
  calculateCarbon,
};
