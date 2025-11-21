/**
 * User type from Better Auth
 */
export type User = {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Session type from Better Auth
 */
export type Session = {
	id: string;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
};

/**
 * Auth context type
 */
export type AuthContext = {
	user: User | null;
	session: Session | null;
	isAuthenticated: boolean;
	isLoading: boolean;
};

/**
 * Login credentials
 */
export type LoginCredentials = {
	email: string;
	password: string;
	rememberMe?: boolean;
	callbackURL?: string;
};

/**
 * Sign up credentials
 */
export type SignUpCredentials = {
	email: string;
	password: string;
	name: string;
	callbackURL?: string;
};
