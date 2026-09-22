/**
 * Centralized emission factors and activity metadata.
 * Authoritative source of truth for all CO₂ calculations in CarbonMap.
 * Values defined according to Hackathon specifications:
 * - Car: 0.20 kg CO₂ / km
 * - Bus: 0.08 kg CO₂ / km
 * - Flight: 0.25 kg CO₂ / km
 * - Electricity: 0.80 kg CO₂ / kWh
 * - Vegetarian meal: 0.50 kg CO₂ / meal
 * - Non-vegetarian meal: 2.00 kg CO₂ / meal
 */

const EMISSION_FACTORS = {
  CAR: 0.20,
  BUS: 0.08,
  FLIGHT: 0.25,
  ELECTRICITY: 0.80,
  VEG_MEAL: 0.50,
  NON_VEG_MEAL: 2.00,
};

// Activity definitions with display labels, units, factors, category mapping, and DP2 realistic maximum thresholds
const ACTIVITY_DEFINITIONS = {
  car: {
    key: 'car',
    label: 'Car Travel',
    unit: 'km',
    factor: EMISSION_FACTORS.CAR,
    category: 'Transport',
    maxThreshold: 2000, // DP2: max 2,000 km per activity
  },
  bus: {
    key: 'bus',
    label: 'Bus Travel',
    unit: 'km',
    factor: EMISSION_FACTORS.BUS,
    category: 'Transport',
    maxThreshold: 1000, // DP2: max 1,000 km per activity
  },
  flight: {
    key: 'flight',
    label: 'Flight',
    unit: 'km',
    factor: EMISSION_FACTORS.FLIGHT,
    category: 'Transport',
    maxThreshold: 20000, // DP2: max 20,000 km per activity
  },
  electricity: {
    key: 'electricity',
    label: 'Electricity',
    unit: 'kWh',
    factor: EMISSION_FACTORS.ELECTRICITY,
    category: 'Electricity',
    maxThreshold: 5000, // DP2: max 5,000 kWh per activity
  },
  veg_meal: {
    key: 'veg_meal',
    label: 'Vegetarian Meal',
    unit: 'meals',
    factor: EMISSION_FACTORS.VEG_MEAL,
    category: 'Food',
    maxThreshold: 50, // DP2: max 50 meals per activity
  },
  non_veg_meal: {
    key: 'non_veg_meal',
    label: 'Non-Vegetarian Meal',
    unit: 'meals',
    factor: EMISSION_FACTORS.NON_VEG_MEAL,
    category: 'Food',
    maxThreshold: 50, // DP2: max 50 meals per activity
  },
};

// Normalized lookup by key or common aliases (e.g., 'Car Travel', 'car', 'VEG_MEAL')
function getActivityDefinition(typeInput) {
  if (!typeInput || typeof typeInput !== 'string') return null;
  const clean = typeInput.trim().toLowerCase().replace(/[\s-]+/g, '_');
  
  if (ACTIVITY_DEFINITIONS[clean]) {
    return ACTIVITY_DEFINITIONS[clean];
  }

  // Check by label or partial match
  const match = Object.values(ACTIVITY_DEFINITIONS).find(
    (item) => item.label.toLowerCase() === typeInput.trim().toLowerCase()
  );
  return match || null;
}

module.exports = {
  EMISSION_FACTORS,
  ACTIVITY_DEFINITIONS,
  getActivityDefinition,
};
