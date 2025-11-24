import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/modules/auth/lib/auth-client";

export const Route = createFileRoute("/_app/tasks")({
	component: TasksPage,
});

function TasksPage() {
	const { data: session } = useSession();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Tasks</h1>
					<p className="text-gray-600">
						Welcome back, {session?.user?.name || session?.user?.email}!
					</p>
				</div>
			</div>

			<div className="rounded-lg border bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-semibold text-xl">Your Tasks</h2>
				<p className="text-gray-600">
					This is your tasks page. Start building your task management features
					here!
				</p>
			</div>
		</div>
	);
}
