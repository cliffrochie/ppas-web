---
name: project-stack-setup
description: ppas-web frontend stack, installed versions, key config decisions, and a Shadcn CLI alias quirk to remember
metadata:
  type: project
---

ppas-web was scaffolded from Vite 8 + React 19 + TypeScript 6.

**Stack confirmed installed:**
- Router: react-router-dom v7 (blueprint uses `createBrowserRouter`, NOT TanStack Router)
- Server state: @tanstack/react-query v5
- Client state: zustand v5 (persist middleware)
- HTTP: axios v1
- Forms: react-hook-form v7 + @hookform/resolvers v5
- Validation: **zod v4** (not v3 — use `z.string().min(1, 'msg')` which still works, but object syntax `{ message: '...' }` is safer for email/url validators)
- UI: Shadcn/ui (base-nova style, Tailwind v4 via @tailwindcss/vite — NO tailwind.config.ts)
- Icons: lucide-react
- Toast: sonner v2
- Tables: @tanstack/react-table v8
- CSS font: Geist Variable via @fontsource-variable/geist (installed by Shadcn init)
- Testing: vitest v4 + @testing-library/react v16 + happy-dom + msw v2

**Shadcn CLI quirk (resolved):** When `npx shadcn@latest init` runs, it resolves `@/` aliases via the ROOT `tsconfig.json` (not tsconfig.app.json). If the root tsconfig has no `compilerOptions.paths`, the CLI writes component files to a literal `@/` directory at the project root instead of `src/`. Fix: add `baseUrl + paths` to root tsconfig.json with `ignoreDeprecations: "6.0"`.

**TypeScript 6 deprecation:** `baseUrl` is deprecated in TS6 (removed in TS7). In tsconfig.app.json, `paths` alone works without `baseUrl` since TS4.1. Use `ignoreDeprecations: "6.0"` only in the root tsconfig.json (for tooling like Shadcn CLI).

**Vite config:** `@tailwindcss/vite` plugin added alongside existing `babel-plugin-react-compiler` setup. Path alias: `@` → `src/` set in both `resolve.alias` (Vite) and `paths` (tsconfig.app.json).

**ESLint:** `react-refresh/only-export-components` set to `warn` with `allowConstantExport: true`. Rule disabled in `src/components/ui/**`, `src/testing/**`, and `src/app/router.tsx`.

**Why:** Blueprint mandates react-router-dom (not TanStack Router). Vite 8 bundles with rolldown. React Compiler active via babel preset.
**How to apply:** When adding new features, trust these versions are in place. When updating schemas, be explicit with Zod v4 message syntax. When adding Shadcn components use `npx shadcn@latest add <name> --yes`.
