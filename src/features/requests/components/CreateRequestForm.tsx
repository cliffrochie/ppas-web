import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type UseFormRegister,
  type FieldErrors,
  type Control,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils';
import { useAuthStore } from '@/stores/authStore';
import { isApiValidationError } from '@/types';
import { useCategories } from '../api/categories';
import { useCreateRequest, requestsApi } from '../api/requests';

// ─── Zod schema ──────────────────────────────────────────────────────────────

// Zod v4 uses `{ message }` for all error customisation (required_error /
// invalid_type_error were removed in the v4 redesign).
const itemSchema = z.object({
  item_description: z.string().min(1, 'Item name is required'),
  unit_cost: z
    .number({ message: 'Enter a valid price' })
    .positive('Price must be greater than 0'),
  quantity: z
    .number({ message: 'Enter a valid quantity' })
    .int('Must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  specifications: z.string(),
});

const createRequestSchema = z.object({
  end_user_name: z.string().min(1, 'End-user / responsible person is required'),
  category_id: z
    .number({ message: 'Please select a category' })
    .int()
    .positive('Please select a category'),
  purpose: z.string().min(1, 'Justification is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const amountFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmt = (val: number) => amountFormatter.format(val);

const safeNum = (val: unknown): number =>
  Number.isFinite(Number(val)) ? Number(val) : 0;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ number, title }: { number: number; title: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-semibold text-white">
      {number}
    </div>
    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
  </div>
);

// ─── Item row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  index: number;
  subtotal: number;
  canRemove: boolean;
  onRemove: () => void;
  register: UseFormRegister<CreateRequestFormValues>;
  control: Control<CreateRequestFormValues>;
  errors: FieldErrors<CreateRequestFormValues>;
}

const ItemRow = ({
  index,
  subtotal,
  canRemove,
  onRemove,
  register,
  errors,
}: ItemRowProps) => {
  const itemErrors = errors.items?.[index];

  return (
    <div className={cn('pt-4', index > 0 && 'border-t border-gray-100')}>
      {/* Top row: Item Name | Estimated Price | Qty | Subtotal */}
      {/* Mobile: 2-col grid — name spans full width, price+qty side-by-side, subtotal full-width */}
      {/* Desktop (md+): fixed 4-col grid */}
      <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-[1fr_160px_72px_100px]">
        {/* Item Name */}
        <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
          <Label htmlFor={`items.${index}.item_description`} className="text-xs font-medium">
            Item Name <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`items.${index}.item_description`}
            type="text"
            placeholder="e.g. Printer"
            aria-required="true"
            aria-invalid={!!itemErrors?.item_description}
            aria-describedby={
              itemErrors?.item_description ? `item_desc_err_${index}` : undefined
            }
            className={cn('h-9 text-sm', itemErrors?.item_description && 'border-destructive')}
            {...register(`items.${index}.item_description`)}
          />
          {itemErrors?.item_description && (
            <p id={`item_desc_err_${index}`} className="text-xs text-destructive">
              {itemErrors.item_description.message}
            </p>
          )}
        </div>

        {/* Estimated Price */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={`items.${index}.unit_cost`} className="text-xs font-medium">
            Estimated Price <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`items.${index}.unit_cost`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            aria-required="true"
            aria-invalid={!!itemErrors?.unit_cost}
            aria-describedby={
              itemErrors?.unit_cost ? `item_cost_err_${index}` : undefined
            }
            className={cn('h-9 text-right text-sm', itemErrors?.unit_cost && 'border-destructive')}
            {...register(`items.${index}.unit_cost`, { valueAsNumber: true })}
          />
          {itemErrors?.unit_cost && (
            <p id={`item_cost_err_${index}`} className="text-xs text-destructive">
              {itemErrors.unit_cost.message}
            </p>
          )}
        </div>

        {/* Qty */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={`items.${index}.quantity`} className="text-xs font-medium">
            Qty <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id={`items.${index}.quantity`}
            type="number"
            step="1"
            min="1"
            placeholder="0"
            aria-required="true"
            aria-invalid={!!itemErrors?.quantity}
            aria-describedby={
              itemErrors?.quantity ? `item_qty_err_${index}` : undefined
            }
            className={cn('h-9 text-center text-sm', itemErrors?.quantity && 'border-destructive')}
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
          {itemErrors?.quantity && (
            <p id={`item_qty_err_${index}`} className="text-xs text-destructive">
              {itemErrors.quantity.message}
            </p>
          )}
        </div>

        {/* Subtotal (computed) */}
        {/* Mobile: full-width row with label left / value right, separated by a top border */}
        {/* Desktop: stacked column, value right-aligned at input height */}
        <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 md:col-span-1 md:flex-col md:items-stretch md:gap-1 md:border-0 md:pt-0">
          <p className="text-xs font-medium text-gray-500">Subtotal</p>
          <p className="flex h-9 items-center justify-end text-sm font-semibold text-gray-900">
            {fmt(subtotal)}
          </p>
        </div>
      </div>

      {/* Bottom row: Specifications + delete */}
      <div className="mt-3 flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor={`items.${index}.specifications`} className="text-xs font-medium">
            Details / Specification
          </Label>
          <textarea
            id={`items.${index}.specifications`}
            rows={2}
            placeholder="Details here..."
            className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register(`items.${index}.specifications`)}
          />
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove item ${index + 1}`}
            className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────

const DEFAULT_ITEM = {
  item_description: '',
  unit_cost: 0,
  quantity: 0,
  specifications: '',
} as const;

export const CreateRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateRequest();

  // File attachment state — not in RHF because files are uploaded after PR creation
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracks which button triggered the submit so onSubmit can distinguish draft vs submit
  const intentRef = useRef<'submit' | 'draft'>('submit');

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      end_user_name: '',
      category_id: undefined,
      purpose: '',
      items: [{ ...DEFAULT_ITEM }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Watch items for live subtotal / total computation in the sidebar
  const watchedItems = useWatch({ control, name: 'items' });
  const itemSubtotals = watchedItems.map((item) =>
    safeNum(item.unit_cost) * safeNum(item.quantity),
  );
  const grandTotal = itemSubtotals.reduce((sum, s) => sum + s, 0);

  // ── File upload handlers ──────────────────────────────────────────────────

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) => {
      if (f.size > MAX_FILE_BYTES) return false;
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    // Reset so the same file can be re-selected if removed
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Form submission ───────────────────────────────────────────────────────

  const onSubmit = async (values: CreateRequestFormValues) => {
    const isDraft = intentRef.current === 'draft';

    if (!user?.office_id) {
      setError('root', {
        type: 'server',
        message: 'Your account has no assigned office. Contact your administrator.',
      });
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        end_user_name: values.end_user_name,
        requesting_office_id: user.office_id,
        category_id: values.category_id,
        purpose: values.purpose,
        items: values.items.map((item) => ({
          item_description: item.item_description,
          specifications: item.specifications || undefined,
          unit_of_measure: 'unit',
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
        ...(isDraft && { is_draft: true }),
      });

      // Upload any selected attachments (fire-and-forget individually; failures are non-fatal)
      if (files.length > 0) {
        await Promise.allSettled(
          files.map((file) => requestsApi.uploadAttachment(response.data.id, file)),
        );
      }

      navigate('/requests');
    } catch (error) {
      if (isApiValidationError(error)) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          // Map top-level API field names directly; nested fields (e.g. items.0.unit_cost)
          // will appear as root errors since RHF path structure differs from the API path.
          setError(field as keyof CreateRequestFormValues, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        setError('root', {
          type: 'server',
          message: 'Failed to submit the request. Please try again.',
        });
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_288px]">
        {/* ── Left column: Sections 1 → 3 ─────────────────────────────── */}
        <div className="space-y-4">
          {/* ── Section 1: Request Details ── */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader number={1} title="Request Details" />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* End-User / Responsible Person */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="end_user_name" className="text-sm font-medium">
                  End-User / Responsible Person{' '}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="end_user_name"
                  type="text"
                  placeholder="Full name of the end-user..."
                  aria-required="true"
                  aria-invalid={!!errors.end_user_name}
                  aria-describedby={errors.end_user_name ? 'end_user_name_err' : undefined}
                  className={cn(
                    'h-10',
                    errors.end_user_name && 'border-destructive',
                  )}
                  {...register('end_user_name')}
                />
                {errors.end_user_name && (
                  <p id="end_user_name_err" className="text-xs text-destructive">
                    {errors.end_user_name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category_trigger" className="text-sm font-medium">
                  Category{' '}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </Label>
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
                        id="category_trigger"
                        aria-required="true"
                        aria-invalid={!!errors.category_id}
                        aria-describedby={errors.category_id ? 'category_err' : undefined}
                        className={cn(
                          'h-10 w-full',
                          errors.category_id && 'border-destructive',
                        )}
                      >
                        <SelectValue placeholder="Select category" />
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
                {errors.category_id && (
                  <p id="category_err" className="text-xs text-destructive">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Justification */}
            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="purpose" className="text-sm font-medium">
                Justification{' '}
                <span className="text-red-500" aria-hidden="true">*</span>
              </Label>
              <textarea
                id="purpose"
                rows={4}
                placeholder="Explain why these items are necessary for the agency's operations..."
                aria-required="true"
                aria-invalid={!!errors.purpose}
                aria-describedby={errors.purpose ? 'purpose_err' : 'purpose_hint'}
                className={cn(
                  'w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                  errors.purpose && 'border-destructive ring-3 ring-destructive/20',
                )}
                {...register('purpose')}
              />
              {errors.purpose ? (
                <p id="purpose_err" className="text-xs text-destructive">
                  {errors.purpose.message}
                </p>
              ) : (
                <p id="purpose_hint" className="text-xs text-muted-foreground">
                  This explanation will be visible to the approver.
                </p>
              )}
            </div>
          </div>

          {/* ── Section 2: Items ── */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader number={2} title="Items" />

            <div className="mt-2 space-y-0">
              {fields.map((field, index) => (
                <ItemRow
                  key={field.id}
                  index={index}
                  subtotal={itemSubtotals[index] ?? 0}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(index)}
                  register={register}
                  control={control}
                  errors={errors}
                />
              ))}
            </div>

            {/* Array-level error (e.g. "at least one item required") */}
            {errors.items && !Array.isArray(errors.items) && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {errors.items.message}
              </p>
            )}

            {/* Add Item + Total row */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...DEFAULT_ITEM })}
                className="h-8 gap-1.5 text-sm"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add Item
              </Button>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-gray-900">{fmt(grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* ── Section 3: Attachments ── */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader number={3} title="Attachments" />

            <div className="mt-4">
              {/* Drop zone */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload files — click or drag and drop"
                onClick={handleDropZoneClick}
                onKeyDown={(e) => e.key === 'Enter' && handleDropZoneClick()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-10 transition-colors',
                  isDragging && 'border-green-500 bg-green-50',
                  !isDragging && 'hover:border-gray-400 hover:bg-gray-50',
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-gray-200">
                  <Upload className="size-5 text-gray-500" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  Quotations, Specifications, PPMP or others (max 50MB)
                </p>

                {/* Hidden file input — activated by the drop zone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  aria-hidden="true"
                  onChange={handleFileInput}
                />
              </div>

              {/* Attached files list */}
              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2"
                    >
                      <span className="max-w-[160px] truncate text-xs font-medium text-gray-700">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Remove ${file.name}`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: Summary + Reminders ───────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Summary card */}
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold text-gray-800">Summary</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">No. of Items</span>
                <span className="font-semibold text-gray-900">{watchedItems.length}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-gray-900">{fmt(grandTotal)}</span>
              </div>
            </div>

            {/* Root / server error */}
            {errors.root && (
              <p className="mt-4 text-xs text-destructive" role="alert">
                {errors.root.message}
              </p>
            )}

            <div className="mt-6 space-y-2">
              {/* Submit Request */}
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  intentRef.current = 'submit';
                }}
                className="h-10 w-full bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-700/50"
              >
                {isSubmitting && intentRef.current === 'submit'
                  ? 'Submitting...'
                  : 'Submit Request'}
              </Button>

              {/* Save Draft */}
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  intentRef.current = 'draft';
                }}
                className="h-10 w-full"
              >
                {isSubmitting && intentRef.current === 'draft' ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>

          {/* Reminders card */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 className="text-sm font-semibold text-green-800">Reminders</h3>
            <ul className="mt-3 space-y-2.5">
              <li className="flex gap-2 text-xs text-green-700">
                <span className="mt-0.5 shrink-0" aria-hidden="true">•</span>
                <span>
                  Requests with a total of 50,000.00 or greater are subject to mandatory PhilGEPS
                  posting process which may take a lot of time to complete and affect procurement
                  timelines.
                </span>
              </li>
              <li className="flex gap-2 text-xs text-green-700">
                <span className="mt-0.5 shrink-0" aria-hidden="true">•</span>
                <span>
                  ICT related equipment must be reviewed and approved by the authorized IT
                  Personnel.
                </span>
              </li>
              <li className="flex gap-2 text-xs text-green-700">
                <span className="mt-0.5 shrink-0" aria-hidden="true">•</span>
                <span>Conducting a pre-canvass may hasten the process of the request.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};
