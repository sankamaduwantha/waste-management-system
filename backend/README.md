# Waste Management System - Backend

Backend API for the Urban Waste Management System built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Real-time Updates**: Socket.io integration for live notifications
- **RESTful API**: Well-structured API endpoints for all operations
- **Database Models**: Comprehensive Mongoose schemas for all entities
- **Scheduled Jobs**: Automated notifications and data processing
- **Email & SMS**: Notification system with multiple channels
- **Payment Integration**: Stripe payment gateway support
- **File Uploads**: Cloudinary integration for image storage
- **Security**: Helmet, rate limiting, input validation
- **Error Handling**: Centralized error handling middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Redis (optional, for caching)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   copy .env.example .env
   ```
   Then edit `.env` with your configuration values.

4. **Start MongoDB**
   - Local: Ensure MongoDB service is running
   - Atlas: Use connection string in `.env`

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── authController.js    # Controller logic
├── jobs/
│   ├── notificationJobs.js  # Scheduled notification tasks
│   └── binJobs.js           # Bin monitoring tasks
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── rateLimiter.js       # Rate limiting
│   └── validator.js         # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Resident.js          # Resident profile schema
│   ├── Zone.js              # Zone/area schema
│   ├── Schedule.js          # Collection schedule schema
│   ├── Vehicle.js           # Vehicle schema
│   ├── Bin.js               # Bin schema
│   ├── ServiceRequest.js    # Service request schema
│   ├── Payment.js           # Payment schema
│   ├── WasteData.js         # Waste analytics schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── userRoutes.js        # User management routes
│   ├── residentRoutes.js    # Resident routes
│   ├── scheduleRoutes.js    # Schedule routes
│   ├── vehicleRoutes.js     # Vehicle routes
│   ├── binRoutes.js         # Bin routes
│   ├── serviceRequestRoutes.js
│   ├── paymentRoutes.js
│   ├── wasteDataRoutes.js
│   ├── zoneRoutes.js
│   ├── dashboardRoutes.js
│   └── notificationRoutes.js
├── utils/
│   ├── emailService.js      # Email utility
│   ├── smsService.js        # SMS utility
│   └── notificationService.js # Notification utility
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── server.js                # Main entry point
```

## 🔐 API Endpoints

### Authentication
```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - Login user
GET    /api/v1/auth/me                - Get current user
POST   /api/v1/auth/logout            - Logout user
POST   /api/v1/auth/forgot-password   - Request password reset
PUT    /api/v1/auth/reset-password    - Reset password
PUT    /api/v1/auth/update-password   - Update password
```

### Users
```
GET    /api/v1/users                  - Get all users (Admin)
GET    /api/v1/users/:id              - Get single user
PUT    /api/v1/users/:id              - Update user
DELETE /api/v1/users/:id              - Delete user
```

### Service Requests
```
GET    /api/v1/service-requests       - Get all requests
POST   /api/v1/service-requests       - Create request
GET    /api/v1/service-requests/:id   - Get single request
PUT    /api/v1/service-requests/:id   - Update request
POST   /api/v1/service-requests/:id/feedback - Submit feedback
```

### Schedules
```
GET    /api/v1/schedules              - Get all schedules
POST   /api/v1/schedules              - Create schedule
GET    /api/v1/schedules/:id          - Get schedule
PUT    /api/v1/schedules/:id          - Update schedule
DELETE /api/v1/schedules/:id          - Delete schedule
```

### Vehicles
```
GET    /api/v1/vehicles               - Get all vehicles
POST   /api/v1/vehicles               - Create vehicle
GET    /api/v1/vehicles/tracking      - Get tracking data
GET    /api/v1/vehicles/:id           - Get vehicle
PUT    /api/v1/vehicles/:id           - Update vehicle
```

### Bins
```
GET    /api/v1/bins                   - Get all bins
POST   /api/v1/bins                   - Create bin
GET    /api/v1/bins/smart-bins        - Get smart bin data
GET    /api/v1/bins/:id               - Get bin
PUT    /api/v1/bins/:id               - Update bin
```

### Payments
```
GET    /api/v1/payments               - Get all payments
POST   /api/v1/payments/create-payment - Create payment
GET    /api/v1/payments/my-payments   - Get user payments
GET    /api/v1/payments/:id           - Get payment
```

### Waste Data
```
GET    /api/v1/waste-data             - Get all waste data
POST   /api/v1/waste-data             - Create waste data
GET    /api/v1/waste-data/analytics   - Get analytics
GET    /api/v1/waste-data/environmental-impact - Get impact
```

### Zones
```
GET    /api/v1/zones                  - Get all zones
POST   /api/v1/zones                  - Create zone
GET    /api/v1/zones/:id              - Get zone
PUT    /api/v1/zones/:id              - Update zone
DELETE /api/v1/zones/:id              - Delete zone
```

### Dashboard
```
GET    /api/v1/dashboard/resident     - Resident dashboard
GET    /api/v1/dashboard/city-manager - City manager dashboard
GET    /api/v1/dashboard/admin        - Admin dashboard
GET    /api/v1/dashboard/sustainability - Sustainability dashboard
```

## 👥 User Roles

- **resident**: End users who generate waste
- **city_manager**: Operations team managing collection
- **admin**: System administrators
- **sustainability_manager**: Strategic planning and analytics

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- Helmet for security headers
- CORS configuration
- Role-based access control (RBAC)

## 📧 Notifications

The system supports multiple notification channels:
- **Email**: via Nodemailer
- **SMS**: via Twilio
- **Push**: via Socket.io
- **In-app**: stored in database

## ⏰ Scheduled Jobs

- **Collection Reminders**: Daily at 6 PM
- **Payment Reminders**: 1st and 15th of each month at 9 AM
- **Bin Status Check**: Every 2 hours

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions, please contact the development team.
