# Login CORS Fix - Step by Step Guide

## Problem
```
POST http://localhost:4000/auth/sign-in/email net::ERR_FAILED 200 (OK)
TypeError: Failed to fetch
```

Backend is returning 200 OK with correct response, but browser blocks it due to CORS.

## Root Cause
The Motia CORS middleware in `motia.config.ts` is correctly configured, BUT:
1. Better Auth may be adding its own CORS headers
2. Multiple CORS middleware can conflict
3. The order of middleware matters

## Solution

### Step 1: Update Backend motia.config.ts

The CORS middleware needs to run BEFORE Better Auth and should handle OPTIONS requests:

```typescript
import { config } from "@motiadev/core";

const statesPlugin = require("@motiadev/plugin-states/plugin");
const endpointPlugin = require("@motiadev/plugin-endpoint/plugin");
const logsPlugin = require("@motiadev/plugin-logs/plugin");
const observabilityPlugin = require("@motiadev/plugin-observability/plugin");

const cors = require("cors");

export default config({
  plugins: [observabilityPlugin, statesPlugin, endpointPlugin, logsPlugin],

  app: (app) => {
    // CORS must be the FIRST middleware
    app.use(
      cors({
        origin: "http://localhost:3000", // Exact frontend origin
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["Set-Cookie"],
        maxAge: 86400, // 24 hours
        preflightContinue: false,
        optionsSuccessStatus: 204,
      })
    );
  },
});
```

Key changes:
- Added `Cookie` to `allowedHeaders`
- Added `exposedHeaders: ["Set-Cookie"]`
- Added `maxAge`, `preflightContinue`, `optionsSuccessStatus` for proper preflight handling

### Step 2: Check Better Auth Configuration

In your backend `src/lib/auth.ts`, ensure Better Auth is NOT setting conflicting CORS:

```typescript
export const auth = betterAuth({
  // ... other config
  baseURL: "http://localhost:4000",

  // Make sure trustedOrigins includes frontend
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],

  // DO NOT set CORS here - let Motia handle it
  // cors: false, // If this option exists, set to false
});
```

### Step 3: Restart Backend

CRITICAL: You MUST fully restart the backend for changes to take effect:

```bash
# Go to backend directory
cd /Users/dinuwan/Desktop/nn/bisbig-backend

# Stop the server (Ctrl+C)
# Then restart:
pnpm dev
```

### Step 4: Verify Frontend Configuration

Your frontend auth client should look like this (already correct):

```typescript
// src/modules/auth/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL: "http://localhost:4000/auth",
  fetchOptions: {
    credentials: "include",
  },
});
```

### Step 5: Test CORS Headers

Open browser DevTools (F12) → Network tab, then try to login:

**Look for the OPTIONS request (preflight):**
- URL: `http://localhost:4000/auth/sign-in/email`
- Method: OPTIONS
- Status: Should be **204 No Content**
- Response Headers should include:
  ```
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
  access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
  ```

**Then the POST request:**
- URL: `http://localhost:4000/auth/sign-in/email`
- Method: POST
- Status: Should be **200 OK**
- Response Headers should include:
  ```
  access-control-allow-origin: http://localhost:3000
  access-control-allow-credentials: true
  set-cookie: <session cookie>
  ```

## Alternative Solution: Proxy Setup

If CORS continues to be problematic, you can set up a proxy in the frontend:

### Vite Proxy Configuration

Create or update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        credentials: 'include',
      },
    },
  },
})
```

Then update the auth client to use relative URL:

```typescript
// src/modules/auth/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL: "/auth", // Relative URL - proxied to backend
  fetchOptions: {
    credentials: "include",
  },
});
```

**Pros:** No CORS issues since requests are same-origin
**Cons:** Only works in development, not production

## Debugging Steps

If still not working:

1. **Check browser console for exact error:**
   - Copy the full error message
   - Look for CORS-specific details

2. **Check backend logs:**
   - Does it receive the OPTIONS request?
   - Does it receive the POST request?
   - What headers is it sending?

3. **Use curl to test:**
   ```bash
   # Test OPTIONS request
   curl -X OPTIONS http://localhost:4000/auth/sign-in/email \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -v

   # Should show Access-Control-Allow-Origin header
   ```

4. **Check for multiple CORS middleware:**
   - Search backend code for `cors(` or `Access-Control`
   - Ensure only ONE place sets CORS headers

## Expected Behavior When Working

1. User clicks "Sign In"
2. Browser sends OPTIONS preflight → Backend returns 204
3. Browser sends POST with credentials → Backend returns 200 with session cookie
4. Frontend receives response and redirects to dashboard
5. Session cookie is stored and sent with future requests

## Common Mistakes

❌ **Backend has multiple CORS middleware**
- Check if Better Auth config has CORS settings
- Check if there's a separate CORS middleware file
- Solution: Remove all except Motia CORS

❌ **Not restarting backend after config changes**
- Environment and config changes require restart
- Solution: Always Ctrl+C and restart with `pnpm dev`

❌ **Browser caching old CORS responses**
- Browser may cache preflight responses
- Solution: Hard refresh (Cmd+Shift+R) or clear cache

❌ **Wrong origin in CORS config**
- Must match exactly (including protocol and port)
- `http://localhost:3000` ≠ `http://localhost:3000/`
- Solution: Verify with DevTools Network tab

## Success Checklist

- [ ] Backend `motia.config.ts` has CORS with `origin: "http://localhost:3000"`
- [ ] Backend `src/lib/auth.ts` has `trustedOrigins: ["http://localhost:3000"]`
- [ ] Backend fully restarted after config changes
- [ ] Frontend auth client uses `baseURL: "http://localhost:4000/auth"`
- [ ] Frontend auth client has `credentials: "include"`
- [ ] Browser cache cleared
- [ ] OPTIONS request returns 204 with correct headers
- [ ] POST request returns 200 (or auth error, not CORS error)

If all checked and still failing, use the proxy solution above as a workaround.
