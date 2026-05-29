@echo off
echo ========================================
echo FULL REFRESH - Reseed and Clear All
echo ========================================
echo.

echo Step 1: Reseeding all modified problems...
node scripts/reseed-level-1.js

echo.
echo Step 2: Clearing .next cache...
if exist ".next" (
    rd /s /q ".next"
    echo ✓ Cache cleared
)

echo.
echo ========================================
echo COMPLETE! Now do:
echo ========================================
echo 1. RESTART dev server:
echo    - Press Ctrl+C
echo    - Run: npm run dev
echo.
echo 2. In browser:
echo    - Press Ctrl+Shift+Delete
echo    - Clear "Cached images and files"
echo    - Hard refresh: Ctrl+Shift+R
echo ========================================
pause
