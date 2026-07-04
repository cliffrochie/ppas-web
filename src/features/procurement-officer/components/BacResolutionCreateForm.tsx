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
import { useUsersInfinite } from '@/features/requests';
import { useAbstractsOfQuotation, useCreateBacResolution } from '../api/procurement';
import { SearchCombobox } from './SearchCombobox';

const schema = z.object({
  resolution_number: z.string().min(1, 'Required'),
  abstract_of_quotation_id: z
    .number({ message: 'Please select an abstract of quotation' })
    .int()
    .positive('Please select an abstract of quotation'),
  prepared_by_id: z
    .number({ message: 'Please select a preparer' })
    .int()
    .positive('Please select a preparer'),
  issued_at: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const getFullName = (user: { first_name: string; last_name: string }) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ');

export const BacResolutionCreateForm = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [abstractSearch, setAbstractSearch] = useState('');
  const [abstractDisplay, setAbstractDisplay] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const debouncedAbstractSearch = useDebounce(abstractSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const { data: abstractsData, isLoading: abstractsLoading, isError: abstractsError } =
    useAbstractsOfQuotation({ search: debouncedAbstractSearch || undefined });
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite(debouncedUserSearch);

  const { mutate, isPending } = useCreateBacResolution();

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

  const abstractOptions = (abstractsData?.data ?? []).map((a) => ({
    id: a.id,
    label: `Abstract #${a.id}`,
    sublabel: a.recommended_supplier ?? undefined,
  }));
  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const closeAndReset = () => {
    setOpen(false);
    reset();
    setFile(null);
    setFileError(null);
    setAbstractDisplay('');
    setUserDisplay('');
  };

  const onSubmit = (values: FormValues) => {
    if (!file) {
      setFileError('The resolution document is required.');
      return;
    }

    mutate(
      {
        resolution_number: values.resolution_number,
        abstract_of_quotation_id: values.abstract_of_quotation_id,
        prepared_by_id: values.prepared_by_id,
        issued_at: values.issued_at || undefined,
        file,
      },
      {
        onSuccess: closeAndReset,
        onError: () => setError('root', { message: 'Failed to create BAC resolution. Please try again.' }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-green-700 text-white hover:bg-green-800" />}>
        Create BAC Resolution
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create BAC Resolution</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bac_resolution_number">
              Resolution Number <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input id="bac_resolution_number" {...register('resolution_number')} />
            {errors.resolution_number && (
              <p className="text-xs text-destructive">{errors.resolution_number.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bac_abstract_trigger">
              Abstract of Quotation <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="abstract_of_quotation_id"
              render={({ field }) => (
                <SearchCombobox
                  id="bac_abstract_trigger"
                  value={field.value}
                  displayValue={abstractDisplay}
                  onChange={(id, label) => {
                    field.onChange(id);
                    setAbstractDisplay(label);
                  }}
                  options={abstractOptions}
                  isLoading={abstractsLoading}
                  isError={abstractsError}
                  search={abstractSearch}
                  onSearchChange={setAbstractSearch}
                  placeholder="Select abstract..."
                  ariaLabel="Search abstracts of quotation"
                  hasError={!!errors.abstract_of_quotation_id}
                />
              )}
            />
            {errors.abstract_of_quotation_id && (
              <p className="text-xs text-destructive">{errors.abstract_of_quotation_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bac_prepared_by_trigger">
              Prepared By <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="prepared_by_id"
              render={({ field }) => (
                <SearchCombobox
                  id="bac_prepared_by_trigger"
                  value={field.value}
                  displayValue={userDisplay}
                  onChange={(id, label) => {
                    field.onChange(id);
                    setUserDisplay(label);
                  }}
                  options={userOptions}
                  isLoading={usersLoading}
                  isError={usersError}
                  search={userSearch}
                  onSearchChange={setUserSearch}
                  placeholder="Select preparer..."
                  ariaLabel="Search users"
                  hasError={!!errors.prepared_by_id}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onFetchNextPage={fetchNextPage}
                />
              )}
            />
            {errors.prepared_by_id && (
              <p className="text-xs text-destructive">{errors.prepared_by_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bac_issued_at">Issued At</Label>
            <Input id="bac_issued_at" type="date" {...register('issued_at')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bac_file">
              Resolution Document <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2">
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                >
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="bac_file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-green-400 hover:bg-green-50/50"
              >
                <Upload className="size-4 text-gray-400" aria-hidden="true" />
                Click to upload
                <input
                  id="bac_file"
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
              {isPending ? 'Creating…' : 'Create Resolution'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
