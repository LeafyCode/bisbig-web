// src/components/ProtectedRoute.tsx

import { Navigate } from "@tanstack/react-router";
import { useSession } from "../lib/authClient";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
	const { session, isLoading } = useSession();

	if (isLoading) {
		return <p>Loading...</p>; // wait for auth check
	}

	if (!session) {
		return <Navigate replace to="/login" />;
	}

	return children;
};
