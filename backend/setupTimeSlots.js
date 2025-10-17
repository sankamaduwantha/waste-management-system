/**
 * @fileoverview Setup Time Slots Configuration Script
 * @description Seeds TimeSlotConfig documents for all zones
 * 
 * Run this script to initialize appointment time slots:
 * node setupTimeSlots.js
 */

const mongoose = require('mongoose');
const TimeSlotConfig = require('./models/TimeSlotConfig');
const Zone = require('./models/Zone');
require('dotenv').config();

/**
 * Initialize time slots for all zones
 */
async function setupTimeSlots() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all zones
    console.log('📍 Fetching all zones...');
    const zones = await Zone.find({});
    
    if (zones.length === 0) {
      console.log('❌ No zones found. Please create zones first.');
      process.exit(1);
    }

    console.log(`✅ Found ${zones.length} zones:\n`);
    zones.forEach((zone, index) => {
      console.log(`   ${index + 1}. ${zone.name} (ID: ${zone._id})`);
    });
    console.log('');

    let totalCreated = 0;
    let totalSkipped = 0;

    // Create time slots for each zone
    for (const zone of zones) {
      console.log(`\n📅 Setting up time slots for zone: ${zone.name}`);
      
      // Check if time slots already exist
      const existingConfigs = await TimeSlotConfig.find({ zone: zone._id });
      
      if (existingConfigs.length > 0) {
        console.log(`   ⚠️  ${existingConfigs.length} configurations already exist. Skipping...`);
        totalSkipped += existingConfigs.length;
        continue;
      }

      // Initialize default slots (Monday-Saturday)
      const configs = await TimeSlotConfig.initializeDefaultSlots(zone._id, null);
      
      console.log(`   ✅ Created ${configs.length} day configurations:`);
      
      configs.forEach(config => {
        console.log(`      • ${config.dayName}: ${config.activeSlotCount} slots (Total capacity: ${config.totalCapacity})`);
      });

      totalCreated += configs.length;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total zones processed: ${zones.length}`);
    console.log(`Total configurations created: ${totalCreated}`);
    console.log(`Total configurations skipped: ${totalSkipped}`);
    console.log('='.repeat(60));
    
    console.log('\n✅ Time slot setup completed successfully!');
    
    // Display default schedule
    console.log('\n📋 DEFAULT SCHEDULE:');
    console.log('   Monday - Friday:');
    console.log('      • 09:00-10:00 (Capacity: 10)');
    console.log('      • 10:00-11:00 (Capacity: 10)');
    console.log('      • 11:00-12:00 (Capacity: 10)');
    console.log('      • 14:00-15:00 (Capacity: 10)');
    console.log('      • 15:00-16:00 (Capacity: 10)');
    console.log('      • 16:00-17:00 (Capacity: 10)');
    console.log('\n   Saturday:');
    console.log('      • 09:00-10:00 (Capacity: 5)');
    console.log('      • 10:00-11:00 (Capacity: 5)');
    console.log('      • 11:00-12:00 (Capacity: 5)');
    console.log('\n   Sunday: No appointments available');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up time slots:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupTimeSlots();
