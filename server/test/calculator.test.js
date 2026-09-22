const assert = require('assert');
const { calculateCarbon } = require('../services/carbonCalculator');

console.log('--- RUNNING CARBON CALCULATOR TESTS ---');

// TEST 1: Car 10 km -> Expected: 2.00 kg CO₂
const t1 = calculateCarbon('car', 10);
assert.strictEqual(t1.co2, 2.00, 'Test 1 Failed: Car 10 km must be 2.00 kg CO₂');
assert.strictEqual(t1.unit, 'km');
console.log('✓ TEST 1 Passed: Car 10 km = 2.00 kg CO₂');

// TEST 2: Bike 10 km -> Expected: 1.00 kg CO₂
const t2 = calculateCarbon('bike', 10);
assert.strictEqual(t2.co2, 1.00, 'Test 2 Failed: Bike 10 km must be 1.00 kg CO₂');
console.log('✓ TEST 2 Passed: Bike 10 km = 1.00 kg CO₂');

// TEST 3: Bus 10 km -> Expected: 0.80 kg CO₂
const t3 = calculateCarbon('bus', 10);
assert.strictEqual(t3.co2, 0.80, 'Test 3 Failed: Bus 10 km must be 0.80 kg CO₂');
console.log('✓ TEST 3 Passed: Bus 10 km = 0.80 kg CO₂');

// TEST 4: Train 10 km -> Expected: 0.40 kg CO₂
const t4 = calculateCarbon('train', 10);
assert.strictEqual(t4.co2, 0.40, 'Test 4 Failed: Train 10 km must be 0.40 kg CO₂');
console.log('✓ TEST 4 Passed: Train 10 km = 0.40 kg CO₂');

// TEST 5: Flight 100 km -> Expected: 25.00 kg CO₂
const t5 = calculateCarbon('flight', 100);
assert.strictEqual(t5.co2, 25.00, 'Test 5 Failed: Flight 100 km must be 25.00 kg CO₂');
console.log('✓ TEST 5 Passed: Flight 100 km = 25.00 kg CO₂');

// TEST 6: LPG 1 kg -> Expected: 3.00 kg CO₂
const t6 = calculateCarbon('lpg', 1);
assert.strictEqual(t6.co2, 3.00, 'Test 6 Failed: LPG 1 kg must be 3.00 kg CO₂');
console.log('✓ TEST 6 Passed: LPG 1 kg = 3.00 kg CO₂');

// TEST 7: Electricity 5 kWh -> Expected: 4.00 kg CO₂
const t7 = calculateCarbon('electricity', 5);
assert.strictEqual(t7.co2, 4.00, 'Test 7 Failed: Electricity 5 kWh must be 4.00 kg CO₂');
console.log('✓ TEST 7 Passed: Electricity 5 kWh = 4.00 kg CO₂');

// TEST 8: Wood 1 kg -> Expected: 1.80 kg CO₂
const t8 = calculateCarbon('wood', 1);
assert.strictEqual(t8.co2, 1.80, 'Test 8 Failed: Wood 1 kg must be 1.80 kg CO₂');
console.log('✓ TEST 8 Passed: Wood 1 kg = 1.80 kg CO₂');

// TEST 9: Coal 1 kg -> Expected: 2.40 kg CO₂
const t9 = calculateCarbon('coal', 1);
assert.strictEqual(t9.co2, 2.40, 'Test 9 Failed: Coal 1 kg must be 2.40 kg CO₂');
console.log('✓ TEST 9 Passed: Coal 1 kg = 2.40 kg CO₂');

// TEST 10: Vegetarian meal 1 -> Expected: 1.00 kg CO₂
const t10 = calculateCarbon('veg_meal', 1);
assert.strictEqual(t10.co2, 1.00, 'Test 10 Failed: Vegetarian meal 1 must be 1.00 kg CO₂');
console.log('✓ TEST 10 Passed: Vegetarian meal 1 = 1.00 kg CO₂');

// TEST 11: Non-vegetarian meal 1 -> Expected: 2.50 kg CO₂
const t11 = calculateCarbon('non_veg_meal', 1);
assert.strictEqual(t11.co2, 2.50, 'Test 11 Failed: Non-vegetarian meal 1 must be 2.50 kg CO₂');
console.log('✓ TEST 11 Passed: Non-vegetarian meal 1 = 2.50 kg CO₂');

// TEST 12: Car 500,000 km -> Expected: Rejected (DP2)
let rejected = false;
try {
  calculateCarbon('car', 500000);
} catch (err) {
  rejected = true;
  assert.strictEqual(err.isAbsurdInput, true);
  console.log(`✓ TEST 12 Passed: Car 500,000 km successfully rejected with message: "${err.message}"`);
}
assert.strictEqual(rejected, true, 'Test 12 Failed: Car 500,000 km should have been rejected');

console.log('--- ALL CALCULATOR TESTS PASSED SUCCESSFULLY ---');
