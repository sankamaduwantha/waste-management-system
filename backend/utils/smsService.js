const twilio = require('twilio');

// Initialize Twilio client only if credentials are provided
let client = null;

const initializeClient = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return null;
};

// Send SMS
exports.sendSMS = async (to, message) => {
  // Initialize client if not already done
  if (!client) {
    client = initializeClient();
  }

  // If no client available, log warning and skip
  if (!client) {
    console.warn('⚠️ SMS service not configured. SMS not sent to:', to);
    return { sid: 'sms-not-configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('✅ SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    throw error;
  }
};

// SMS templates
exports.smsTemplates = {
  collectionReminder: (wasteType, date) => 
    `Reminder: Your ${wasteType} waste collection is scheduled for ${date}. Please place bins outside by 7 AM.`,
  
  serviceRequestUpdate: (requestNumber, status) =>
    `Service Request #${requestNumber} updated to: ${status}. Check your dashboard for details.`,
  
  paymentReminder: (amount, dueDate) =>
    `Payment reminder: $${amount} is due on ${dueDate}. Pay online to avoid late fees.`,
  
  binFull: (binId, location) =>
    `Alert: Bin ${binId} at ${location} is full. Collection needed.`
};
