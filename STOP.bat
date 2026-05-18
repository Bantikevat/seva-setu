@echo off
REM ============================================
REM  SEVA SETU - STOP ALL SERVICES
REM ============================================

title SEVA SETU - Stopping Services
color 0C

echo.
echo ==========================================
echo   SEVA SETU - Stopping Services
echo ==========================================
echo.

echo Saare services band kar raha hoon...
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo.
    echo [OK] Sab services band ho gayi!
) else (
    echo.
    echo [INFO] Koi service chal nahi rahi thi.
)

echo.
timeout /t 3 /nobreak >nul
exit
