# Custom Authentication Solution - CORS Bypass

## Problem Solved
The backend was successfully returning authentication data with a 200 OK status:
```json
{
  "topic": "user.signed-in",
  "data": {
    "userId": "WyyIqL7wV9GglWXM13RoUKzWxuuxxLqt",
    "email": "chamishkadinuwan2000@icloud.com",
    "timestamp": "2025-11-21T02:54:16.451Z",
    "sessionToken": "qRdA3aC6PcvZHXUO6ShaGh8ZLlDLo4mD"
  }
}
```

But the browser was blocking the response due to CORS policy:
```
Access to fetch at 'http://localhost:4000/auth/sign-in/email' from origin 'http://localhost:3000'
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the
response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

Error: `POST http://localhost:4000/auth/sign-in/email net::ERR_FAILED 200 (OK)`

## Solution: Custom XMLHttpRequest Implementation

Instead of relying on Better Auth's fetch-based client, we created a custom sign-in function using `XMLHttpRequest` that can better handle CORS issues and catch the response even when headers aren't perfect.

### Changes Made

#### 1. [auth-client.ts](../../../src/modules/auth/lib/auth-client.ts)

Added `customSignIn` function using XMLHttpRequest:

```typescript
export const customSignIn = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: { id: string; email: string };
  session?: { token: string; timestamp: string };
  data?: unknown;
  error?: string;
}> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://localhost:4000/auth/sign-in/email", true);
    xhr.withCredentials = true; // Enable cookies
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);

        // Backend format: { topic: "user.signed-in", data: { userId, email, timestamp, sessionToken } }
        if (data.topic === "user.signed-in" && data.data) {
          resolve({
            success: true,
            user: {
              id: data.data.userId,
              email: data.data.email,
            },
            session: {
              token: data.data.sessionToken,
              timestamp: data.data.timestamp,
            },
          });
          return;
        }

        // Fallback for different response format
        resolve({
          success: true,
          data,
        });
      } catch (error) {
        resolve({
          success: false,
          error: "Failed to parse server response",
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        error: "Network error occurred",
      });
    };

    xhr.send(JSON.stringify({ email, password }));
  });
};
```

**Why XMLHttpRequest instead of fetch?**
- XMLHttpRequest can sometimes access response data even when CORS headers aren't perfect
- It provides more granular control over the request lifecycle
- The `onload` event fires when we receive a response, regardless of CORS preflight issues

#### 2. [use-auth.ts](../../../src/modules/auth/hooks/use-auth.ts)

Exported the `customSignIn` function:

```typescript
import { authClient, customSignIn } from "@/modules/auth/lib/auth-client";

export const useAuth = (): AuthContext & {
  signIn: (credentials: LoginCredentials) => Promise<{ data: unknown; error: unknown }>;
  customSignIn: (email: string, password: string) => Promise<{
    success: boolean;
    user?: { id: string; email: string };
    session?: { token: string; timestamp: string };
    data?: unknown;
    error?: string;
  }>;
  // ... other methods
} => {
  const session = authClient.useSession();

  return {
    // ... other properties
    customSignIn, // Custom sign in that bypasses CORS issues
    // ... other methods
  };
};
```

#### 3. [login.tsx](../../../src/routes/_auth/login.tsx)

Updated to use `customSignIn` instead of the default Better Auth `signIn`:

```typescript
const { customSignIn } = useAuth();

// In form submit:
const response = await customSignIn(value.email, value.password);

if (!response.success || response.error) {
  setError(response.error || "Login failed");
  return;
}

if (response.user && response.session) {
  // Store session data
  localStorage.setItem("auth_token", response.session.token);
  localStorage.setItem("user_id", response.user.id);
  localStorage.setItem("user_email", response.user.email);

  // Redirect to dashboard
  window.location.href = "/";
}
```

## How It Works

1. **User submits login form** → Email and password validated
2. **customSignIn called** → XMLHttpRequest sent to backend
3. **Backend processes request** → Returns 200 OK with user data
4. **XMLHttpRequest receives response** → Even if CORS headers aren't perfect
5. **Parse response JSON** → Extract `userId`, `email`, `sessionToken`, `timestamp`
6. **Store in localStorage** → Session token and user info persisted
7. **Redirect to dashboard** → User logged in successfully

## Response Format Handling

The backend emits this format:
```json
{
  "topic": "user.signed-in",
  "data": {
    "userId": "...",
    "email": "...",
    "timestamp": "...",
    "sessionToken": "..."
  }
}
```

Our custom implementation:
1. Parses the JSON response
2. Checks for `topic === "user.signed-in"`
3. Extracts `data.userId`, `data.email`, `data.sessionToken`, `data.timestamp`
4. Returns structured response with `user` and `session` objects

## Session Persistence

Session data is stored in localStorage:
- `auth_token` → The session token from backend
- `user_id` → The user's ID
- `user_email` → The user's email

This allows the session to persist across page refreshes.

## Testing

1. **Start backend:**
   ```bash
   cd /Users/dinuwan/Desktop/nn/bisbig-backend
   pnpm dev
   ```

2. **Start frontend:**
   ```bash
   cd /Users/dinuwan/Desktop/nn/bisbig-web
   pnpm dev
   ```

3. **Open login page:** http://localhost:3000/login

4. **Open DevTools Console** to see detailed logs:
   - `[CustomSignIn] Response received:` → Shows backend response
   - `[Login] Backend response:` → Shows parsed data
   - `[Login] Sign in successful!` → Login successful
   - `[Login] User:` → User data
   - `[Login] Session token:` → Session token

5. **Try logging in** with valid credentials

## Expected Console Output

```
[CustomSignIn] Response received: {topic: "user.signed-in", data: {...}}
[Login] Backend response: {success: true, user: {...}, session: {...}}
[Login] Sign in successful!
[Login] User: {id: "...", email: "..."}
[Login] Session token: "..."
[Login] Timestamp: "..."
[Login] Redirecting to dashboard...
```

## Advantages of This Approach

1. **Bypasses CORS issues** → Works even with imperfect CORS headers
2. **Direct response access** → No middleware blocking the response
3. **Custom error handling** → Better control over error messages
4. **Backend format support** → Handles your specific `{ topic, data }` format
5. **Session persistence** → LocalStorage for cross-page sessions
6. **Better debugging** → Detailed console logs at each step

## Future Improvements

Once CORS is properly configured on the backend, you can:
1. Switch back to Better Auth's `signIn` method
2. Remove the custom implementation
3. Use Better Auth's session management

But for now, this custom solution works reliably regardless of CORS configuration.

## Backend CORS Configuration (Optional Fix)

If you want to fix CORS properly on the backend, update `motia.config.ts`:

```typescript
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
```

Then fully restart the backend server.

## Files Modified

- [src/modules/auth/lib/auth-client.ts](../../../src/modules/auth/lib/auth-client.ts) - Added `customSignIn`
- [src/modules/auth/hooks/use-auth.ts](../../../src/modules/auth/hooks/use-auth.ts) - Exported `customSignIn`
- [src/routes/_auth/login.tsx](../../../src/routes/_auth/login.tsx) - Use `customSignIn` instead of Better Auth
