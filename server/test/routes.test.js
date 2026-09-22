const assert = require('assert');
const {
  COMMUTE_PRESETS,
  estimateDistance,
  calculateRouteEmissions,
} = require('../services/routeService');

console.log('--- RUNNING ECO ROUTE & CARBON SHAVED TESTS ---');

// TEST 1: Preset match
const d1 = estimateDistance(COMMUTE_PRESETS[0].source, COMMUTE_PRESETS[0].destination);
assert.strictEqual(d1, 15, 'Test 1 Failed: Preset distance should match 15 km');
console.log('✓ TEST 1 Passed: Preset distance correctly matched (15 km)');

// TEST 2: Multi-modal calculations for 15 km commute
const res = calculateRouteEmissions({
  source: COMMUTE_PRESETS[0].source,
  destination: COMMUTE_PRESETS[0].destination,
  baselineMode: 'car',
});

assert.strictEqual(res.distanceKm, 15);
assert.strictEqual(res.baseline.co2, 3.00, 'Car 15 km @ 0.20 must be 3.00 kg CO₂');

const trainMode = res.modes.find((m) => m.id === 'train');
assert.strictEqual(trainMode.co2, 0.60, 'Train 15 km @ 0.04 must be 0.60 kg CO₂');
assert.strictEqual(trainMode.co2Saved, 2.40, 'Train savings must be 3.00 - 0.60 = 2.40 kg CO₂');
assert.strictEqual(trainMode.percentageSaved, 80, 'Train percent saved must be 80%');
console.log('✓ TEST 2 Passed: Train shaves 2.40 kg CO₂ (80%) vs Car driving 15 km');

const busMode = res.modes.find((m) => m.id === 'bus');
assert.strictEqual(busMode.co2, 1.20, 'Bus 15 km @ 0.08 must be 1.20 kg CO₂');
assert.strictEqual(busMode.co2Saved, 1.80, 'Bus savings must be 3.00 - 1.20 = 1.80 kg CO₂');
assert.strictEqual(busMode.percentageSaved, 60, 'Bus percent saved must be 60%');
console.log('✓ TEST 3 Passed: Bus shaves 1.80 kg CO₂ (60%) vs Car driving 15 km');

const bikeMode = res.modes.find((m) => m.id === 'bike');
assert.strictEqual(bikeMode.co2, 1.50, 'Bike 15 km @ 0.10 must be 1.50 kg CO₂');
assert.strictEqual(bikeMode.co2Saved, 1.50, 'Bike savings must be 3.00 - 1.50 = 1.50 kg CO₂');
assert.strictEqual(bikeMode.percentageSaved, 50, 'Bike percent saved must be 50%');
console.log('✓ TEST 4 Passed: Motorcycle shaves 1.50 kg CO₂ (50%) vs Car driving 15 km');

// TEST 5: Short distance (< 5km) recommends walking / cycling with 100% savings
const shortRes = calculateRouteEmissions({
  source: 'Local Street',
  destination: 'Corner Bakery',
  customDistanceKm: 3.0,
});
const walkMode = shortRes.modes.find((m) => m.id === 'walking');
assert(walkMode, 'Short trip must include bicycle / walking');
assert.strictEqual(walkMode.co2, 0.00);
assert.strictEqual(walkMode.percentageSaved, 100);
assert.strictEqual(shortRes.recommendedMode.id, 'walking');
console.log('✓ TEST 5 Passed: Short 3 km trip recommends walking / cycling with 100% emissions shaved');

console.log('--- ALL ROUTE & CARBON SHAVED TESTS PASSED 100% ---');
