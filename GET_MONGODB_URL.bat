@echo off
echo ======================================
echo  MongoDB Atlas Connection Setup
echo ======================================
echo.
echo Your MongoDB credentials:
echo Username: sankamaduwantha68
echo Password: 234vIKVoIUMakHE5
echo.
echo ======================================
echo  IMPORTANT: Get Your Cluster URL
echo ======================================
echo.
echo The current connection string is using a placeholder URL.
echo You need to get your ACTUAL cluster URL from MongoDB Atlas.
echo.
echo Follow these steps:
echo.
echo 1. Go to: https://cloud.mongodb.com/
echo.
echo 2. Log in with your MongoDB Atlas account
echo.
echo 3. Click "Connect" on your cluster
echo.
echo 4. Select "Connect your application"
echo.
echo 5. Copy the connection string that looks like:
echo    mongodb+srv://sankamaduwantha68:^<password^>@cluster0.xxxxx.mongodb.net/...
echo.
echo 6. The important part is: cluster0.XXXXX.mongodb.net
echo    (Replace XXXXX with your actual cluster domain)
echo.
echo ======================================
echo  Common Cluster URL Formats:
echo ======================================
echo.
echo cluster0.abc12.mongodb.net
echo cluster0.12345.mongodb.net
echo cluster0.abcde.mongodb.net
echo.
echo ======================================
echo  Next Steps:
echo ======================================
echo.
echo After getting your cluster URL:
echo.
echo 1. Open: backend\.env
echo.
echo 2. Update the MONGODB_URI line with your actual cluster URL
echo.
echo 3. Make sure to whitelist your IP in MongoDB Atlas
echo    (Network Access -^> Add IP Address -^> Allow from Anywhere for testing)
echo.
echo 4. Restart the backend server
echo.
echo ======================================
echo  Press any key to open MongoDB Atlas...
echo ======================================
pause
start https://cloud.mongodb.com/
