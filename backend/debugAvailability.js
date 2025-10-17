/**
 * Debug script to test appointment availability
 * Run: node debugAvailability.js
 */

const mongoose = require('mongoose');
const TimeSlotConfig = require('./models/TimeSlotConfig');
const User = require('./models/User');
const Zone = require('./models/Zone');
const Appointment = require('./models/Appointment');
require('dotenv').config();

async function debugAvailability() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Test date (Saturday, Oct 18, 2025)
    const testDate = new Date('2025-10-18');
    const dayOfWeek = testDate.getDay(); // 6 = Saturday
    
    console.log('📅 Testing Date:', testDate.toISOString().split('T')[0]);
    console.log('📅 Day of Week:', dayOfWeek, '(Saturday)');
    console.log('');

    // Get all zones
    const zones = await Zone.find({});
    console.log(`📍 Found ${zones.length} zones:`);
    zones.forEach(z => console.log(`   - ${z.name} (${z._id})`));
    console.log('');

    // Get all TimeSlotConfigs
    const allConfigs = await TimeSlotConfig.find({});
    console.log(`⚙️  Total TimeSlotConfigs: ${allConfigs.length}`);
    console.log('');

    // Test each zone
    for (const zone of zones) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing Zone: ${zone.name} (${zone._id})`);
      console.log('='.repeat(60));

      // Get config for Saturday
      const config = await TimeSlotConfig.findOne({ 
        zone: zone._id, 
        dayOfWeek: dayOfWeek,
        isActive: true 
      });

      if (!config) {
        console.log('❌ No TimeSlotConfig found for Saturday');
        
        // Check if ANY config exists for this zone
        const anyConfig = await TimeSlotConfig.findOne({ zone: zone._id });
        if (anyConfig) {
          console.log(`   ℹ️  Config exists for day: ${anyConfig.dayOfWeek} (${anyConfig.dayName})`);
        } else {
          console.log('   ❌ No config exists for this zone at all!');
        }
        continue;
      }

      console.log(`✅ Config found: ${config.dayName}`);
      console.log(`   Active: ${config.isActive}`);
      console.log(`   Slots: ${config.slots.length}`);
      console.log('');

      // Check if date is available
      const isAvailable = config.isDateAvailable(testDate);
      console.log(`📅 Is ${testDate.toISOString().split('T')[0]} available?`, isAvailable);
      
      if (!isAvailable) {
        if (config.isHoliday(testDate)) {
          console.log('   ❌ Date is a holiday');
        }
        const specialConfig = config.getSpecialDateConfig(testDate);
        if (specialConfig) {
          console.log('   ⚠️  Special date config:', specialConfig);
        }
        continue;
      }

      // Get slots for date
      const slots = config.getSlotsForDate(testDate);
      console.log(`\n⏰ Available Slots for ${testDate.toISOString().split('T')[0]}:`);
      slots.forEach(slot => {
        console.log(`   ${slot.start} - ${slot.end} (Capacity: ${slot.capacity})`);
      });

      // Check existing appointments
      const existingAppointments = await Appointment.find({
        appointmentDate: {
          $gte: new Date(testDate.setHours(0, 0, 0, 0)),
          $lt: new Date(testDate.setHours(23, 59, 59, 999)),
        },
        status: { $ne: 'cancelled' },
      });

      console.log(`\n📋 Existing appointments: ${existingAppointments.length}`);
      
      // Calculate availability per slot
      console.log('\n📊 Slot Availability:');
      for (const slot of slots) {
        const slotAppointments = existingAppointments.filter(apt => 
          apt.timeSlot === slot.start
        );
        const available = slot.capacity - slotAppointments.length;
        console.log(`   ${slot.start}-${slot.end}: ${available}/${slot.capacity} available`);
      }
    }

    // Get a resident user to test
    console.log('\n\n' + '='.repeat(60));
    console.log('Testing User Zone Assignment');
    console.log('='.repeat(60));
    
    const residents = await User.find({ role: 'resident' }).limit(3);
    console.log(`\nFound ${residents.length} resident users:`);
    
    for (const user of residents) {
      const resident = await mongoose.model('Resident').findOne({ user: user._id });
      console.log(`\n👤 ${user.name} (${user.email})`);
      if (resident && resident.zone) {
        const zone = await Zone.findById(resident.zone);
        console.log(`   ✅ Zone: ${zone.name} (${zone._id})`);
        
        // Check if this zone has Saturday config
        const satConfig = await TimeSlotConfig.findOne({
          zone: resident.zone,
          dayOfWeek: 6,
          isActive: true
        });
        console.log(`   ${satConfig ? '✅' : '❌'} Saturday config: ${satConfig ? 'EXISTS' : 'MISSING'}`);
      } else {
        console.log('   ❌ No zone assigned!');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

debugAvailability();
