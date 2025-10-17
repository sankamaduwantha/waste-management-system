/**
 * Test Zone Assignment Functionality
 * Run: node testZoneAssignment.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Zone = require('./models/Zone');
const Resident = require('./models/Resident');
require('dotenv').config();

async function testZoneAssignment() {
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

    // Get all users
    const users = await User.find({})
      .select('name email role zone')
      .populate('zone', 'name');

    console.log('👥 User Zone Status:');
    console.log('='.repeat(80));
    
    let withZone = 0;
    let withoutZone = 0;

    for (const user of users) {
      const hasZone = user.zone ? '✅' : '❌';
      const zoneName = user.zone ? user.zone.name : 'No Zone';
      
      console.log(`${hasZone} ${user.name.padEnd(25)} | ${user.role.padEnd(20)} | ${zoneName}`);
      
      if (user.zone) {
        withZone++;
      } else {
        withoutZone++;
      }
    }

    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   With Zone: ${withZone} (${((withZone/users.length)*100).toFixed(1)}%)`);
    console.log(`   Without Zone: ${withoutZone} (${((withoutZone/users.length)*100).toFixed(1)}%)`);

    // Check residents specifically
    const residents = await User.find({ role: 'resident' })
      .select('name email zone')
      .populate('zone', 'name');

    const residentsWithoutZone = residents.filter(r => !r.zone);
    
    console.log(`\n👤 Residents:`);
    console.log(`   Total Residents: ${residents.length}`);
    console.log(`   Residents with Zone: ${residents.length - residentsWithoutZone.length}`);
    console.log(`   Residents without Zone: ${residentsWithoutZone.length}`);

    if (residentsWithoutZone.length > 0) {
      console.log('\n⚠️  Residents without zones:');
      residentsWithoutZone.forEach(r => {
        console.log(`   - ${r.name} (${r.email})`);
      });
    }

    // Check Resident model sync
    console.log('\n🔄 Checking User-Resident Model Sync:');
    const residentUsers = await User.find({ role: 'resident' }).select('_id zone');
    
    let synced = 0;
    let notSynced = 0;

    for (const userDoc of residentUsers) {
      const residentDoc = await Resident.findOne({ user: userDoc._id });
      if (residentDoc) {
        const userZone = userDoc.zone?.toString();
        const residentZone = residentDoc.zone?.toString();
        
        if (userZone === residentZone) {
          synced++;
        } else {
          notSynced++;
          console.log(`   ⚠️  Mismatch for user ${userDoc._id}:`);
          console.log(`      User.zone: ${userZone || 'null'}`);
          console.log(`      Resident.zone: ${residentZone || 'null'}`);
        }
      }
    }

    console.log(`   Synced: ${synced}`);
    console.log(`   Not Synced: ${notSynced}`);

    // Test zone assignment API endpoints info
    console.log('\n\n' + '='.repeat(80));
    console.log('📚 API ENDPOINTS FOR ZONE ASSIGNMENT');
    console.log('='.repeat(80));
    console.log('\n1️⃣  Assign Zone to Single User:');
    console.log('   PATCH /api/v1/users/:userId/assign-zone');
    console.log('   Body: { "zoneId": "68f210fe84fe8f7bf19f268e" }');
    console.log('\n2️⃣  Bulk Assign Zones:');
    console.log('   POST /api/v1/users/bulk/assign-zones');
    console.log('   Body: {');
    console.log('     "assignments": [');
    console.log('       { "userId": "...", "zoneId": "..." },');
    console.log('       { "userId": "...", "zoneId": "..." }');
    console.log('     ]');
    console.log('   }');
    console.log('\n🔐 Access: Admin, City Manager only');
    console.log('='.repeat(80));

    if (withoutZone > 0) {
      console.log('\n💡 TIP: Run assignUserZone.js to assign zones to all users');
      console.log('   Command: node assignUserZone.js');
    } else {
      console.log('\n✅ All users have zones assigned!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testZoneAssignment();
