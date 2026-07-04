import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks';
import { useBacResolutions, useCreateNoticeOfAward } from '../api/procurement';
import { SearchCombobox } from './SearchCombobox';

const schema = z.object({
  noa_number: z.string().min(1, 'Required'),
  bac_resolution_id: z
    .number({ message: 'Please select a BAC resolution' })
    .int()
    .positive('Please select a BAC resolution'),
  awarded_supplier: z.string().min(1, 'Required'),
  awarded_amount: z.number({ message: 'Enter a valid amount' }).positive('Must be greater than 0'),
  issued_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const NoticeOfAwardCreateForm = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [resolutionSearch, setResolutionSearch] = useState('');
  const [resolutionDisplay, setResolutionDisplay] = useState('');

  const debouncedResolutionSearch = useDebounce(resolutionSearch, 300);

  const {
    data: resolutionsData,
    isLoading: resolutionsLoading,
    isError: resolutionsError,
  } = useBacResolutions({ search: debouncedResolutionSearch || undefined });

  const { mutate, isPending } = useCreateNoticeOfAward();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const resolutionOptions = (resolutionsData?.data ?? []).map((r) => ({
    id: r.id,
    label: r.resolution_number,
  }));

  const closeAndReset = () => {
    setOpen(false);
    reset();
    setFile(null);
    setFileError(null);
    setResolutionDisplay('');
  };

  const onSubmit = (values: FormValues) => {
    if (!file) {
      setFileError('The notice of award document is required.');
      return;
    }

    mutate(
      {
        noa_number: values.noa_number,
        bac_resolution_id: values.bac_resolution_id,
        awarded_supplier: values.awarded_supplier,
        awarded_amount: values.awarded_amount,
        issued_at: values.issued_at || undefined,
        file,
      },
      {
        onSuccess: closeAndReset,
        onError: () => setError('root', { message: 'Failed to create notice of award. Please try again.' }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-green-700 text-white hover:bg-green-800" />}>
        Create Notice of Award
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Notice of Award</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_number">
              NOA Number <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input id="noa_number" {...register('noa_number')} />
            {errors.noa_number && <p className="text-xs text-destructive">{errors.noa_number.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_resolution_trigger">
              BAC Resolution <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="bac_resolution_id"
              render={({ field }) => (
                <SearchCombobox
                  id="noa_resolution_trigger"
                  value={field.value}
                  displayValue={resolutionDisplay}
                  onChange={(id, label) => {
                    field.onChange(id);
                    setResolutionDisplay(label);
                  }}
                  options={resolutionOptions}
                  isLoading={resolutionsLoading}
                  isError={resolutionsError}
                  search={resolutionSearch}
                  onSearchChange={setResolutionSearch}
                  placeholder="Select BAC resolution..."
                  ariaLabel="Search BAC resolutions"
                  hasError={!!errors.bac_resolution_id}
                />
              )}
            />
            {errors.bac_resolution_id && (
              <p className="text-xs text-destructive">{errors.bac_resolution_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_awarded_supplier">
              Awarded Supplier <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input id="noa_awarded_supplier" {...register('awarded_supplier')} />
            {errors.awarded_supplier && (
              <p className="text-xs text-destructive">{errors.awarded_supplier.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_awarded_amount">
              Awarded Amount <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="noa_awarded_amount"
              type="number"
              step="0.01"
              {...register('awarded_amount', { valueAsNumber: true })}
            />
            {errors.awarded_amount && (
              <p className="text-xs text-destructive">{errors.awarded_amount.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_issued_at">Issued At</Label>
            <Input id="noa_issued_at" type="date" {...register('issued_at')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="noa_file">
              NOA Document <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2">
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="noa_file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-green-400 hover:bg-green-50/50"
              >
                <Upload className="size-4 text-gray-400" aria-hidden="true" />
                Click to upload
                <input
                  id="noa_file"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setFileError(null);
                  }}
                />
              </label>
            )}
            {fileError && <p className="text-xs text-destructive">{fileError}</p>}
          </div>

          {errors.root && (
            <p className="text-xs text-destructive" role="alert">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAndReset}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-green-700 text-white hover:bg-green-800">
              {isPending ? 'Creating…' : 'Create NOA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
