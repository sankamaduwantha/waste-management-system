# Waste Management System - Frontend

React-based frontend for the Urban Waste Management System.

## 🚀 Features

- **Modern React**: Built with React 18 and Vite for blazing-fast development
- **Responsive Design**: TailwindCSS for beautiful, mobile-first UI
- **State Management**: Zustand for simple and efficient state management
- **Real-time Updates**: Socket.io integration for live notifications
- **Form Handling**: React Hook Form for performant form management
- **Data Fetching**: React Query for server state management
- **Routing**: React Router v6 for navigation
- **Maps Integration**: React Leaflet for location features
- **Charts**: Recharts for data visualization
- **Payment Integration**: Stripe for secure payments

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` with your API URL.

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will start on `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── resident/     # Resident pages
│   │   ├── city-manager/ # City manager pages
│   │   ├── admin/        # Admin pages
│   │   └── sustainability/ # Sustainability pages
│   ├── services/         # API services
│   │   └── api.js
│   ├── store/            # State management
│   │   └── authStore.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 UI Components

### Tailwind Utility Classes

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-danger` - Danger button style
- `.card` - Card container
- `.input-field` - Input field style
- `.label` - Label style
- `.badge-*` - Badge variants (success, warning, danger, info)

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. Protected routes automatically redirect to login if not authenticated.

## 👥 User Roles & Routes

### Resident
- `/resident/dashboard` - Personal dashboard
- `/resident/schedule` - Collection schedule
- `/resident/requests` - Service requests
- `/resident/payments` - Payment history
- `/resident/profile` - User profile

### City Manager
- `/city-manager/dashboard` - Operations dashboard
- `/city-manager/fleet` - Fleet management
- `/city-manager/routes` - Route management
- `/city-manager/bins` - Bin monitoring
- `/city-manager/requests` - Request management

### Admin
- `/admin/dashboard` - System dashboard
- `/admin/users` - User management
- `/admin/zones` - Zone configuration
- `/admin/settings` - System settings

### Sustainability Manager
- `/sustainability/dashboard` - Analytics dashboard
- `/sustainability/analytics` - Waste analytics
- `/sustainability/reports` - Reports generation
- `/sustainability/impact` - Environmental impact

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Environment Variables

```
VITE_API_URL=http://localhost:5000/api/v1
```

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🎭 State Management

The app uses Zustand for state management:

- **Auth Store**: Manages user authentication state
- Persistent storage via localStorage
- Automatic token refresh

## 🔔 Real-time Notifications

Socket.io integration provides:
- Live collection updates
- Service request status changes
- System announcements
- Bin fill alerts

## 🗺️ Maps Integration

Leaflet maps are used for:
- Collection route visualization
- Bin locations
- Zone boundaries
- Real-time vehicle tracking

## 💳 Payment Integration

Stripe is integrated for:
- Monthly fee payments
- Service request payments
- Secure card processing
- Payment history

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For issues and questions, please contact the development team.
