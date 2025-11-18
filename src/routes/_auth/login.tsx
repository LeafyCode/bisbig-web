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

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
});

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

function LoginPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: ({ value }) => {
			// Validate on submit
			const result = loginSchema.safeParse(value);
			if (!result.success) {
				// Schema validation will be caught by field validators
				return;
			}

			setError(null);
			setIsSubmitting(true);

			try {
				// TODO: Implement login logic

				// Redirect to home after successful login
				navigate({ to: "/" });
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "An error occurred during login"
				);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle className="text-xl">Welcome back</CardTitle>
				<CardDescription>
					Enter your credentials to sign in to your account
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
							name="password"
							validators={{
								onBlur: ({ value }) =>
									value.length < 1 ? "Password is required" : undefined,
								onSubmit: ({ value }) =>
									value.length < 1 ? "Password is required" : undefined,
							}}
						/>
						<Field>
							<Button className="w-full" disabled={isSubmitting} type="submit">
								{isSubmitting ? "Signing In..." : "Sign In"}
							</Button>
							<FieldDescription className="text-center">
								Don't have an account?{" "}
								<Link className="text-blue-600 hover:underline" to="/signup">
									Sign up
								</Link>
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
