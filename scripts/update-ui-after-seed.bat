@echo off
echo ========================================
echo UPDATE UI AFTER RESEEDING
echo ========================================
echo.

echo Step 1: Clearing Next.js cache...
if exist ".next" (
    rd /s /q ".next"
    echo ✓ .next cache cleared
) else (
    echo ✓ No .next cache to clear
)

echo.
echo Step 2: Clearing application cache...
echo Attempting to clear via API...

curl -X POST http://localhost:9002/api/cache/clear 2>nul
if errorlevel 1 (
    curl -X POST http://localhost:3000/api/cache/clear 2>nul
    if errorlevel 1 (
        echo ✗ Dev server not running
        echo.
        echo IMPORTANT: You must restart your dev server!
        echo 1. Stop dev server: Press Ctrl+C in the terminal
        echo 2. Start dev server: npm run dev
        echo 3. Or visit: http://localhost:9002/api/cache/clear in browser
        goto :end
    )
)

echo ✓ Application cache cleared via API

:end
echo.
echo ========================================
echo NEXT STEPS IN YOUR BROWSER:
echo ========================================
echo 1. Clear browser cache: Ctrl+Shift+Delete
echo 2. Hard refresh: Ctrl+Shift+R (multiple times)
echo 3. Navigate to the problem page
echo ========================================
pause
