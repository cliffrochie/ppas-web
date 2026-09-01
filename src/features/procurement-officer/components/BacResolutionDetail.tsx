import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks';
import { useAuthorization } from '@/lib/authorization';
import { useUsersInfinite } from '@/features/requests';
import type { BacResolution } from '@/types';
import { useUpdateBacResolution } from '../api/procurement';
import {
  bacResolutionEditSchema as editSchema,
  type BacResolutionEditValues as EditValues,
} from '../schemas/bacResolutionSchema';
import { SearchCombobox } from './SearchCombobox';

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

const BacResolutionEditForm = ({ resolution }: { resolution: BacResolution }) => {
  const [file, setFile] = useState<File | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState(
    resolution.prepared_by ? getFullName(resolution.prepared_by) : '',
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

  const { mutate, isPending } = useUpdateBacResolution(resolution.id);

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
      resolution_number: resolution.resolution_number,
      prepared_by_id: resolution.prepared_by_id,
      issued_at: resolution.issued_at ?? '',
    },
  });

  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const onSubmit = (values: EditValues) => {
    mutate({
      resolution_number: values.resolution_number,
      prepared_by_id: values.prepared_by_id,
      issued_at: values.issued_at || null,
      file: file ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bac_edit_resolution_number">Resolution Number</Label>
        <Input id="bac_edit_resolution_number" {...register('resolution_number')} />
        {errors.resolution_number && (
          <p className="text-xs text-destructive">{errors.resolution_number.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bac_edit_prepared_by">Prepared By</Label>
        <Controller
          control={control}
          name="prepared_by_id"
          render={({ field }) => (
            <SearchCombobox
              id="bac_edit_prepared_by"
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
        <Label htmlFor="bac_edit_issued_at">Issued At</Label>
        <Input id="bac_edit_issued_at" type="date" {...register('issued_at')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bac_edit_file">Replace Document</Label>
        {file ? (
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3">
            <span className="truncate text-sm text-gray-700">{file.name}</span>
            <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
              <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="bac_edit_file"
            className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-green-400"
          >
            <Upload className="size-3.5 text-gray-400" aria-hidden="true" />
            Upload new file
            <input
              id="bac_edit_file"
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

interface BacResolutionDetailProps {
  resolution: BacResolution;
}

export const BacResolutionDetail = ({ resolution }: BacResolutionDetailProps) => {
  const { hasRole } = useAuthorization();
  const canManage = hasRole(['procurement_officer']);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-bold text-gray-900">{resolution.resolution_number}</h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            Abstract:{' '}
            <Link
              to={`/procurement-officer/abstracts/${resolution.abstract_of_quotation_id}`}
              className="text-green-700 hover:underline"
            >
              #{resolution.abstract_of_quotation_id}
            </Link>
          </span>
          <span>
            Prepared By: {resolution.prepared_by ? getFullName(resolution.prepared_by) : '—'}
          </span>
          <span>Issued At: {formatDate(resolution.issued_at)}</span>
        </div>
      </div>

      {canManage && (
        <SectionCard title="Update BAC Resolution">
          <BacResolutionEditForm resolution={resolution} />
        </SectionCard>
      )}
    </div>
  );
};
