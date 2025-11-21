# CORS Authentication Fix Guide

## Problem
Getting CORS error: "Access-Control-Allow-Origin must not be '*' when credentials are included"

## Root Cause
The backend server needs to be **completely restarted** to pick up the `.env` changes. Environment variables are loaded only at startup.

## What Was Fixed

### ✅ Backend Changes (bisbig-backend)

1. **`.env` file** - Updated allowed origins
   ```env
   BETTER_AUTH_URL="http://localhost:4000"
   FRONT_END_URL="http://localhost:3000"
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
   ```

2. **`src/lib/auth.ts`** - Added frontend origin to trustedOrigins
   ```typescript
   trustedOrigins: [
     "http://localhost:3000", // TanStack Start dev server ← ADDED
     "http://localhost:5173", // Vite default
     "http://localhost:3001", // Alternative dev port
   ],
   baseURL: "http://localhost:4000", // ← FIXED (was 3000)
   ```

3. **CORS Middleware** - Already correctly configured in `middlewares/core.middleware.ts`
   - Reads from `ALLOWED_ORIGINS` env var
   - Sets `Access-Control-Allow-Credentials: true`
   - Never uses wildcard '*'

### ✅ Frontend Changes (bisbig-web)

1. **`src/modules/auth/lib/auth-client.ts`** - Correct Better Auth client setup
   ```typescript
   export const authClient = createAuthClient({
     baseURL: `${env.VITE_API_BASE_URL}/auth`, // Full path: http://localhost:4000/auth
     fetchOptions: {
       credentials: "include", // Enable cookies
     },
   });
   ```

2. **`.env` file** - Backend URL
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

## 🔧 CRITICAL: How to Fix

### Step 1: Stop ALL Running Servers

**Backend:**
- Find the terminal running the backend
- Press `Ctrl+C` to stop it
- Wait for it to fully shut down

**Frontend:**
- Find the terminal running the frontend
- Press `Ctrl+C` to stop it
- Wait for it to fully shut down

### Step 2: Clear Any Cached Processes

```bash
# Optional: Kill any lingering Node processes
pkill -f "node"

# Or find and kill specific ports
lsof -ti:4000 | xargs kill -9  # Backend port
lsof -ti:3000 | xargs kill -9  # Frontend port
```

### Step 3: Restart Backend FIRST

```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend

# Verify .env has correct values
cat .env | grep ALLOWED_ORIGINS
# Should show: ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Start backend
pnpm dev
```

**Wait for backend to fully start** (you should see "Server running" message)

### Step 4: Restart Frontend

```bash
cd /Users/dinuwan/Desktop/nn/bisbig-web

# Start frontend
pnpm dev
```

**Wait for frontend to fully start** (should open on http://localhost:3000)

### Step 5: Test CORS (Optional)

Run this in the backend directory while server is running:

```bash
node test-cors.js
```

You should see:
```
✅ PASS: Access-Control-Allow-Origin is correct: http://localhost:3000
✅ PASS: Access-Control-Allow-Credentials is true
```

If you see `❌ ERROR`, the backend didn't pick up the `.env` changes.

### Step 6: Test Login

1. Open: `http://localhost:3000/login`
2. Open browser DevTools (F12) → Network tab
3. Try to log in
4. Check the network request to `/auth/sign-in/email`

**Expected behavior:**
- Preflight OPTIONS request returns 204
- POST request succeeds or fails with auth error (not CORS)
- Response headers include:
  - `Access-Control-Allow-Origin: http://localhost:3000`
  - `Access-Control-Allow-Credentials: true`

**If still failing:**
- Check browser console for the exact error
- Verify backend console shows the OPTIONS and POST requests
- Run `node test-cors.js` to diagnose

## Common Issues

### Issue 1: "Still getting CORS error after restart"

**Solution:**
```bash
# Backend - force clean restart
cd /Users/dinuwan/Desktop/nn/bisbig-backend
pkill -f "pnpm dev"
rm -rf .motia
pnpm dev
```

### Issue 2: "Backend shows wrong ALLOWED_ORIGINS in logs"

**Solution:**
- Backend is using a different `.env` file or cached env vars
- Check for `.env.local`, `.env.development`, etc.
- Verify: `cat .env | grep ALLOWED_ORIGINS`

### Issue 3: "Test script shows wrong origin"

**Solution:**
- Backend definitely didn't reload `.env`
- Try hard restart:
  ```bash
  pkill -f node
  cd /Users/dinuwan/Desktop/nn/bisbig-backend
  pnpm dev
  ```

### Issue 4: "Email verification required" error

**Solution:**
- Backend has `requireEmailVerification: true`
- You must verify the user's email first
- Check backend logs for verification token after signup
- Use: `POST /auth/verify-email` with the token

## Verification Checklist

- [ ] Backend `.env` has `ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"`
- [ ] Backend `src/lib/auth.ts` has `http://localhost:3000` in `trustedOrigins`
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:4000`
- [ ] Backend server fully stopped and restarted
- [ ] Frontend server fully stopped and restarted
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] `node test-cors.js` shows ✅ PASS
- [ ] Login page loads without console errors
- [ ] Network tab shows correct CORS headers

## Still Not Working?

If after following ALL steps above you still get CORS errors:

1. **Capture diagnostics:**
   ```bash
   # Backend logs
   cd /Users/dinuwan/Desktop/nn/bisbig-backend
   pnpm dev 2>&1 | tee backend.log

   # In another terminal, test
   node test-cors.js > cors-test.log

   # Frontend - check browser console
   ```

2. **Check these files match exactly:**
   - Backend `.env` ALLOWED_ORIGINS line
   - Backend `src/lib/auth.ts` trustedOrigins array
   - Frontend `src/modules/auth/lib/auth-client.ts` baseURL
   - Frontend `.env` VITE_API_BASE_URL

3. **Last resort - nuclear option:**
   ```bash
   # Stop everything
   pkill -f node
   pkill -f pnpm

   # Clear all caches
   cd /Users/dinuwan/Desktop/nn/bisbig-backend
   rm -rf node_modules/.cache .motia dist

   cd /Users/dinuwan/Desktop/nn/bisbig-web
   rm -rf node_modules/.vite dist .tanstack

   # Restart backend first, wait, then frontend
   ```

## Success Indicators

When working correctly, you'll see in browser DevTools:

**Preflight (OPTIONS) Request:**
```
Request URL: http://localhost:4000/auth/sign-in/email
Request Method: OPTIONS
Status Code: 204 No Content

Response Headers:
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
access-control-allow-headers: Content-Type, Authorization, Cookie
```

**Actual (POST) Request:**
```
Request URL: http://localhost:4000/auth/sign-in/email
Request Method: POST
Status Code: 200 OK (or 400/401 for auth errors)

Response Headers:
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
```

If you see these headers, CORS is working! Any errors would be auth-related, not CORS.
