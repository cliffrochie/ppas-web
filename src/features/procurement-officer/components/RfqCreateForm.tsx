import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useRequests, useUsersInfinite } from '@/features/requests';
import { useCreateRfq } from '../api/rfqs';
import { rfqSchema as schema, type RfqFormValues as FormValues } from '../schemas/rfqSchema';
import { SearchCombobox } from './SearchCombobox';

const getFullName = (user: { first_name: string; last_name: string }) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ');

export const RfqCreateForm = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [prSearch, setPrSearch] = useState('');
  const [prDisplay, setPrDisplay] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const debouncedPrSearch = useDebounce(prSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const { data: requestsData, isLoading: requestsLoading, isError: requestsError } = useRequests({
    search: debouncedPrSearch || undefined,
    per_page: 10,
  });
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite(debouncedUserSearch);

  const { mutate, isPending } = useCreateRfq();

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

  const requestOptions = (requestsData?.data ?? []).map((r) => ({
    id: r.id,
    label: r.rf_number ?? `#${r.id}`,
    sublabel: r.purpose,
  }));

  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const closeAndReset = () => {
    setOpen(false);
    reset();
    setFile(null);
    setPrDisplay('');
    setUserDisplay('');
  };

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        purchase_request_id: values.purchase_request_id,
        prepared_by_id: values.prepared_by_id,
        deadline: values.deadline || undefined,
        file: file ?? undefined,
      },
      {
        onSuccess: closeAndReset,
        onError: () => {
          setError('root', { message: 'Failed to create RFQ. Please try again.' });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-green-700 text-white hover:bg-green-800" />}>
        Create RFQ
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create RFQ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfq_pr_trigger">
              Purchase Request <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="purchase_request_id"
              render={({ field }) => (
                <SearchCombobox
                  id="rfq_pr_trigger"
                  value={field.value}
                  displayValue={prDisplay}
                  onChange={(id, label) => {
                    field.onChange(id);
                    setPrDisplay(label);
                  }}
                  options={requestOptions}
                  isLoading={requestsLoading}
                  isError={requestsError}
                  search={prSearch}
                  onSearchChange={setPrSearch}
                  placeholder="Select purchase request..."
                  ariaLabel="Search purchase requests"
                  hasError={!!errors.purchase_request_id}
                />
              )}
            />
            {errors.purchase_request_id && (
              <p className="text-xs text-destructive">{errors.purchase_request_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfq_prepared_by_trigger">
              Prepared By <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="prepared_by_id"
              render={({ field }) => (
                <SearchCombobox
                  id="rfq_prepared_by_trigger"
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
            <Label htmlFor="rfq_deadline">Deadline</Label>
            <Input id="rfq_deadline" type="date" {...register('deadline')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfq_file">RFQ Document</Label>
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2">
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="rfq_file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-green-400 hover:bg-green-50/50"
              >
                <Upload className="size-4 text-gray-400" aria-hidden="true" />
                Click to upload
                <input
                  id="rfq_file"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
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
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-700 text-white hover:bg-green-800"
            >
              {isPending ? 'Creating…' : 'Create RFQ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
