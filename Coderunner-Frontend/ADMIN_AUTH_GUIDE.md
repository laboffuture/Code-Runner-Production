# Admin Authentication Implementation Guide

## Current State

The admin dashboard is now **secured and functional**, but the authentication flow is incomplete:

### What's Already Done ✅
- ✅ Admin dashboard at `/admin/dashboard` with auth guard
- ✅ Frontend checks for `authToken`, `isAuthenticated`, and `userRole` in localStorage
- ✅ Admin navigation link in sidebar (Shield icon) — only visible if `userRole === 'admin'`
- ✅ Backend admin endpoints (`/admin/system`, `/admin/queues`, etc.) reject non-admin requests with 403
- ✅ Dashboard shows "Access denied" if user is not admin
- ✅ All 6 admin endpoints integrated (system, queues, docker, logs, users, errors)

### What's Missing ❌
- ❌ **Actual login flow** — Current "login" just sets `isAuthenticated: 'true'`, doesn't call backend
- ❌ **JWT token stored from backend** — No API call to `/auth/login` to get token
- ❌ **User role stored** — No `userRole` saved in localStorage on login

---

## How to Implement Proper Authentication

### Step 1: Update Login Page to Call Backend API

**File:** `web/src/app/(auth)/login/page.tsx`

**Current code (around line 316):**
```typescript
const handleLockIn = () => {
  if (!selectedAgent) return;

  // Store selected agent
  localStorage.setItem('selectedAgent', selectedAgent);
  localStorage.setItem('isAuthenticated', 'true');

  // Redirect to boot screen
  setTimeout(() => {
    router.push('/boot');
  }, 100);
};
```

**Replace with:**
```typescript
const handleLockIn = async () => {
  if (!selectedAgent) return;

  try {
    // For now, use a demo login flow
    // TODO: Replace with actual username/password inputs
    const response = await api.auth.login('demo_user', 'demo_password');

    // Store auth data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userRole', response.user.role); // 'admin' or 'student'
    localStorage.setItem('userId', response.user.id);
    localStorage.setItem('username', response.user.username);
    localStorage.setItem('selectedAgent', selectedAgent);
    localStorage.setItem('isAuthenticated', 'true');

    // Redirect to boot screen
    setTimeout(() => {
      router.push('/boot');
    }, 100);
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please try again.');
  }
};
```

---

### Step 2: Backend Requirements

Your backend's `/auth/login` endpoint must return:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "username": "john_doe",
    "role": "admin",  // or "student"
    "email": "john@example.com"
  }
}
```

The JWT token should include the user's role in its payload:
```json
{
  "userId": "user_123",
  "username": "john_doe",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

### Step 3: Admin Role Assignment in Database

**MongoDB Collection:** `users`

**Admin User Schema:**
```json
{
  "_id": "ObjectId(...)",
  "username": "admin",
  "email": "admin@coderunner.com",
  "password": "$2b$10$hashed_password_here",
  "role": "admin",  // ← This is the key field
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**To create an admin user manually:**
```javascript
// In MongoDB shell or admin script
db.users.insertOne({
  username: "admin",
  email: "admin@coderunner.com",
  password: await bcrypt.hash("your_secure_password", 10),
  role: "admin",
  createdAt: new Date()
});
```

---

### Step 4: Testing the Admin Flow

1. **Create an admin user** in your MongoDB database with `role: "admin"`
2. **Update the login page** to call `api.auth.login()` and store the role
3. **Login as admin** — you should see the Shield icon in the sidebar after a hard refresh
4. **Click the Shield icon** — you'll be taken to `/admin/dashboard`
5. **Dashboard loads data** — all 6 panels should populate with real-time data

---

## Quick Testing Workaround (Without Backend Changes)

If you want to test the admin dashboard **right now** without implementing the full login flow:

**In browser console:**
```javascript
// Simulate admin login
localStorage.setItem('authToken', 'fake-token-for-testing');
localStorage.setItem('userRole', 'admin');
localStorage.setItem('isAuthenticated', 'true');
```

Then refresh the page — the Shield icon will appear in the sidebar.

**⚠️ Note:** The dashboard will show "Access denied" errors when fetching data because the backend expects a real JWT token. This is just for UI testing.

---

## Security Checklist

- [ ] JWT secret is strong (use crypto.randomBytes(64).toString('hex'))
- [ ] JWT tokens expire (1 hour is reasonable)
- [ ] Passwords are hashed with bcrypt (salt rounds >= 10)
- [ ] Admin endpoints verify JWT and check `user.role === 'admin'`
- [ ] Rate limiting on login endpoint (5 attempts per 15 minutes)
- [ ] HTTPS enforced in production
- [ ] Credentials not committed to `.env.local`

---

## Admin Dashboard Features

Once authenticated, admins can see:

- **System Health**: CPU, Memory, Uptime, Process stats
- **Queue Metrics**: Execution queue, Submission queue (waiting, active, completed, failed)
- **Docker Pool**: Container status, pool size, provisioning progress
- **User Analytics**: Total users, active today, recent signups
- **Error Analytics**: 24h error count, error rate, recent error details
- **Live Logs**: Real-time log stream (errors, warnings, info)

All data auto-refreshes every 10 seconds.

---

## File References

- **Admin Dashboard**: `web/src/app/admin/dashboard/page.tsx`
- **Sidebar with Admin Link**: `web/src/components/editor/NeuralSidebar.tsx`
- **API Client**: `web/src/lib/api-client.ts`
- **Login Page**: `web/src/app/(auth)/login/page.tsx`

---

## Questions?

The admin system is fully built and ready to use. The only missing piece is connecting the frontend login to the backend's `/auth/login` endpoint and storing the user's role.
