---
name: auth-integration
description: Complete auth wiring status for ppas-web — what exists, what was fixed, known pre-existing TS errors
metadata:
  type: project
---

The auth integration in ppas-web is complete. All layers were present and wired correctly when first reviewed. Only one TypeScript error existed and was fixed.

**Why:** Token-based auth (not Sanctum SPA cookie). Token stored in Zustand persisted to `localStorage` under key `auth-storage`.

**Auth mechanism:** Laravel Sanctum Personal Access Tokens. Login via `POST /auth/login` with `{ identifier, password }` (identifier accepts email or username). Response envelope: `ApiResponse<{ token: string, user: User }>`.

**Files confirmed complete (no changes needed):**
- `src/lib/api-client.ts` — Axios instance, Bearer token injected via request interceptor from `useAuthStore.getState().token`, 401/403/429/500 global error handling
- `src/stores/authStore.ts` — Zustand with persist, key `auth-storage`, `setAuth`, `clearAuth`, `hasHydrated` via `onRehydrateStorage`
- `src/features/auth/types/index.ts` — `LoginCredentials`, `LoginResponseData`, `RegisterPayload`, `RegisterResponseData`
- `src/features/auth/schemas/authSchema.ts` — `loginSchema`, `registerSchema` (birthday split into month/day/year for UX, assembled to `date_of_birth` on submit)
- `src/features/auth/api/auth.ts` — `authApi` object + `useLogin`, `useLogout`, `useRegister` hooks
- `src/features/auth/components/LoginForm.tsx` — RHF + zodResolver, 422 mapped per-field, root error for non-field failures
- `src/features/auth/components/RegisterForm.tsx` — same pattern; maps `date_of_birth` backend error to `birthday_day` form field
- `src/features/auth/index.ts` — barrel export
- `src/lib/authorization.tsx` — `useAuthorization()` hook with `hasRole(roles: string[])`
- `src/app/router.tsx` — all protected routes wrapped in `<ProtectedRoute />`

**Fixed:**
- `src/lib/auth.tsx` — Removed unused `user` destructuring (TS6133 under `noUnusedLocals: true`) and stale TODO comment saying guard was not wired (it was fully wired already).

**Pre-existing TypeScript errors NOT in auth scope:**
- All `<Button asChild>` usages across procurement-officer, bac, budget-officer, and requester detail/edit pages — Button uses `@base-ui/react/button` which has no `asChild`. Needs fixing separately.
- `SupplierCreateForm.tsx` — `SubmitHandler<TFieldValues>` type mismatch.

**How to apply:** When working on auth features, all layers are complete. New work should focus on feature modules (requests, bac, suppliers, etc.) rather than auth plumbing.
