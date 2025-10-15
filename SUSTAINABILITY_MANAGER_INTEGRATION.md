# 🎯 Sustainability Manager Dashboard - Integration Guide

## ✅ Files Created

### 1. Components
- ✅ `PlasticSuggestionForm.jsx` - Create/Edit form for suggestions
- ✅ `PlasticSuggestionForm.css` - Form styles
- ✅ `PlasticSuggestionList.jsx` - Already exists (add isAdmin prop support)

### 2. Pages
- ✅ `SustainabilityManagerDashboard.jsx` - Main dashboard
- ✅ `SustainabilityManagerDashboard.css` - Dashboard styles

### 3. Store
- ✅ `plasticSuggestionsStore.js` - Already created with all CRUD methods

---

## 🔧 Integration Steps

### Step 1: Add Routes to App.jsx

Find your main `App.jsx` or routing file and add these routes:

```javascript
import SustainabilityManagerDashboard from './pages/sustainability-manager/SustainabilityManagerDashboard';

// Inside your Routes
<Route 
  path="/sustainability-manager/*" 
  element={
    <ProtectedRoute roles={['sustainability_manager', 'admin']}>
      <SustainabilityManagerDashboard />
    </ProtectedRoute>
  } 
/>
```

The dashboard handles its own sub-routes internally:
- `/sustainability-manager` - Redirects to list
- `/sustainability-manager/plastic-suggestions` - List all suggestions (with edit/delete)
- `/sustainability-manager/plastic-suggestions/create` - Create new suggestion
- `/sustainability-manager/plastic-suggestions/edit/:id` - Edit existing suggestion

---

### Step 2: Add Navigation Link

In your navigation component (Sidebar/Navbar), add a link for Sustainability Managers:

```javascript
{user.role === 'sustainability_manager' || user.role === 'admin' ? (
  <Link to="/sustainability-manager">
    <FaLeaf /> Plastic Management
  </Link>
) : null}
```

---

### Step 3: Install Required Dependencies (if not already installed)

```powershell
cd "e:\USER\Desktop\Waste Management System\frontend"
npm install react-icons react-toastify zustand
```

---

## 🎨 Dashboard Features

### Main Dashboard Page
```
┌─────────────────────────────────────────────┐
│ 🌱 Plastic Reduction Management             │
│ Create and manage suggestions...            │
│                     [+ Create New Suggestion]│
├─────────────────────────────────────────────┤
│                                             │
│  📋 Total: 25  🌱 Saved: 150kg             │
│  📊 Impl: 89   💰 Money: $1,250            │
│                                             │
├─────────────────────────────────────────────┤
│  [View All] [Create New]                    │
├─────────────────────────────────────────────┤
│                                             │
│  Suggestion Cards with Edit/Delete buttons  │
│                                             │
└─────────────────────────────────────────────┘
```

### Create/Edit Form Features
- ✅ Title, Description fields
- ✅ Category dropdown (10 categories)
- ✅ Difficulty selector (easy/medium/hard)
- ✅ Plastic saved (grams/year)
- ✅ Money saved ($/year)
- ✅ Tags (comma-separated)
- ✅ Image URL
- ✅ **Dynamic Arrays**:
  - Implementation Steps (add/remove)
  - Implementation Tips (add/remove)
  - Alternative Products (add/remove)
- ✅ Validation with error messages
- ✅ Character counters
- ✅ Save/Cancel buttons

### List View Features (Admin Mode)
- ✅ Search functionality
- ✅ Advanced filters (category, difficulty, impact score)
- ✅ Pagination
- ✅ **Action buttons on each card**:
  - 👁️ View details
  - ✏️ Edit suggestion
  - 🗑️ Delete suggestion
- ✅ Create new button
- ✅ Results counter
- ✅ Empty state with "Create First" button

---

## 📊 API Endpoints Used

### For Managers/Admins:
```
POST   /api/v1/plastic-suggestions           - Create new
PUT    /api/v1/plastic-suggestions/:id       - Update existing
DELETE /api/v1/plastic-suggestions/:id       - Delete
GET    /api/v1/plastic-suggestions           - List all (with filters)
GET    /api/v1/plastic-suggestions/:id       - Get single
GET    /api/v1/plastic-suggestions/statistics - Get stats for dashboard
```

All admin endpoints check for `sustainability_manager` or `admin` role in the backend.

---

## 🔐 Authorization

The backend already has role-based authorization set up:

```javascript
// In routes/plasticReductionRoutes.js
router.post('/', 
  protect, 
  authorize('admin', 'sustainability_manager'), 
  createSuggestion
);

router.put('/:id', 
  protect, 
  authorize('admin', 'sustainability_manager'), 
  updateSuggestion
);

router.delete('/:id', 
  protect, 
  authorize('admin', 'sustainability_manager'), 
  deleteSuggestion
);
```

---

## 🎯 Usage Flow for Sustainability Manager

### 1. Login as Sustainability Manager
```
Email: manager@example.com
Password: Manager@123
Role: sustainability_manager
```

### 2. Navigate to Dashboard
Click "Plastic Management" in sidebar → Opens `/sustainability-manager`

### 3. View Statistics
See:
- Total suggestions count
- Total plastic potentially saved
- Total implementations by residents
- Total money potentially saved

### 4. Create New Suggestion
- Click "+ Create New Suggestion"
- Fill in form:
  - **Title**: "Use Reusable Shopping Bags"
  - **Description**: Long description about benefits...
  - **Category**: Shopping
  - **Plastic Saved**: 8000 (grams/year)
  - **Money Saved**: 50 (dollars/year)
  - **Difficulty**: Easy
  - **Tags**: reusable, shopping, bags, eco-friendly
  - **Steps**: 
    - Step 1: Purchase durable cloth bags
    - Step 2: Keep them in your car
    - Step 3: Use them for all shopping
  - **Tips**:
    - Buy colorful bags you'll remember
    - Wash them regularly
  - **Products**:
    - Canvas tote bags
    - Mesh produce bags
- Click "Create Suggestion"
- Toast notification: "Suggestion created successfully!"
- Redirected to list view

### 5. Edit Existing Suggestion
- In list view, hover over a suggestion card
- Click ✏️ Edit button
- Form opens pre-filled with existing data
- Make changes
- Click "Update Suggestion"
- Toast: "Suggestion updated successfully!"

### 6. Delete Suggestion
- Hover over card
- Click 🗑️ Delete button
- Confirmation dialog: "Are you sure?"
- Click OK
- Toast: "Suggestion deleted successfully!"
- Card removed from list

### 7. Filter/Search
- Use search bar for keyword search
- Click "Show Filters" to see:
  - Category filter
  - Difficulty filter
  - Impact score slider
- Apply filters
- Results update

---

## 🎨 Styling Features

### Responsive Design
- ✅ Mobile-friendly (stacks on small screens)
- ✅ Tablet-optimized
- ✅ Desktop full-width layout

### Visual Feedback
- ✅ Hover effects on cards
- ✅ Button hover animations
- ✅ Loading spinners
- ✅ Error messages in red
- ✅ Success toasts (green)
- ✅ Smooth transitions

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast compliance

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error when creating/editing
**Solution**: Make sure user is logged in with `sustainability_manager` or `admin` role

### Issue: Form validation errors
**Solution**: 
- Title must be 10+ characters
- Description must be 50+ characters
- Plastic saved must be > 0
- Money saved must be > 0

### Issue: Dashboard shows "empty"
**Solution**: Create your first suggestion using the "+ Create New Suggestion" button

### Issue: Can't see edit/delete buttons
**Solution**: 
- Make sure you're on the sustainability manager dashboard (`/sustainability-manager/plastic-suggestions`)
- The `isAdmin={true}` prop must be passed to PlasticSuggestionList

---

## 📝 Example Test Data

### Suggestion 1: Reusable Water Bottles
```json
{
  "title": "Switch to Reusable Water Bottles",
  "description": "Replace single-use plastic water bottles with a reusable stainless steel or glass bottle. This simple change can prevent hundreds of plastic bottles from entering landfills each year.",
  "category": "shopping",
  "plasticSavedGrams": 12000,
  "moneySaved": 150,
  "difficulty": "easy",
  "tags": ["water", "reusable", "bottles", "beginner-friendly"],
  "imageUrl": "https://example.com/water-bottle.jpg",
  "detailedSteps": [
    "Purchase a quality reusable water bottle (stainless steel or glass)",
    "Wash and sanitize before first use",
    "Carry it with you daily",
    "Refill at water fountains or home",
    "Clean regularly to maintain hygiene"
  ],
  "implementationTips": [
    "Choose a bottle with a comfortable carrying handle",
    "Get an insulated bottle to keep drinks cold/hot",
    "Set reminders to bring your bottle"
  ],
  "alternativeProducts": [
    "Stainless steel water bottles (Hydro Flask, Klean Kanteen)",
    "Glass bottles with protective sleeves",
    "Collapsible silicone bottles for travel"
  ]
}
```

### Suggestion 2: Shopping Bags
```json
{
  "title": "Use Reusable Shopping Bags",
  "description": "Bring your own cloth or reusable bags when shopping to eliminate plastic bag waste. Keeps bags out of landfills and oceans.",
  "category": "shopping",
  "plasticSavedGrams": 8000,
  "moneySaved": 50,
  "difficulty": "easy",
  "tags": ["shopping", "bags", "reusable", "grocery"],
  "detailedSteps": [
    "Purchase 5-10 reusable shopping bags",
    "Store bags in your car or by the door",
    "Bring bags to all stores (grocery, retail, etc.)",
    "Wash fabric bags monthly"
  ],
  "implementationTips": [
    "Keep folded bags in your car",
    "Buy colorful bags so you remember them",
    "Start with one store at a time"
  ],
  "alternativeProducts": [
    "Canvas tote bags",
    "Mesh produce bags",
    "Insulated grocery bags"
  ]
}
```

---

## ✅ Success Checklist

Before going live:

- [ ] Backend routes are registered in `server.js`
- [ ] Frontend routes added to `App.jsx`
- [ ] Navigation link added for sustainability managers
- [ ] Zustand store is working
- [ ] Form validation works
- [ ] Create suggestion works
- [ ] Edit suggestion works
- [ ] Delete suggestion works (with confirmation)
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Statistics display correctly
- [ ] Toast notifications appear
- [ ] Mobile responsive
- [ ] Role-based access working

---

## 🎉 You're Ready!

The Sustainability Manager now has a complete CRUD interface for managing plastic reduction suggestions:

1. ✅ **Dashboard** with statistics
2. ✅ **Create** new suggestions with rich form
3. ✅ **Read** all suggestions with filters
4. ✅ **Update** existing suggestions
5. ✅ **Delete** suggestions (with confirmation)
6. ✅ **Search** functionality
7. ✅ **Filtering** by category, difficulty, impact
8. ✅ **Pagination** for large datasets

**The dashboard is no longer empty!** 🚀
