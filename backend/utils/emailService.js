const nodemailer = require('nodemailer');

// Create transporter only if email config is provided
let transporter = null;

const initializeTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return null;
};

// Send email
exports.sendEmail = async (options) => {
  // Initialize transporter if not already done
  if (!transporter) {
    transporter = initializeTransporter();
  }

  // If no transporter available, log warning and skip
  if (!transporter) {
    console.warn('⚠️ Email service not configured. Email not sent to:', options.to);
    return { messageId: 'email-not-configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

// Email templates
exports.emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Waste Management System',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our waste management platform.</p>
      <p>You can now access your dashboard and start managing your waste collection services.</p>
    `
  }),
  
  collectionReminder: (name, date, wasteType) => ({
    subject: 'Waste Collection Reminder',
    html: `
      <h2>Hi ${name},</h2>
      <p>This is a reminder that your <strong>${wasteType}</strong> waste will be collected on <strong>${date}</strong>.</p>
      <p>Please ensure your bins are placed outside by 7:00 AM.</p>
    `
  }),
  
  serviceRequestUpdate: (requestNumber, status) => ({
    subject: `Service Request ${requestNumber} - Status Update`,
    html: `
      <h2>Service Request Update</h2>
      <p>Your service request <strong>#${requestNumber}</strong> status has been updated to: <strong>${status}</strong></p>
      <p>Login to your dashboard for more details.</p>
    `
  }),
  
  paymentConfirmation: (amount, transactionId) => ({
    subject: 'Payment Confirmation',
    html: `
      <h2>Payment Successful</h2>
      <p>Your payment of <strong>$${amount}</strong> has been successfully processed.</p>
      <p>Transaction ID: ${transactionId}</p>
      <p>Thank you for your payment!</p>
    `
  })
};
