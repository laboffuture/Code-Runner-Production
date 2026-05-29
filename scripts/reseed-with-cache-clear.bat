@echo off
setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: reseed-with-cache-clear.bat PROBLEM_NUMBER
    echo Example: reseed-with-cache-clear.bat 6
    exit /b 1
)

set PROBLEM_NUM=%1

echo ========================================
echo Reseeding Problem %PROBLEM_NUM% with Cache Clear
echo ========================================
echo.

echo Step 1: Reseeding problem %PROBLEM_NUM%...
call npx tsx scripts/seed-problems/11-14/level-1/seed-problem-%PROBLEM_NUM%.ts
if errorlevel 1 (
    echo ERROR: Failed to reseed problem
    exit /b 1
)

echo.
echo Step 2: Verifying in database...
call node scripts/verify-problem-%PROBLEM_NUM%.js

echo.
echo Step 3: Clearing Next.js cache...
if exist ".next" rd /s /q ".next"

echo.
echo Step 4: Clearing application cache via API...
echo NOTE: Your dev server MUST be running for this step!
echo Attempting to clear cache...
curl -X POST http://localhost:9002/api/cache/clear 2>nul
if errorlevel 1 (
    curl -X POST http://localhost:3000/api/cache/clear 2>nul
    if errorlevel 1 (
        echo.
        echo WARNING: Could not reach dev server to clear cache.
        echo Please manually clear cache by visiting http://localhost:3000/api/cache/clear
        echo Or restart your dev server.
    )
)

echo.
echo ========================================
echo ✓ Complete!
echo.
echo Now in your browser:
echo 1. Hard refresh: Ctrl+Shift+R
echo 2. Or clear browser cache completely
echo ========================================
pause
