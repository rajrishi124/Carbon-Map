/**
 * MongoDB Demo Data Seeder for CarbonMap
 * 
 * Populates realistic carbon activities for the current Monday–Sunday week:
 * - Transport (Car, Bus)
 * - Energy (Electricity)
 * - Food (Vegetarian, Non-Vegetarian)
 * - Targets: Daily Limit (5.5 kg CO₂e), Weekly Limit (38.5 kg CO₂e)
 * 
 * Usage:
 *   node server/seedDemo.js
 *   npm run seed
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns');

// Configure reliable DNS servers (Google / Cloudflare) to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // Ignore if not supported in environment
}

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Activity = require('./models/Activity');
const Target = require('./models/Target');
const { calculateCarbon } = require('./services/carbonCalculator');
const { getWeekBounds } = require('./services/dashboardService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carbonmap';

async function seedData() {
  console.log('====================================================');
  console.log('       CARBONMAP MONGODB DEMO DATA SEEDER');
  console.log('====================================================\n');
  console.log(`Connecting to MongoDB: ${MONGODB_URI}...`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✓ Connected to MongoDB database: ${mongoose.connection.name || 'carbonmap'}\n`);

    // Remove existing demo activities
    const deleteResult = await Activity.deleteMany({
      note: { $regex: /\[Demo\]/i },
    });
    if (deleteResult.deletedCount > 0) {
      console.log(`Cleared ${deleteResult.deletedCount} prior demo activities.`);
    }

    const { monday } = getWeekBounds(new Date());

    // Generate date timestamps for each day of the current week
    const getDayDate = (dayOffset, hours, minutes) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + dayOffset);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const demoActivities = [
      // Monday (Total: 5.40 kg CO₂e)
      { type: 'car', quantity: 10, date: getDayDate(0, 8, 30), note: '[Demo] Morning office commute' },
      { type: 'veg_meal', quantity: 1, date: getDayDate(0, 13, 0), note: '[Demo] Vegetarian cafe lunch' },
      { type: 'electricity', quantity: 3, date: getDayDate(0, 19, 30), note: '[Demo] Evening home lighting & laptop' },

      // Tuesday (Total: 5.50 kg CO₂e)
      { type: 'bike', quantity: 15, date: getDayDate(1, 9, 0), note: '[Demo] Motorcycle commute' },
      { type: 'lpg', quantity: 0.5, date: getDayDate(1, 12, 30), note: '[Demo] LPG cylinder gas for cooking' },
      { type: 'non_veg_meal', quantity: 1, date: getDayDate(1, 19, 45), note: '[Demo] Chicken dinner' },

      // Wednesday (Total: 5.20 kg CO₂e)
      { type: 'bus', quantity: 12.5, date: getDayDate(2, 8, 45), note: '[Demo] Public bus transit' },
      { type: 'train', quantity: 20, date: getDayDate(2, 17, 30), note: '[Demo] Metro rail transit' },
      { type: 'electricity', quantity: 3, date: getDayDate(2, 20, 0), note: '[Demo] Home office workstation power' },
      { type: 'veg_meal', quantity: 1, date: getDayDate(2, 13, 15), note: '[Demo] Plant-based lunch' },

      // Thursday (Total: 5.90 kg CO₂e)
      { type: 'car', quantity: 8, date: getDayDate(3, 9, 15), note: '[Demo] Grocery & errands drive' },
      { type: 'wood', quantity: 1, date: getDayDate(3, 18, 0), note: '[Demo] Firewood / wood heating fuel' },
      { type: 'non_veg_meal', quantity: 1, date: getDayDate(3, 20, 30), note: '[Demo] Non-vegetarian family dinner' },

      // Friday (Total: 5.00 kg CO₂e)
      { type: 'bike', quantity: 10, date: getDayDate(4, 8, 30), note: '[Demo] Scooter ride to office' },
      { type: 'electricity', quantity: 2.5, date: getDayDate(4, 18, 45), note: '[Demo] Friday electronics & AC' },
      { type: 'veg_meal', quantity: 2, date: getDayDate(4, 13, 0), note: '[Demo] Vegetarian lunch & light dinner' },

      // Saturday (Total: 4.20 kg CO₂e)
      { type: 'train', quantity: 25, date: getDayDate(5, 11, 0), note: '[Demo] Weekend metro trip to museum' },
      { type: 'coal', quantity: 0.5, date: getDayDate(5, 17, 30), note: '[Demo] Solid coal fuel usage' },
      { type: 'veg_meal', quantity: 2, date: getDayDate(5, 19, 0), note: '[Demo] Home-cooked vegetarian meals' },

      // Sunday (Total: 8.90 kg CO₂e)
      { type: 'flight', quantity: 16, date: getDayDate(6, 10, 0), note: '[Demo] Short regional flight' },
      { type: 'bus', quantity: 10, date: getDayDate(6, 14, 0), note: '[Demo] Airport express bus' },
      { type: 'electricity', quantity: 2, date: getDayDate(6, 21, 0), note: '[Demo] Sunday night lights & devices' },
      { type: 'non_veg_meal', quantity: 1, date: getDayDate(6, 19, 30), note: '[Demo] Sunday non-veg dinner' },
    ];

    const activitiesToInsert = demoActivities.map((item) => {
      const calc = calculateCarbon(item.type, item.quantity);
      return {
        type: calc.type,
        quantity: calc.quantity,
        unit: calc.unit,
        emissionFactor: calc.emissionFactor,
        co2: calc.co2,
        date: item.date,
        note: item.note,
      };
    });

    const inserted = await Activity.insertMany(activitiesToInsert);
    const totalCo2 = inserted.reduce((sum, a) => sum + a.co2, 0).toFixed(2);

    console.log(`✓ Successfully inserted ${inserted.length} realistic activities.`);
    console.log(`✓ Total Week Carbon: ${totalCo2} kg CO₂e\n`);

    // Ensure Target in MongoDB is updated to Daily: 5.5 kg, Weekly: 38.5 kg
    let target = await Target.findOne();
    if (!target) {
      target = await Target.create({ weeklyTarget: 38.5, dailyTarget: 5.5 });
    } else {
      target.weeklyTarget = 38.5;
      target.dailyTarget = 5.5;
      await target.save();
    }

    console.log(`✓ Updated Carbon Limits in MongoDB:`);
    console.log(`   - Daily Limit:  ${target.dailyTarget.toFixed(2)} kg CO₂e`);
    console.log(`   - Weekly Limit: ${target.weeklyTarget.toFixed(2)} kg CO₂e\n`);

    console.log('====================================================');
    console.log('       DEMO DATA SEEDING COMPLETE!');
    console.log('====================================================');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedData();
