const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('./emailService');
const { sendSMS, smsTemplates } = require('./smsService');

// Create notification
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Get user preferences
    const user = await require('../models/User').findById(data.recipient);
    
    if (!user) return notification;
    
    // Send via enabled channels
    if (user.preferences.emailNotifications && user.email) {
      await sendEmailNotification(user.email, data);
      notification.channels.email.sent = true;
      notification.channels.email.sentAt = new Date();
    }
    
    if (user.preferences.smsNotifications && user.phone) {
      await sendSMSNotification(user.phone, data);
      notification.channels.sms.sent = true;
      notification.channels.sms.sentAt = new Date();
    }
    
    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(data.recipient.toString()).emit('notification', notification);
      notification.channels.push.sent = true;
      notification.channels.push.sentAt = new Date();
    }
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

// Send email notification
const sendEmailNotification = async (email, data) => {
  try {
    await sendEmail({
      to: email,
      subject: data.title,
      text: data.message,
      html: `<h3>${data.title}</h3><p>${data.message}</p>`
    });
  } catch (error) {
    console.error('Email notification error:', error);
  }
};

// Send SMS notification
const sendSMSNotification = async (phone, data) => {
  try {
    await sendSMS(phone, `${data.title}: ${data.message}`);
  } catch (error) {
    console.error('SMS notification error:', error);
  }
};

// Bulk notification
exports.sendBulkNotification = async (recipients, data) => {
  const notifications = recipients.map(recipientId => ({
    ...data,
    recipient: recipientId
  }));
  
  return Promise.all(
    notifications.map(notif => this.createNotification(notif))
  );
};
