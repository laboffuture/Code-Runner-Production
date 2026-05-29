@echo off
echo ====================================
echo Starting Redis (Docker)
echo ====================================
echo.

REM Check if code-runner-redis container exists
docker inspect code-runner-redis >nul 2>&1
if %errorlevel% == 0 (
    echo Redis container exists - starting it...
    docker start code-runner-redis
) else (
    echo Redis container not found - creating it...
    docker run -d --name code-runner-redis -p 6379:6379 redis:7-alpine
)

echo.
echo Waiting for Redis to be ready...
timeout /t 3 /nobreak >nul

REM Test Redis connection
docker exec code-runner-redis redis-cli ping >nul 2>&1
if %errorlevel% == 0 (
    echo.
    echo ====================================
    echo Redis is running on localhost:6379
    echo ====================================
) else (
    echo.
    echo ERROR: Redis failed to start. Make sure Docker Desktop is running.
)
echo.
