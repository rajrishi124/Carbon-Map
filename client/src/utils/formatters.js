/**
 * Formatters and UI metadata for CarbonMap.
 * Uses official Hackathon emission factors as source of truth.
 */

export const ACTIVITY_CONFIG = {
  car: {
    key: 'car',
    label: 'Car Travel',
    unit: 'km',
    factor: 0.20,
    category: 'Transport',
    maxThreshold: 2000,
    color: 'emerald',
    iconName: 'Car',
    description: 'Private petrol/diesel vehicle travel',
  },
  bus: {
    key: 'bus',
    label: 'Bus Travel',
    unit: 'km',
    factor: 0.08,
    category: 'Transport',
    maxThreshold: 1000,
    color: 'teal',
    iconName: 'Bus',
    description: 'Public city/regional bus transit',
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
  veg_meal: {
    key: 'veg_meal',
    label: 'Vegetarian Meal',
    unit: 'meals',
    factor: 0.50,
    category: 'Food',
    maxThreshold: 50,
    color: 'green',
    iconName: 'Salad',
    description: 'Plant-based or lacto-vegetarian meal',
  },
  non_veg_meal: {
    key: 'non_veg_meal',
    label: 'Non-Vegetarian Meal',
    unit: 'meals',
    factor: 2.00,
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
