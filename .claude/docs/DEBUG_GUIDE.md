# 🔍 Complete Debugging Guide for CORS Issues

## Step-by-Step Debugging Process

### Step 1: Verify Backend is Running

```bash
# Check if backend is accessible
curl http://localhost:4000/health

# If connection refused, backend is not running
# If you get a response, backend is running
```

**Expected:** Some response (not "connection refused")

---

### Step 2: Check Backend Environment Variables

```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend
node check-env.js
```

**Expected output:**
```
✅ PASS: http://localhost:3000 is in ALLOWED_ORIGINS
✅ PASS: BETTER_AUTH_URL is correct
✅ PASS: FRONT_END_URL is correct
```

**If you see ❌ FAIL:**
- Backend didn't load `.env` correctly
- Restart backend required
- Or `.env` file has wrong values

---

### Step 3: Test CORS Headers Directly

```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend
node test-cors.js
```

**Expected output:**
```
Testing CORS preflight request...

Response Status: 204

Response Headers:
{
  "access-control-allow-origin": "http://localhost:3000",
  "access-control-allow-credentials": "true",
  ...
}

✅ PASS: Access-Control-Allow-Origin is correct: http://localhost:3000
✅ PASS: Access-Control-Allow-Credentials is true
```

**If you see errors:**
1. Backend is not running → Start it
2. Headers show wrong origin → Backend needs restart
3. Headers show `*` → CORS middleware not working

---

### Step 4: Test CORS in Browser

Open: `file:///Users/dinuwan/Desktop/nn/bisbig-web/test-auth-client.html`

Click **"Test CORS"** button

**Expected:**
```
Testing CORS preflight...
OPTIONS Status: 204
CORS Headers: { ... }
✅ Origin is correct!
✅ Credentials allowed!
```

**If you see errors:**
- Red text = CORS is failing
- Check the error message
- Compare with what `test-cors.js` showed

---

### Step 5: Check Browser Network Tab

1. Open http://localhost:3000/login
2. Press F12 → Network tab
3. Clear network log (trash icon)
4. Try to log in
5. Look for the `/auth/sign-in/email` request

#### What to Look For:

**Preflight Request (OPTIONS):**
```
Request URL: http://localhost:4000/auth/sign-in/email
Request Method: OPTIONS
Status Code: 204 (or 200)
```

**Request Headers:**
```
Origin: http://localhost:3000
Access-Control-Request-Method: POST
```

**Response Headers (CRITICAL!):**
```
Access-Control-Allow-Origin: http://localhost:3000  ← Must be EXACT origin!
Access-Control-Allow-Credentials: true              ← Must be present!
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

**If you see:**
- ❌ `Access-Control-Allow-Origin: *` → Backend CORS misconfigured
- ❌ No CORS headers → Middleware not running
- ❌ Status: 404 → Wrong endpoint URL
- ❌ Connection refused → Backend not running

---

## Common Issues & Solutions

### Issue 1: Headers Show `*` Instead of Exact Origin

**Symptom:**
```
access-control-allow-origin: *
```

**Cause:** Backend is using old configuration

**Solution:**
```bash
# Stop backend (Ctrl+C)
cd /Users/dinuwan/Desktop/nn/bisbig-backend
pnpm dev
```

---

### Issue 2: No CORS Headers at All

**Symptom:** Response has no `access-control-*` headers

**Cause:** CORS middleware not running or bypassed

**Debug:**
```bash
# Check if middleware is applied to auth routes
grep -r "withGlobalMiddleware" /Users/dinuwan/Desktop/nn/bisbig-backend/steps/auth/
```

**Should show:** All auth steps use `withGlobalMiddleware`

**Solution:** Verify `steps/auth/sign-in.step.ts` has:
```typescript
export const config = withGlobalMiddleware({
  // ...
});
```

---

### Issue 3: Wrong Origin in Headers

**Symptom:**
```
access-control-allow-origin: http://localhost:5173
```
(But you're on `http://localhost:3000`)

**Cause:** Backend didn't reload `.env` or default is wrong

**Debug:**
```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend
node check-env.js
```

**Solution:**
1. Fix `.env` if needed
2. Restart backend
3. Test again

---

### Issue 4: Preflight Request Fails (Status not 204)

**Symptom:** OPTIONS request returns 404, 500, or other error

**Cause:** OPTIONS method not handled

**Debug:**
Check if CORS middleware handles OPTIONS:
```bash
grep -A 10 "if (req.method === \"OPTIONS\")" /Users/dinuwan/Desktop/nn/bisbig-backend/middlewares/core.middleware.ts
```

**Should return:**
```typescript
if (req.method === "OPTIONS") {
  return {
    status: 204,
    body: undefined,
    headers: { /* CORS headers */ }
  };
}
```

---

### Issue 5: Frontend Cached Old Errors

**Symptom:** Backend is fixed but browser still shows old error

**Solution:**
```bash
# Clear browser cache completely
# Or use Incognito mode
```

**Steps:**
1. Open DevTools (F12)
2. Network tab → Right-click Refresh button
3. Select "Empty Cache and Hard Reload"
4. Or: Close all browser windows and reopen

---

## Advanced Debugging

### Debug 1: Check Actual Request Being Made

**Browser Console:**
```javascript
// Paste this in browser console at http://localhost:3000
fetch('http://localhost:4000/auth/sign-in/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', [...r.headers.entries()]);
  return r.json();
})
.then(d => console.log('Data:', d))
.catch(e => console.error('Error:', e));
```

**Expected:** Either success or auth error (NOT CORS error)

---

### Debug 2: Check Backend Logs

**Start backend with verbose logging:**
```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend
DEBUG=* pnpm dev
```

**Look for:**
- OPTIONS request logged
- POST request logged
- Any CORS-related errors

---

### Debug 3: Compare Headers Between Tests

Run all three tests and compare:

**Test 1 - Command Line:**
```bash
cd /Users/dinuwan/Desktop/nn/bisbig-backend
node test-cors.js
```

**Test 2 - Browser HTML:**
Open `test-auth-client.html` → Click "Test CORS"

**Test 3 - Actual App:**
Open http://localhost:3000/login → Try to log in

**Compare:**
- Do all three show same CORS headers?
- If test 1 & 2 work but test 3 fails → Frontend configuration issue
- If all three fail → Backend configuration issue

---

## Debugging Checklist

Run through this checklist in order:

- [ ] **Backend running?** `curl http://localhost:4000/health`
- [ ] **Environment loaded?** `node check-env.js` (all ✅)
- [ ] **CORS test passes?** `node test-cors.js` (all ✅)
- [ ] **Browser test passes?** Open `test-auth-client.html` → Test CORS (all ✅)
- [ ] **Backend logs show requests?** Check terminal where backend runs
- [ ] **Browser console clear?** No errors except auth errors
- [ ] **Network tab shows correct headers?** OPTIONS returns CORS headers
- [ ] **Cache cleared?** Hard reload in DevTools

**If all checks pass but login still fails:**
- Issue is authentication, NOT CORS
- Check credentials are correct
- Check user exists and email is verified

---

## Quick Reference: Expected vs Actual

### Expected Behavior:

**OPTIONS Request:**
```
Status: 204 No Content
Headers:
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
  access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  access-control-allow-headers: Content-Type, Authorization, Cookie
```

**POST Request:**
```
Status: 200 OK (or 400/401 for auth errors)
Headers:
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
```

### Common Wrong Behaviors:

**Wrong 1: Wildcard**
```
access-control-allow-origin: *  ← WRONG!
```
→ Backend not restarted after config change

**Wrong 2: Wrong Origin**
```
access-control-allow-origin: http://localhost:5173  ← WRONG!
```
→ Frontend is on 3000, not 5173

**Wrong 3: No Credentials**
```
(missing access-control-allow-credentials header)  ← WRONG!
```
→ CORS middleware not setting credentials: true

**Wrong 4: No Headers**
```
(no access-control-* headers at all)  ← WRONG!
```
→ CORS middleware not running

---

## Next Steps Based on Test Results

### If `check-env.js` shows ✅:
Backend config is correct → Restart backend

### If `test-cors.js` shows ✅:
Backend CORS is working → Check frontend/browser

### If browser test shows ✅:
Everything works in isolation → Check actual app code

### If everything shows ✅ but login fails:
- Not a CORS issue
- Check authentication (user exists, email verified, correct password)
- Check backend auth logs

---

## Emergency Reset

If nothing works, do a complete reset:

```bash
# Kill everything
pkill -f node
pkill -f pnpm

# Backend - from scratch
cd /Users/dinuwan/Desktop/nn/bisbig-backend
rm -rf .motia node_modules/.cache
cat .env | grep ALLOWED_ORIGINS  # Verify it has localhost:3000
pnpm dev

# Wait 10 seconds for backend to start

# Test
node check-env.js
node test-cors.js

# Frontend - from scratch
cd /Users/dinuwan/Desktop/nn/bisbig-web
rm -rf .tanstack node_modules/.vite
pnpm dev

# Clear browser cache completely
# Test login
```

---

## Get Help

If still stuck after following all debugging steps:

1. **Capture all test outputs:**
   ```bash
   cd /Users/dinuwan/Desktop/nn/bisbig-backend
   node check-env.js > debug-env.txt
   node test-cors.js > debug-cors.txt
   pnpm dev 2>&1 | head -50 > debug-backend.txt
   ```

2. **Capture browser console:**
   - Open http://localhost:3000/login
   - F12 → Console tab
   - Try to login
   - Right-click console → "Save as..."

3. **Capture network request:**
   - F12 → Network tab
   - Try to login
   - Right-click failed request → Copy → Copy as cURL

4. **Check these files:**
   - Backend `.env` (ALLOWED_ORIGINS line)
   - Backend `middlewares/core.middleware.ts` (line 340-355)
   - Frontend `src/modules/auth/lib/auth-client.ts` (line 18-22)

---

**Most Common Solution: Just restart the backend server!**

90% of CORS issues after configuration changes are solved by simply stopping and starting the backend server to reload environment variables.
