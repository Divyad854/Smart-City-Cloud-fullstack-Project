@echo off
echo ========================================
echo  Smart City Platform - Starting...
echo ========================================

echo.
echo [1/2] Starting Backend (port 5000)...
cd backend
start "Smart City Backend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo [2/2] Starting Frontend (port 3000)...
cd frontend
start "Smart City Frontend" cmd /k "npm install && npm start"
cd ..

echo.
echo ========================================
echo  App will open at: http://localhost:3000
echo ========================================
pause
