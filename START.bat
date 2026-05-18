@echo off
title SEVA SETU - All Services
color 0A

echo.
echo ==========================================
echo   SEVA SETU - Starting 7 Backend Services
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/8] Stopping old services...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/8] AUTH (3001)...
start "Auth Service" cmd /k "cd services\auth-service && echo [AUTH - Port 3001] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [3/8] USER (3002)...
start "User Service" cmd /k "cd services\user-service && echo [USER - Port 3002] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [4/8] WORKER (3003)...
start "Worker Service" cmd /k "cd services\worker-service && echo [WORKER - Port 3003] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [5/8] BOOKING (3004)...
start "Booking Service" cmd /k "cd services\booking-service && echo [BOOKING - Port 3004] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [6/8] NOTIFICATION (3005)...
start "Notification Service" cmd /k "cd services\notification-service && echo [NOTIFY - Port 3005] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [7/8] PAYMENT (3006)...
start "Payment Service" cmd /k "cd services\payment-service && echo [PAYMENT - Port 3006] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [8/9] AI (3007)...
start "AI Service" cmd /k "cd services\ai-service && echo [AI - Port 3007] && node src/index.js"
timeout /t 2 /nobreak >nul

echo [9/9] ADMIN (3008)...
start "Admin Service" cmd /k "cd services\admin-service && echo [ADMIN - Port 3008] && node src/index.js"
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   ALL 7 SERVICES READY!
echo ==========================================
echo.
echo   Auth:         http://localhost:3001
echo   User:         http://localhost:3002
echo   Worker:       http://localhost:3003
echo   Booking:      http://localhost:3004
echo   Notification: http://localhost:3005
echo   Payment:      http://localhost:3006
echo   AI:           http://localhost:3007
echo.
echo   Frontend:
echo   cd apps\mobile-web ^&^& npm run dev
echo.
pause
