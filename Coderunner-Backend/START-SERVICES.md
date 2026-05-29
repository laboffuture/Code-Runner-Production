# 🚀 Starting Code Runner Backend Services

## ⚠️ IMPORTANT: Start Order

**Redis MUST be started first**, before the API or Runner. Without Redis, code execution fails with "ECONNREFUSED" and the "Run Code" button won't work.

---

## Quick Start

### Step 1 — Start Redis (REQUIRED, do this FIRST every time)
**Double-click:** `start-redis.bat`

Or manually:
```bash
docker start code-runner-redis
```

**Wait for:** "Redis is running on localhost:6379"

---

### Step 2 — Start API + Runner

**Terminal 1 - API Server:**
```bash
cd apps/api && npm run dev
```

**Terminal 2 - Runner Service:**
```bash
cd apps/runner && npm run dev
```

## Test Redis is working
```bash
docker exec code-runner-redis redis-cli ping
```
Should show: PONG

## Troubleshooting

### "Run Code" / "Submit" button does not work
- Redis is not running — most common cause
- Fix: Run `start-redis.bat` then restart API and Runner

### Runner logs show "ECONNREFUSED" / "Redis reconnecting (attempt NNN)"
- Redis is not running
- Fix: `docker start code-runner-redis`

## Service Ports
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Redis: localhost:6379 (Docker container: code-runner-redis)
- MongoDB: MongoDB Atlas (cloud)
