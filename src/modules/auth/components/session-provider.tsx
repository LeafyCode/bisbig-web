import { useEffect } from "react";
import { authClient } from "@/modules/auth/lib/auth-client";

type SessionProviderProps = {
	children: React.ReactNode;
};

/**
 * SessionProvider component
 *
 * Wraps the app to ensure session is initialized and validated on mount.
 * Better Auth's useSession hook is called at the root level to enable
 * session persistence across the entire application.
 */
export function SessionProvider({ children }: SessionProviderProps) {
	const session = authClient.useSession();

	useEffect(() => {
		// Validate session on mount
		// Better Auth automatically handles session persistence via cookies
		if (!(session.isPending || session.data)) {
			// Session is not loading and no data exists
			// This is a fresh mount or expired session
			console.debug("[SessionProvider] No active session");
		}
	}, [session.isPending, session.data]);

	// Don't block rendering - Better Auth handles session loading internally
	// Components can check isLoading state from useAuth() if needed
	return <>{children}</>;
}
