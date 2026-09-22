const Activity = require('../models/Activity');
const Target = require('../models/Target');

/**
 * Returns the Monday 00:00:00 and Sunday 23:59:59 bounds for the given date (default: now).
 * Decision Point 3 (DP3): Strict Monday-Sunday weekly window.
 */
function getWeekBounds(refDate = new Date()) {
  const d = new Date(refDate);
  // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const day = d.getDay();
  // distance to previous Monday: if Sunday (0), it's 6 days back; otherwise day - 1
  const diffToMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

/**
 * Calculates day of week info (e.g. Wednesday, Day 3 of 7)
 */
function getWeekDayInfo(refDate = new Date()) {
  const d = new Date(refDate);
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday ...
  // Monday is Day 1, Sunday is Day 7
  const dayNumber = dayIndex === 0 ? 7 : dayIndex;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    dayName: dayNames[dayIndex],
    dayNumber,
    totalDays: 7,
    label: `${dayNames[dayIndex]} • Day ${dayNumber} of 7`,
  };
}

/**
 * Generates personalized supportive nudges based on real category impact (DP1)
 */
function generateNudge(weeklyTotal, weeklyTarget, categoryBreakdown, topActivities) {
  const isExceeded = weeklyTotal > weeklyTarget;
  const diff = Number((weeklyTotal - weeklyTarget).toFixed(2));
  const progressPercent = weeklyTarget > 0 ? Number(((weeklyTotal / weeklyTarget) * 100).toFixed(1)) : 0;

  if (!isExceeded) {
    if (progressPercent >= 80) {
      return {
        status: 'near_target',
        title: "Approaching Weekly Target",
        message: `You've used ${progressPercent}% of your weekly carbon target (${weeklyTotal.toFixed(2)} / ${weeklyTarget.toFixed(2)} kg).`,
        tip: "Consider mindful adjustments for the remainder of the week to stay within your goal.",
      };
    }
    return {
      status: 'within_target',
      title: "On Track",
      message: "You're within your weekly target.",
      tip: "Keep up the sustainable choices!",
    };
  }

  // Target exceeded: ENCOURAGE + INFORM + SUGGEST (Never shame or block)
  let suggestion = "Small changes can still make a difference in your environmental footprint.";
  
  // Find highest contributing category
  const categories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const highestCategory = categories.length > 0 ? categories[0][0] : 'Transport';

  if (highestCategory === 'Transport') {
    // Check specific activity if car or flight
    const carActivity = topActivities.find(a => a.type === 'car');
    if (carActivity && carActivity.co2 > 4) {
      suggestion = "Your car travel is contributing significantly to this week's footprint. Consider replacing one short car trip with public transport (bus emits 60% less CO₂ per km).";
    } else {
      suggestion = "Transport is your largest emission source this week. Walking, cycling, or shared transit for short commutes can meaningfully reduce your impact.";
    }
  } else if (highestCategory === 'Food') {
    const nonVeg = topActivities.find(a => a.type === 'non_veg_meal');
    if (nonVeg) {
      suggestion = "Non-vegetarian meals are a significant part of your footprint this week. Swapping just one non-vegetarian meal for a vegetarian option saves ~1.50 kg CO₂.";
    } else {
      suggestion = "Dietary choices make a big impact. Local and plant-rich meals help keep your footprint low.";
    }
  } else if (highestCategory === 'Electricity') {
    suggestion = "Electricity is a significant part of your footprint this week. Consider reducing standby power, turning off unused cooling or appliances, or utilizing natural lighting.";
  }

  return {
    status: 'exceeded',
    title: "You're above your weekly carbon target",
    supportiveText: "That's okay — small changes can still make a difference.",
    diffKg: diff,
    suggestion,
    highestCategory,
  };
}

/**
 * Aggregates all dashboard metrics in one fast query set.
 */
async function getDashboardData() {
  const now = new Date();
  const { monday, sunday } = getWeekBounds(now);
  const dayInfo = getWeekDayInfo(now);

  // Retrieve current weekly and daily carbon limits (defaults: Weekly 38.5 kg, Daily 5.5 kg)
  let targetDoc = await Target.findOne();
  if (!targetDoc) {
    targetDoc = await Target.create({ weeklyTarget: 38.5, dailyTarget: 5.5 });
  } else if (Number(targetDoc.weeklyTarget) === 20 || targetDoc.weeklyTarget === 20.0 || !targetDoc.dailyTarget) {
    targetDoc.weeklyTarget = 38.5;
    targetDoc.dailyTarget = 5.5;
    await targetDoc.save();
  }
  const weeklyTarget = targetDoc.weeklyTarget;
  const dailyTarget = targetDoc.dailyTarget || 5.5;

  // 1. All-time Total CO₂
  const totalResult = await Activity.aggregate([
    { $group: { _id: null, totalCo2: { $sum: '$co2' }, totalActivities: { $sum: 1 } } },
  ]);
  const totalCo2 = totalResult.length > 0 ? Number(totalResult[0].totalCo2.toFixed(2)) : 0;
  const totalActivitiesCount = totalResult.length > 0 ? totalResult[0].totalActivities : 0;

  // 2. This Week's Activities (Monday 00:00 to Sunday 23:59)
  const weekActivities = await Activity.find({
    date: { $gte: monday, $lte: sunday },
  }).sort({ date: 1 });

  const weeklyTotal = Number(
    weekActivities.reduce((acc, curr) => acc + curr.co2, 0).toFixed(2)
  );

  const remaining = Number(Math.max(0, weeklyTarget - weeklyTotal).toFixed(2));
  const progressPercent = weeklyTarget > 0 ? Number(((weeklyTotal / weeklyTarget) * 100).toFixed(1)) : 0;

  // 3. Category Breakdown (Transport, Electricity, Food)
  const categoryBreakdown = {
    Transport: 0,
    Electricity: 0,
    Food: 0,
  };

  const activityTypeTotals = {};

  weekActivities.forEach((act) => {
    // Map types to categories
    if (act.type === 'car' || act.type === 'bus' || act.type === 'flight') {
      categoryBreakdown.Transport += act.co2;
    } else if (act.type === 'electricity') {
      categoryBreakdown.Electricity += act.co2;
    } else if (act.type === 'veg_meal' || act.type === 'non_veg_meal') {
      categoryBreakdown.Food += act.co2;
    }

    activityTypeTotals[act.type] = (activityTypeTotals[act.type] || 0) + act.co2;
  });

  categoryBreakdown.Transport = Number(categoryBreakdown.Transport.toFixed(2));
  categoryBreakdown.Electricity = Number(categoryBreakdown.Electricity.toFixed(2));
  categoryBreakdown.Food = Number(categoryBreakdown.Food.toFixed(2));

  // 4. Daily Trend Data (Monday through Sunday)
  const trendDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyMap = {};
  
  // Initialize 7 days with zero
  trendDays.forEach((dayName, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dateStr = dayDate.toISOString().split('T')[0];
    dailyMap[dateStr] = {
      day: dayName.slice(0, 3), // Mon, Tue...
      fullDay: dayName,
      date: dateStr,
      co2: 0,
      activitiesCount: 0,
    };
  });

  // Aggregate actual week activities by day
  weekActivities.forEach((act) => {
    const actDateStr = new Date(act.date).toISOString().split('T')[0];
    if (dailyMap[actDateStr]) {
      dailyMap[actDateStr].co2 = Number((dailyMap[actDateStr].co2 + act.co2).toFixed(2));
      dailyMap[actDateStr].activitiesCount += 1;
    }
  });

  const trendData = Object.values(dailyMap);

  // Today's emissions vs Daily Target
  const todayStr = now.toISOString().split('T')[0];
  const todayTotal = dailyMap[todayStr] ? dailyMap[todayStr].co2 : 0;
  const todayActivitiesCount = dailyMap[todayStr] ? dailyMap[todayStr].activitiesCount : 0;
  const isDailyExceeded = todayTotal > dailyTarget;
  const dailyRemaining = Number(Math.max(0, dailyTarget - todayTotal).toFixed(2));
  const dailyProgressPercent = dailyTarget > 0 ? Number(((todayTotal / dailyTarget) * 100).toFixed(1)) : 0;

  // 5. Top activities for nudge & eco coach
  const topActivities = Object.entries(activityTypeTotals).map(([type, co2]) => ({
    type,
    co2: Number(co2.toFixed(2)),
  })).sort((a, b) => b.co2 - a.co2);

  // 6. Generate Nudge (DP1)
  const nudge = generateNudge(weeklyTotal, weeklyTarget, categoryBreakdown, topActivities);

  // Recent 5 activities
  const recentActivities = await Activity.find().sort({ date: -1, createdAt: -1 }).limit(5);

  return {
    stats: {
      totalCo2,
      weeklyTotal,
      weeklyTarget,
      dailyTarget,
      todayTotal,
      todayActivitiesCount,
      remaining,
      dailyRemaining,
      progressPercent,
      dailyProgressPercent,
      isExceeded: weeklyTotal > weeklyTarget,
      isDailyExceeded,
      totalActivitiesCount,
    },
    weekInfo: {
      monday: monday.toISOString(),
      sunday: sunday.toISOString(),
      formattedRange: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      ...dayInfo,
    },
    trendData,
    categoryBreakdown: [
      { name: 'Transport', value: categoryBreakdown.Transport, color: '#10B981' },
      { name: 'Electricity', value: categoryBreakdown.Electricity, color: '#F59E0B' },
      { name: 'Food', value: categoryBreakdown.Food, color: '#064E3B' },
    ],
    nudge,
    recentActivities,
  };
}

module.exports = {
  getWeekBounds,
  getWeekDayInfo,
  getDashboardData,
  generateNudge,
};
