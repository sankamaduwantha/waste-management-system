# 🚀 Quick Start Installation Guide

## Step-by-Step Setup for Windows

### 1️⃣ Prerequisites Check

Make sure you have these installed:

- **Node.js** (v18+): Download from https://nodejs.org/
- **MongoDB**: 
  - Option A: Local - https://www.mongodb.com/try/download/community
  - Option B: Cloud - MongoDB Atlas (free tier)
- **Git**: https://git-scm.com/download/win

Verify installations:
```powershell
node --version
npm --version
mongod --version
git --version
```

### 2️⃣ Backend Setup

Open PowerShell and navigate to the project:

```powershell
cd "e:\USER\Desktop\Waste Management System\backend"
```

Install dependencies:
```powershell
npm install
```

Create environment file:
```powershell
copy .env.example .env
```

Edit `.env` file with your settings:
```powershell
notepad .env
```

**Minimum required settings:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste_management
JWT_SECRET=your_secret_key_here_change_this
CLIENT_URL=http://localhost:3000
```

Start MongoDB (if using local):
```powershell
# In a new PowerShell window
mongod
```

Start backend server:
```powershell
npm run dev
```

✅ Backend should be running at: http://localhost:5000

### 3️⃣ Frontend Setup

Open a NEW PowerShell window:

```powershell
cd "e:\USER\Desktop\Waste Management System\frontend"
```

Install dependencies:
```powershell
npm install
```

Create environment file:
```powershell
copy .env.example .env
```

Edit `.env`:
```powershell
notepad .env
```

Add:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start frontend:
```powershell
npm run dev
```

✅ Frontend should be running at: http://localhost:3000

### 4️⃣ Access the Application

Open your browser and go to:
```
http://localhost:3000
```

### 5️⃣ Create Your First Account

1. Click "Register now" on the login page
2. Fill in your details
3. Select role (start with "resident")
4. Click "Register"
5. You'll be automatically logged in!

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error**: "MongoServerError: connect ECONNREFUSED"

**Solution**:
```powershell
# Start MongoDB service
net start MongoDB
```

Or use MongoDB Atlas (cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update MONGODB_URI in `.env`

### Port Already in Use

**Error**: "Port 5000 is already in use"

**Solution**:
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in backend/.env
PORT=5001
```

### Module Not Found

**Error**: "Cannot find module..."

**Solution**:
```powershell
# Delete node_modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

### CORS Error

**Error**: "Access to fetch has been blocked by CORS policy"

**Solution**: Check backend `.env`:
```env
CLIENT_URL=http://localhost:3000
```

---

## 📦 Optional Services Setup

### Email Notifications (Gmail)

1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate App Password
4. Update in backend `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### SMS Notifications (Twilio)

1. Sign up at https://www.twilio.com/try-twilio
2. Get Account SID and Auth Token
3. Get Twilio phone number
4. Update in backend `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Payment Gateway (Stripe)

1. Sign up at https://stripe.com
2. Get API keys from Dashboard
3. Update in backend `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🎯 Quick Test

### Test Backend API:
```powershell
# Open PowerShell
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running"
}
```

### Test Frontend:
Open browser: http://localhost:3000
- Should see login page
- No console errors

---

## 🚀 Production Deployment

### Build Frontend:
```powershell
cd frontend
npm run build
# Creates 'dist' folder
```

### Build Backend:
```powershell
cd backend
npm install --production
```

### Recommended Hosting:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas

---

## 📚 Next Steps

1. ✅ Complete environment setup
2. 📖 Read PROJECT_SCOPE.md for features
3. 🧪 Test with sample data
4. 🎨 Customize UI/branding
5. 📊 Set up analytics
6. 🚀 Deploy to production

---

## 💡 Pro Tips

1. **Use nodemon for development**: Already configured in `npm run dev`
2. **MongoDB GUI**: Download MongoDB Compass for easier database management
3. **API Testing**: Use Postman or Thunder Client (VS Code extension)
4. **Real-time logs**: Keep terminal windows visible while developing
5. **Git workflow**: Commit changes regularly

---

## 🆘 Need Help?

- 📖 Check README.md for detailed documentation
- 📋 Review PROJECT_SCOPE.md for feature requirements
- 🐛 Open an issue on GitHub
- 💬 Contact support team

---

**You're all set! Happy coding! 🎉**
