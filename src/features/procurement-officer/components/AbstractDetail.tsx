import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
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
import { useDebounce } from '@/hooks';
import { useAuthorization } from '@/lib/authorization';
import { useUsersInfinite } from '@/features/requests';
import type { AbstractOfQuotation, AbstractStatus } from '@/types';
import { useUpdateAbstractOfQuotation } from '../api/procurement';
import {
  abstractEditSchema as editSchema,
  type AbstractEditValues as EditValues,
} from '../schemas/abstractSchema';
import { AbstractStatusBadge } from './AbstractsTable';
import { SearchCombobox } from './SearchCombobox';

const formatCurrency = (amount: string | null) =>
  amount === null
    ? '—'
    : Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const getFullName = (user: { first_name: string; last_name: string }) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ');

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const ABSTRACT_STATUS_OPTIONS: AbstractStatus[] = ['draft', 'approved'];

const AbstractEditForm = ({ abstract }: { abstract: AbstractOfQuotation }) => {
  const [file, setFile] = useState<File | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState(
    abstract.prepared_by ? getFullName(abstract.prepared_by) : '',
  );
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite(debouncedUserSearch);

  const { mutate, isPending } = useUpdateAbstractOfQuotation(abstract.id);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      prepared_by_id: abstract.prepared_by_id,
      recommended_supplier: abstract.recommended_supplier ?? '',
      recommended_amount: abstract.recommended_amount ? parseFloat(abstract.recommended_amount) : undefined,
      status: abstract.status,
      approved_at: abstract.approved_at ?? '',
    },
  });

  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const onSubmit = (values: EditValues) => {
    mutate({
      prepared_by_id: values.prepared_by_id,
      recommended_supplier: values.recommended_supplier || null,
      recommended_amount: values.recommended_amount ?? null,
      status: values.status,
      approved_at: values.approved_at || null,
      file: file ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_prepared_by">Prepared By</Label>
        <Controller
          control={control}
          name="prepared_by_id"
          render={({ field }) => (
            <SearchCombobox
              id="abstract_edit_prepared_by"
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_status_trigger">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(val) => val && field.onChange(val)}>
              <SelectTrigger id="abstract_edit_status_trigger" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ABSTRACT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'approved' ? 'Approved' : 'Draft'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_supplier">Recommended Supplier</Label>
        <Input id="abstract_edit_supplier" {...register('recommended_supplier')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_amount">Recommended Amount</Label>
        <Input
          id="abstract_edit_amount"
          type="number"
          step="0.01"
          {...register('recommended_amount', { valueAsNumber: true })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_approved_at">Approved At</Label>
        <Input id="abstract_edit_approved_at" type="date" {...register('approved_at')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="abstract_edit_file">Replace Document</Label>
        {file ? (
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3">
            <span className="truncate text-sm text-gray-700">{file.name}</span>
            <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
              <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="abstract_edit_file"
            className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-green-400"
          >
            <Upload className="size-3.5 text-gray-400" aria-hidden="true" />
            Upload new file
            <input
              id="abstract_edit_file"
              type="file"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending} className="bg-green-700 text-white hover:bg-green-800">
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

interface AbstractDetailProps {
  abstract: AbstractOfQuotation;
}

export const AbstractDetail = ({ abstract }: AbstractDetailProps) => {
  const { hasRole } = useAuthorization();
  const canManage = hasRole(['procurement_officer']);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">Abstract #{abstract.id}</h1>
            <AbstractStatusBadge status={abstract.status} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            RFQ:{' '}
            <Link to={`/procurement-officer/rfqs/${abstract.rfq_id}`} className="text-green-700 hover:underline">
              #{abstract.rfq_id}
            </Link>
          </span>
          <span>Recommended Supplier: {abstract.recommended_supplier ?? '—'}</span>
          <span>Recommended Amount: {formatCurrency(abstract.recommended_amount)}</span>
          <span>Approved At: {formatDate(abstract.approved_at)}</span>
        </div>
      </div>

      {canManage && (
        <SectionCard title="Update Abstract">
          <AbstractEditForm abstract={abstract} />
        </SectionCard>
      )}
    </div>
  );
};
