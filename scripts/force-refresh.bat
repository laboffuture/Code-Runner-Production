@echo off
echo Forcing complete cache clear and restart...
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Clearing Next.js cache...
if exist ".next" rd /s /q ".next"

echo Step 3: Clearing node_modules cache...
if exist "node_modules\.cache" rd /s /q "node_modules\.cache"

echo.
echo ✓ All caches cleared!
echo.
echo Now run: npm run dev
echo Then hard refresh browser with: Ctrl + Shift + R
echo.
pause
