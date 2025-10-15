# 🔧 MongoDB Atlas Setup Guide

## ✅ Your MongoDB Configuration

Your `.env` file has been configured with your MongoDB Atlas credentials:

```
DB_USER: sankamaduwantha68
DB_PASSWORD: 234vIKVoIUMakHE5
```

## 📋 Important: Complete Your MongoDB Atlas Setup

Before running the application, you need to complete these steps in MongoDB Atlas:

### 1️⃣ Find Your Cluster Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with your credentials
3. Click on **"Connect"** on your cluster
4. Select **"Connect your application"**
5. Copy your connection string - it should look like:
   ```
   mongodb+srv://sankamaduwantha68:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2️⃣ Update Your `.env` File

Replace the `MONGODB_URI` in `backend/.env` with your actual cluster URL:

**Current (needs updating):**
```env
MONGODB_URI=mongodb+srv://sankamaduwantha68:234vIKVoIUMakHE5@cluster0.mongodb.net/waste_management?retryWrites=true&w=majority
```

**Update to (replace `cluster0.xxxxx` with your actual cluster domain):**
```env
MONGODB_URI=mongodb+srv://sankamaduwantha68:234vIKVoIUMakHE5@cluster0.YOUR_CLUSTER.mongodb.net/waste_management?retryWrites=true&w=majority
```

### 3️⃣ Whitelist Your IP Address

MongoDB Atlas requires IP whitelisting:

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Choose one:
   - **Add Current IP Address** (for your local development)
   - **Allow Access from Anywhere** (`0.0.0.0/0`) - for testing (not recommended for production)
4. Click **"Confirm"**

### 4️⃣ Create Database User (Already Done!)

Your user is already created:
- Username: `sankamaduwantha68`
- Password: `234vIKVoIUMakHE5`

If you need to verify or update:
1. Go to **Database Access** in MongoDB Atlas
2. Ensure the user exists with **Read and Write** permissions

## 🚀 Testing Your Connection

After completing the steps above, test your connection:

```powershell
# Navigate to backend folder
cd "e:\USER\Desktop\Waste Management System\backend"

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000 in development mode
```

## ⚠️ Common Issues & Solutions

### Issue 1: "MongoServerError: bad auth"
**Solution:** 
- Verify username and password are correct
- Check if special characters in password need URL encoding
- If password has special characters like `@, #, /, :`, encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `/` → `%2F`
  - `:` → `%3A`

Your password `234vIKVoIUMakHE5` has no special characters, so it's fine! ✅

### Issue 2: "MongoServerError: IP not whitelisted"
**Solution:** Add your IP address in Network Access (see step 3 above)

### Issue 3: "Could not connect to any servers"
**Solution:** 
- Check your cluster URL is correct
- Ensure your internet connection is working
- Verify the cluster is running in MongoDB Atlas

## 📝 Your Current Configuration Files

### `backend/.env` (Created - Active Configuration)
```env
MONGODB_URI=mongodb+srv://sankamaduwantha68:234vIKVoIUMakHE5@cluster0.mongodb.net/waste_management?retryWrites=true&w=majority
```

### `backend/config/database.js` (Already Configured)
This file handles the MongoDB connection and is ready to use!

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file to Git** (already in `.gitignore`)
2. ✅ **Use strong passwords** (your password is good!)
3. ⚠️ **Change JWT secrets** in production
4. ⚠️ **Restrict IP access** in MongoDB Atlas for production
5. ⚠️ **Use separate databases** for development/staging/production

## 🎯 Next Steps

1. **Find your actual cluster URL** from MongoDB Atlas
2. **Update the `.env` file** with the correct cluster domain
3. **Whitelist your IP address** in Network Access
4. **Test the connection** by running `npm run dev`
5. **Start building!** Your database will be automatically created

## 📞 Need Help?

If you encounter any issues:

1. Check the MongoDB Atlas dashboard for cluster status
2. Verify Network Access settings
3. Check Database Access for user permissions
4. Review server logs for specific error messages

---

**Your credentials are configured! Just update the cluster URL and you're ready to go! 🚀**
