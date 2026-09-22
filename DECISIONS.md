# CarbonMap Decision Points

This document provides a detailed rationale for the three architectural and behavioral design decisions made in **CarbonMap — Personal Carbon Footprint Tracker**.

---

## DP1 — The Nudge

### Challenge Question
> *"What does the app do when the weekly target is crossed: warn, encourage, shame, block? Why?"*

### CarbonMap Decision
**Encourage + Inform + Actionable Suggestions** (Never shame or block the user).

### Rationale
CarbonMap's mission is behavioral empowerment, not punitive judgment. Climate guilt and shaming in digital products often lead to user disengagement, abandonment, and data falsification. 
Blocking the user from logging activities once they cross their weekly target would prevent them from accurately capturing their environmental footprint.

### Implementation Details
When the user crosses their weekly target:
1. **Supportive Messaging**: The dashboard prominently states:
   - *"You're above your weekly carbon target."*
   - *"That's okay — small changes can still make a difference."*
2. **Context-Aware Analytics**: The system computes the user's top contributing emission category (Transport, Electricity, or Food) from real MongoDB activity data.
3. **Actionable Suggestions**:
   - **High Car Travel**: Recommends replacing a single short drive with public transit or carpooling, highlighting that a bus emits 60% less CO₂ per km (0.08 vs 0.20 kg/km).
   - **High Food Footprint**: Suggests swapping one non-vegetarian meal (2.00 kg CO₂) with a plant-based meal (0.50 kg CO₂), saving 1.50 kg CO₂ per meal.
   - **High Electricity**: Provides actionable energy conservation tips (reducing standby consumption, optimizing heating/cooling).

---

## DP2 — Absurd Input

### Challenge Question
> *"How do you treat an obviously wrong entry, like a 500,000 km car trip? Why?"*

### CarbonMap Decision
**Reject obviously unrealistic inputs on both frontend and backend.**

### Rationale
Allowing obviously distorted inputs (such as a 500,000 km daily commute) pollutes historical statistics, invalidates weekly goal tracking, skews group analytics, and ruins chart visualizations. Silently accepting outlier data undermines user trust in the platform's calculation integrity.

### Strict Validation Thresholds
CarbonMap establishes clear maximum realistic thresholds per single activity entry:
- **Car Travel**: Maximum `2,000 km` per activity
- **Bus Travel**: Maximum `1,000 km` per activity
- **Flight**: Maximum `20,000 km` per activity (approx. half the globe)
- **Electricity**: Maximum `5,000 kWh` per activity
- **Vegetarian / Non-Vegetarian Meals**: Maximum `50 meals` per entry
- **Numeric Integrity**: Values ≤ 0, `NaN`, `null`, `Infinity`, or negative values are strictly rejected.

### User Experience Flow
- **Frontend Interception**: When an absurd value is entered, submission is intercepted and an alert modal appears:
  - *"This value looks unusually high. Please check the distance before saving this activity."*
  - Interactive choices: **Cancel** or **Edit Value**.
- **Backend Enforcement**: If a user attempts to bypass frontend validation via direct API requests, the backend validation middleware (`server/middleware/validation.js`) rejects the payload with HTTP 400:
  ```json
  {
    "success": false,
    "isAbsurdInput": true,
    "message": "The entered distance (500000 km) is unusually high. Maximum accepted is 2000 km. Please check the value."
  }
  ```

---

## DP3 — The Week

### Challenge Question
> *"When does a 'week' start, and how is mid-week progress shown? Why?"*

### CarbonMap Decision
**Monday 00:00:00 through Sunday 23:59:59 (Local Time).**

### Rationale
In corporate sustainability, transportation schedules, and standard ISO 8601 calendar operations, a week is defined as beginning Monday and concluding Sunday. This standard aligns with natural lifestyle rhythms where individuals plan work commutes during weekdays and leisure activities during the weekend.

### Implementation Details
1. **Consistent Weekly Window**: Used synchronously across:
   - Dashboard statistics (`This Week` total)
   - Recharts Trend Area Chart (displaying Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
   - Recharts Category Breakdown Donut Chart
   - Weekly Target Progress Bar
   - DP1 Nudge calculations
   - Filter query parameters (`period=week`)
2. **Mid-Week Progress Indicator**:
   The dashboard explicitly surfaces progress through both day-of-week context and target pacing:
   - E.g.: `Wednesday • Day 3 of 7 • 12.40 / 38.50 kg (32%) • Daily Limit: 5.50 kg CO₂e`
   - Shows active day, today's emissions vs 5.5 kg daily limit, and remaining carbon allowance before Sunday midnight.
