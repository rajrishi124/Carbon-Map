const { EMISSION_FACTORS } = require('../config/emissionFactors');

/**
 * Curated list of popular commute presets for instant zero-latency suggestions.
 */
const COMMUTE_PRESETS = [
  {
    id: 'home-office',
    label: 'Home to Downtown Office',
    source: 'Greenwood Suburb, 14th Ave',
    destination: 'Downtown Financial Center, Tower 2',
    estimatedKm: 15,
    hasMetro: true,
    hasBus: true,
  },
  {
    id: 'home-techpark',
    label: 'Home to Tech Innovation Park',
    source: 'Northgate Residential Sector',
    destination: 'Silicon Boulevard, Tech Hub Phase 1',
    estimatedKm: 22,
    hasMetro: true,
    hasBus: true,
  },
  {
    id: 'city-airport',
    label: 'City Center to International Airport',
    source: 'Central Metro Station Plaza',
    destination: 'Terminal 2, International Airport',
    estimatedKm: 32,
    hasMetro: true,
    hasBus: true,
  },
  {
    id: 'suburb-university',
    label: 'Suburban Station to University Campus',
    source: 'West End Heights',
    destination: 'State University Science Quad',
    estimatedKm: 8,
    hasMetro: true,
    hasBus: true,
  },
  {
    id: 'market-mall',
    label: 'Local Commute to Market & Mall',
    source: 'Sunset Boulevard Apartments',
    destination: 'Grand Galleria & Central Market',
    estimatedKm: 4.5,
    hasMetro: false,
    hasBus: true,
  },
];

/**
 * Intelligent deterministic distance estimator.
 * If distanceKm is provided, uses it. Otherwise calculates based on address keywords or string hash heuristics.
 */
function estimateDistance(source, destination, customDistanceKm) {
  if (customDistanceKm && !isNaN(parseFloat(customDistanceKm)) && parseFloat(customDistanceKm) > 0) {
    return Number(parseFloat(customDistanceKm).toFixed(1));
  }

  // Check matching preset
  const cleanSource = (source || '').trim().toLowerCase();
  const cleanDest = (destination || '').trim().toLowerCase();

  const matched = COMMUTE_PRESETS.find(
    (p) =>
      (cleanSource.includes(p.source.toLowerCase()) || p.source.toLowerCase().includes(cleanSource)) &&
      (cleanDest.includes(p.destination.toLowerCase()) || p.destination.toLowerCase().includes(cleanDest))
  );

  if (matched) {
    return matched.estimatedKm;
  }

  // Heuristic based on string characteristics if custom addresses entered
  const combinedLength = (source || '').length + (destination || '').length;
  // Deterministic calculation between 5 km and 25 km
  let hash = 0;
  for (let i = 0; i < combinedLength; i++) {
    hash = (hash << 5) - hash + (source.charCodeAt(i % source.length) || 0) + (destination.charCodeAt(i % destination.length) || 0);
    hash |= 0;
  }
  const variance = Math.abs(hash % 180) / 10; // 0.0 to 18.0 km
  const baseKm = 6.0 + variance; // between 6.0 and 24.0 km
  return Number(baseKm.toFixed(1));
}

/**
 * Calculates emissions and carbon savings across all modes for the given journey.
 */
function calculateRouteEmissions({
  source = 'Home',
  destination = 'Office',
  baselineMode = 'car',
  customDistanceKm = null,
}) {
  const cleanSource = (source || 'Current Location').trim();
  const cleanDest = (destination || 'Destination').trim();

  if (!cleanSource || !cleanDest) {
    throw new Error('Both source and destination addresses are required.');
  }

  const distanceKm = estimateDistance(cleanSource, cleanDest, customDistanceKm);

  // Factors from central config
  const carFactor = EMISSION_FACTORS.CAR || 0.20;
  const bikeFactor = EMISSION_FACTORS.BIKE || 0.10;
  const busFactor = EMISSION_FACTORS.BUS || 0.08;
  const trainFactor = EMISSION_FACTORS.TRAIN || 0.04;

  // Compute baseline driving footprint
  const carCo2 = Number((distanceKm * carFactor).toFixed(2));
  const bikeCo2 = Number((distanceKm * bikeFactor).toFixed(2));
  const busCo2 = Number((distanceKm * busFactor).toFixed(2));
  const trainCo2 = Number((distanceKm * trainFactor).toFixed(2));
  const walkingCo2 = 0.00;

  // Transit Modes Comparison List
  const modes = [
    {
      id: 'train',
      type: 'train',
      name: 'Train / Metro Rail',
      category: 'Public Rail',
      icon: 'Train',
      factor: trainFactor,
      unit: 'km',
      distanceKm,
      co2: trainCo2,
      durationMinutes: Math.round(distanceKm * 2.2 + 8), // Average metro speed ~30-40 km/h + 8 min wait
      estimatedCost: '₹20 - ₹40',
      convenience: 'High',
      tag: 'Lowest Mechanized CO₂',
      co2Saved: Number((carCo2 - trainCo2).toFixed(2)),
      percentageSaved: Math.round(((carCo2 - trainCo2) / carCo2) * 100),
      isRecommended: true,
      description: 'Zero road congestion, electric rapid transit with 80% lower emissions than driving.',
    },
    {
      id: 'bus',
      type: 'bus',
      name: 'City / Regional Bus',
      category: 'Public Bus',
      icon: 'Bus',
      factor: busFactor,
      unit: 'km',
      distanceKm,
      co2: busCo2,
      durationMinutes: Math.round(distanceKm * 3.0 + 10), // Bus with stops ~20 km/h + 10 min wait
      estimatedCost: '₹15 - ₹30',
      convenience: 'Moderate',
      tag: '60% Less CO₂ than Car',
      co2Saved: Number((carCo2 - busCo2).toFixed(2)),
      percentageSaved: Math.round(((carCo2 - busCo2) / carCo2) * 100),
      isRecommended: false,
      description: 'Shared municipal road transit providing broad neighborhood connectivity.',
    },
    {
      id: 'bike',
      type: 'bike',
      name: 'Motorcycle / Scooter',
      category: 'Two-Wheeler',
      icon: 'Bike',
      factor: bikeFactor,
      unit: 'km',
      distanceKm,
      co2: bikeCo2,
      durationMinutes: Math.round(distanceKm * 2.0 + 3), // Agile city commute
      estimatedCost: '₹25 - ₹50 (fuel)',
      convenience: 'High',
      tag: '50% Less CO₂ than Car',
      co2Saved: Number((carCo2 - bikeCo2).toFixed(2)),
      percentageSaved: Math.round(((carCo2 - bikeCo2) / carCo2) * 100),
      isRecommended: false,
      description: 'Lighter vehicle weight cuts fuel consumption in half compared to a private car.',
    },
    {
      id: 'car',
      type: 'car',
      name: 'Private Car (Solo Drive)',
      category: 'Baseline Reference',
      icon: 'Car',
      factor: carFactor,
      unit: 'km',
      distanceKm,
      co2: carCo2,
      durationMinutes: Math.round(distanceKm * 2.5 + 5), // City traffic
      estimatedCost: '₹80 - ₹180 (fuel + parking)',
      convenience: 'Flexible',
      tag: 'Highest Emission Baseline',
      co2Saved: 0.00,
      percentageSaved: 0,
      isRecommended: false,
      description: 'Conventional petrol/diesel single-occupancy vehicle commute.',
    },
  ];

  // If distance is short (<= 5 km), add Cycling / Walking as ultimate eco choice
  if (distanceKm <= 7.0) {
    modes.unshift({
      id: 'walking',
      type: 'bike', // mapped to bike or zero emission
      name: 'Bicycle / Walking',
      category: 'Active Zero-Emission',
      icon: 'Footprints',
      factor: 0.00,
      unit: 'km',
      distanceKm,
      co2: 0.00,
      durationMinutes: Math.round(distanceKm * 4.5), // Cycling ~13 km/h
      estimatedCost: 'Free (₹0)',
      convenience: distanceKm <= 3 ? 'High' : 'Moderate',
      tag: '100% Zero Emissions',
      co2Saved: carCo2,
      percentageSaved: 100,
      isRecommended: true,
      description: 'Active mobility with 0.00 kg emissions, great for physical cardiovascular health.',
    });

    // Make walking top recommendation if <= 5 km
    if (distanceKm <= 5.0) {
      modes.forEach((m) => {
        m.isRecommended = m.id === 'walking';
      });
    }
  }

  // Find best alternative
  const recommendedMode = modes.find((m) => m.isRecommended) || modes[0];
  const maxShavedKg = Number((carCo2 - (recommendedMode.co2 || 0)).toFixed(2));
  const maxShavedPercent = Math.round(((carCo2 - (recommendedMode.co2 || 0)) / (carCo2 || 1)) * 100);

  // Environmental equivalence calculator
  // 1 tree absorbs ~0.06 kg CO2/day (~21.77 kg/year)
  // 1 smartphone charge emits ~0.008 kg CO2
  // 1 kWh electricity saved = 0.80 kg CO2
  const treeEquivalenceDays = Number((maxShavedKg / 0.06).toFixed(1));
  const smartphoneCharges = Math.round(maxShavedKg / 0.008);
  const electricityKwhEquivalent = Number((maxShavedKg / 0.80).toFixed(2));

  // Smart suggestion text
  let suggestion = `Taking ${recommendedMode.name} saves ${maxShavedKg.toFixed(2)} kg CO₂e (${maxShavedPercent}% reduction) compared to driving alone.`;
  if (recommendedMode.id === 'train') {
    suggestion = `Switching from a car to the Metro rail shaves ${maxShavedKg.toFixed(2)} kg CO₂e (80% drop) on this ${distanceKm} km commute and bypasses traffic jams.`;
  } else if (recommendedMode.id === 'walking') {
    suggestion = `This ${distanceKm} km trip is ideal for cycling or walking — eliminating 100% of transport emissions (${maxShavedKg.toFixed(2)} kg CO₂e saved).`;
  }

  return {
    source: cleanSource,
    destination: cleanDest,
    distanceKm,
    baseline: {
      mode: 'car',
      name: 'Private Car',
      factor: carFactor,
      co2: carCo2,
    },
    modes,
    recommendedMode,
    carbonShaved: {
      co2SavedKg: maxShavedKg,
      percentSaved: maxShavedPercent,
      suggestion,
      environmentalEquivalents: {
        treesAbsorbedDays: treeEquivalenceDays,
        smartphoneCharges,
        electricityKwhEquivalent,
      },
    },
  };
}

module.exports = {
  COMMUTE_PRESETS,
  estimateDistance,
  calculateRouteEmissions,
};
