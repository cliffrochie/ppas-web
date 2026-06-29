---
name: project-routing-layout-patterns
description: PPAS web routing structure, layout conventions, and multi-role layout pattern
metadata:
  type: project
---

The router uses react-router-dom v7 with `createBrowserRouter`. Route groups are structured under a shared `<ProtectedRoute />` parent (no layout), then each role-specific root layout component wraps its child pages via `<Outlet />`.

Established layout pattern:
- `AppRootLayout` (src/app/routes/app/root.tsx) → wraps `DashboardLayout` (sidebar) for admin/general roles
- `RequesterRootLayout` (src/app/routes/app/requester-root.tsx) → wraps `RequesterLayout` (top-nav) for requester role

Both layouts live in `src/components/layouts/` and are exported from the barrel `index.ts`.

The `RequesterLayout` (top-nav pattern) is the correct layout for the requester role — it shows PPAS logo + nav links + bell/user in a top bar, with a green hero banner and gray content area rendered by each page.

Route for the requester requests list: `/requests` → `RequestsPage` (thin page, just renders banner + `<RequestList />`).

**Why:** The design (01-01__request__list.png) shows a top-nav layout for requester role, different from the sidebar layout used by other roles. Two separate route groups under the same `<ProtectedRoute />` support this cleanly.

**How to apply:** When adding new requester routes, add them under the `RequesterRootLayout` children in `src/app/router.tsx`. New role-specific layouts follow the same pattern: create layout component, create `*-root.tsx` route wrapper, add route group to `router.tsx`.
