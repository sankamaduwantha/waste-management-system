/**
 * @fileoverview Setup Script for Appointment Booking
 * @description Creates default zone and time slot configurations for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Models
const Zone = require('./models/Zone');
const TimeSlotConfig = require('./models/TimeSlotConfig');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create default zones
const createDefaultZones = async () => {
  try {
    const zoneCount = await Zone.countDocuments();
    
    if (zoneCount > 0) {
      console.log('ℹ️  Zones already exist, skipping...');
      return;
    }

    const zones = [
      {
        name: 'Zone A - North District',
        code: 'ZA',
        district: 'North District',
        city: 'Main City',
        state: 'State',
        area: 25.5, // square kilometers
        population: 5000,
        stats: {
          totalHouseholds: 1500,
          totalBins: 150,
          averageWastePerDay: 500,
          recyclingRate: 35
        }
      },
      {
        name: 'Zone B - South District',
        code: 'ZB',
        district: 'South District',
        city: 'Main City',
        state: 'State',
        area: 30.2, // square kilometers
        population: 6000,
        stats: {
          totalHouseholds: 1800,
          totalBins: 180,
          averageWastePerDay: 600,
          recyclingRate: 40
        }
      }
    ];

    const createdZones = await Zone.insertMany(zones);
    console.log(`✅ Created ${createdZones.length} default zones`);
    return createdZones;
  } catch (error) {
    console.error('❌ Error creating zones:', error);
    throw error;
  }
};

// Create time slot configurations
const createTimeSlotConfigs = async (zones) => {
  try {
    const configCount = await TimeSlotConfig.countDocuments();
    
    if (configCount > 0) {
      console.log('ℹ️  Time slot configs already exist, skipping...');
      return;
    }

    // Default time slots for each zone
    const defaultSlots = [
      { start: '08:00', end: '09:00', capacity: 10 },
      { start: '09:00', end: '10:00', capacity: 10 },
      { start: '10:00', end: '11:00', capacity: 10 },
      { start: '11:00', end: '12:00', capacity: 10 },
      { start: '13:00', end: '14:00', capacity: 10 },
      { start: '14:00', end: '15:00', capacity: 10 },
      { start: '15:00', end: '16:00', capacity: 10 },
      { start: '16:00', end: '17:00', capacity: 10 },
    ];

    const configs = [];
    
    for (const zone of zones) {
      // Create config for each day of the week
      for (let day = 0; day <= 6; day++) {
        configs.push({
          zone: zone._id,
          dayOfWeek: day,
          slots: defaultSlots.map(slot => ({
            ...slot,
            isActive: day !== 0 // Not active on Sunday (day 0)
          })),
          isActive: day !== 0, // Not active on Sunday
          holidays: [],
          specialDates: []
        });
      }
    }

    const createdConfigs = await TimeSlotConfig.insertMany(configs);
    console.log(`✅ Created ${createdConfigs.length} time slot configurations`);
    return createdConfigs;
  } catch (error) {
    console.error('❌ Error creating time slot configs:', error);
    throw error;
  }
};

// Update existing residents to have a zone
const assignZonesToResidents = async (defaultZone) => {
  try {
    const Resident = require('./models/Resident');
    
    // Find residents without a zone
    const residentsWithoutZone = await Resident.find({ zone: { $exists: false } });
    
    if (residentsWithoutZone.length === 0) {
      console.log('ℹ️  All residents already have zones assigned');
      return;
    }

    // Assign default zone to residents without one
    const result = await Resident.updateMany(
      { zone: { $exists: false } },
      { $set: { zone: defaultZone._id } }
    );

    console.log(`✅ Assigned default zone to ${result.modifiedCount} residents`);
  } catch (error) {
    console.error('❌ Error assigning zones to residents:', error);
    // Don't throw - this is optional
  }
};

// Main setup function
const setupAppointmentSystem = async () => {
  try {
    console.log('🚀 Starting appointment system setup...\n');

    await connectDB();

    // Create zones
    console.log('📍 Setting up zones...');
    const zones = await createDefaultZones();
    const defaultZone = zones && zones.length > 0 ? zones[0] : await Zone.findOne();

    if (!defaultZone) {
      throw new Error('No zones available. Please create zones first.');
    }

    // Create time slot configurations
    console.log('\n⏰ Setting up time slot configurations...');
    await createTimeSlotConfigs([defaultZone]);

    // Assign zones to residents
    console.log('\n👥 Assigning zones to residents...');
    await assignZonesToResidents(defaultZone);

    console.log('\n✅ Appointment system setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Default Zone ID: ${defaultZone._id}`);
    console.log(`   - Zone Name: ${defaultZone.name}`);
    console.log(`   - Zone Code: ${defaultZone.code}`);
    console.log('   - Time slots: Monday-Saturday, 8:00 AM - 5:00 PM');
    console.log('   - Capacity: 10 appointments per hour\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
};

// Run setup
setupAppointmentSystem();
