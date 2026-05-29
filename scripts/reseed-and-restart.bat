@echo off
echo ========================================
echo Reseeding Problem and Clearing Cache
echo ========================================
echo.

REM Get problem number from argument
set PROBLEM_NUM=%1

if "%PROBLEM_NUM%"=="" (
    echo Usage: reseed-and-restart.bat [problem_number]
    echo Example: reseed-and-restart.bat 5
    pause
    exit /b 1
)

echo Step 1: Reseeding problem %PROBLEM_NUM%...
npx tsx scripts/seed-problems/11-14/level-1/seed-problem-%PROBLEM_NUM%.ts

echo.
echo Step 2: Verifying in database...
node scripts/verify-problem-%PROBLEM_NUM%.js

echo.
echo Step 3: Killing Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Step 4: Clearing Next.js cache...
if exist ".next" rd /s /q ".next"

echo.
echo ========================================
echo ✓ Complete! Now run: npm run dev
echo Then hard refresh browser: Ctrl+Shift+R
echo ========================================
pause
