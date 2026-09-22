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
  BIKE: 0.10,
  BUS: 0.08,
  TRAIN: 0.04,
  FLIGHT: 0.25,
  LPG: 3.00,
  ELECTRICITY: 0.80,
  WOOD: 1.80,
  COAL: 2.40,
  VEG_MEAL: 1.00,
  NON_VEG_MEAL: 2.50,
};

// Activity definitions with display labels, units, factors, category mapping, and DP2 realistic maximum thresholds
const ACTIVITY_DEFINITIONS = {
  car: {
    key: 'car',
    label: 'Car',
    unit: 'km',
    factor: EMISSION_FACTORS.CAR,
    category: 'Transport',
    maxThreshold: 2000,
  },
  bike: {
    key: 'bike',
    label: 'Bike/Motorcycle',
    unit: 'km',
    factor: EMISSION_FACTORS.BIKE,
    category: 'Transport',
    maxThreshold: 1500,
  },
  bus: {
    key: 'bus',
    label: 'Bus',
    unit: 'km',
    factor: EMISSION_FACTORS.BUS,
    category: 'Transport',
    maxThreshold: 1000,
  },
  train: {
    key: 'train',
    label: 'Train/Metro',
    unit: 'km',
    factor: EMISSION_FACTORS.TRAIN,
    category: 'Transport',
    maxThreshold: 5000,
  },
  flight: {
    key: 'flight',
    label: 'Flight',
    unit: 'km',
    factor: EMISSION_FACTORS.FLIGHT,
    category: 'Transport',
    maxThreshold: 20000,
  },
  lpg: {
    key: 'lpg',
    label: 'LPG',
    unit: 'kg',
    factor: EMISSION_FACTORS.LPG,
    category: 'Electricity',
    maxThreshold: 100,
  },
  electricity: {
    key: 'electricity',
    label: 'Electricity',
    unit: 'kWh',
    factor: EMISSION_FACTORS.ELECTRICITY,
    category: 'Electricity',
    maxThreshold: 5000,
  },
  wood: {
    key: 'wood',
    label: 'Wood/Firewood',
    unit: 'kg',
    factor: EMISSION_FACTORS.WOOD,
    category: 'Electricity',
    maxThreshold: 500,
  },
  coal: {
    key: 'coal',
    label: 'Coal',
    unit: 'kg',
    factor: EMISSION_FACTORS.COAL,
    category: 'Electricity',
    maxThreshold: 500,
  },
  veg_meal: {
    key: 'veg_meal',
    label: 'Vegetarian Meal',
    unit: 'meals',
    factor: EMISSION_FACTORS.VEG_MEAL,
    category: 'Food',
    maxThreshold: 50,
  },
  non_veg_meal: {
    key: 'non_veg_meal',
    label: 'Non-Vegetarian Meal',
    unit: 'meals',
    factor: EMISSION_FACTORS.NON_VEG_MEAL,
    category: 'Food',
    maxThreshold: 50,
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
