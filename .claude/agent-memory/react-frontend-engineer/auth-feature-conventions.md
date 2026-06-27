---
name: auth-feature-conventions
description: ppas-web auth feature conventions — field naming, API contract, form patterns, and social button stubs
metadata:
  type: project
---

The login form uses `identifier` (not `email`) as the credential field name, accepting both username and email. This is reflected in `LoginCredentials`, `loginSchema`, and the RHF form.

The API service at `src/features/auth/api/auth.ts` sends `{ identifier, password }` to `POST /auth/login`. Backend must accept `identifier`.

Social login buttons ("Continue with Google", "Continue with Apple") are UI-only stubs with `// TODO: wire up OAuth` comments. Google icon uses inline 4-path SVG; Apple icon uses inline 2-path SVG — both are component-local, no external icon lib used.

**Why:** Design spec shows "Username or email address" field and social login buttons. Backend acceptance of `identifier` is assumed pending backend update.

**How to apply:** When extending the auth feature (e.g., forgot-password, register), follow the same `identifier` naming convention. When wiring OAuth, replace the `onClick` stubs in `LoginForm.tsx`.

[[auth-store-shape]]
