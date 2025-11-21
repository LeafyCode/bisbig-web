# Project File Structure

This document summarizes the current layout of the Bisbig web project to help new contributors navigate the codebase.

## Root
- `README.md` – project overview and quick start.
- `package.json` / `pnpm-lock.yaml` / `pnpm-workspace.yaml` – workspace metadata and dependencies.
- `tsconfig.json` / `vite.config.ts` – TypeScript and Vite build config.
- `biome.json` – Biome formatter/linter config.
- `lefthook.yml` – Git hook automation.
- `components.json` – shadcn/ui component registry.
- `public/` – static assets served as-is.
- `src/` – main application source.

> Additional workspace folders such as `.cursor/`, `.tanstack/`, `.storybook/`, `.vscode/`, and `node_modules/` support tooling and are omitted from detailed sections.

## `src/` overview
- `components/` – shared UI elements (sidebar, nav, forms) plus `ui/` with shadcn primitives.
- `data/` – mock/demo datasets (`demo-table-data.ts`, `demo.punk-songs.ts`).
- `env.ts` – runtime environment helpers.
- `hooks/` – reusable hooks, e.g., form demos and `use-mobile`.
- `integrations/` – external provider glue (currently TanStack Query).
- `lib/` – generic utilities (`utils.ts`).
- `logo.svg` – project logo asset.
- `modules/` – domain-specific modules (auth, shared API client).
- `routeTree.gen.ts` / `router.tsx` – generated TanStack router config.
- `routes/` – file-based route definitions.
- `styles.css` – global styles.

## `src/components/`
Top-level components:
- `app-sidebar.tsx`, `nav-main.tsx`, `nav-projects.tsx`, `nav-user.tsx`, `team-switcher.tsx` – layout/navigation building blocks.
- `login-form.tsx` and `demo.form-components.tsx` – auth and demo forms.
- `storybook/` – storybook-specific wrappers.
- `ui/` – shadcn/ui exports such as `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, `sidebar.tsx`, `switch.tsx`, etc.

## `src/modules/`
- `auth/` – module entry (`index.ts`) and local README for auth flows.
- `shared/api/client.ts` – shared API client abstraction.

## `src/hooks/`
- `demo.form.ts`, `demo.form-context.ts` – form demo logic.
- `use-mobile.ts` – viewport detection helper.

## `src/integrations/tanstack-query/`
- `root-provider.tsx` – wraps the app with a TanStack Query provider.
- `devtools.tsx` – TanStack Query DevTools toggle.

## `src/routes/`
- `_app.tsx` and `_app/` – base layout route; `_app/index.tsx` defines the authenticated shell.
- `_auth.tsx` and `_auth/` – unauthenticated layout with pages `login.tsx`, `signup.tsx`, `forgot-password.tsx`.
- `auth/` – auxiliary auth flows (`reset-password.tsx`, `verify-email.tsx`).
- `demo/` – showcase routes for forms, API requests, SSR examples, tables, and Storybook integration (e.g., `start.ssr.*.tsx`, `form.*.tsx`, `tanstack-query.tsx`).
- `__root.tsx` – TanStack router root route definition.

## Supporting files
- `src/modules/auth/lib/auth-client.ts` – (better auth)client helpers for auth flows.
- `src/routes/_app/index.tsx` – main application dashboard shell with sidebar + top nav.
- `src/routes/_auth/login.tsx` / `signup.tsx` / `forgot-password.tsx` – entry points for user authentication.

---
_Last updated: 2025-11-21_
