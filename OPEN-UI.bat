@echo off
REM ============================================
REM  SEVA SETU - OPEN UI IN BROWSER
REM ============================================

title SEVA SETU - Opening UI
color 0B

echo.
echo ==========================================
echo   SEVA SETU - Opening UI in Browser
echo ==========================================
echo.

cd /d "%~dp0\ui"

REM Check if Python is installed (for simple server)
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Python server start kar raha hoon...
    echo.
    echo Browser apne aap khulega.
    echo Server band karne ke liye is window mein Ctrl+C dabao.
    echo.
    start http://localhost:8080
    python -m http.server 8080
) else (
    REM No Python - direct file open
    echo [INFO] Browser mein file open kar raha hoon...
    start "" "%~dp0\ui\index.html"
    echo.
    echo UI khol diya browser mein.
    echo.
    pause
)
