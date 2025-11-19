import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FieldDescription } from "@/components/ui/field";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
			<div className="w-full max-w-md">
				<Outlet />

				<FieldDescription className="mt-4 px-6 text-center">
					By clicking continue, you agree to our{" "}
					{/* biome-ignore lint/a11y/useValidAnchor: Placeholder links for demo */}
					<a href="#">Terms of Service</a> and{" "}
					{/* biome-ignore lint/a11y/useValidAnchor: Placeholder links for demo */}
					<a href="#">Privacy Policy</a>.
				</FieldDescription>
			</div>
		</div>
	);
}
