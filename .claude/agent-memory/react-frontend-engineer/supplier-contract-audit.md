---
name: supplier-contract-audit
description: Verified real backend contract for the Supplier feature (../ppas-api source), corrected 2026-07 after the original build used almost entirely wrong field names
metadata:
  type: project
---

## Real `SupplierResource` shape (confirmed against `../ppas-api` PHP source)

`id, name, tin_number, category_id, website, tags, contact_person, email, phone,
address_street, address_city, address_province, address_zip, on_time_delivery_rate,
defect_rate, is_active, logo_url, category (nested CategoryResource, whenLoaded),
documents (nested SupplierDocumentResource[], whenLoaded), created_at, updated_at`.

`on_time_delivery_rate` / `defect_rate` are `decimal(5,2)` nullable columns with a
`decimal:2` Eloquent cast → serialize as `string | null`, matching the repo-wide
decimal-as-string convention in [[global-entity-types]]. `defect_rate` is NOT the
inverse-framing of a `quality_rate` field — there is no `quality_rate`, only
`defect_rate`, and it means the opposite (higher is worse).

`SupplierDocumentResource`: `id, supplier_id, uploader_id, file_name, file_size,
mime_type, uploaded_at, download_url, uploader (nested UserResource, whenLoaded),
created_at, updated_at`. No `file_path` (private-disk only, served via
`GET /supplier-documents/{id}/download`).

Fields that were invented with no backend equivalent (removed entirely, not
renamed): `quality_rate`, `total_orders`, `total_value`, `last_order_date`,
`last_order_po`, `highest_order_value`, `highest_order_po`,
`recent_purchase_orders` (+ the `SupplierPurchaseOrder` type that backed it).
There is no endpoint anywhere that returns per-supplier PO history — don't
reintroduce this pattern without a real backend field to back it.

## `StoreSupplierRequest` / `UpdateSupplierRequest` real fields

`name` (required), `tin_number` (nullable), `category_id` (nullable, FK
`exists:categories,id`), `website` (nullable url), `tags` (nullable
`string[]`), `logo` (nullable file upload, max 5120KB,
jpg/jpeg/png/gif/svg/webp — accepted on both create AND update as a file
replacement), `contact_person` (nullable), `email` (required, unique, ignores
self on update), `phone` (nullable), `address_street/city/province/zip`
(nullable), `is_active` (`sometimes|boolean` — not required, defaults true at
the DB level via `->default(true)`).

`is_active` is a real boolean column (not the `status: 'active'|'inactive'`
string enum the original build invented) — send `'1'`/`'0'` when building
FormData (Laravel's boolean rule accepts those).

## `ListSupplierRequest` / `SupplierService::list()` — no sort support at all

Confirmed the backend's list filters are ONLY `search, category_id, is_active,
address_city, address_province` — there is no `sort_by`/`sort_dir` handling
anywhere in `SupplierService::list()` (always `orderBy('name')`), and
`per_page` is ignored (`paginate(15)` is hardcoded). The frontend
`SuppliersTable`/`SuppliersList` still send `sort_by`/`sort_dir`/`per_page` in
the query filters — these are harmless no-ops server-side (Laravel silently
drops unvalidated extra query params), not validation errors, but the sort
toggle UI doesn't actually change server ordering. This was already broken
before the 2026-07 field-name audit and was left as-is (out of scope for a
field-rename task) — flag it if asked to make supplier sorting/pagination
actually work, since it needs a backend change too.

## Supplier documents — separate resource, no update endpoint

`POST /supplier-documents` (`supplier_id` + `file`, max 10240KB, mimes
pdf/jpg/jpeg/png/doc/docx/xls/xlsx) is the only way to attach a compliance
doc — no update, only create + `DELETE /supplier-documents/{id}`. Since
`supplier_id` doesn't exist until the parent supplier is created, the create
flow must: (1) create the supplier via the existing multipart mutation, (2)
loop-`POST` each queued `File` to `/supplier-documents` after success. Added
`useUploadSupplierDocument()` in `src/features/procurement-officer/api/suppliers.ts`
for this — no per-file toast (parent create's toast is enough), failures
tracked with `Promise.allSettled` so one bad doc doesn't block navigation
(the global Axios interceptor already surfaces its own error toast).

**Why:** An audit request flagged the entire Supplier feature (types, create
form, detail page, table) as built against an imagined contract rather than
the real Laravel FormRequests/Resources — cross-checked every claim directly
against `../ppas-api` PHP source rather than trusting the audit prompt.
**How to apply:** Before touching any other feature's types/forms in this
repo, prefer reading the actual FormRequest/Resource/Service source in
`../ppas-api` over trusting existing frontend code or task descriptions — this
codebase has a demonstrated history of the frontend inventing fields that
were never real.
