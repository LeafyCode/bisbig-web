import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/modules/auth/lib/auth-client";

/**
 * Email verification route
 * Handles the email verification link from Better Auth
 * URL: /auth/verify-email?token=xxx
 */
export const Route = createFileRoute("/auth/verify-email")({
	component: VerifyEmailPage,
	validateSearch: z.object({
		token: z.string(),
	}),
});

function VerifyEmailPage() {
	const navigate = useNavigate();
	const { token } = Route.useSearch();
	const [status, setStatus] = useState<"verifying" | "success" | "error">(
		"verifying"
	);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				console.log("[Verify Email] Verifying token:", token);

				// Call Better Auth's verify email endpoint with POST and JSON body
				const response = await authClient.$fetch("/verify-email", {
					method: "POST",
					body: {
						token,
					},
				});

				console.log("[Verify Email] Response:", response);

				// Check if response indicates success
				if (response && typeof response === "object") {
					// Better Auth returns success data
					console.log("[Verify Email] ✅ Email verified successfully!");
					setStatus("success");
					return;
				}

				// If we get here, something unexpected happened
				setStatus("error");
				setErrorMessage(
					"Failed to verify email. The link may be expired or invalid."
				);
			} catch (err) {
				console.error("[Verify Email] Unexpected error:", err);

				// Check if it's a Better Auth error
				if (err && typeof err === "object" && "message" in err) {
					setErrorMessage(String(err.message));
				} else {
					setErrorMessage(
						"An unexpected error occurred. Please try again or contact support."
					);
				}

				setStatus("error");
			}
		};

		verifyEmail();
	}, [token]);

	if (status === "verifying") {
		return (
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Verifying your email...</CardTitle>
					<CardDescription>
						Please wait while we verify your email address
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center py-8">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (status === "error") {
		return (
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Verification failed</CardTitle>
					<CardDescription className="text-red-600">
						{errorMessage}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						className="w-full"
						onClick={() => navigate({ to: "/signup" })}
						variant="outline"
					>
						Back to signup
					</Button>
					<Button className="w-full" onClick={() => navigate({ to: "/login" })}>
						Go to login
					</Button>
				</CardContent>
			</Card>
		);
	}

	// Success
	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Email verified!</CardTitle>
				<CardDescription>
					Your email has been successfully verified. You can now sign in to your
					account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button className="w-full" onClick={() => navigate({ to: "/login" })}>
					Continue to login
				</Button>
			</CardContent>
		</Card>
	);
}
