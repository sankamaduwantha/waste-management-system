const cron = require('node-cron');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Resident = require('../models/Resident');
const { createNotification } = require('../utils/notificationService');

// Send collection reminders (runs daily at 6 PM)
exports.scheduleNotifications = () => {
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('Running collection reminder job...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      // Get tomorrow's schedules
      const schedules = await Schedule.find({
        collectionDay: dayName,
        isActive: true,
        status: 'scheduled'
      }).populate('zone');
      
      for (const schedule of schedules) {
        // Get residents in this zone
        const residents = await User.find({
          zone: schedule.zone._id,
          role: 'resident',
          status: 'active'
        });
        
        // Send notification to each resident
        for (const resident of residents) {
          await createNotification({
            recipient: resident._id,
            type: 'collection_reminder',
            title: 'Waste Collection Tomorrow',
            message: `Your ${schedule.wasteType} waste will be collected tomorrow between ${schedule.timeSlot.start} and ${schedule.timeSlot.end}. Please place your bins outside.`,
            priority: 'high',
            data: {
              scheduleId: schedule._id,
              wasteType: schedule.wasteType
            }
          });
        }
      }
      
      console.log('Collection reminders sent successfully');
    } catch (error) {
      console.error('Error sending collection reminders:', error);
    }
  });
  
  console.log('✅ Notification scheduler started');
};

// Send payment reminders (runs on 1st and 15th of each month at 9 AM)
exports.paymentReminders = () => {
  cron.schedule('0 9 1,15 * *', async () => {
    try {
      console.log('Running payment reminder job...');
      
      const residents = await Resident.find({
        'paymentInfo.paymentStatus': 'pending'
      }).populate('user');
      
      for (const resident of residents) {
        if (resident.user) {
          await createNotification({
            recipient: resident.user._id,
            type: 'payment_due',
            title: 'Payment Reminder',
            message: `Your monthly waste collection fee of $${resident.paymentInfo.monthlyFee} is due. Please make payment to avoid service interruption.`,
            priority: 'medium'
          });
        }
      }
      
      console.log('Payment reminders sent successfully');
    } catch (error) {
      console.error('Error sending payment reminders:', error);
    }
  });
};
