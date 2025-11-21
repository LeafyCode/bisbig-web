# CORS Authentication - Solution Summary

## Problem
Getting CORS error when trying to authenticate:
```
Access to fetch at 'http://localhost:4000/auth/sign-in/email' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

## Root Cause
When using `credentials: 'include'` in fetch requests (required for cookie-based auth), browsers enforce strict CORS:
- Backend must explicitly allow the frontend origin
- Backend must set `Access-Control-Allow-Credentials: true`
- Backend must handle preflight OPTIONS requests correctly

## Solution: Backend CORS Configuration

The **correct and only solution** is to configure CORS properly on the backend.

### ✅ What Was Done

#### 1. Frontend Auth Client - [auth-client.ts](src/modules/auth/lib/auth-client.ts)
```typescript
export const authClient = createAuthClient({
  baseURL: "http://localhost:4000/auth",  // Must be absolute URL
  fetchOptions: {
    credentials: "include",  // Required for cookies/sessions
  },
});
```

**Important Notes:**
- ✅ Must use absolute URL with protocol (`http://` or `https://`)
- ❌ Cannot use relative URLs like `/auth` (Better Auth validation fails)
- ❌ Cannot use environment variables during module initialization (SSR issues)
- ✅ Hardcoded for development, should be configurable for production

#### 2. Backend CORS Setup (See [CORS_FIX.md](CORS_FIX.md))

The backend needs these configurations:

**Backend `.env`:**
```env
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
BETTER_AUTH_URL="http://localhost:4000"
```

**Backend `src/lib/auth.ts`:**
```typescript
trustedOrigins: [
  "http://localhost:3000",  // TanStack Start dev server
  "http://localhost:5173",  // Vite default port
],
baseURL: "http://localhost:4000",
```

**Backend CORS Middleware:**
- Must read from `ALLOWED_ORIGINS` environment variable
- Must set `Access-Control-Allow-Credentials: true`
- Must handle OPTIONS preflight requests
- Must NOT use wildcard `*` for origin when credentials are included

## How It Works

### Client-Side Request Flow

1. **Browser initiates login**: User clicks sign in button
2. **Preflight OPTIONS request**: Browser sends to `http://localhost:4000/auth/sign-in/email`
3. **Backend CORS middleware**: Checks origin, returns appropriate headers
4. **Browser validates**: Checks `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`
5. **Actual POST request**: If preflight passes, sends login credentials
6. **Backend processes auth**: Better Auth handles authentication
7. **Response with cookies**: Backend sets session cookie
8. **Success**: Frontend receives auth response and redirects

### Expected Headers

**Preflight Response (OPTIONS):**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Status: 204 No Content
```

**Auth Response (POST):**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Set-Cookie: session=...; HttpOnly; SameSite=Lax
Status: 200 OK
```

## Troubleshooting

### Still Getting CORS Errors?

1. **Restart backend completely**
   ```bash
   cd /path/to/backend
   # Stop with Ctrl+C
   pnpm dev
   ```
   Environment variables are only loaded at startup!

2. **Clear browser cache**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or clear all browser data

3. **Check browser DevTools Network tab**
   - Look for OPTIONS request (preflight)
   - Check response headers for `Access-Control-Allow-Origin`
   - Verify it matches your frontend origin exactly

4. **Verify backend configuration**
   ```bash
   cd /path/to/backend
   cat .env | grep ALLOWED_ORIGINS
   # Should show: ALLOWED_ORIGINS="http://localhost:3000,..."
   ```

5. **Run CORS test** (if available)
   ```bash
   cd /path/to/backend
   node test-cors.js
   # Should show: ✅ PASS: Access-Control-Allow-Origin is correct
   ```

### Common Mistakes

❌ **Using relative URLs in auth client**
```typescript
// WRONG - Better Auth will reject this
baseURL: "/auth"
```

❌ **Backend using wildcard with credentials**
```javascript
// WRONG - Browser will block this
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Credentials', 'true')
```

❌ **Forgetting to restart backend after .env changes**
```bash
# WRONG - Old env vars still loaded
# Just make .env changes without restart
```

✅ **Correct setup**
```typescript
// Frontend
baseURL: "http://localhost:4000/auth"
credentials: "include"

// Backend
Access-Control-Allow-Origin: http://localhost:3000  // Exact match
Access-Control-Allow-Credentials: true
```

## Production Considerations

For production deployment:

1. **Update auth client baseURL**
   - Use environment variable: `process.env.VITE_API_BASE_URL`
   - Or build-time configuration
   - Or runtime configuration from server

2. **Update backend CORS**
   - Add production frontend URL to `ALLOWED_ORIGINS`
   - Use HTTPS URLs (`https://yourdomain.com`)
   - Consider same-domain deployment to avoid CORS entirely

3. **Secure cookies**
   - Set `Secure` flag (HTTPS only)
   - Use `SameSite=Strict` or `SameSite=Lax`
   - Set appropriate `Domain` and `Path`

## Related Files

- [CORS_FIX.md](CORS_FIX.md) - Detailed backend CORS setup guide
- [auth-client.ts](src/modules/auth/lib/auth-client.ts) - Frontend auth configuration
- [login.tsx](src/routes/_auth/login.tsx) - Login page implementation
- [use-auth.ts](src/modules/auth/hooks/use-auth.ts) - Auth hook

## Success Indicators

When everything is working correctly:

✅ No CORS errors in browser console
✅ OPTIONS request returns 204 with correct headers
✅ POST request succeeds (or fails with auth error, not CORS)
✅ Cookies are set correctly
✅ Session persists across page refreshes

If you see auth errors (like "Invalid credentials" or "Email not verified"), that means CORS is working! Those are application-level errors, not infrastructure issues.
