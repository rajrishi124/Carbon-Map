const assert = require('assert');
const { calculateCarbon } = require('../services/carbonCalculator');

console.log('--- RUNNING CARBON CALCULATOR TESTS ---');

// TEST 1: Car 10 km -> Expected: 2.00 kg CO₂
const t1 = calculateCarbon('car', 10);
assert.strictEqual(t1.co2, 2.00, 'Test 1 Failed: Car 10 km must be 2.00 kg CO₂');
assert.strictEqual(t1.unit, 'km');
console.log('✓ TEST 1 Passed: Car 10 km = 2.00 kg CO₂');

// TEST 2: Bus 10 km -> Expected: 0.80 kg CO₂
const t2 = calculateCarbon('bus', 10);
assert.strictEqual(t2.co2, 0.80, 'Test 2 Failed: Bus 10 km must be 0.80 kg CO₂');
console.log('✓ TEST 2 Passed: Bus 10 km = 0.80 kg CO₂');

// TEST 3: Flight 100 km -> Expected: 25.00 kg CO₂
const t3 = calculateCarbon('flight', 100);
assert.strictEqual(t3.co2, 25.00, 'Test 3 Failed: Flight 100 km must be 25.00 kg CO₂');
console.log('✓ TEST 3 Passed: Flight 100 km = 25.00 kg CO₂');

// TEST 4: Electricity 5 kWh -> Expected: 4.00 kg CO₂
const t4 = calculateCarbon('electricity', 5);
assert.strictEqual(t4.co2, 4.00, 'Test 4 Failed: Electricity 5 kWh must be 4.00 kg CO₂');
console.log('✓ TEST 4 Passed: Electricity 5 kWh = 4.00 kg CO₂');

// TEST 5: Vegetarian meal 1 -> Expected: 0.50 kg CO₂
const t5 = calculateCarbon('veg_meal', 1);
assert.strictEqual(t5.co2, 0.50, 'Test 5 Failed: Vegetarian meal 1 must be 0.50 kg CO₂');
console.log('✓ TEST 5 Passed: Vegetarian meal 1 = 0.50 kg CO₂');

// TEST 6: Non-vegetarian meal 1 -> Expected: 2.00 kg CO₂
const t6 = calculateCarbon('non_veg_meal', 1);
assert.strictEqual(t6.co2, 2.00, 'Test 6 Failed: Non-vegetarian meal 1 must be 2.00 kg CO₂');
console.log('✓ TEST 6 Passed: Non-vegetarian meal 1 = 2.00 kg CO₂');

// TEST 7: Car 500,000 km -> Expected: Rejected (DP2)
let rejected = false;
try {
  calculateCarbon('car', 500000);
} catch (err) {
  rejected = true;
  assert.strictEqual(err.isAbsurdInput, true);
  console.log(`✓ TEST 7 Passed: Car 500,000 km successfully rejected with message: "${err.message}"`);
}
assert.strictEqual(rejected, true, 'Test 7 Failed: Car 500,000 km should have been rejected');

console.log('--- ALL CALCULATOR TESTS PASSED SUCCESSFULLY ---');
