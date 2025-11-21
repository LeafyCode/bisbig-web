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
import { useAuth } from "@/modules/auth/hooks/use-auth";

export const Route = createFileRoute("/_auth/signup")({
	component: SignUpPage,
});

const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128, "Password must be less than 128 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

/**
 * Extract error message from Better Auth error response
 */
function getErrorMessage(error: unknown): string {
	if (!error) {
		return "An error occurred during signup";
	}

	// Better Auth returns error as an object with message property
	if (typeof error === "object" && error !== null && "message" in error) {
		return String(error.message);
	}

	if (typeof error === "string") {
		return error;
	}

	return "Failed to create account. Please try again.";
}

/**
 * Process signup response and handle email verification
 */
function handleSignupResponse(
	response: { data?: unknown; error?: unknown },
	email: string,
	handlers: {
		setUserEmail: (userEmail: string) => void;
		setIsSuccess: (success: boolean) => void;
		navigate: (options: { to: string }) => Promise<void>;
	}
): void {
	console.log("[SignUp] Sign up successful!");
	console.log("[SignUp] Full response data:", response.data);

	const signupData = response.data as {
		message?: string;
		user?: {
			id: string;
			email: string;
			name: string;
			emailVerified: boolean;
		};
	};

	if (signupData.user) {
		console.log("[SignUp] User data:", signupData.user);

		// Check if email verification is required
		if (!signupData.user.emailVerified) {
			console.log("[SignUp] Email verification required");
			handlers.setUserEmail(email);
			handlers.setIsSuccess(true);
			return;
		}
	}

	if (signupData.message) {
		console.log("[SignUp] Message:", signupData.message);
	}
	console.log("[SignUp] Redirecting to dashboard...");

	// Redirect to dashboard after successful signup
	handlers.navigate({ to: "/" }).catch((err) => {
		console.error("[SignUp] Navigation error:", err);
	});
}

function SignUpPage() {
	const navigate = useNavigate();
	const { signUp } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [userEmail, setUserEmail] = useState<string>("");

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			// Validate on submit
			const result = signupSchema.safeParse(value);
			if (!result.success) {
				return;
			}

			setError(null);
			setIsSubmitting(true);

			try {
				const response = await signUp({
					name: value.name,
					email: value.email,
					password: value.password,
				});

				console.log("[SignUp] Backend response:", {
					data: response.data,
					error: response.error,
					fullResponse: response,
				});

				if (response.error) {
					console.error("[SignUp] Authentication error:", response.error);
					setError(getErrorMessage(response.error));
					return;
				}

				if (response.data) {
					handleSignupResponse(response, value.email, {
						setUserEmail,
						setIsSuccess,
						navigate,
					});
				}
			} catch (err) {
				console.error("[SignUp] Unexpected error during sign up:", err);
				setError(getErrorMessage(err));
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Show success message if email verification is required
	if (isSuccess) {
		return (
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Check your email</CardTitle>
					<CardDescription>
						We've sent a verification link to <strong>{userEmail}</strong>.
						Please check your email and click the link to verify your account.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FieldDescription className="text-center text-muted-foreground text-sm">
						Didn't receive the email? Check your spam folder. The link will
						expire in 1 hour.
					</FieldDescription>
					<Button
						className="w-full"
						onClick={() => navigate({ to: "/login" })}
						variant="outline"
					>
						Go to login
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Create an account</CardTitle>
				<CardDescription>
					Enter your information to create your account
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
									<FieldLabel htmlFor="name">Full Name</FieldLabel>
									<Input
										id="name"
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="John Doe"
										required
										type="text"
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
							name="name"
							validators={{
								onBlur: ({ value }) => {
									const result = z.string().min(2).safeParse(value);
									return result.success
										? undefined
										: "Name must be at least 2 characters";
								},
								onSubmit: ({ value }) => {
									const result = z.string().min(2).safeParse(value);
									return result.success
										? undefined
										: "Name must be at least 2 characters";
								},
							}}
						/>
						<form.Field
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
							children={(field) => (
								<Field>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
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
						<form.Field
							// biome-ignore lint/correctness/noChildrenProp: TanStack Form requires children prop
							children={(field) => (
								<Field>
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Input
										id="password"
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="••••••••"
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
									<FieldDescription>
										Must be at least 8 characters
									</FieldDescription>
								</Field>
							)}
							name="password"
							validators={{
								onBlur: ({ value }) => {
									const result = z.string().min(8).max(128).safeParse(value);
									return result.success
										? undefined
										: "Password must be 8-128 characters";
								},
								onSubmit: ({ value }) => {
									const result = z.string().min(8).max(128).safeParse(value);
									return result.success
										? undefined
										: "Password must be 8-128 characters";
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
										placeholder="••••••••"
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
								onBlur: ({ value, fieldApi }) => {
									const password = fieldApi.form.getFieldValue("password");
									return value === password
										? undefined
										: "Passwords don't match";
								},
								onSubmit: ({ value, fieldApi }) => {
									const password = fieldApi.form.getFieldValue("password");
									return value === password
										? undefined
										: "Passwords don't match";
								},
							}}
						/>
						<Field>
							<Button className="w-full" disabled={isSubmitting} type="submit">
								{isSubmitting ? "Creating Account..." : "Create Account"}
							</Button>
							<FieldDescription className="text-center">
								Already have an account?{" "}
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
