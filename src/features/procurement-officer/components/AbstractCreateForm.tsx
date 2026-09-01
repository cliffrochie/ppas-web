import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsersInfinite } from '@/features/requests';
import { useDebounce } from '@/hooks';
import { useCreateAbstractOfQuotation } from '../api/procurement';
import { useRfqs } from '../api/rfqs';
import {
  abstractSchema as schema,
  type AbstractFormValues as FormValues,
} from '../schemas/abstractSchema';
import { SearchCombobox } from './SearchCombobox';

const getFullName = (user: { first_name: string; last_name: string }) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ');

export const AbstractCreateForm = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rfqSearch, setRfqSearch] = useState('');
  const [rfqDisplay, setRfqDisplay] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const debouncedRfqSearch = useDebounce(rfqSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const { data: rfqsData, isLoading: rfqsLoading, isError: rfqsError } = useRfqs({
    search: debouncedRfqSearch || undefined,
  });
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite(debouncedUserSearch);

  const { mutate, isPending } = useCreateAbstractOfQuotation();

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

  const rfqOptions = (rfqsData?.data ?? []).map((r) => ({ id: r.id, label: r.rfq_number }));
  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const closeAndReset = () => {
    setOpen(false);
    reset();
    setFile(null);
    setRfqDisplay('');
    setUserDisplay('');
  };

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        rfq_id: values.rfq_id,
        prepared_by_id: values.prepared_by_id,
        recommended_supplier: values.recommended_supplier || undefined,
        recommended_amount: values.recommended_amount,
        file: file ?? undefined,
      },
      {
        onSuccess: closeAndReset,
        onError: () => setError('root', { message: 'Failed to create abstract. Please try again.' }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-green-700 text-white hover:bg-green-800" />}>
        Create Abstract
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Abstract of Quotation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="abstract_rfq_trigger">
              RFQ <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="rfq_id"
              render={({ field }) => (
                <SearchCombobox
                  id="abstract_rfq_trigger"
                  value={field.value}
                  displayValue={rfqDisplay}
                  onChange={(id, label) => {
                    field.onChange(id);
                    setRfqDisplay(label);
                  }}
                  options={rfqOptions}
                  isLoading={rfqsLoading}
                  isError={rfqsError}
                  search={rfqSearch}
                  onSearchChange={setRfqSearch}
                  placeholder="Select RFQ..."
                  ariaLabel="Search RFQs"
                  hasError={!!errors.rfq_id}
                />
              )}
            />
            {errors.rfq_id && <p className="text-xs text-destructive">{errors.rfq_id.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="abstract_prepared_by_trigger">
              Prepared By <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Controller
              control={control}
              name="prepared_by_id"
              render={({ field }) => (
                <SearchCombobox
                  id="abstract_prepared_by_trigger"
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
            <Label htmlFor="abstract_recommended_supplier">Recommended Supplier</Label>
            <Input id="abstract_recommended_supplier" {...register('recommended_supplier')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="abstract_recommended_amount">Recommended Amount</Label>
            <Input
              id="abstract_recommended_amount"
              type="number"
              step="0.01"
              {...register('recommended_amount', { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="abstract_file">Abstract Document</Label>
            {file ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2">
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
                  <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="abstract_file"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-green-400 hover:bg-green-50/50"
              >
                <Upload className="size-4 text-gray-400" aria-hidden="true" />
                Click to upload
                <input
                  id="abstract_file"
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
            <Button type="submit" disabled={isPending} className="bg-green-700 text-white hover:bg-green-800">
              {isPending ? 'Creating…' : 'Create Abstract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
