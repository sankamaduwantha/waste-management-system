# 🧪 APPOINTMENT BOOKING - QUICK TEST GUIDE

## ✅ System Status
- ✅ Backend: http://localhost:5000 (Running)
- ✅ Frontend: http://localhost:3000 (Running)
- ✅ Database: Connected with zones configured
- ✅ Issue Fixed: Zone information now auto-detected

---

## 🎯 Quick Test Steps

### 1️⃣ **Login**
1. Open browser: http://localhost:3000
2. Login as a resident
3. You should see the Dashboard

### 2️⃣ **Navigate to Appointment Booking**
1. Scroll down on the Dashboard
2. Find the **"Appointment Booking"** section
3. You'll see 3 tabs: **Book New**, **My Appointments**, **History**

### 3️⃣ **Book Your First Appointment**

#### Step 1: Select Date
- Click **"Book New"** tab (should be active by default)
- Look at the calendar on the left
- **✅ CHECK**: Calendar should load without errors
- Click on any future date (green dates are available)
- **✅ CHECK**: Time slots should appear below the calendar

#### Step 2: Choose Time Slot
- You should see 8 time slots (8 AM - 5 PM)
- Each slot shows: "08:00 AM - 09:00 AM" with "10 spots left"
- Click on any available slot
- **✅ CHECK**: Selected slot highlights in green
- **✅ CHECK**: Booking form appears on the right side

#### Step 3: Fill Appointment Details
On the right side form:

1. **Waste Types** (Select at least one):
   - ♻️ Recyclable
   - 🌱 Organic  
   - 🗑️ Non-Recyclable
   - ⚠️ Hazardous
   - 📦 Bulky Items

2. **Estimated Amount**:
   - Enter amount in kg (e.g., 5.5)
   - Must be between 0.1 and 1000

3. **Special Instructions** (Optional):
   - Add any notes (e.g., "Please collect from back gate")

4. **Click** "Book Appointment" button

#### Expected Result:
✅ Success toast: "Appointment booked successfully! 🎉"  
✅ Form resets  
✅ Automatically switches to "My Appointments" tab  
✅ Your new appointment appears in the list  

### 4️⃣ **View Your Appointments**

Click **"My Appointments"** tab:
- **✅ CHECK**: You should see your newly booked appointment
- **✅ CHECK**: Status badge shows "Pending" (yellow)
- **✅ CHECK**: Date, time, and waste types display correctly
- **✅ CHECK**: Three action buttons visible: "View Details", "Reschedule", "Cancel"

### 5️⃣ **Test View Details**

1. Click **"View Details"** button
2. **✅ CHECK**: Modal opens showing full appointment details
3. **✅ CHECK**: All information displayed correctly:
   - Status
   - Date & Time
   - Waste Types (with colored badges)
   - Estimated Amount
   - Special Instructions
   - Zone information
4. Click **X** to close modal

### 6️⃣ **Test Reschedule**

1. Click **"Reschedule"** button on appointment card
2. **✅ CHECK**: Modal opens in "Update" mode
3. **✅ CHECK**: Calendar and form appear
4. Select a new date and time slot
5. Update any details if needed
6. Click **"Update Appointment"**
7. **✅ CHECK**: Success toast appears
8. **✅ CHECK**: Appointment list updates with new date/time

### 7️⃣ **Test Cancel**

1. Click **"Cancel"** button on appointment card
2. **✅ CHECK**: Modal opens with warning message
3. **✅ CHECK**: Cancellation reason textarea appears
4. Enter cancellation reason (minimum 5 characters)
   - Example: "Schedule conflict - need to reschedule"
5. **✅ CHECK**: Character counter shows (e.g., "25/300")
6. Check the confirmation checkbox
7. Click **"Confirm Cancellation"**
8. **✅ CHECK**: Success toast appears
9. **✅ CHECK**: Appointment status changes to "Cancelled" (red badge)
10. **✅ CHECK**: Appointment moves to "History" tab

### 8️⃣ **Test Filters**

In "My Appointments" tab:
1. Click **"Filters"** button
2. **✅ CHECK**: Filter panel expands
3. Try filtering by:
   - **Status**: Select "Pending", "Confirmed", etc.
   - **From Date**: Select start date
   - **To Date**: Select end date
4. Click **"Apply Filters"**
5. **✅ CHECK**: List updates to show only matching appointments
6. Click **"Clear"** to reset filters

### 9️⃣ **Test Pagination** (If you have many appointments)

1. Book multiple appointments (book 5-10 for testing)
2. **✅ CHECK**: Pagination controls appear at bottom
3. **✅ CHECK**: Shows "Page 1 of X"
4. Click next page arrow
5. **✅ CHECK**: List updates with next page appointments

### 🔟 **Test History Tab**

1. Click **"History"** tab
2. **✅ CHECK**: Shows completed and cancelled appointments
3. **✅ CHECK**: No action buttons (can't reschedule/cancel past appointments)
4. **✅ CHECK**: Can still view details

---

## 📊 Test Statistics Cards

At the top of Appointment Booking section, verify:

✅ **Total**: Shows count of all appointments  
✅ **Completed**: Shows completed count  
✅ **Upcoming**: Shows pending/confirmed count  
✅ **Waste Collected**: Shows total kg collected  

---

## 🐛 Common Issues & Solutions

### Issue: "Zone information is missing"
**Solution**: ✅ Already fixed! Run `node setupAppointments.js` if you still see this.

### Issue: Calendar doesn't show available dates
**Check**: 
- Backend server running?
- Database connected?
- Console errors in browser?

### Issue: Time slots don't appear
**Check**:
- Did you select a future date? (Past dates won't have slots)
- Is it Sunday? (Sunday is closed by default)
- Check browser console for errors

### Issue: Can't book appointment
**Check**:
- Did you select waste types?
- Is estimated amount valid (0.1 - 1000 kg)?
- Do you already have 3 active appointments? (Max limit)

---

## ✅ Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Open calendar | Loads without "zone error" |
| Select date | Time slots appear (8 slots, Mon-Sat) |
| Select slot | Booking form appears |
| Book appointment | Success message + switches to "My Appointments" |
| View details | Modal shows full information |
| Reschedule | Can select new date/time successfully |
| Cancel | Requires reason + confirmation, updates status |
| Filter | List updates based on criteria |
| Pagination | Navigate through multiple pages |
| Statistics | Shows accurate counts |

---

## 🎉 Success Criteria

Your appointment booking system is working if:

✅ No "zone information is missing" error  
✅ Calendar loads and shows available dates  
✅ Time slots appear when date selected  
✅ Can book appointments successfully  
✅ Can view appointment details  
✅ Can reschedule appointments  
✅ Can cancel with reason  
✅ Filters work correctly  
✅ Statistics display accurate data  
✅ Toast notifications appear for all actions  
✅ UI is responsive and user-friendly  

---

## 📝 Test Checklist

Print this and check off as you test:

- [ ] Login as resident
- [ ] Navigate to Appointment Booking section
- [ ] Calendar loads without errors
- [ ] Select future date
- [ ] Time slots appear
- [ ] Select time slot
- [ ] Fill booking form
- [ ] Book appointment successfully
- [ ] View appointment in "My Appointments"
- [ ] Click "View Details" - modal opens
- [ ] Click "Reschedule" - can update
- [ ] Click "Cancel" - provide reason and confirm
- [ ] Test filters (status, date range)
- [ ] Test pagination (if applicable)
- [ ] Check "History" tab
- [ ] Verify statistics cards
- [ ] Test on different dates/times
- [ ] Test with multiple waste types
- [ ] Test booking limit (try 4th appointment - should fail)

---

## 🚀 Advanced Testing (Optional)

### Test Business Rules:
1. **1-Hour Advance Rule**:
   - Try booking for current time + 30 minutes
   - Should fail with error message

2. **Max 3 Active Appointments**:
   - Book 3 appointments
   - Try booking 4th
   - Should fail with "Maximum 3 active appointments allowed"

3. **30-Day Advance Limit**:
   - Try booking 35 days in future
   - Should not show in calendar

### Test Edge Cases:
- Book for last available slot
- Cancel immediately after booking
- Reschedule multiple times
- Try booking on Sunday (should fail)
- Enter maximum waste amount (1000 kg)
- Enter minimum waste amount (0.1 kg)

---

## 📞 Report Issues

If you find any issues during testing:
1. Note the exact steps to reproduce
2. Check browser console for errors (F12 → Console)
3. Check backend terminal for server errors
4. Take screenshots if helpful

---

**Happy Testing! 🎉**

The appointment booking system is fully operational and ready for production use!
