# Custom Sign-In Implementation

## Overview

This implementation uses **Better Auth to send the request** but **handles custom backend response formats**, bypassing Better Auth's response parsing. This allows the frontend to trigger the backend endpoint while extracting session tokens and custom data emitted by the backend.

## Architecture

```
Frontend (Better Auth) → Backend Endpoint → Custom Response Handler → Session Storage
```

### Flow

1. **Request**: Uses `authClient.signIn.email()` to send authentication request
2. **Backend**: Your backend receives the request and processes it
3. **Response**: Backend returns custom response (event-based or standard)
4. **Parsing**: Frontend parses the response and extracts session data
5. **Storage**: Session token and user data are stored in localStorage
6. **API Calls**: All subsequent API calls automatically include the auth token

## Key Files

### 1. [auth-client.ts](../src/modules/auth/lib/auth-client.ts)

**Main authentication client with custom response handling:**

```typescript
export const customSignIn = async (email: string, password: string)
```

**Supported Response Formats:**

#### Event-based Response (Recommended)
```json
{
  "topic": "user.signed-in",
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "sessionToken": "abc123...",
    "timestamp": "2025-01-21T..."
  }
}
```

#### Standard Response
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "abc123..."
  }
}
```

**Helper Functions:**
- `getStoredSession()` - Retrieve current session from localStorage
- `isAuthenticated()` - Check if user has valid token
- `clearSession()` - Remove session data

### 2. [client.ts](../src/modules/shared/api/client.ts)

**Axios client with automatic token injection:**

All API requests automatically include:
```
Authorization: Bearer <token>
```

The token is retrieved from localStorage and attached in the request interceptor.

### 3. [login.tsx](../src/routes/_auth/login.tsx)

**Login page using custom sign-in:**

```typescript
const response = await customSignIn(value.email, value.password);

if (response.success && response.session) {
  // Session stored automatically
  // Token available in localStorage
  window.location.href = "/";
}
```

## Usage

### Sign In
```typescript
import { customSignIn } from "@/modules/auth/lib/auth-client";

const result = await customSignIn("user@example.com", "password");

if (result.success) {
  console.log("User:", result.user);
  console.log("Session:", result.session);
  // Navigate to protected route
} else {
  console.error("Error:", result.error);
}
```

### Make Authenticated API Calls
```typescript
import { apiClient } from "@/modules/shared/api/client";

// Token is automatically attached
const response = await apiClient.get("/api/protected-resource");
```

### Check Authentication Status
```typescript
import { isAuthenticated, getStoredSession } from "@/modules/auth/lib/auth-client";

if (isAuthenticated()) {
  const { user, session } = getStoredSession();
  console.log("Current user:", user);
}
```

### Sign Out
```typescript
import { clearSession } from "@/modules/auth/lib/auth-client";

clearSession();
window.location.href = "/login";
```

## Session Storage

**LocalStorage Keys:**
- `auth_token` - JWT or session token
- `user_id` - User ID
- `user_email` - User email
- `user_name` - User name (optional)

## Backend Integration

Your backend should:

1. **Accept requests** from Better Auth endpoint (e.g., `/auth/sign-in/email`)
2. **Process authentication** with your custom logic
3. **Return response** in one of the supported formats above
4. **Accept Bearer token** in Authorization header for protected routes

### Example Backend Response Handler

```typescript
// Emit event-based response
res.json({
  topic: "user.signed-in",
  data: {
    userId: user.id,
    email: user.email,
    sessionToken: generateToken(user),
    timestamp: new Date().toISOString()
  }
});
```

## Benefits

✅ **Uses Better Auth** for request handling (CORS, credentials, etc.)
✅ **Custom response parsing** to extract your backend's data format
✅ **Bypasses Better Auth limitations** while keeping the good parts
✅ **Session token stored** and auto-attached to all API calls
✅ **Event-based responses** supported for real-time systems
✅ **Flexible backend** - structure your response however you want

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_AUTH_BASE_URL=http://localhost:4000/auth
```

## Type Safety

All response types are defined:
- `User` - User data structure
- `Session` - Session data with token
- `CustomAuthResponse` - Sign-in response wrapper

## Error Handling

Errors are captured and returned with descriptive messages:
- Network errors
- Backend validation errors
- Authentication failures
- Unexpected response formats

All errors are logged to console with `[CustomSignIn]` prefix for debugging.
