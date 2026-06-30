import { useState, useRef, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';
import type { Supplier } from '@/types';
import { useCreateSupplier, useUpdateSupplier } from '../api/suppliers';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Required'),
  tin: z.string().optional(),
  category: z.string().min(1, 'Required'),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

const LogoUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Logo</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex size-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400"
        aria-label="Upload supplier logo"
      >
        {preview ? (
          <img src={preview} alt="Logo preview" className="h-full w-full object-cover" />
        ) : (
          <Upload className="size-5 text-gray-400" aria-hidden="true" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-label="Select logo file"
      />
    </div>
  );
};

// ─── Compliance docs upload ───────────────────────────────────────────────────

const ComplianceDocs = () => {
  const [docs, setDocs] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDocs((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
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
  const isPending = supplier ? updatePending : createPending;

  const [tags, setTags] = useState<string[]>(supplier?.tags ?? []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: supplier
      ? {
          name: supplier.name,
          tin: supplier.tin ?? '',
          category: supplier.category,
          website_url: supplier.website_url ?? '',
          status: supplier.status,
          contact_person: supplier.contact_person ?? '',
          email: supplier.email,
          phone: supplier.phone ?? '',
          street_address: supplier.street_address ?? '',
          city: supplier.city ?? '',
          state: supplier.state ?? '',
          zip: supplier.zip ?? '',
        }
      : { status: 'active' },
  });

  const isActive = watch('status') === 'active';

  const onSubmit = (values: FormValues) => {
    if (supplier) {
      // Edit mode — JSON PATCH
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
    if (values.tin) formData.append('tin', values.tin);
    formData.append('category', values.category);
    if (values.website_url) formData.append('website_url', values.website_url);
    formData.append('status', values.status);
    tags.forEach((tag) => formData.append('tags[]', tag));
    if (values.contact_person) formData.append('contact_person', values.contact_person);
    formData.append('email', values.email);
    if (values.phone) formData.append('phone', values.phone);
    if (values.street_address) formData.append('street_address', values.street_address);
    if (values.city) formData.append('city', values.city);
    if (values.state) formData.append('state', values.state);
    if (values.zip) formData.append('zip', values.zip);

    createMutate(formData, {
      onSuccess: () => {
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
              <LogoUpload />

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
                required
                error={errors.tin?.message}
                htmlFor="tin"
              >
                <Input id="tin" {...register('tin')} />
              </Field>

              <Field
                label="Category / Industry"
                required
                error={errors.category?.message}
                htmlFor="category"
              >
                <select
                  id="category"
                  {...register('category')}
                  aria-required="true"
                  className={cn(
                    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-ring',
                    errors.category && 'border-destructive',
                  )}
                >
                  <option value="">Select category</option>
                  <option value="ICT Related">ICT Related</option>
                  <option value="Office Related">Office Related</option>
                  <option value="General Services">General Services</option>
                </select>
              </Field>

              <Field
                label="Website URL"
                error={errors.website_url?.message}
                htmlFor="website_url"
              >
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://"
                  {...register('website_url')}
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
                error={errors.street_address?.message}
                htmlFor="street_address"
              >
                <Input id="street_address" {...register('street_address')} />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="City" error={errors.city?.message} htmlFor="city">
                  <Input id="city" {...register('city')} />
                </Field>
                <Field label="State / Province" error={errors.state?.message} htmlFor="state">
                  <Input id="state" {...register('state')} />
                </Field>
                <Field label="Zip / Post" error={errors.zip?.message} htmlFor="zip">
                  <Input id="zip" {...register('zip')} />
                </Field>
              </div>
            </Card>
          </div>

          {/* ─── Right column ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <Card title="Supplier Status">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active Supplier</span>
                <label className="relative inline-flex cursor-pointer items-center" htmlFor="status-toggle">
                  <input
                    id="status-toggle"
                    type="checkbox"
                    className="peer sr-only"
                    checked={isActive}
                    onChange={(e) => setValue('status', e.target.checked ? 'active' : 'inactive')}
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

              <Button variant="outline" className="w-full" asChild>
                <Link to="/procurement-officer/suppliers">Cancel</Link>
              </Button>
            </Card>

            <Card title="Compliance Documents">
              <ComplianceDocs />
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};
