# Authentication Module

This module handles authentication using Better Auth with the Motia backend.

## Structure

```
src/modules/auth/
├── components/        # Auth-related components (LoginForm, etc.)
├── hooks/            # Auth hooks (useAuth, etc.)
├── lib/              # Auth client configuration
├── types/            # TypeScript types for auth
└── index.ts          # Module exports
```

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with:

```env
VITE_API_BASE_URL=http://localhost:4000
```

This should point to your Motia backend server.

### 2. Backend Requirements

Your Motia backend must have Better Auth configured and running. The backend should expose these endpoints:

- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

See the backend documentation for more details.

## Usage

### Using the useAuth Hook

The `useAuth` hook provides authentication state and methods:

```typescript
import { useAuth } from "@/modules/auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Sign In

```typescript
const { signIn } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await signIn({
    email,
    password,
    callbackURL: "/dashboard", // Optional redirect URL
    rememberMe: true, // Optional
  });

  if (error) {
    console.error("Login failed:", error);
    return;
  }

  console.log("Login successful:", data);
};
```

### Sign Up

```typescript
const { signUp } = useAuth();

const handleSignUp = async (email: string, password: string, name: string) => {
  const { data, error } = await signUp({
    email,
    password,
    name,
    callbackURL: "/dashboard", // Optional redirect URL
  });

  if (error) {
    console.error("Sign up failed:", error);
    return;
  }

  console.log("Sign up successful:", data);
};
```

### Sign Out

```typescript
const { signOut } = useAuth();

const handleSignOut = async () => {
  await signOut();
  // User is now signed out
};
```

### Checking Authentication Status

```typescript
const { isAuthenticated, user, session } = useAuth();

if (isAuthenticated) {
  console.log("User ID:", user?.id);
  console.log("User Email:", user?.email);
  console.log("Session Token:", session?.token);
}
```

## Protected Routes

There are two ways to protect routes:

### Method 1: Using the ProtectedRoute Component (Recommended)

Wrap your component with `ProtectedRoute`:

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute, useAuth } from "@/modules/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user } = useAuth();

  return (
    <ProtectedRoute redirectTo="/login" fallback={<div>Loading...</div>}>
      <div>Welcome to your dashboard, {user?.name}!</div>
    </ProtectedRoute>
  );
}
```

### Method 2: Using Route Guards (beforeLoad)

Check authentication in the route's `beforeLoad` function:

```typescript
// src/routes/dashboard.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient, useAuth } from "@/modules/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data?.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/dashboard",
        },
      });
    }
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user } = useAuth();
  return <div>Welcome to your dashboard, {user?.name}!</div>;
}
```

## Types

The module exports these TypeScript types:

- `User` - User information
- `Session` - Session information
- `AuthContext` - Complete auth context
- `LoginCredentials` - Login form data
- `SignUpCredentials` - Sign up form data

```typescript
import type { User, Session, LoginCredentials } from "@/modules/auth";
```

## API Reference

### `useAuth()`

Returns an object with:

- `user: User | null` - Current user or null if not authenticated
- `session: Session | null` - Current session or null
- `isAuthenticated: boolean` - True if user is logged in
- `isLoading: boolean` - True while checking auth status
- `error: Error | null` - Error from session fetch (if any)
- `refetch: () => void` - Manually refetch session
- `signIn(credentials: LoginCredentials): Promise<{ data, error }>` - Sign in function
- `signOut(): Promise<void>` - Sign out function
- `signUp(credentials: SignUpCredentials): Promise<{ data, error }>` - Sign up function

### `SessionProvider`

Wraps your app to enable session management. Already integrated in the root layout.

```typescript
import { SessionProvider } from "@/modules/auth";

function App() {
  return (
    <SessionProvider>
      {/* Your app content */}
    </SessionProvider>
  );
}
```

### `ProtectedRoute`

Component to protect routes that require authentication.

Props:
- `children: React.ReactNode` - Content to render when authenticated
- `redirectTo?: string` - Path to redirect to when not authenticated (default: "/login")
- `fallback?: React.ReactNode` - Content to show while checking auth (default: "Loading...")

```typescript
import { ProtectedRoute } from "@/modules/auth";

function ProtectedPage() {
  return (
    <ProtectedRoute redirectTo="/login" fallback={<Spinner />}>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### `authClient`

The raw Better Auth client for advanced usage:

```typescript
import { authClient } from "@/modules/auth";

// Get session
const session = await authClient.getSession();

// Sign in
const result = await authClient.signIn.email({ email, password });

// Sign out
await authClient.signOut();
```

## Error Handling

All auth methods return `{ data, error }`. Always check for errors:

```typescript
const { data, error } = await signIn({ email, password });

if (error) {
  // Handle error
  if (typeof error === "string") {
    console.error(error);
  } else {
    console.error("Authentication failed");
  }
  return;
}

// Success - use data
console.log("Logged in:", data);
```

## Common Issues

### "Unauthorized" or 401 errors

- Verify `VITE_API_BASE_URL` points to your backend
- Ensure the backend is running
- Check that Better Auth is configured on the backend

### Session not persisting

- Better Auth uses cookies for session management
- Ensure cookies are enabled in your browser
- Check CORS configuration on the backend

### TypeScript errors

- Ensure all auth types are imported from `@/modules/auth/types`
- Run `pnpm build` to check for type errors

## Testing

To test authentication:

1. Start the backend server: `pnpm dev` (in backend directory)
2. Start the frontend: `pnpm dev` (in this directory)
3. Navigate to `/login`
4. Enter credentials and submit

## Related Files

- [Login Page](/src/routes/_auth/login.tsx) - Login form implementation
- [Environment Config](/src/env.ts) - Environment variable validation
- [Auth Client](/src/modules/auth/lib/auth-client.ts) - Better Auth client setup
