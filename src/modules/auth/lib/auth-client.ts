import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

/**
 * Auth client configuration for Better Auth
 *
 * Connects directly to the backend auth service.
 * Requires proper CORS configuration on the backend to allow credentials.
 */
export const authClient = createAuthClient({
	baseURL: env.VITE_AUTH_BASE_URL,
	fetchOptions: {
		credentials: "include",
	},
});

/**
 * Export commonly used auth methods for convenience
 */
export const { useSession, signOut, signUp, signIn, forgetPassword } =
	authClient;
