/**
 * Assign zone to user
 * Run: node assignUserZone.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Zone = require('./models/Zone');
require('dotenv').config();

async function assignUserZone() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all zones
    const zones = await Zone.find({});
    console.log('📍 Available Zones:');
    zones.forEach((zone, index) => {
      console.log(`   ${index + 1}. ${zone.name} (${zone._id})`);
    });
    console.log('');

    // Get users without zones
    const usersWithoutZone = await User.find({ 
      zone: { $exists: false }
    }).or([
      { zone: null },
      { zone: { $exists: false } }
    ]);

    console.log(`👥 Found ${usersWithoutZone.length} users without zones:\n`);

    if (usersWithoutZone.length === 0) {
      console.log('✅ All users already have zones assigned!');
      process.exit(0);
    }

    // Assign first zone to all users without zones
    const defaultZone = zones[0];
    console.log(`🎯 Assigning all users to zone: ${defaultZone.name}\n`);

    let updated = 0;
    for (const user of usersWithoutZone) {
      console.log(`   Updating: ${user.name} (${user.email}) - ${user.role}`);
      user.zone = defaultZone._id;
      await user.save();
      updated++;
    }

    console.log(`\n✅ Updated ${updated} users with zone: ${defaultZone.name}`);
    console.log('\n💡 Users can now book appointments!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

assignUserZone();
