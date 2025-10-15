<<<<<<< HEAD
# waste-management-system
3rd year project
=======
# 🗑️ Urban Waste Management System

A comprehensive full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to modernize and optimize waste management operations in urban areas through digital transformation, real-time monitoring, and data-driven decision making.

## 🎯 Project Overview

This system serves four main stakeholder groups:
- **Residents**: Easy waste disposal scheduling, service requests, and gamification
- **City Managers**: Fleet management, route optimization, and operational monitoring
- **Administrators**: User management, system configuration, and zone management
- **Sustainability Managers**: Analytics, environmental impact tracking, and reporting

## ✨ Key Features

### For Residents
- 📅 Personalized collection schedules with notifications
- 📍 Service request portal (missed collections, bulk pickup, complaints)
- 🏆 Gamification system with points and rewards
- 📊 Personal recycling statistics and environmental impact
- 💳 Online payment integration
- 📚 Educational resources on waste management

### For City Managers
- 🚛 Real-time fleet tracking and management
- 🗺️ Dynamic route optimization
- 🗑️ Smart bin monitoring with IoT integration
- 👷 Workforce management and assignment
- 📋 Service request handling and dispatch
- 📊 Operational dashboards and analytics

### For Administrators
- 👥 Comprehensive user management with RBAC
- 🏘️ Zone and area configuration
- ⚙️ System settings and customization
- 🔐 Security and compliance management
- 📄 Content management system
- 🔔 System monitoring and alerts

### For Sustainability Managers
- 📈 Advanced waste analytics and forecasting
- 🌍 Environmental impact metrics (CO2, energy savings)
- 💰 Cost-benefit analysis and ROI tracking
- 🎯 Goal setting and KPI monitoring
- 📊 Comparative analysis and benchmarking
- 📋 Compliance and regulatory reporting

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **SMS**: Twilio
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Caching**: Redis
- **Scheduling**: node-cron

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **API Client**: Axios
- **Data Fetching**: React Query
- **Maps**: React Leaflet
- **Charts**: Recharts, Chart.js
- **Notifications**: React Toastify

## 📁 Project Structure

```
Waste Management System/
├── backend/                    # Node.js/Express backend
│   ├── config/                 # Database & app configuration
│   ├── controllers/            # Request handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth, validation, error handling
│   ├── utils/                  # Email, SMS, notifications
│   ├── jobs/                   # Scheduled tasks
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   ├── server.js               # Entry point
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── resident/       # Resident pages
│   │   │   ├── city-manager/   # City manager pages
│   │   │   ├── admin/          # Admin pages
│   │   │   └── sustainability/ # Sustainability pages
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── PROJECT_SCOPE.md            # Detailed project requirements
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd "Waste Management System"
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   npm install
   copy .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup** (in a new terminal)
   ```powershell
   cd frontend
   npm install
   copy .env.example .env
   # Edit .env with API URL
   npm run dev
   ```

4. **Start MongoDB**
   - Local: Ensure MongoDB service is running
   - Atlas: Use connection string in backend `.env`

### Default Access

After setting up, you can create an admin account or use seeded data:

```
Email: admin@wastemanagement.com
Password: Admin@123456
```

## 🔧 Configuration

### Backend Environment Variables

Key variables to configure in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste_management
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
STRIPE_SECRET_KEY=your_stripe_key
```

### Frontend Environment Variables

Configure in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register      - Register new user
POST   /api/v1/auth/login          - Login user
GET    /api/v1/auth/me             - Get current user
POST   /api/v1/auth/logout         - Logout user
POST   /api/v1/auth/forgot-password - Request password reset
PUT    /api/v1/auth/reset-password  - Reset password
```

### Resource Endpoints

All endpoints are prefixed with `/api/v1/`

- `/users` - User management
- `/residents` - Resident profiles
- `/schedules` - Collection schedules
- `/vehicles` - Fleet management
- `/bins` - Bin management
- `/service-requests` - Service requests
- `/payments` - Payment processing
- `/waste-data` - Waste analytics
- `/zones` - Zone management
- `/dashboard` - Dashboard data
- `/notifications` - Notifications

Detailed API documentation available in `backend/README.md`

## 👥 User Roles & Permissions

### Role Hierarchy

1. **Admin** - Full system access
2. **Sustainability Manager** - Analytics and reporting
3. **City Manager** - Operations management
4. **Resident** - Basic user access

### Role-Based Access Control (RBAC)

Routes are protected based on user roles. See `App.jsx` for complete routing structure.

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt (10 rounds)
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet security headers
- Environment variable protection

## 📊 Database Models

- **User** - User accounts and authentication
- **Resident** - Resident profiles and gamification
- **Zone** - Geographic zones and areas
- **Schedule** - Collection schedules
- **Vehicle** - Fleet vehicles and tracking
- **Bin** - Waste bins and IoT sensors
- **ServiceRequest** - User service requests
- **Payment** - Payment transactions
- **WasteData** - Waste collection data
- **Notification** - System notifications

## 🎨 UI/UX Features

- Responsive design (mobile, tablet, desktop)
- Dark mode support (optional)
- Accessibility (WCAG 2.1 AA compliance)
- Interactive maps for routes and bins
- Real-time notifications
- Data visualization with charts
- Progressive Web App (PWA) capabilities

## 📈 Performance Optimization

- Code splitting and lazy loading
- Image optimization
- API response caching with Redis
- Database indexing
- Query optimization
- Compression middleware
- CDN for static assets

## 🧪 Testing

```powershell
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. Set environment variables
2. Build: `npm install --production`
3. Start: `npm start`

### Frontend Deployment (Vercel/Netlify/GitHub Pages)

1. Build: `npm run build`
2. Deploy `dist/` folder

### Docker Deployment (Optional)

```powershell
docker-compose up -d
```

## 📝 Development Roadmap

### Phase 1: Foundation ✅
- User authentication system
- Basic dashboards
- Database models
- API structure

### Phase 2: Core Features (In Progress)
- Service request system
- Fleet management
- Payment integration
- Notification system

### Phase 3: Advanced Features (Planned)
- AI-powered route optimization
- IoT sensor integration
- Predictive analytics
- Mobile apps (React Native)

### Phase 4: Optimization (Planned)
- Performance tuning
- Advanced analytics
- Third-party integrations
- Blockchain for transparency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development Team

- **Project Type**: Full-Stack MERN Application
- **Version**: 1.0.0
- **Last Updated**: October 14, 2025

## 📞 Support & Contact

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: support@wastemanagement.com
- Documentation: See PROJECT_SCOPE.md

## 🌟 Acknowledgments

- MongoDB for database
- React team for the amazing framework
- TailwindCSS for beautiful styling
- All open-source contributors

---

**Built with ❤️ for a cleaner, greener future 🌱**
>>>>>>> aabd5df (Initial commit)
