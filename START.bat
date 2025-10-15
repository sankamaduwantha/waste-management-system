@echo off
title Waste Management System - Startup
color 0A

echo.
echo ========================================================
echo           WASTE MANAGEMENT SYSTEM - STARTUP
echo ========================================================
echo.

:CHECK_MONGODB
echo [1/3] Checking MongoDB Connection...
echo.
echo IMPORTANT: Your MongoDB connection string needs your ACTUAL cluster URL
echo Current: mongodb+srv://sankamaduwantha68:234vIKVoIUMakHE5@cluster0.mongodb.net/...
echo.
echo If you haven't updated your cluster URL yet:
echo   1. Run GET_MONGODB_URL.bat to get your cluster URL
echo   2. Update backend\.env with the correct URL
echo   3. Whitelist your IP in MongoDB Atlas (Network Access)
echo.
set /p MONGO_READY="Have you updated your MongoDB cluster URL? (y/n): "
if /i not "%MONGO_READY%"=="y" (
    echo.
    echo Please update your MongoDB configuration first.
    echo Run: GET_MONGODB_URL.bat
    echo.
    pause
    exit /b
)

echo.
echo ========================================================
echo [2/3] Starting Backend Server (Port 5000)...
echo ========================================================
echo.
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
cd ..

echo.
echo ========================================================
echo [3/3] Starting Frontend Server (Port 3000)...
echo ========================================================
echo.
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================================
echo                  SERVERS STARTING...
echo ========================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The application will open in your browser in 10 seconds...
echo.
echo Check the Backend and Frontend terminal windows for:
echo   - MongoDB connection status
echo   - Any errors or warnings
echo.
timeout /t 10 /nobreak >nul

start http://localhost:3000

echo.
echo ========================================================
echo                 SERVERS ARE RUNNING!
echo ========================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo To stop the servers:
echo   - Close the Backend Server window
echo   - Close the Frontend Server window
echo   - Or press Ctrl+C in each terminal
echo.
echo ========================================================
echo.
pause
