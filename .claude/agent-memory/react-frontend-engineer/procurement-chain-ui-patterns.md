---
name: procurement-chain-ui-patterns
description: Patterns established when building RFQ/Abstract/BAC Resolution/NOA UI - multipart file upload convention, base-ui Dialog trigger render prop, shared SearchCombobox, pre-existing baseline type errors to ignore
metadata:
  type: project
---

## Multipart file-upload mutation pattern (Laravel FormRequest contract)

Several backend FormRequests (Rfq, AbstractOfQuotation, BacResolution, NoticeOfAward
create/update) accept a multipart `file` upload; the corresponding TS payload types in
`src/types/entities/*.ts` still document a stale `file_path?: string` field (server-derived,
never accepted from the client — the type comments are misleading, don't trust them for any
entity that has a document/attachment).

Established convention now used in `src/features/procurement-officer/api/rfqs.ts` and
`api/procurement.ts`:
- Define a local `CreateXInput = Omit<CreateXPayload, 'file_path'> & { file?: File }` (or
  `file: File` when the FormRequest marks it required, e.g. BacResolution/NoticeOfAward create).
- `create` always POSTs FormData (`Content-Type: multipart/form-data`), even when the file is
  optional and omitted — mirrors `suppliers.ts` `create`.
- `update` branches: no file → plain JSON `api.patch()` (also the only way to null out a
  nullable field, since FormData can't represent `null`); file present → FormData POST with
  `formData.append('_method', 'PATCH')` (Laravel method-spoofing) to the same resource URL.
- A small `buildXFormData()` helper builds the FormData from the Input type; both create/update
  reuse it.

**Why:** The task required fixing a bug where these mutations sent JSON `file_path` against a
backend that actually validates a multipart `file` field — verified directly against the Laravel
FormRequest source in `../ppas-api`.
**How to apply:** Any new entity with a file/document field should follow this exact Input-type +
buildFormData + branching-update pattern rather than trusting the shared payload type's
`file_path` field.

## base-ui Dialog trigger — use `render`, not nested children

`DialogTrigger` (base-ui) should NOT wrap a `<Button>` as a plain child (produces invalid
`<button><button/></button>` DOM). Use the `render` prop to substitute the Button as the actual
rendered element, with the trigger label as `children` of `DialogTrigger` itself:
```tsx
<DialogTrigger render={<Button className="..." />}>Create RFQ</DialogTrigger>
```
Same pattern already used internally by `DialogClose` in `src/components/ui/dialog.tsx`.

## Shared SearchCombobox component

`src/features/procurement-officer/components/SearchCombobox.tsx` is a generic FK-picker
(id + label + optional sublabel, debounced search, optional infinite-scroll via
hasNextPage/onFetchNextPage) extracted from the `EndUserCombobox` pattern in
`CreateRequestForm.tsx`. Reused across RfqCreateForm/RfqDetail (PR + user pickers),
AbstractCreateForm/AbstractDetail (RFQ + user pickers), BacResolutionCreateForm/Detail
(Abstract + user pickers), NoticeOfAwardCreateForm (BAC Resolution picker). Use this instead of
writing a new inline combobox when a form needs to pick a related entity by id.

`useDebounce` was extracted from being duplicated per-component into
`src/hooks/useDebounce.ts` (barrel: `src/hooks/index.ts`) — it's a generic, non-feature-specific
utility, so new debounced-search UIs should import it from `@/hooks` rather than redefining it.

## List query hooks with no server-side sort

Unlike `usePurchaseOrders`/`useSuppliers` (which support `sort_by`/`sort_dir`), the RFQ/Abstract/
BacResolution/NoticeOfAward list filter types have no sort fields — `RfqsTable`,
`AbstractsTable`, `BacResolutionsTable`, `NoticesOfAwardTable` are plain unsorted tables (no
`ArrowUpDown` sort-toggle headers). Don't add sort UI to these tables unless the backend filter
type gains `sort_by`/`sort_dir`.

## Pre-existing baseline type/lint errors — do not "fix" unless asked

As of 2026-07-04, `npx tsc -b --noEmit` is fully clean (0 errors) for any file not currently being
edited by a parallel agent. The `<Button asChild>` baseline issue noted earlier in this doc's
history has since been fixed elsewhere. The `SupplierCreateForm.tsx` Zod-resolver mismatch (it had
a `status: z.enum([...]).default('active')` field, forcing a `FormInput`/`FormOutput` generic
split on `useForm`) was resolved during the 2026-07-04 Supplier contract-field-rename task (see
[[supplier-contract-audit]]) by replacing `status` with a plain required `is_active: z.boolean()`
(no `.default()`) — a single `FormValues = z.infer<typeof schema>` type is enough now, no more
input/output split needed for that form. Don't assume a stale error count from an old memory;
always re-run `tsc -b --noEmit` fresh rather than trusting a remembered baseline number.

What IS still a live, confirmed-pre-existing lint baseline (present in `src/features/requests/**`,
which is a frequently off-limits file in parallel-agent tasks — verify via `git stash` if unsure
whether it's yours):
- `CreateRequestForm.tsx` has a `jsx-a11y/no-autofocus` eslint-disable comment that errors with
  "Definition for rule ... was not found" (the rule isn't in this project's eslint config) plus
  two React Compiler "Cannot access refs during render" errors on `intentRef.current` (lines near
  637 and 957 as of 2026-07-04).
- Every TanStack Table component (`*Table.tsx` across bac/, monitoring/, procurement-officer/,
  requests/) throws one `react-hooks/incompatible-library` warning on `useReactTable(...)` — this
  is expected/harmless per [[monitoring-feature-conventions]], not a regression.

**Why:** Verified via `git stash` (stashes tracked changes, not untracked new files) that these
errors reproduce identically without any of this task's tracked-file changes applied.
**How to apply:** When running `type-check`/`lint` after a change, diff the error list against
current-run output rather than an old remembered count. Don't spend effort "fixing" these unless
the user explicitly asks — `CreateRequestForm.tsx` in particular is `src/features/requests/**`,
which is very often explicitly off-limits in multi-agent tasks. Do NOT copy the
`// eslint-disable-next-line jsx-a11y/no-autofocus` comment pattern into new files — it errors
because the rule isn't registered; just omit it (autoFocus on a search input inside an
already-opened dropdown is a defensible a11y tradeoff without the rule anyway).
