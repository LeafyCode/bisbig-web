# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BisBig Web** is a frontend React application built with **TanStack Start**. This is a **frontend-only** application that communicates with a separate backend API. Authentication is handled via **Better Auth**.

**Important:** This is NOT a Next.js app—it uses TanStack Router for file-based routing and Vite for building.

**Tech Stack:**
- TanStack Start 1.132.0 (React framework with SSR)
- React 19.2.0
- TypeScript 5.7.2 (strict mode)
- Vite 7.1.7 (build tool)
- Tailwind CSS 4.0.6
- TanStack Query (React Query) for API calls
- Better Auth for authentication
- Vitest 3.0.5 (testing)

---

## Development Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm serve            # Preview production build

# Testing
pnpm test             # Run Vitest tests

# Code Quality
pnpm lint:fix         # Lint and auto-fix (use this before commits)
pnpm lint             # Check for issues
pnpm format           # Format code
pnpm check            # Run Biome checks

# Storybook
pnpm storybook        # Start Storybook dev server on port 6006
pnpm build-storybook  # Build Storybook

# Add shadcn components
pnpx shadcn@latest add button    # Add UI components
```

---

## Project Structure

This project uses a **modular architecture** where code is organized by feature/domain rather than by type:

```
src/
├── modules/                  # Feature modules (organized by domain)
│   ├── shared/              # Shared code across all modules
│   │   ├── components/      # Reusable UI components
│   │   │   └── ui/         # shadcn UI components (Button, Input, etc.)
│   │   ├── hooks/          # Shared custom React hooks
│   │   ├── lib/            # Shared utility functions
│   │   │   └── utils.ts    # cn() for Tailwind class merging
│   │   ├── types/          # Shared TypeScript types/interfaces
│   │   ├── api/            # API client, base queries, utilities
│   │   └── config/         # Shared configuration
│   │
│   ├── auth/               # Authentication module (Better Auth)
│   │   ├── components/     # Auth-related components (LoginForm, etc.)
│   │   ├── hooks/          # Auth hooks (useAuth, useUser, etc.)
│   │   ├── types/          # Auth types
│   │   └── api/            # Auth API calls
│   │
│   ├── [feature-name]/     # Feature-specific modules (e.g., dashboard, products, etc.)
│   │   ├── components/     # Feature-specific components
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── lib/            # Feature-specific utilities
│   │   ├── types/          # Feature-specific types
│   │   └── api/            # Feature-specific API queries/mutations
│   │
│   └── ...                 # Additional feature modules
│
├── routes/                 # File-based routing (TanStack Router)
│   ├── __root.tsx         # Root layout (like _app.tsx in Next.js)
│   └── index.tsx          # Home page (/)
│
├── integrations/          # Third-party integrations
│   └── tanstack-query/    # React Query setup
│
├── router.tsx             # Router configuration
├── env.ts                 # Type-safe environment variables (T3Env)
├── styles.css             # Global Tailwind CSS
└── routeTree.gen.ts       # Auto-generated route tree (don't edit)
```

### Module Organization Principles

1. **Feature Modules**: Each feature/domain gets its own folder in `src/modules/`
   - Example: `src/modules/auth/`, `src/modules/dashboard/`, `src/modules/products/`

2. **Shared Module**: Common code goes in `src/modules/shared/`
   - UI components used across features
   - Common hooks, utilities, types
   - Design system components (shadcn)
   - Base API client configuration

3. **Self-Contained Modules**: Each module should contain:
   - `components/` - React components specific to this feature
   - `hooks/` - Custom hooks for this feature
   - `lib/` - Utility functions for this feature
   - `types/` - TypeScript types/interfaces for this feature
   - `api/` - React Query hooks for API calls (queries, mutations)

4. **Import Pattern**:
   ```typescript
   // Shared imports
   import { Button } from '@/modules/shared/components/ui/button'
   import { cn } from '@/modules/shared/lib/utils'
   import { apiClient } from '@/modules/shared/api/client'

   // Feature-specific imports
   import { LoginForm } from '@/modules/auth/components/login-form'
   import { useAuth } from '@/modules/auth/hooks/use-auth'

   // Other feature imports
   import { ProductCard } from '@/modules/products/components/product-card'
   import { useProducts } from '@/modules/products/api/use-products'
   ```

5. **Routes Reference Modules**: Route components in `src/routes/` import from modules:
   ```typescript
   // src/routes/dashboard.tsx
   import { DashboardLayout } from '@/modules/dashboard/components/dashboard-layout'
   import { useDashboardData } from '@/modules/dashboard/api/use-dashboard-data'
   ```

---

## Key Architectural Patterns

### API Communication

**This is a frontend-only application.** All backend logic is handled by a separate API server.

**Use TanStack Query (React Query) for all API calls:**

```typescript
// Example: src/modules/products/api/use-products.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/modules/shared/api/client'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products')
      return response.data
    }
  })
}

// Example mutation:
export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (product: Product) => {
      const response = await apiClient.post('/products', product)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
```

**API Module Structure:**
- `src/modules/shared/api/` - Base API client, interceptors, common utilities
- `src/modules/[feature]/api/` - Feature-specific React Query hooks

**React Query is configured in:** `src/integrations/tanstack-query/root-provider.tsx`

### Authentication (Better Auth)

Authentication is handled via **Better Auth**:

- Configuration in `src/modules/auth/`
- Auth components: `src/modules/auth/components/`
- Auth hooks: `src/modules/auth/hooks/` (e.g., `useAuth()`, `useUser()`)
- Protected routes can check auth state in route loaders or components

Example protected route:
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/modules/auth/hooks/use-auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Check auth status
    // Redirect if not authenticated
  },
  component: DashboardComponent,
})
```

### File-Based Routing (TanStack Router)

Routes are automatically generated from files in `src/routes/`:

```typescript
// Example: src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
  // Optional:
  loader: async () => { /* prefetch data */ },
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
})

function AboutComponent() {
  const data = Route.useLoaderData() // Access loader data
  return <div>About Page</div>
}
```

**Special files:**
- `__root.tsx` - Root layout (wraps all routes)
- `index.tsx` - Home page at `/`

**Layouts:** Use `<Outlet />` in `__root.tsx` to render child routes

**Navigation:** Use `<Link to="/path">` from `@tanstack/react-router`

### Data Fetching Patterns

**Primary method: TanStack Query**

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Queries (GET requests)
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: async () => {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  }
})

// Mutations (POST, PUT, DELETE)
const mutation = useMutation({
  mutationFn: async (newUser: User) => {
    return apiClient.post('/users', newUser)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
})
```

**Route Loaders (for prefetching):**
```typescript
loader: async () => {
  // Can prefetch data using queryClient
  await queryClient.ensureQueryData({
    queryKey: ['data'],
    queryFn: fetchData
  })
}
```

### Environment Variables

Configure in [src/env.ts](src/env.ts) using T3Env:

```typescript
import { env } from '@/env'

// Example: API base URL
console.log(env.VITE_API_BASE_URL)
```

**Important:** Client-accessible variables must be prefixed with `VITE_`

Example:
```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=BisBig
```

### Path Aliases

Always use `@/` prefix for imports (configured in `tsconfig.json`):

```typescript
// Shared components
import { Button } from '@/modules/shared/components/ui/button'
import { cn } from '@/modules/shared/lib/utils'

// Feature modules
import { LoginForm } from '@/modules/auth/components/login-form'
import { useAuth } from '@/modules/auth/hooks/use-auth'

// Routes
import { Route } from '@/routes/index'
```

### UI Components (shadcn)

Add components with:
```bash
pnpx shadcn@latest add button
```

**Important:** shadcn components are installed in `src/modules/shared/components/ui/` (configured in `components.json`). They are fully customizable and use:
- Radix UI for accessibility
- Tailwind CSS for styling
- `cn()` utility for class merging

---

## Creating New Features

When adding a new feature to the project:

1. **Create a new module folder:**
   ```
   src/modules/[feature-name]/
   ```

2. **Add necessary subfolders:**
   ```
   src/modules/[feature-name]/
   ├── components/    # Feature components
   ├── hooks/         # Feature hooks
   ├── lib/           # Feature utilities
   ├── types/         # Feature types
   └── api/           # React Query hooks for API calls
   ```

3. **Create API hooks:**
   ```typescript
   // src/modules/[feature-name]/api/use-[feature-data].ts
   import { useQuery } from '@tanstack/react-query'
   import { apiClient } from '@/modules/shared/api/client'

   export const useFeatureData = () => {
     return useQuery({
       queryKey: ['feature-data'],
       queryFn: async () => {
         const response = await apiClient.get('/feature-endpoint')
         return response.data
       }
     })
   }
   ```

4. **Create route files:**
   ```
   src/routes/[feature-name]/
   └── index.tsx      # Main feature route
   ```

5. **Import from the module in routes:**
   ```typescript
   import { FeatureComponent } from '@/modules/[feature-name]/components/feature-component'
   import { useFeatureData } from '@/modules/[feature-name]/api/use-feature-data'
   ```

---

## Testing with Vitest

- Tests run with `pnpm test`
- Use JSDOM for DOM simulation
- Testing Library for React components
- Write assertions inside `it()` or `test()` blocks
- Use async/await (no done callbacks)
- Don't commit `.only` or `.skip`
- Place test files adjacent to the code being tested (e.g., `component.test.tsx` next to `component.tsx`)

**Testing API calls:**
- Mock API responses using MSW (Mock Service Worker) or similar
- Test React Query hooks in isolation

---

## Code Quality Standards (Ultracite/Biome)

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards.

### Quick Reference

- **Always run before committing:** `pnpm lint:fix`
- **Check for issues:** `npx ultracite check`
- **Diagnose setup:** `npx ultracite doctor`

Most issues are automatically fixable. Biome provides extremely fast Rust-based linting and formatting.

### Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

#### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

#### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

#### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

#### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

#### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

#### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

#### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

#### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)

#### React 19+ Specific

- Use ref as a prop instead of `React.forwardRef`
- This project uses React 19, so leverage new features when appropriate

---

## Important Notes

### Demo Files

Files/routes prefixed with `demo` can be safely deleted. They provide examples of:
- Form handling
- React Query usage
- Table implementations
- Storybook integration

### Auto-Generated Files

**Do NOT manually edit:**
- `src/routeTree.gen.ts` - Auto-generated by TanStack Router

### Git Hooks

Lefthook and lint-staged are configured to automatically run `pnpm lint:fix` on staged files before commits.

### DevTools

The following DevTools are available in development:
- TanStack Router DevTools
- React Query DevTools
- TanStack DevTools (general)

They're configured in `__root.tsx` and can be toggled or removed.

### Shadcn Configuration

The `components.json` file should be configured to install components in `src/modules/shared/components/ui/`. The configuration uses:
- Style: New York
- Base color: zinc
- CSS variables: enabled
- Icon library: Lucide

---

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

## Framework Comparison

**This is NOT Next.js.** Key differences:

| Feature | Next.js | TanStack Start |
|---------|---------|----------------|
| Routing | App Router or Pages | File-based TanStack Router |
| Data Fetching | Server Components, fetch | React Query |
| API Routes | `/app/api` or `/pages/api` | Separate backend (external API) |
| Build Tool | Webpack/Turbopack | Vite |
| Framework | Opinionated | Flexible, composable |

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm lint:fix` before committing to ensure compliance.
