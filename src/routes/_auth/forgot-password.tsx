import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/modules/auth/lib/auth-client";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: ForgotPasswordPage,
	validateSearch: z.object({
		token: z.string().optional(),
		// Better Auth might use 'token' in the URL
		callbackURL: z.string().optional(),
	}),
});

const emailSchema = z.object({
	email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number"
		),
	confirmPassword: z.string().min(1, "Please confirm your password"),
});

/**
 * Extract error message from Better Auth error response
 */
function getErrorMessage(error: unknown): string {
	if (!error) {
		return "An error occurred";
	}

	if (typeof error === "object" && error !== null && "message" in error) {
		return String(error.message);
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unexpected error occurred. Please try again.";
}

function ForgotPasswordPage() {
	const search = Route.useSearch();
	const token = search.token;

	console.log("[Forgot Password Page] URL search params:", search);
	console.log("[Forgot Password Page] Token:", token);

	// Determine which view to show based on token presence
	const isResetView = !!token;

	return isResetView ? (
		<ResetPasswordForm token={token} />
	) : (
		<RequestResetForm />
	);
}

/**
 * Form to request a password reset link
 */
function RequestResetForm() {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			const result = emailSchema.safeParse(value);
			if (!result.success) {
				return;
			}

			setError(null);
			setIsSubmitting(true);

			try {
				// Call Better Auth's forgot password endpoint
				// Note: Better Auth will append ?token=xxx to this URL
				const response = await authClient.forgetPassword({
					email: value.email,
					redirectTo: `${window.location.origin}/forgot-password`,
				});

				console.log("[Forgot Password] Reset request response:", response);

				// Better Auth returns a success message in error.message for security
				// This is intentional - it doesn't reveal whether the email exists
				if (response.error) {
					const errorMsg = getErrorMessage(response.error);

					// Check if it's the expected security message
					if (errorMsg.includes("you will receive a password reset link")) {
						// This is actually a success - show success message
						console.log("[Forgot Password] ✅ Reset email request processed");
						setIsSuccess(true);
						return;
					}

					// Otherwise it's a real error
					console.error("[Forgot Password] Error:", response.error);
					setError(errorMsg);
					return;
				}

				// Show success message even if response.data is null
				setIsSuccess(true);
			} catch (err) {
				console.error("[Forgot Password] Unexpected error:", err);
				setError(getErrorMessage(err));
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	if (isSuccess) {
		return (
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Check your email</CardTitle>
					<CardDescription>
						We've sent you a password reset link. Please check your email and
						follow the instructions to reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<FieldDescription className="text-center text-muted-foreground text-sm">
							Didn't receive the email? Check your spam folder or try again.
						</FieldDescription>
						<Button
							className="w-full"
							onClick={() => setIsSuccess(false)}
							variant="outline"
						>
							Send another link
						</Button>
						<FieldDescription className="text-center">
							<Link className="text-blue-600 hover:underline" to="/login">
								Back to login
							</Link>
						</FieldDescription>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Forgot your password?</CardTitle>
				<CardDescription>
					Enter your email address and we'll send you a link to reset your
					password
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{error && (
						<FieldDescription className="mb-4 text-center text-red-600">
							{error}
						</FieldDescription>
					)}
					<FieldGroup>
						<form.Field
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
							children={(field) => (
								<Field>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
										autoFocus
										id="email"
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="m@example.com"
										required
										type="email"
										value={field.state.value}
									/>
									{field.state.meta.errors.length > 0 && (
										<FieldDescription className="text-red-600">
											{typeof field.state.meta.errors[0] === "string"
												? field.state.meta.errors[0]
												: field.state.meta.errors[0]?.message ||
													String(field.state.meta.errors[0])}
										</FieldDescription>
									)}
								</Field>
							)}
							name="email"
							validators={{
								onBlur: ({ value }) => {
									const result = z.string().email().safeParse(value);
									return result.success ? undefined : "Invalid email address";
								},
								onSubmit: ({ value }) => {
									const result = z.string().email().safeParse(value);
									return result.success ? undefined : "Invalid email address";
								},
							}}
						/>
						<Field>
							<Button className="w-full" disabled={isSubmitting} type="submit">
								{isSubmitting ? "Sending..." : "Send reset link"}
							</Button>
							<FieldDescription className="text-center">
								Remember your password?{" "}
								<Link className="text-blue-600 hover:underline" to="/login">
									Sign in
								</Link>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}

/**
 * Form to reset password with a valid token
 */
function ResetPasswordForm({ token }: { token: string }) {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			// Validate passwords match
			if (value.password !== value.confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			const result = resetPasswordSchema.safeParse(value);
			if (!result.success) {
				return;
			}

			setError(null);
			setIsSubmitting(true);

			try {
				// Call Better Auth's reset password endpoint
				const response = await authClient.resetPassword({
					newPassword: value.password,
					token,
				});

				console.log("[Reset Password] Response:", response);

				if (response.error) {
					console.error("[Reset Password] Error:", response.error);
					setError(getErrorMessage(response.error));
					return;
				}

				// Success - redirect to login
				console.log("[Reset Password] ✅ Password reset successful!");
				navigate({ to: "/login" });
			} catch (err) {
				console.error("[Reset Password] Unexpected error:", err);
				setError(getErrorMessage(err));
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Reset your password</CardTitle>
				<CardDescription>
					Enter your new password below. Make sure it's strong and secure.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{error && (
						<FieldDescription className="mb-4 text-center text-red-600">
							{error}
						</FieldDescription>
					)}
					<FieldGroup>
						<form.Field
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
							children={(field) => (
								<Field>
									<FieldLabel htmlFor="password">New Password</FieldLabel>
									<Input
										autoFocus
										id="password"
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
										type="password"
										value={field.state.value}
									/>
									{field.state.meta.errors.length > 0 && (
										<FieldDescription className="text-red-600">
											{typeof field.state.meta.errors[0] === "string"
												? field.state.meta.errors[0]
												: field.state.meta.errors[0]?.message ||
													String(field.state.meta.errors[0])}
										</FieldDescription>
									)}
									<FieldDescription className="text-muted-foreground text-sm">
										Must be at least 8 characters with uppercase, lowercase, and
										number
									</FieldDescription>
								</Field>
							)}
							name="password"
							validators={{
								onBlur: ({ value }) => {
									const result = resetPasswordSchema
										.pick({ password: true })
										.safeParse({ password: value });
									return result.success
										? undefined
										: result.error.errors[0].message;
								},
								onSubmit: ({ value }) => {
									const result = resetPasswordSchema
										.pick({ password: true })
										.safeParse({ password: value });
									return result.success
										? undefined
										: result.error.errors[0].message;
								},
							}}
						/>
						<form.Field
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
							children={(field) => (
								<Field>
									<FieldLabel htmlFor="confirmPassword">
										Confirm Password
									</FieldLabel>
									<Input
										id="confirmPassword"
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
										type="password"
										value={field.state.value}
									/>
									{field.state.meta.errors.length > 0 && (
										<FieldDescription className="text-red-600">
											{typeof field.state.meta.errors[0] === "string"
												? field.state.meta.errors[0]
												: field.state.meta.errors[0]?.message ||
													String(field.state.meta.errors[0])}
										</FieldDescription>
									)}
								</Field>
							)}
							name="confirmPassword"
							validators={{
								onChange: ({ value, fieldApi }) => {
									const password = fieldApi.form.getFieldValue("password");
									if (value && value !== password) {
										return "Passwords do not match";
									}
									return;
								},
								onSubmit: ({ value, fieldApi }) => {
									const password = fieldApi.form.getFieldValue("password");
									if (value !== password) {
										return "Passwords do not match";
									}
									return;
								},
							}}
						/>
						<Field>
							<Button className="w-full" disabled={isSubmitting} type="submit">
								{isSubmitting ? "Resetting..." : "Reset password"}
							</Button>
							<FieldDescription className="text-center">
								<Link className="text-blue-600 hover:underline" to="/login">
									Back to login
								</Link>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
