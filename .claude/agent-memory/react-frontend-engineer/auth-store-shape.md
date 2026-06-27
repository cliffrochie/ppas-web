---
name: auth-store-shape
description: Zustand auth store field names, AuthUser interface, and the hasHydrated pattern used in ProtectedRoute
metadata:
  type: project
---

Auth store lives at `src/stores/authStore.ts`. Exports `useAuthStore` and `AuthUser` interface.

```ts
interface AuthUser { id: number; name: string; email: string; role: string; }

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}
```

Persisted under key `'auth-storage'` via zustand persist middleware. `hasHydrated` is set to `true` inside `onRehydrateStorage` callback.

**ProtectedRoute** is in `src/lib/auth.tsx`. It renders a loading state until `hasHydrated === true`, then redirects to `/login` if not authenticated, then checks `roles` if provided.

**Why:** Blueprint mandates waiting for hydration before redirecting — prevents false logout flashes on page load.
**How to apply:** Never redirect in a route guard before checking `hasHydrated`. When building role-gated routes, pass the `roles` array to `<ProtectedRoute roles={['Admin']} />`.
