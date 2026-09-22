/**
 * Optional third-party Carbon API integration adapter.
 *
 * CRITICAL HACKATHON RULE:
 * The application MUST NOT be dependent on a third-party carbon API.
 * The hackathon's provided emission factors are the authoritative source of truth.
 * This adapter exists as an isolated architectural extension point.
 */

const { calculateCarbon } = require('./carbonCalculator');

async function fetchExternalEstimate(type, quantity) {
  // If an external service is configured, it would be called here.
  // By default, CarbonMap safely defaults to its deterministic calculation engine.
  return calculateCarbon(type, quantity);
}

module.exports = {
  fetchExternalEstimate,
};
