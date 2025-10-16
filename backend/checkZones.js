const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Resident = require('./models/Resident');
const Zone = require('./models/Zone');

async function checkZones() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all zones
    const zones = await Zone.find();
    console.log('📍 Zones in database:');
    zones.forEach(zone => {
      console.log(`  - ${zone.name} (${zone.code}): ${zone._id}`);
    });
    console.log('');

    // Check all resident users
    const users = await User.find({ role: 'resident' }).select('name email zone');
    console.log('👥 Resident Users:');
    for (const user of users) {
      console.log(`\n  User: ${user.name} (${user.email})`);
      console.log(`  User Zone: ${user.zone || 'NOT SET'}`);
      
      const resident = await Resident.findOne({ user: user._id });
      if (resident) {
        console.log(`  Resident ID: ${resident._id}`);
        console.log(`  Resident Zone ID: ${resident.zone || 'NOT SET'}`);
        
        if (resident.zone) {
          const zone = await Zone.findById(resident.zone);
          if (zone) {
            console.log(`  Zone Name: ${zone.name} (${zone.code})`);
          }
        }
      } else {
        console.log(`  ❌ No Resident record found for this user!`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkZones();
