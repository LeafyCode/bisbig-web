import { authClient } from "@/modules/auth/lib/auth-client";
import type {
	AuthContext,
	LoginCredentials,
	SignUpCredentials,
} from "@/modules/auth/types";

/**
 * Custom hook for authentication
 * Wraps Better Auth's useSession hook and provides additional utilities
 */
export const useAuth = (): AuthContext & {
	signIn: (
		credentials: LoginCredentials
	) => Promise<{ data: unknown; error: unknown }>;
	signOut: typeof authClient.signOut;
	signUp: (
		credentials: SignUpCredentials
	) => Promise<{ data: unknown; error: unknown }>;
	error: Error | null;
	refetch: () => void;
} => {
	const session = authClient.useSession();

	return {
		user: session.data?.user ?? null,
		session: session.data?.session ?? null,
		isAuthenticated: !!session.data?.user,
		isLoading: session.isPending,
		error: session.error,
		refetch: session.refetch,
		signIn: authClient.signIn.email,
		signOut: authClient.signOut,
		signUp: authClient.signUp.email,
	};
};
