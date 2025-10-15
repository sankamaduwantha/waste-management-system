# 🔐 Registration & Login Guide

## ✅ How to Create an Account

### Step 1: Go to Registration Page
**URL:** http://localhost:3001/register

### Step 2: Fill in Your Details

#### Required Fields:
- **Full Name:** Your first and last name
- **Email:** A valid email address (will be used for login)
- **Password:** Must meet security requirements (see below)
- **Confirm Password:** Must match your password
- **Account Type:** Select your role

#### Optional Fields:
- **Phone:** Your contact number

---

## 🔒 Password Requirements

Your password **MUST** include all of the following:

✅ **At least 8 characters long**
✅ **One uppercase letter** (A-Z)
✅ **One lowercase letter** (a-z)
✅ **One number** (0-9)
✅ **One special character** (@, $, !, %, *, ?, &)

### ✅ Valid Password Examples:
```
Password123!
Welcome@2024
SecurePass1$
MyAccount99*
Resident2024!
```

### ❌ Invalid Password Examples:
```
password        ❌ No uppercase, number, or special character
Password        ❌ No number or special character
Password123     ❌ No special character
password123!    ❌ No uppercase letter
```

---

## 👥 Account Types

### 🏠 Resident
**Best for:** Regular users who need waste collection services
**Features:**
- View collection schedules
- Create service requests
- Track payments
- Monitor environmental impact
- Earn points and badges

### 🏙️ City Manager
**Best for:** Municipal staff managing fleet and routes
**Features:**
- Fleet management
- Route optimization
- Bin monitoring
- Handle service requests
- View analytics

### 👨‍💼 Administrator
**Best for:** System administrators
**Features:**
- User management
- Zone configuration
- System settings
- Full platform access
- Security controls

### 🌱 Sustainability Manager
**Best for:** Environmental officers
**Features:**
- Environmental metrics
- Waste analytics
- Impact reports
- Carbon tracking
- Sustainability goals

---

## 🚀 Registration Process

### 1. Open the Registration Page
```
http://localhost:3001/register
```

### 2. Fill Out the Form
- Enter your **Full Name**: John Doe
- Enter your **Email**: john.doe@example.com
- Select your **Account Type**: Resident
- Enter your **Phone** (optional): +1234567890
- Create a **Password**: MySecure123!
- **Confirm Password**: MySecure123!

### 3. Click "Register"
The system will:
- Validate your information
- Create your account
- Log you in automatically
- Redirect you to your dashboard

---

## 🔐 Login

### After Registration
1. Go to: http://localhost:3001/login
2. Enter your **Email**
3. Enter your **Password**
4. Click "Sign in"

### Forgot Password?
Click "Forgot Password?" on the login page to reset it.

---

## ❌ Common Registration Errors

### Error: "Password must contain uppercase, lowercase, number and special character"
**Solution:** Make sure your password includes:
- Capital letter (A-Z)
- Small letter (a-z)
- Number (0-9)
- Special character (@$!%*?&)

**Example Fix:**
- ❌ `password123` → ✅ `Password123!`

### Error: "User already exists with this email"
**Solution:** 
- This email is already registered
- Try logging in instead
- Or use a different email address

### Error: "Passwords do not match"
**Solution:** 
- Make sure both password fields have the exact same value
- Retype carefully

### Error: "Email is invalid"
**Solution:** 
- Use a valid email format: name@domain.com
- No spaces allowed
- Check for typos

---

## 🧪 Quick Test Registration

Want to test quickly? Use these sample credentials:

### Test Resident Account
```
Name: John Resident
Email: john.resident@example.com
Account Type: Resident
Password: Resident123!
```

### Test City Manager Account
```
Name: Jane Manager
Email: jane.manager@example.com
Account Type: City Manager
Password: Manager123!
```

### Test Admin Account
```
Name: Admin User
Email: admin.user@example.com
Account Type: Administrator
Password: Admin123!
```

---

## 📱 After Registration

### What Happens Next?
1. ✅ Account is created in MongoDB
2. ✅ You're automatically logged in
3. ✅ JWT token is stored
4. ✅ You're redirected to your dashboard
5. ✅ Welcome email is sent (if configured)

### Your Dashboard
Based on your role, you'll see:
- **Resident:** Collection schedules, service requests, payments
- **City Manager:** Fleet management, routes, bin monitoring
- **Admin:** User management, system settings
- **Sustainability:** Analytics, environmental reports

---

## 🔧 Troubleshooting

### Registration Form Not Loading?
- Check frontend is running: http://localhost:3001
- Open browser console (F12) for errors

### Can't Submit Form?
- Check all required fields are filled
- Verify password meets requirements
- Look for red error messages under fields

### Account Created But Can't Login?
- Wait a few seconds and try again
- Check backend terminal for errors
- Verify MongoDB is connected

### Backend Errors?
Check the backend terminal window for:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

---

## 🎯 Best Practices

### Password Tips:
- ✅ Use unique passwords for each account
- ✅ Mix letters, numbers, and symbols
- ✅ Avoid common words or patterns
- ✅ Don't share your password

### Email Tips:
- ✅ Use a valid email you can access
- ✅ Check spam folder for confirmation emails
- ✅ One email per account only

### Account Security:
- ✅ Log out after use
- ✅ Don't save passwords in browsers
- ✅ Use strong passwords
- ✅ Report suspicious activity

---

## 📞 Need Help?

### Check These:
1. **Frontend:** http://localhost:3001 (should be accessible)
2. **Backend:** Terminal should show "✅ MongoDB connected"
3. **MongoDB:** Atlas dashboard should show active connection
4. **Browser Console:** Press F12 to see any errors

### Common Solutions:
- Clear browser cache
- Restart both servers
- Check .env configuration
- Review terminal logs

---

## ✅ Success Checklist

Before registering, make sure:
- [ ] Frontend is running (http://localhost:3001)
- [ ] Backend is running (port 5000)
- [ ] MongoDB is connected
- [ ] You have a valid email
- [ ] Your password meets ALL requirements
- [ ] Both password fields match

---

**Ready to register?** Go to: http://localhost:3001/register

**Password Format:** `UpperLower123!`

**Happy registering!** 🎉
