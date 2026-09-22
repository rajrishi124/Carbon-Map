/**
 * Eco Coach Service
 * Analyzes actual logged activities and returns personalized, actionable reduction tips.
 *
 * CRITICAL RULE: AI does NOT calculate official CO₂ totals.
 * AI interprets already calculated deterministic data.
 * If AI_API_KEY is not set or fails, graceful fallback generates
 * a deeply personalized response based on actual user data.
 */

function generateDeterministicFallback(dashboardData) {
  const { stats, categoryBreakdown, weekInfo } = dashboardData;
  const weeklyTotal = stats.weeklyTotal || 0;
  const target = stats.weeklyTarget || 38.5;
  const dailyLimit = stats.dailyTarget || 5.5;

  if (weeklyTotal === 0) {
    return {
      summary: "You don't have any logged activities for this week yet. Start logging your daily commutes, electricity usage, or meals to get personalized insights!",
      insights: [
        "Commuting by bus instead of a private car saves 0.12 kg CO₂ per kilometer.",
        "Choosing a plant-based lunch saves 1.50 kg CO₂ compared to a meat-based option.",
        "Unplugging idle electronics can save up to 0.80 kg CO₂ per day.",
      ],
      topCategory: "None",
      potentialWeeklySavingsKg: 2.5,
      isAiGenerated: false,
      poweredBy: "CarbonMap Deterministic Eco Engine",
    };
  }

  // Calculate percentage per category
  const categories = categoryBreakdown.map((c) => ({
    name: c.name,
    value: c.value,
    percent: weeklyTotal > 0 ? Math.round((c.value / weeklyTotal) * 100) : 0,
  })).sort((a, b) => b.value - a.value);

  const top = categories[0];
  let summary = `Your ${top.name.toLowerCase()} activities make up ${top.percent}% of your carbon footprint this week (${top.value.toFixed(2)} kg CO₂).`;
  
  const insights = [];

  if (top.name === 'Transport') {
    insights.push(
      "Replacing one 10 km car trip with a bus trip saves approximately 1.20 kg CO₂ based on CarbonMap's official emission factors (0.20 vs 0.08 kg CO₂/km)."
    );
    insights.push(
      "Combining multiple errands into a single trip or carpooling once a week could reduce your transport emissions by over 20%."
    );
  } else if (top.name === 'Food') {
    insights.push(
      "Switching just one non-vegetarian meal per day to a vegetarian meal reduces your emissions by 1.50 kg CO₂ (2.00 vs 0.50 kg CO₂/meal)."
    );
    insights.push(
      "Planning meals in advance reduces food waste, which globally accounts for 8-10% of greenhouse emissions."
    );
  } else if (top.name === 'Electricity') {
    insights.push(
      "Electricity is your largest footprint sector. Saving 5 kWh this week through efficient heating/cooling or natural lighting prevents 4.00 kg of CO₂ emissions."
    );
    insights.push(
      "Switching to high-efficiency LED lighting and using smart power strips can reduce household power draw by up to 15%."
    );
  }

  // General encouraging secondary insight
  if (weeklyTotal > target) {
    insights.push(
      `You're currently ${(weeklyTotal - target).toFixed(2)} kg above your weekly goal of ${target.toFixed(2)} kg, but small daily adjustments over ${weekInfo.dayName ? 'the rest of the week' : 'the coming days'} will bring you right back on target.`
    );
  } else {
    insights.push(
      `Great job pacing yourself! You have ${(target - weeklyTotal).toFixed(2)} kg remaining in your weekly allowance (aim for under ${dailyLimit.toFixed(1)} kg CO₂e per day).`
    );
  }

  return {
    summary,
    insights,
    topCategory: top.name,
    potentialWeeklySavingsKg: Number(Math.max(1.2, top.value * 0.25).toFixed(2)),
    isAiGenerated: false,
    poweredBy: "CarbonMap Deterministic Eco Engine",
  };
}

async function getEcoCoachAdvice(dashboardData) {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_ai_api_key') {
    return generateDeterministicFallback(dashboardData);
  }

  // Attempt AI call using Gemini or standard LLM endpoint
  try {
    const prompt = `You are CarbonMap's expert Eco Coach.
Analyze the following personal carbon footprint data for this week (Mon-Sun):
- Total Weekly CO₂: ${dashboardData.stats.weeklyTotal} kg
- Weekly Target: ${dashboardData.stats.weeklyTarget} kg
- Target Exceeded: ${dashboardData.stats.isExceeded ? 'Yes' : 'No'}
- Category Breakdown:
  * Transport: ${dashboardData.categoryBreakdown.find(c => c.name === 'Transport')?.value || 0} kg CO₂
  * Electricity: ${dashboardData.categoryBreakdown.find(c => c.name === 'Electricity')?.value || 0} kg CO₂
  * Food: ${dashboardData.categoryBreakdown.find(c => c.name === 'Food')?.value || 0} kg CO₂

Official CarbonMap Emission Factors:
Car = 0.20 kg/km, Bus = 0.08 kg/km, Flight = 0.25 kg/km, Electricity = 0.80 kg/kWh, Veg meal = 0.50 kg, Non-veg meal = 2.00 kg.

Provide a concise, encouraging, and highly actionable analysis in valid JSON format with keys:
"summary": a 1-2 sentence overview noting top contributor percentage.
"insights": an array of 2-3 specific, encouraging suggestions referencing CarbonMap's emission savings (e.g. replacing car with bus saves 1.20 kg per 10km).
"potentialWeeklySavingsKg": estimated kg that could be saved realistically (number).
`;

    // Try Google Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (contentText) {
        const parsed = JSON.parse(contentText);
        return {
          summary: parsed.summary,
          insights: parsed.insights || [],
          topCategory: dashboardData.categoryBreakdown.sort((a,b) => b.value - a.value)[0]?.name || 'General',
          potentialWeeklySavingsKg: parsed.potentialWeeklySavingsKg || 2.0,
          isAiGenerated: true,
          poweredBy: "Gemini 1.5 Flash",
        };
      }
    }
  } catch (err) {
    console.warn('AI call failed, falling back to deterministic coach:', err.message);
  }

  return generateDeterministicFallback(dashboardData);
}

module.exports = {
  getEcoCoachAdvice,
  generateDeterministicFallback,
};
