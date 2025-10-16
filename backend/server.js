const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import models to ensure they're registered with Mongoose
require('./models/Zone');
require('./models/User');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const residentRoutes = require('./routes/residentRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const binRoutes = require('./routes/binRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const wasteDataRoutes = require('./routes/wasteDataRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const plasticReductionRoutes = require('./routes/plasticReductionRoutes');
const wasteEntryRoutes = require('./routes/wasteEntryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Import scheduled jobs
const { scheduleNotifications } = require('./jobs/notificationJobs');
const { updateBinStatus } = require('./jobs/binJobs');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Apply rate limiting to all routes
app.use('/api/', rateLimiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log(' MongoDB connected successfully');
  
  // Start scheduled jobs after DB connection
  scheduleNotifications();
  updateBinStatus();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/residents`, residentRoutes);
app.use(`/api/${API_VERSION}/schedules`, scheduleRoutes);
app.use(`/api/${API_VERSION}/vehicles`, vehicleRoutes);
app.use(`/api/${API_VERSION}/bins`, binRoutes);
app.use(`/api/${API_VERSION}/service-requests`, serviceRequestRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/waste-data`, wasteDataRoutes);
app.use(`/api/${API_VERSION}/zones`, zoneRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/plastic-suggestions`, plasticReductionRoutes);
app.use(`/api/${API_VERSION}/waste-entries`, wasteEntryRoutes);
app.use(`/api/${API_VERSION}/appointments`, appointmentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/${API_VERSION}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
