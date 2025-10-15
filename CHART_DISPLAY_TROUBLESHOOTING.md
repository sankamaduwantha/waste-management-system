# 🔍 WASTE BREAKDOWN CHART TROUBLESHOOTING GUIDE

## 📊 Issue: Circle Chart Not Displaying Waste Breakdown

### ✅ **What We've Confirmed:**

1. ✅ Backend server running on port 5000
2. ✅ Frontend server running on port 3000
3. ✅ API endpoints responding successfully:
   - `GET /api/v1/waste-entries/chart-data?days=30` → 200 OK
   - `GET /api/v1/waste-entries/statistics?days=30` → 200 OK
   - `POST /api/v1/waste-entries` → 201 Created
4. ✅ Chart component exists and is imported correctly
5. ✅ Chart data fetch function working
6. ✅ Statistics display working

---

## 🔎 **Debugging Steps to Follow:**

### Step 1: Open Browser Developer Tools
1. Open http://localhost:3000 in your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab

### Step 2: Check Console Logs
Look for these console messages I added:

```
🔍 Chart Data: {object}
✅ Formatted Chart Data: [array]
📊 Chart State: {object}
```

### Step 3: What to Look For

**Scenario A: No Console Logs at All**
- **Issue**: Component not rendering
- **Fix**: Check if you're logged in as a resident

**Scenario B: Chart Data is `null` or `undefined`**
```javascript
🔍 Chart Data: null
❌ No chart data available
ℹ️ Showing empty state
```
- **Issue**: API not returning data or store not updating
- **Fix**: See "Fix for No Data" section below

**Scenario C: Chart Data Exists but All Values are 0**
```javascript
📊 Chart State: {
  formattedData: [
    {name: "General", value: 0, percentage: 0},
    {name: "Recyclable", value: 0, percentage: 0},
    ...
  ],
  allZero: true
}
ℹ️ Showing empty state
```
- **Issue**: No waste entries in database for this user
- **Fix**: Add a waste entry using the form

**Scenario D: Chart Data Exists with Values**
```javascript
✅ Formatted Chart Data: [
  {name: "General", value: 3.5, percentage: 48.61, color: "#6b7280"},
  {name: "Recyclable", value: 2.0, percentage: 27.78, color: "#059669"},
  ...
]
```
- **Status**: ✅ Chart should be displaying!
- **If not showing**: See "Chart Rendering Issues" section

---

## 🛠️ **Common Fixes:**

### Fix 1: No Data in Database
**Symptom**: Empty state showing "No waste data recorded yet"

**Solution**: Add waste entry
1. Click "Add Today's Waste Entry" button
2. Fill in the form:
   - General Waste: 3.5 kg
   - Recyclable: 2.0 kg
   - Organic: 1.5 kg
   - Hazardous: 0.2 kg
3. Click Save
4. Chart should update automatically

---

### Fix 2: Store Not Updating
**Symptom**: Console shows `chartData: null` even after API returns data

**Solution**: Check Zustand store
1. Open Console
2. Type: `localStorage.getItem('waste-entry-storage')`
3. If this shows old data, clear it:
   ```javascript
   localStorage.clear()
   ```
4. Refresh the page

---

### Fix 3: API Response Format Issue
**Symptom**: Console errors about accessing properties

**Solution**: Check API response format
1. Open **Network** tab in DevTools
2. Find `chart-data?days=30` request
3. Click on it and view **Response** tab
4. Should look like:
```json
{
  "status": "success",
  "data": {
    "chartData": {
      "labels": ["General", "Recyclable", "Organic", "Hazardous"],
      "datasets": [{"data": [3.5, 2.0, 1.5, 0.2]}],
      "percentages": ["48.61", "27.78", "20.83", "2.78"],
      "totalWaste": 7.2,
      "period": "Last 30 days"
    }
  }
}
```

If format is different, backend needs adjustment.

---

### Fix 4: Chart Component CSS Issues
**Symptom**: Chart container appears but chart itself is invisible

**Solution**: Check CSS
1. In DevTools, click **Elements** tab
2. Find `<div class="chart-container">`
3. Check if it has dimensions (width/height)
4. Check if Recharts SVG is rendering inside

**CSS Fix** (if needed):
The `ResponsiveContainer` needs a parent with defined dimensions. Add to WasteCircularChart.css:
```css
.chart-content {
  position: relative;
  margin-bottom: 1.5rem;
  min-height: 300px; /* Add this */
}
```

---

### Fix 5: React/Recharts Render Issue
**Symptom**: Data exists but chart doesn't render

**Solution**: Force re-render
1. Make a small change to Dashboard.jsx:
```jsx
<WasteCircularChart 
  key="waste-chart" 
  days={30} 
  chartType="donut" 
/>
```

---

## 🎯 **Expected Behavior:**

### When Working Correctly:

1. **With Data**: You should see:
   - Circular donut chart with 4 colored segments
   - Center showing total waste
   - Legend at bottom with waste types
   - Hover tooltips showing details
   - "Waste Breakdown" title
   - "Last 30 days" subtitle

2. **Without Data**: You should see:
   - Empty state with trash icon
   - Message: "No waste data recorded yet"
   - Subtitle: "Start tracking your daily waste to see insights here"

---

## 📝 **What The Console Logs Tell Us:**

### Log Analysis Guide:

#### Log 1: `🔍 Chart Data:`
Shows the raw data from the API store.
- **If null**: API call failed or hasn't completed
- **If object**: API returned data successfully

#### Log 2: `✅ Formatted Chart Data:`
Shows data after transformation for Recharts.
- **Length should be 4** (General, Recyclable, Organic, Hazardous)
- **Each item should have**: name, value, percentage, color

#### Log 3: `📊 Chart State:`
Shows complete component state.
- **loading**: Should be `false` when data is ready
- **error**: Should be `null` if no errors
- **hasData**: Should be `true` if data exists
- **allZero**: Should be `false` if waste was recorded

---

## 🚨 **Error Scenarios:**

### Error 1: "Cannot read property 'data' of undefined"
```
TypeError: Cannot read property 'data' of undefined
```
**Cause**: chartData.datasets is undefined
**Fix**: Backend not returning correct structure. Check wasteEntryService.js line 308-330

### Error 2: "percentage.toFixed is not a function"
```
TypeError: percentage.toFixed is not a function
```
**Cause**: Percentage is still a string, not parsed to float
**Fix**: Already fixed with `parseFloat()` on line 82

### Error 3: Network Error
```
GET http://localhost:5000/api/v1/waste-entries/chart-data?days=30 net::ERR_CONNECTION_REFUSED
```
**Cause**: Backend not running
**Fix**: Start backend server

---

## 🎨 **Visual Checklist:**

When chart is working, you should see:

### Chart Layout:
```
┌─────────────────────────────────────────┐
│ Waste Breakdown         Last 30 days    │ ← Header
├─────────────────────────────────────────┤
│                                         │
│         ╱────────╲                      │
│       ╱   Total   ╲                     │
│      │   7.2 kg    │  ← Donut center   │
│       ╲          ╱                      │
│         ╲────────╱                      │
│                                         │
│  ● General  ● Recyclable                │ ← Legend
│  ● Organic  ● Hazardous                 │
│                                         │
└─────────────────────────────────────────┘
```

### Color Coding:
- 🔘 **Gray** (#6b7280): General Waste
- 🟢 **Green** (#059669): Recyclable
- 🟡 **Yellow** (#ca8a04): Organic
- 🔴 **Red** (#dc2626): Hazardous

---

## 📋 **Complete Checklist:**

Before reporting the issue, verify:

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Logged in as resident role
- [ ] On resident dashboard page
- [ ] Browser console open (F12)
- [ ] At least one waste entry exists in database
- [ ] No JavaScript errors in console
- [ ] API calls returning 200 status
- [ ] Chart component CSS loaded
- [ ] Recharts library installed

---

## 🔧 **Quick Test:**

Run this in the browser console while on the dashboard:

```javascript
// Check if store has data
const store = window.__ZUSTAND_STORE__
if (store) {
  console.log('Chart Data:', store.chartData)
  console.log('Statistics:', store.statistics)
} else {
  console.log('Store not accessible')
}

// Check if component is rendered
console.log('Chart Container:', document.querySelector('.chart-container'))
console.log('Recharts SVG:', document.querySelector('.recharts-wrapper'))
```

---

## 📞 **What to Report:**

If still not working, provide:

1. **Console logs** (copy all 🔍 📊 ✅ ℹ️ messages)
2. **Network tab** screenshot (showing chart-data request)
3. **Elements tab** screenshot (showing .chart-container)
4. **Any JavaScript errors** in red
5. **Screenshot** of what you see on the page

---

## 🎯 **Most Likely Issues:**

Based on the backend logs showing successful API calls:

1. **90% Chance**: Data exists but chart component has rendering issue
   - **Check**: Browser console for React/Recharts errors
   - **Fix**: See "Fix 4" or "Fix 5"

2. **5% Chance**: Data format mismatch
   - **Check**: Network tab response format
   - **Fix**: See "Fix 3"

3. **5% Chance**: CSS/layout issue
   - **Check**: Elements tab for chart-container dimensions
   - **Fix**: See "Fix 4"

---

## ✅ **Success Indicators:**

You'll know it's working when:
1. ✅ No console errors
2. ✅ Console shows formatted chart data with values > 0
3. ✅ Chart appears as colorful donut with 4 segments
4. ✅ Center shows total waste in kg
5. ✅ Hovering shows tooltips
6. ✅ Legend shows all 4 waste types

---

**Last Updated**: October 15, 2025
**Status**: Debugging in Progress
**Servers Running**: ✅ Backend (port 5000) | ✅ Frontend (port 3000)
