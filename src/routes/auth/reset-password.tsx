import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

/**
 * Redirect route for Better Auth's default reset password URL
 * Redirects from /auth/reset-password?token=xxx to /forgot-password?token=xxx
 */
export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: z.object({
		token: z.string(),
	}),
	beforeLoad: ({ search }) => {
		// Redirect to the forgot-password page with the token
		throw redirect({
			to: "/forgot-password",
			search: { token: search.token },
		});
	},
});
