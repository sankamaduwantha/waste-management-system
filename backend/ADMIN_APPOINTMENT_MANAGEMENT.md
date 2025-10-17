# Admin Appointment Management - Implementation Summary

## 📋 Overview
Admin and City Manager users now have full access to manage all appointments in the system, bypassing resident-specific restrictions.

---

## ✅ Changes Made

### 1. **Controller Updates** (`appointmentController.js`)

#### Modified Functions:
- **`getAppointmentDetails`**
  - ✅ Admins/City Managers can view ANY appointment
  - ✅ Residents can only view their own appointments
  
- **`updateAppointment`**
  - ✅ Admins/City Managers can update/reschedule ANY appointment
  - ✅ Bypass rescheduling restrictions (e.g., time limits)
  - ✅ Residents restricted to their own appointments
  
- **`cancelAppointment`**
  - ✅ Admins/City Managers can cancel ANY appointment
  - ✅ Bypass cancellation restrictions
  - ✅ Residents restricted to their own appointments

**Role Detection:**
```javascript
const isAdminOrManager = ['admin', 'city_manager'].includes(req.user.role);
const residentId = isAdminOrManager ? null : (req.user.resident || req.user._id);
```

---

### 2. **Service Updates** (`appointmentService.js`)

#### Modified Functions:
All service methods now accept `residentId = null` for admin access:

- **`getAppointmentDetails(appointmentId, residentId)`**
  ```javascript
  // Skip ownership check if residentId is null (admin)
  if (residentId && appointment.resident._id.toString() !== residentId.toString()) {
    throw new AppError('Access denied', 403);
  }
  ```

- **`updateAppointment(appointmentId, residentId, updateData)`**
  ```javascript
  // Skip reschedule restrictions if residentId is null (admin)
  if (residentId && !appointment.canBeRescheduled) {
    throw new AppError('This appointment cannot be rescheduled', 400);
  }
  ```

- **`cancelAppointment(appointmentId, residentId, reason)`**
  ```javascript
  // Skip cancellation restrictions if residentId is null (admin)
  if (residentId && !appointment.canBeCancelled) {
    throw new AppError('This appointment cannot be cancelled', 400);
  }
  ```

---

### 3. **Route Updates** (`appointmentRoutes.js`)

Updated route documentation to reflect admin/city manager access:

```javascript
/**
 * @access  Private (Resident/Admin/City Manager)
 */
router.get('/:id', appointmentController.getAppointmentDetails);
router.patch('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.cancelAppointment);
```

---

## 🎯 Admin Capabilities

### View Appointments
✅ **GET** `/api/v1/appointments/:id`
- View any appointment details
- No ownership restrictions

### Update/Reschedule Appointments
✅ **PATCH** `/api/v1/appointments/:id`
- Reschedule any appointment to any date/time
- Bypass time restrictions (e.g., minimum 24-hour notice)
- Update appointment details (waste types, amount, etc.)

**Example Request:**
```json
{
  "appointmentDate": "2025-10-25T00:00:00.000Z",
  "timeSlot": {
    "start": "10:00",
    "end": "11:00"
  },
  "estimatedAmount": 50
}
```

### Cancel Appointments
✅ **DELETE** `/api/v1/appointments/:id`
- Cancel any appointment
- Bypass cancellation restrictions
- Require cancellation reason

**Example Request:**
```json
{
  "reason": "Resident requested via phone call"
}
```

---

## 🔐 Access Control Summary

| Endpoint | Resident | Admin | City Manager |
|----------|----------|-------|--------------|
| View appointment | ✅ Own only | ✅ Any | ✅ Any |
| Update appointment | ✅ Own only (with restrictions) | ✅ Any (no restrictions) | ✅ Any (no restrictions) |
| Cancel appointment | ✅ Own only (with restrictions) | ✅ Any (no restrictions) | ✅ Any (no restrictions) |
| Confirm appointment | ❌ | ✅ | ✅ |
| Start collection | ❌ | ✅ | ✅ |
| Complete collection | ❌ | ✅ | ✅ |

---

## 📊 Additional Admin-Only Endpoints

These endpoints are already implemented and require `admin` or `city_manager` role:

### 1. **Dashboard Data**
```
GET /api/v1/appointments/admin/dashboard
```
- Overview statistics
- Filter by zone, date range

### 2. **All Appointments**
```
GET /api/v1/appointments/admin/all
```
- Paginated list of all appointments
- Filter by zone, status, date range
- **Query Parameters:**
  - `zone` - Zone ID
  - `status` - pending/confirmed/in_progress/completed/cancelled
  - `startDate` - Start date filter
  - `endDate` - End date filter
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)

### 3. **Confirm Appointment**
```
PATCH /api/v1/appointments/admin/:id/confirm
```
- Assign vehicle and driver
- Change status to 'confirmed'

**Request Body:**
```json
{
  "vehicleId": "670abc123def456789012345",
  "driverId": "670def456abc789012345678"
}
```

### 4. **Start Collection**
```
PATCH /api/v1/appointments/admin/:id/start
```
- Mark appointment as 'in_progress'
- Driver started collection

### 5. **Complete Appointment**
```
PATCH /api/v1/appointments/admin/:id/complete
```
- Mark appointment as 'completed'
- Record actual waste collected

**Request Body:**
```json
{
  "actualAmount": 45.5,
  "notes": "Collected more plastic than estimated"
}
```

---

## 🧪 Testing Guide

### Test as Admin

1. **Login as Admin:**
```bash
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

2. **Get All Appointments:**
```bash
GET /api/v1/appointments/admin/all?status=pending&page=1&limit=10
```

3. **View Any Appointment:**
```bash
GET /api/v1/appointments/670abc123def456789012345
```

4. **Update Any Appointment:**
```bash
PATCH /api/v1/appointments/670abc123def456789012345
{
  "appointmentDate": "2025-10-30T00:00:00.000Z",
  "timeSlot": { "start": "14:00", "end": "15:00" }
}
```

5. **Cancel Any Appointment:**
```bash
DELETE /api/v1/appointments/670abc123def456789012345
{
  "reason": "Duplicate booking"
}
```

### Test as Resident

1. **Login as Resident:**
```bash
POST /api/v1/auth/login
{
  "email": "resident@example.com",
  "password": "resident_password"
}
```

2. **Try to Access Other's Appointment:**
```bash
GET /api/v1/appointments/670abc123def456789012345
# Should return 403 Forbidden if not your appointment
```

---

## 🔍 Authorization Flow

```
Request → protect middleware → Check user role
                                    ↓
                    Admin/City Manager? → residentId = null
                                    ↓
                    Resident? → residentId = req.user._id
                                    ↓
                    Service checks residentId
                                    ↓
                    null? → Skip ownership check ✅
                                    ↓
                    value? → Verify ownership ✅
```

---

## 📝 Best Practices

### 1. **Always Provide Cancellation Reason**
Even as admin, provide meaningful cancellation reasons for audit trail:
```json
{
  "reason": "Duplicate booking - cancelled per resident request"
}
```

### 2. **Use Admin Dashboard Endpoint**
For viewing multiple appointments, use the dedicated admin endpoint:
```
GET /api/v1/appointments/admin/all
```
Instead of fetching individual appointments.

### 3. **Respect Data Integrity**
While admins can bypass restrictions, ensure data consistency:
- Check slot availability before rescheduling
- Don't reschedule to past dates
- Provide complete update data

---

## 🚀 Frontend Integration

### Admin Dashboard Component
Create an admin appointments page that uses these endpoints:

```javascript
// Get all appointments
const response = await api.get('/appointments/admin/all', {
  params: { status: 'pending', page: 1, limit: 20 }
});

// Update any appointment
await api.patch(`/appointments/${appointmentId}`, {
  appointmentDate: newDate,
  timeSlot: { start: '10:00', end: '11:00' }
});

// Cancel any appointment
await api.delete(`/appointments/${appointmentId}`, {
  data: { reason: 'Admin cancellation' }
});
```

---

## ✨ Summary

✅ **Admins and City Managers can now:**
- View ANY appointment
- Update/reschedule ANY appointment without restrictions
- Cancel ANY appointment without restrictions
- Bypass all resident-specific limitations
- Manage appointments via dedicated admin endpoints

✅ **Residents are still restricted to:**
- Their own appointments only
- Standard rescheduling rules
- Standard cancellation rules

✅ **Security maintained through:**
- Role-based authorization
- Middleware protection
- Service-layer validation

---

## 📁 Modified Files

1. ✅ `backend/controllers/appointmentController.js`
2. ✅ `backend/services/appointmentService.js`
3. ✅ `backend/routes/appointmentRoutes.js`

**No breaking changes** - Existing resident functionality remains unchanged!
