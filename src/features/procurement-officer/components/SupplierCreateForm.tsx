import { useState, useRef, type KeyboardEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils';
import type { Supplier } from '@/types';
import { useCreateSupplier, useUpdateSupplier, useUploadSupplierDocument } from '../api/suppliers';
import { useCategories } from '@/features/requests';
import {
  supplierSchema as schema,
  type SupplierFormValues as FormValues,
} from '../schemas/supplierSchema';

// ─── Field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  error,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
    >
      {label}
      {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </div>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
    </div>
    <div className="space-y-4 p-4 sm:p-6">{children}</div>
  </div>
);

// ─── Tag chip input ───────────────────────────────────────────────────────────

const TagInput = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-white px-3 py-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => removeTag(tag)}
              className="hover:text-rose-900"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder="Add tag, press Enter..."
          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Add tag"
        />
      </div>
    </div>
  );
};

// ─── Logo upload ──────────────────────────────────────────────────────────────
// Replacing an existing logo on edit is out of scope for now (the update
// mutation only sends JSON) — in edit mode this renders as a read-only
// preview of the current logo rather than silently discarding a new pick.

const LogoUpload = ({
  value,
  onChange,
  existingUrl,
  readOnly,
}: {
  value: File | null;
  onChange: (file: File) => void;
  existingUrl?: string | null;
  readOnly?: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Logo</p>
      <button
        type="button"
        onClick={() => !readOnly && inputRef.current?.click()}
        disabled={readOnly}
        className={cn(
          'flex size-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50',
          !readOnly && 'hover:border-green-400',
        )}
        aria-label={readOnly ? 'Supplier logo' : 'Upload supplier logo'}
      >
        {preview || value ? (
          <img
            src={value ? URL.createObjectURL(value) : (preview ?? undefined)}
            alt="Logo preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <Upload className="size-5 text-gray-400" aria-hidden="true" />
        )}
      </button>
      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
          aria-label="Select logo file"
        />
      )}
    </div>
  );
};

// ─── Compliance docs upload ───────────────────────────────────────────────────

const ComplianceDocs = ({
  docs,
  onChange,
}: {
  docs: File[];
  onChange: (docs: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    onChange([...docs, ...files]);
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    onChange(docs.filter((_, i) => i !== index));
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Compliance Documents
      </p>
      <p className="mb-3 text-xs text-gray-500">
        Upload Business Permits, Contracts or other relevant documents.
      </p>

      <label
        htmlFor="compliance-file-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 px-4 py-6 hover:border-green-400 hover:bg-green-50/50"
      >
        <Upload className="size-5 text-green-600" aria-hidden="true" />
        <span className="text-sm text-green-700">Click or drag files to upload</span>
        <input
          id="compliance-file-upload"
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {docs.length > 0 && (
        <ul className="mt-3 space-y-2">
          {docs.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded bg-green-50 px-3 py-1.5 text-sm"
            >
              <span className="truncate text-gray-700">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeDoc(i)}
                className="shrink-0 text-gray-400 hover:text-gray-700"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────

interface SupplierFormProps {
  supplier?: Supplier;
}

export const SupplierCreateForm = ({ supplier }: SupplierFormProps = {}) => {
  const navigate = useNavigate();
  const { mutate: createMutate, isPending: createPending } = useCreateSupplier();
  const { mutate: updateMutate, isPending: updatePending } = useUpdateSupplier(supplier?.id ?? 0);
  const { mutateAsync: uploadDocumentAsync } = useUploadSupplierDocument();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const isPending = supplier ? updatePending : createPending;

  const [tags, setTags] = useState<string[]>(supplier?.tags ?? []);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [complianceDocs, setComplianceDocs] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: supplier
      ? {
          name: supplier.name,
          tin_number: supplier.tin_number ?? '',
          category_id: supplier.category_id ?? undefined,
          website: supplier.website ?? '',
          is_active: supplier.is_active,
          contact_person: supplier.contact_person ?? '',
          email: supplier.email,
          phone: supplier.phone ?? '',
          address_street: supplier.address_street ?? '',
          address_city: supplier.address_city ?? '',
          address_province: supplier.address_province ?? '',
          address_zip: supplier.address_zip ?? '',
        }
      : { is_active: true },
  });

  const isActive = watch('is_active');

  const onSubmit = (values: FormValues) => {
    if (supplier) {
      // Edit mode — JSON PATCH (logo/document replacement not yet supported here)
      updateMutate(
        { ...values, tags },
        {
          onSuccess: () => {
            void navigate(`/procurement-officer/suppliers/${supplier.id}`);
          },
        },
      );
      return;
    }

    // Create mode — FormData (supports logo upload)
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.tin_number) formData.append('tin_number', values.tin_number);
    formData.append('category_id', String(values.category_id));
    if (values.website) formData.append('website', values.website);
    tags.forEach((tag) => formData.append('tags[]', tag));
    formData.append('is_active', values.is_active ? '1' : '0');
    if (values.contact_person) formData.append('contact_person', values.contact_person);
    formData.append('email', values.email);
    if (values.phone) formData.append('phone', values.phone);
    if (values.address_street) formData.append('address_street', values.address_street);
    if (values.address_city) formData.append('address_city', values.address_city);
    if (values.address_province) formData.append('address_province', values.address_province);
    if (values.address_zip) formData.append('address_zip', values.address_zip);
    if (logoFile) formData.append('logo', logoFile);

    createMutate(formData, {
      onSuccess: (response) => {
        const supplierId = response.data.id;
        if (complianceDocs.length > 0) {
          // Documents can only be uploaded once the supplier (and its id) exists.
          // Best-effort: a failed doc upload shouldn't block the create flow —
          // the global Axios interceptor already surfaces a toast on failure.
          void Promise.allSettled(
            complianceDocs.map((file) => uploadDocumentAsync({ supplier_id: supplierId, file })),
          );
        }
        void navigate('/procurement-officer/suppliers');
      },
    });
  };

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/procurement-officer/suppliers" className="hover:text-gray-900">
          Suppliers
        </Link>
        <span aria-hidden="true">&gt;</span>
        <span className="font-medium text-gray-900">
          {supplier ? 'Edit Supplier Info.' : 'Create Supplier Info.'}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          {/* ─── Left column ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <Card title="Supplier Information">
              <LogoUpload
                value={logoFile}
                onChange={setLogoFile}
                existingUrl={supplier?.logo_url}
                readOnly={!!supplier}
              />

              <Field
                label="Company Legal Name"
                required
                error={errors.name?.message}
                htmlFor="name"
              >
                <Input id="name" {...register('name')} aria-required="true" />
              </Field>

              <Field
                label="Tax / TIN / VAT No."
                error={errors.tin_number?.message}
                htmlFor="tin_number"
              >
                <Input id="tin_number" {...register('tin_number')} />
              </Field>

              <Field
                label="Category / Industry"
                required
                error={errors.category_id?.message}
                htmlFor="category_id_trigger"
              >
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      value={field.value !== undefined ? String(field.value) : ''}
                      onValueChange={(val: string | null) =>
                        field.onChange(val !== null ? Number(val) : undefined)
                      }
                    >
                      <SelectTrigger
                        id="category_id_trigger"
                        aria-required="true"
                        aria-invalid={!!errors.category_id}
                        className={cn('w-full', errors.category_id && 'border-destructive')}
                      >
                        <SelectValue>
                          {(value: string | null) => {
                            if (!value) return 'Select category';
                            return categories.find((c) => String(c.id) === value)?.name ?? value;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="__loading__" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No categories available
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field
                label="Website URL"
                error={errors.website?.message}
                htmlFor="website"
              >
                <Input
                  id="website"
                  type="url"
                  placeholder="https://"
                  {...register('website')}
                />
              </Field>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tags
                </p>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </Card>

            <Card title="Address &amp; Contact">
              <Field
                label="Primary Contact Person"
                error={errors.contact_person?.message}
                htmlFor="contact_person"
              >
                <Input id="contact_person" {...register('contact_person')} />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Email Address"
                  required
                  error={errors.email?.message}
                  htmlFor="email"
                >
                  <Input
                    id="email"
                    type="email"
                    aria-required="true"
                    {...register('email')}
                  />
                </Field>
                <Field
                  label="Phone No."
                  error={errors.phone?.message}
                  htmlFor="phone"
                >
                  <Input id="phone" type="tel" {...register('phone')} />
                </Field>
              </div>

              <Field
                label="Street Address"
                error={errors.address_street?.message}
                htmlFor="address_street"
              >
                <Input id="address_street" {...register('address_street')} />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="City" error={errors.address_city?.message} htmlFor="address_city">
                  <Input id="address_city" {...register('address_city')} />
                </Field>
                <Field
                  label="State / Province"
                  error={errors.address_province?.message}
                  htmlFor="address_province"
                >
                  <Input id="address_province" {...register('address_province')} />
                </Field>
                <Field label="Zip / Post" error={errors.address_zip?.message} htmlFor="address_zip">
                  <Input id="address_zip" {...register('address_zip')} />
                </Field>
              </div>
            </Card>
          </div>

          {/* ─── Right column ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <Card title="Supplier Status">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active Supplier</span>
                <label className="relative inline-flex cursor-pointer items-center" htmlFor="is_active_toggle">
                  <input
                    id="is_active_toggle"
                    type="checkbox"
                    className="peer sr-only"
                    checked={isActive}
                    onChange={(e) => setValue('is_active', e.target.checked)}
                    aria-label="Active supplier toggle"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full" />
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-700 text-white hover:bg-green-800"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : supplier ? 'Update Supplier' : 'Save Supplier'}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                render={<Link to="/procurement-officer/suppliers" />}
              >
                Cancel
              </Button>
            </Card>

            <Card title="Compliance Documents">
              <ComplianceDocs docs={complianceDocs} onChange={setComplianceDocs} />
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
