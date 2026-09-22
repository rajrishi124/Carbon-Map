/**
 * Formatters and UI metadata for CarbonMap.
 * Uses official Hackathon emission factors as source of truth.
 */

export const ACTIVITY_CONFIG = {
  car: {
    key: 'car',
    label: 'Car',
    unit: 'km',
    factor: 0.20,
    category: 'Transport',
    maxThreshold: 2000,
    color: 'emerald',
    iconName: 'Car',
    description: 'Private petrol/diesel vehicle travel',
  },
  bike: {
    key: 'bike',
    label: 'Bike/Motorcycle',
    unit: 'km',
    factor: 0.10,
    category: 'Transport',
    maxThreshold: 1500,
    color: 'cyan',
    iconName: 'Bike',
    description: 'Motorcycle / scooter travel',
  },
  bus: {
    key: 'bus',
    label: 'Bus',
    unit: 'km',
    factor: 0.08,
    category: 'Transport',
    maxThreshold: 1000,
    color: 'teal',
    iconName: 'Bus',
    description: 'Public city/regional bus transit',
  },
  train: {
    key: 'train',
    label: 'Train/Metro',
    unit: 'km',
    factor: 0.04,
    category: 'Transport',
    maxThreshold: 5000,
    color: 'indigo',
    iconName: 'Train',
    description: 'Rail & rapid metro travel',
  },
  flight: {
    key: 'flight',
    label: 'Flight',
    unit: 'km',
    factor: 0.25,
    category: 'Transport',
    maxThreshold: 20000,
    color: 'sky',
    iconName: 'Plane',
    description: 'Commercial air travel',
  },
  lpg: {
    key: 'lpg',
    label: 'LPG',
    unit: 'kg',
    factor: 3.00,
    category: 'Electricity',
    maxThreshold: 100,
    color: 'orange',
    iconName: 'Flame',
    description: 'Cooking & heating LPG cylinder gas',
  },
  electricity: {
    key: 'electricity',
    label: 'Electricity',
    unit: 'kWh',
    factor: 0.80,
    category: 'Electricity',
    maxThreshold: 5000,
    color: 'amber',
    iconName: 'Zap',
    description: 'Residential & workspace power draw',
  },
  wood: {
    key: 'wood',
    label: 'Wood/Firewood',
    unit: 'kg',
    factor: 1.80,
    category: 'Electricity',
    maxThreshold: 500,
    color: 'yellow',
    iconName: 'TreePine',
    description: 'Firewood fuel combustion',
  },
  coal: {
    key: 'coal',
    label: 'Coal',
    unit: 'kg',
    factor: 2.40,
    category: 'Electricity',
    maxThreshold: 500,
    color: 'slate',
    iconName: 'Box',
    description: 'Coal fuel combustion',
  },
  veg_meal: {
    key: 'veg_meal',
    label: 'Vegetarian Meal',
    unit: 'meal',
    factor: 1.00,
    category: 'Food',
    maxThreshold: 50,
    color: 'green',
    iconName: 'Salad',
    description: 'Plant-based or vegetarian meal',
  },
  non_veg_meal: {
    key: 'non_veg_meal',
    label: 'Non-Vegetarian Meal',
    unit: 'meal',
    factor: 2.50,
    category: 'Food',
    maxThreshold: 50,
    color: 'red',
    iconName: 'Utensils',
    description: 'Meat, poultry, or seafood meal',
  },
};

export function formatCo2(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return Number(val).toFixed(2);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getActivityMeta(typeKey) {
  return ACTIVITY_CONFIG[typeKey] || {
    key: typeKey,
    label: typeKey || 'Activity',
    unit: 'units',
    factor: 0,
    category: 'Other',
    maxThreshold: 1000,
    color: 'slate',
    iconName: 'Activity',
  };
}

export function toLocalDateStr(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
