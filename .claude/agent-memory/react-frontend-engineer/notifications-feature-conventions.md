---
name: notifications-feature-conventions
description: NotificationBell dropdown, requestsPathPrefix prop threading through AppSidebarLayout, and the backend's hardcoded per_page for /notifications
metadata:
  type: project
---

## Backend contract quirk: `/notifications` ignores `per_page`

`NotificationService::list()` in `../ppas-api/app/Services/NotificationService.php` calls
`->paginate(15)` with a hardcoded page size — it never reads a `per_page` query param, and
`ListNotificationRequest` doesn't validate one either. Sending `per_page` is harmless (FormRequest
only validates listed rules, extra params aren't rejected) but has zero effect. For any UI that
needs "how many unread notifications exist," just call the list endpoint with `{ is_read: false }`
(no `per_page`) and read `meta.total` — don't try to request a huge page size to "get them all in
one call," it won't work and isn't necessary since `meta.total` is already computed independent of
page size.

## AppSidebarLayout now requires `requestsPathPrefix`

`src/components/layouts/app-sidebar-layout.tsx` takes a `requestsPathPrefix` prop (role-prefixed
base path for PR detail pages, e.g. `/bac/requests`, `/budget-officer/requests`,
`/procurement-officer/requests`) threaded the same way `homeHref`/`roleName` are. All three call
sites (`src/app/routes/bac/root.tsx`, `src/components/layouts/budget-officer-layout.tsx`,
`src/components/layouts/procurement-officer-layout.tsx`) must pass it. `RequesterLayout` doesn't
go through `AppSidebarLayout` at all (it's the separate top-nav layout — see
[[project-routing-layout-patterns]]) so it hardcodes `/requests` directly when rendering
`NotificationBell`.

## NotificationBell component

`src/features/notifications/components/NotificationBell.tsx` — self-contained dropdown, takes
only `requestsPathPrefix` as a prop, does its own data fetching (two `useNotifications` calls:
one `{ is_read: false }` for the badge count via `meta.total`, one unfiltered for the recent list).
Clicking an unread row calls `useMarkNotificationRead()` and — only if `purchase_request_id` is
non-null — navigates to `${requestsPathPrefix}/${purchase_request_id}`. No separate "mark all
read" UI was built (not in scope, not requested).

Reused `src/components/ui/dropdown-menu.tsx` primitives (base-ui `Menu` wrapper) — same ones
already used for the user-account menu in `requester-layout.tsx`. `DropdownMenuTrigger`/
`DropdownMenuContent` support `open`/`onOpenChange` from base-ui `MenuRoot.Props` but this
component leaves the menu uncontrolled (default open/close-on-item-click behavior is sufficient).

## Precedent: components/layouts/ importing from features/

`requester-layout.tsx` already imported `useLogout` from `@/features/auth` before this task —
i.e. `src/components/layouts/*` importing from `src/features/*` is an established (if
blueprint-deviating) pattern in this repo, not something introduced here. `eslint.config.js` has
no import-boundary/`eslint-plugin-boundaries` rule enforcing the strict Bulletproof React
unidirectional layering, so this isn't caught by lint. `NotificationBell` import into both
`app-sidebar-layout.tsx` and `requester-layout.tsx` follows this existing precedent rather than
introducing a new deviation.

**Why:** Confirmed via `npx tsc -b --noEmit` and `npx eslint .` after the change — error/warning
counts matched the documented pre-existing baseline exactly (20 tsc errors, 3 lint errors) with
none in the new/touched files, so the import-boundary deviation isn't flagged by tooling and is
consistent with what already shipped.

**How to apply:** When building a new shared layout component that needs feature-level
functionality (auth actions, notifications, etc.), importing the feature's public barrel
(`@/features/<domain>`) into `components/layouts/*` is acceptable here — just always go through
the barrel `index.ts`, never deep-import into feature internals.
