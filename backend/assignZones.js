const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Zone = require('./models/Zone');

async function assignZones() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get zones
    const zones = await Zone.find();
    if (zones.length === 0) {
      console.log('❌ No zones found in database!');
      process.exit(1);
    }

    console.log(`📍 Found ${zones.length} zones:`);
    zones.forEach(zone => {
      console.log(`  - ${zone.name} (${zone.code}): ${zone._id}`);
    });
    console.log('');

    // Get all resident users
    const users = await User.find({ role: 'resident' });
    console.log(`👥 Found ${users.length} resident users\n`);

    // Assign zones alternating between available zones
    let zoneIndex = 0;
    for (const user of users) {
      const zone = zones[zoneIndex % zones.length];
      user.zone = zone._id;
      await user.save();
      
      console.log(`✅ Assigned ${zone.name} to user ${user.email}`);
      
      zoneIndex++;
    }

    console.log(`\n🎉 Successfully assigned zones to ${users.length} users!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignZones();
