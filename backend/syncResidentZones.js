/**
 * Sync User and Resident zone assignments
 * Run: node syncResidentZones.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Resident = require('./models/Resident');
require('dotenv').config();

async function syncResidentZones() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all resident users
    const residentUsers = await User.find({ role: 'resident' })
      .select('_id name email zone');

    console.log(`👥 Found ${residentUsers.length} resident users\n`);

    let updated = 0;
    let skipped = 0;
    let created = 0;

    for (const user of residentUsers) {
      console.log(`Processing: ${user.name} (${user.email})`);

      // Find or create resident document
      let resident = await Resident.findOne({ user: user._id });

      if (!resident) {
        console.log(`   ⚠️  No Resident document found, creating one...`);
        resident = await Resident.create({
          user: user._id,
          zone: user.zone,
          address: 'N/A',
          wasteGenerationRate: 0
        });
        console.log(`   ✅ Created Resident document with zone`);
        created++;
      } else if (resident.zone?.toString() !== user.zone?.toString()) {
        console.log(`   🔄 Syncing zone: ${resident.zone} → ${user.zone}`);
        resident.zone = user.zone;
        await resident.save();
        console.log(`   ✅ Zone synced`);
        updated++;
      } else {
        console.log(`   ✅ Already synced`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Residents: ${residentUsers.length}`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Already Synced: ${skipped}`);
    console.log('='.repeat(60));

    console.log('\n✅ Sync completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

syncResidentZones();
