import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { env } from "@/env";

/**
 * Base API client configured with the backend URL
 * All HTTP requests should use this client for consistency
 */
export const apiClient: AxiosInstance = axios.create({
	baseURL: env.VITE_API_BASE_URL,
	timeout: 30_000, // 30 seconds
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Important for auth cookies/sessions
});

/**
 * Request interceptor - runs before every request
 * Use this to add auth tokens, logging, etc.
 */
apiClient.interceptors.request.use(
	(config) => {
		// Attach auth token from localStorage if available
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Log requests in development
		if (import.meta.env.DEV) {
			console.log(
				`[API Request] ${config.method?.toUpperCase()} ${config.url}`
			);
		}

		return config;
	},
	(error) => Promise.reject(error)
);

/**
 * Response interceptor - runs after every response
 * Use this for error handling, token refresh, etc.
 */
apiClient.interceptors.response.use(
	(response) => {
		// Log responses in development
		if (import.meta.env.DEV) {
			console.log(
				`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
				response.status
			);
		}

		return response;
	},
	(error) => {
		// Handle common errors
		if (error.response) {
			// Server responded with error status
			const status = error.response.status;

			if (status === 401) {
				// Unauthorized - redirect to login or refresh token
				console.error("[API Error] Unauthorized request");
				// You can add redirect logic here
				// window.location.href = '/login';
			} else if (status === 403) {
				// Forbidden
				console.error("[API Error] Forbidden access");
			} else if (status === 404) {
				// Not found
				console.error("[API Error] Resource not found");
			} else if (status >= 500) {
				// Server error
				console.error("[API Error] Server error:", error.response.data);
			}
		} else if (error.request) {
			// Request made but no response received
			console.error("[API Error] No response from server");
		} else {
			// Error setting up the request
			console.error("[API Error] Request setup failed:", error.message);
		}

		return Promise.reject(error);
	}
);

/**
 * Type-safe API request helper
 * Usage example:
 * const data = await apiRequest<User>({ url: '/users/1', method: 'GET' });
 */
export const apiRequest = async <T = unknown>(
	config: AxiosRequestConfig
): Promise<T> => {
	const response = await apiClient.request<T>(config);
	return response.data;
};
