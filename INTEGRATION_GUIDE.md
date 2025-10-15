# 🚀 Quick Integration Guide - Plastic Reduction Suggestions

## Prerequisites
- ✅ Backend server running on port 5000
- ✅ Frontend server running on port 3000
- ⚠️ MongoDB Atlas connection (requires IP whitelisting)

---

## Step 1: Fix MongoDB Connection

### Issue
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

### Solution Options

#### Option A: Whitelist Your Current IP (Recommended for Production)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Click "Add Current IP Address"
6. Or manually enter your IP
7. Save changes

#### Option B: Allow All IPs (For Development Only)
1. Go to MongoDB Atlas Network Access
2. Add IP Address: `0.0.0.0/0`
3. **Warning**: This allows access from anywhere. Not secure for production!

---

## Step 2: Restart Backend Server

Once MongoDB connection is fixed:

```powershell
# Kill all Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Restart backend
cd "e:\USER\Desktop\Waste Management System\backend"
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api/v1
```

---

## Step 3: Test API Endpoints

### Using Thunder Client / Postman

#### 1. Get All Suggestions (Public)
```http
GET http://localhost:5000/api/v1/plastic-suggestions
```

#### 2. Get Statistics (Public)
```http
GET http://localhost:5000/api/v1/plastic-suggestions/statistics
```

#### 3. Search Suggestions (Public)
```http
GET http://localhost:5000/api/v1/plastic-suggestions/search?q=bottle
```

#### 4. Get Top Suggestions (Public)
```http
GET http://localhost:5000/api/v1/plastic-suggestions/top/5
```

#### 5. Create Suggestion (Admin Only)
```http
POST http://localhost:5000/api/v1/plastic-suggestions
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "title": "Use Reusable Water Bottles",
  "description": "Replace single-use plastic bottles with a reusable stainless steel or glass water bottle. This simple switch can save hundreds of plastic bottles per year.",
  "category": "shopping",
  "plasticSavedGrams": 12000,
  "moneySaved": 150,
  "difficulty": "easy",
  "tags": ["water", "reusable", "daily-use", "beginner-friendly"],
  "imageUrl": "https://example.com/reusable-bottle.jpg",
  "detailedSteps": [
    "Purchase a quality reusable water bottle",
    "Wash and sanitize before first use",
    "Carry it with you daily",
    "Refill at water fountains or home",
    "Clean regularly to maintain hygiene"
  ]
}
```

---

## Step 4: Add Route to Frontend

### Create a new route in your React Router setup

**File**: `frontend/src/App.jsx` (or wherever routes are defined)

```javascript
import PlasticSuggestionList from './components/plastic-suggestions/PlasticSuggestionList';

// Add this route
<Route path="/plastic-suggestions" element={<PlasticSuggestionList />} />
```

---

## Step 5: Add Navigation Link

Add link to main navigation:

```javascript
<Link to="/plastic-suggestions">
  Plastic Reduction Tips
</Link>
```

---

## Step 6: Add Dashboard Widget (Resident Dashboard)

### Create Widget Component

**File**: `frontend/src/components/dashboard/PlasticSuggestionWidget.jsx`

```javascript
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePlasticSuggestionsStore from '../../store/plasticSuggestionsStore';
import PlasticSuggestionCard from '../plastic-suggestions/PlasticSuggestionCard';

const PlasticSuggestionWidget = () => {
  const { topSuggestions, statistics, fetchTopSuggestions, fetchStatistics } = 
    usePlasticSuggestionsStore();

  useEffect(() => {
    fetchTopSuggestions(3);
    fetchStatistics();
  }, []);

  return (
    <div className="plastic-widget">
      <div className="widget-header">
        <h2>🌱 Reduce Plastic Waste</h2>
        {statistics && (
          <div className="widget-stats">
            <span>💚 {statistics.totalPlasticSaved} saved</span>
            <span>💰 ${statistics.totalMoneySaved} saved</span>
          </div>
        )}
      </div>

      <div className="widget-suggestions">
        {topSuggestions.map(suggestion => (
          <PlasticSuggestionCard
            key={suggestion._id}
            suggestion={suggestion}
            compact={true}
            showActions={false}
          />
        ))}
      </div>

      <Link to="/plastic-suggestions" className="view-all-link">
        View All Suggestions →
      </Link>
    </div>
  );
};

export default PlasticSuggestionWidget;
```

### Add to Dashboard

**File**: `frontend/src/pages/resident/Dashboard.jsx`

```javascript
import PlasticSuggestionWidget from '../../components/dashboard/PlasticSuggestionWidget';

// Add to dashboard grid
<div className="dashboard-grid">
  {/* Existing widgets */}
  
  <PlasticSuggestionWidget />
</div>
```

---

## Step 7: Seed Initial Data (Optional)

### Create seed script

**File**: `backend/scripts/seedPlasticSuggestions.js`

```javascript
const mongoose = require('mongoose');
const PlasticReductionSuggestion = require('../models/PlasticReductionSuggestion');
require('dotenv').config();

const suggestions = [
  {
    title: "Use Reusable Shopping Bags",
    description: "Bring your own cloth bags when shopping to eliminate plastic bag waste.",
    category: "shopping",
    plasticSavedGrams: 8000,
    moneySaved: 50,
    difficulty: "easy",
    tags: ["shopping", "bags", "reusable", "daily-use"],
    createdBy: "ADMIN_USER_ID_HERE"
  },
  {
    title: "Switch to Bamboo Toothbrush",
    description: "Replace plastic toothbrushes with biodegradable bamboo alternatives.",
    category: "bathroom",
    plasticSavedGrams: 200,
    moneySaved: 25,
    difficulty: "easy",
    tags: ["bathroom", "dental", "bamboo", "biodegradable"],
    createdBy: "ADMIN_USER_ID_HERE"
  },
  {
    title: "Use Glass Food Containers",
    description: "Store food in glass containers instead of disposable plastic wrap.",
    category: "kitchen",
    plasticSavedGrams: 5000,
    moneySaved: 100,
    difficulty: "medium",
    tags: ["kitchen", "storage", "glass", "food"],
    createdBy: "ADMIN_USER_ID_HERE"
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await PlasticReductionSuggestion.deleteMany({}); // Clear existing
    await PlasticReductionSuggestion.insertMany(suggestions);
    console.log('✅ Seeded', suggestions.length, 'suggestions');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run it:
```powershell
cd "e:\USER\Desktop\Waste Management System\backend"
node scripts/seedPlasticSuggestions.js
```

---

## Step 8: Test Frontend

1. Navigate to `http://localhost:3000/plastic-suggestions`
2. Test filters (category, difficulty, impact score)
3. Test search functionality
4. Test pagination
5. Click "I Implemented This!" button
6. Check that toast notifications appear

---

## Step 9: Admin Features

### Grant Admin Access

Ensure your user has role:
- `admin` or
- `sustainability_manager`

### Test Admin Endpoints

1. Login as admin
2. Create a new suggestion via API or admin UI
3. Edit existing suggestions
4. Delete suggestions (soft delete)

---

## Troubleshooting

### Issue: "Cannot GET /api/v1/plastic-suggestions"
**Solution**: Routes not registered. Check `backend/server.js` line with:
```javascript
app.use('/api/v1/plastic-suggestions', plasticReductionRoutes);
```

### Issue: Frontend shows "Failed to fetch suggestions"
**Solution**: 
1. Check backend is running on port 5000
2. Check CORS settings in `backend/server.js`
3. Check `VITE_API_URL` in `frontend/.env`

### Issue: "Unauthorized" when creating suggestions
**Solution**: 
1. Ensure you're logged in as admin
2. Check JWT token is valid
3. Verify role in database: `db.users.find({ role: 'admin' })`

### Issue: Images not loading
**Solution**: 
1. Use full URLs with https://
2. Check CORS on image host
3. Or use fallback placeholder image

---

## Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.blktod1.mongodb.net/waste_management?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Performance Tips

1. **Enable Pagination**: Always use pagination for large datasets
2. **Use Indexes**: MongoDB indexes already created in model
3. **Cache Statistics**: Cache statistics endpoint result for 5 minutes
4. **Lazy Load Images**: Images load lazily by default
5. **Debounce Search**: Search input debounces automatically

---

## Next Steps After Integration

1. ✅ Test all features thoroughly
2. ✅ Add more seed data
3. ✅ Customize styling to match your theme
4. ✅ Add image upload functionality
5. ✅ Create admin management UI
6. ✅ Add user profiles to track implementations
7. ✅ Create reports and analytics
8. ✅ Add gamification features
9. ✅ Deploy to production

---

## Support Checklist

- [ ] MongoDB connection working
- [ ] Backend server running
- [ ] Frontend server running
- [ ] API endpoints responding
- [ ] Frontend displays data
- [ ] Filters working
- [ ] Search working
- [ ] Pagination working
- [ ] Create suggestion working (admin)
- [ ] Mark as implemented working
- [ ] Toast notifications showing
- [ ] Responsive design working
- [ ] Dark mode working (if enabled)

---

**Ready to use!** 🎉

For detailed documentation, see `PLASTIC_REDUCTION_FEATURE_STATUS.md`
