const cron = require('node-cron');
const Bin = require('../models/Bin');
const { createNotification } = require('../utils/notificationService');
const User = require('../models/User');

// Check bin status and alert for full bins (runs every 2 hours)
exports.updateBinStatus = () => {
  cron.schedule('0 */2 * * *', async () => {
    try {
      console.log('Checking bin status...');
      
      // Find bins that need collection (80%+ full)
      const fullBins = await Bin.find({
        currentFillLevel: { $gte: 80 },
        status: 'active'
      }).populate('zone');
      
      for (const bin of fullBins) {
        // Update bin status
        bin.status = 'full';
        await bin.save();
        
        // Notify city managers for this zone
        if (bin.zone) {
          const managers = await User.find({
            role: 'city_manager',
            zone: bin.zone._id,
            status: 'active'
          });
          
          for (const manager of managers) {
            await createNotification({
              recipient: manager._id,
              type: 'bin_full',
              title: 'Bin Full Alert',
              message: `Bin ${bin.binId} at ${bin.location.address} is ${bin.currentFillLevel}% full and requires immediate collection.`,
              priority: 'high',
              data: {
                binId: bin._id,
                fillLevel: bin.currentFillLevel
              }
            });
          }
        }
      }
      
      console.log(`Checked ${fullBins.length} full bins`);
    } catch (error) {
      console.error('Error checking bin status:', error);
    }
  });
  
  console.log('✅ Bin status checker started');
};
