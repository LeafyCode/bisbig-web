/**
 * Auth Module Exports
 * Centralized exports for authentication functionality
 *
 * Note: This is a barrel file for convenient imports.
 * The auth module is cohesive and all exports are commonly used together.
 */

// Components
// biome-ignore lint/performance/noBarrelFile: Auth module exports are cohesive and commonly used together
export { ProtectedRoute } from "./components/protected-route";
export { SessionProvider } from "./components/session-provider";

// Custom hooks
export { useAuth } from "./hooks/use-auth";

// Auth client and utilities
export {
	authClient,
	signIn,
	signOut,
	signUp,
	useSession,
} from "./lib/auth-client";

// Types
export type {
	AuthContext,
	LoginCredentials,
	Session,
	SignUpCredentials,
	User,
} from "./types";
