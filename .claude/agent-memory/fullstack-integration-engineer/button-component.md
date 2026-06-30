---
name: button-component
description: The Button component uses @base-ui/react/button (not Radix Slot) — asChild is NOT a valid prop
metadata:
  type: project
---

The `src/components/ui/button.tsx` component wraps `@base-ui/react/button` (`ButtonPrimitive`), NOT Radix UI's `@radix-ui/react-slot`. This means the `asChild` prop pattern that Shadcn's default button supports does NOT exist here.

**Why:** Project uses Base UI instead of the default Radix-based Shadcn button. This may be intentional (Base UI is an MUI-backed headless component library).

**How to apply:** Do not use `<Button asChild>` wrapping a `<Link>`. Instead, use `<Link>` directly with appropriate Tailwind classes, or use the `buttonVariants` helper to apply button styling to a `<Link>`:

```tsx
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

// Instead of <Button asChild><Link to="/foo">Go</Link></Button>
<Link to="/foo" className={buttonVariants({ variant: 'outline' })}>Go</Link>
```

There are currently ~12+ TypeScript errors (TS2322) across detail/edit pages and procurement-officer components that use `<Button asChild>`. These need to be fixed by replacing with the `buttonVariants` + `<Link>` pattern.
