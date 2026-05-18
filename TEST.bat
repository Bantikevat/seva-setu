@echo off
REM ============================================
REM  SEVA SETU - QUICK TEST
REM  Services chal rahi hain ya nahi check
REM ============================================

title SEVA SETU - Quick Test
color 0E

echo.
echo ==========================================
echo   SEVA SETU - Services Test
echo ==========================================
echo.

echo [TEST 1] Auth Service check kar raha hoon...
curl -s http://localhost:3001/health
echo.
echo.

echo [TEST 2] User Service check kar raha hoon...
curl -s http://localhost:3002/health
echo.
echo.

echo ==========================================
echo  Services chal rahi hain agar JSON dikha
echo ==========================================
echo.
pause
