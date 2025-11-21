import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/modules/auth/hooks/use-auth";

type ProtectedRouteProps = {
	children: React.ReactNode;
	redirectTo?: string;
	fallback?: React.ReactNode;
};

/**
 * ProtectedRoute component
 *
 * Wraps routes that require authentication. If the user is not authenticated,
 * they will be redirected to the login page (or specified redirectTo path).
 *
 * @example
 * ```tsx
 * import { ProtectedRoute } from '@/modules/auth/components/protected-route'
 *
 * function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardContent />
 *     </ProtectedRoute>
 *   )
 * }
 * ```
 */
export function ProtectedRoute({
	children,
	redirectTo = "/login",
	fallback = <div>Loading...</div>,
}: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <>{fallback}</>;
	}

	if (!isAuthenticated) {
		return <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
}
