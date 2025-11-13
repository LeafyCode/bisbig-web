import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import {
	getContext as getTanstackQueryContext,
	Provider as TanstackQueryProvider,
} from "./integrations/tanstack-query/root-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const rqContext = getTanstackQueryContext();

	const router = createRouter({
		routeTree,
		context: { ...rqContext },
		defaultPreload: "intent",
		Wrap: (props: { children: React.ReactNode }) => (
			<TanstackQueryProvider {...rqContext}>
				{props.children}
			</TanstackQueryProvider>
		),
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
};
