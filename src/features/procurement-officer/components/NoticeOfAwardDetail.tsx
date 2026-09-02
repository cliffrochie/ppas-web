import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthorization } from '@/lib/authorization';
import type { NoticeOfAward } from '@/types';
import { useUpdateNoticeOfAward } from '../api/procurement';
import {
  noticeOfAwardEditSchema as editSchema,
  type NoticeOfAwardEditValues as EditValues,
} from '../schemas/noticeOfAwardSchema';

const formatCurrency = (amount: string) =>
  Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const NoticeOfAwardEditForm = ({ noa }: { noa: NoticeOfAward }) => {
  const [file, setFile] = useState<File | null>(null);
  const { mutate, isPending } = useUpdateNoticeOfAward(noa.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      noa_number: noa.noa_number,
      awarded_supplier: noa.awarded_supplier,
      awarded_amount: parseFloat(noa.awarded_amount),
      issued_at: noa.issued_at ?? '',
    },
  });

  const onSubmit = (values: EditValues) => {
    mutate({
      noa_number: values.noa_number,
      awarded_supplier: values.awarded_supplier,
      awarded_amount: values.awarded_amount,
      issued_at: values.issued_at || null,
      file: file ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="noa_edit_number">NOA Number</Label>
        <Input id="noa_edit_number" {...register('noa_number')} />
        {errors.noa_number && <p className="text-xs text-destructive">{errors.noa_number.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="noa_edit_supplier">Awarded Supplier</Label>
        <Input id="noa_edit_supplier" {...register('awarded_supplier')} />
        {errors.awarded_supplier && (
          <p className="text-xs text-destructive">{errors.awarded_supplier.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="noa_edit_amount">Awarded Amount</Label>
        <Input
          id="noa_edit_amount"
          type="number"
          step="0.01"
          {...register('awarded_amount', { valueAsNumber: true })}
        />
        {errors.awarded_amount && (
          <p className="text-xs text-destructive">{errors.awarded_amount.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="noa_edit_issued_at">Issued At</Label>
        <Input id="noa_edit_issued_at" type="date" {...register('issued_at')} />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="noa_edit_file">Replace Document</Label>
        {file ? (
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3">
            <span className="truncate text-sm text-gray-700">{file.name}</span>
            <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
              <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="noa_edit_file"
            className="flex h-10 w-fit cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 px-4 text-sm text-gray-600 hover:border-green-400"
          >
            <Upload className="size-3.5 text-gray-400" aria-hidden="true" />
            Upload new file
            <input
              id="noa_edit_file"
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

interface NoticeOfAwardDetailProps {
  noa: NoticeOfAward;
}

export const NoticeOfAwardDetail = ({ noa }: NoticeOfAwardDetailProps) => {
  const { hasRole } = useAuthorization();
  const canManage = hasRole(['procurement_officer']);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-bold text-gray-900">{noa.noa_number}</h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            BAC Resolution:{' '}
            <Link
              to={`/procurement-officer/bac-resolutions/${noa.bac_resolution_id}`}
              className="text-green-700 hover:underline"
            >
              #{noa.bac_resolution_id}
            </Link>
          </span>
          <span>Awarded Supplier: {noa.awarded_supplier}</span>
          <span>Awarded Amount: {formatCurrency(noa.awarded_amount)}</span>
          <span>Issued At: {formatDate(noa.issued_at)}</span>
        </div>
      </div>

      {canManage && (
        <SectionCard title="Update Notice of Award">
          <NoticeOfAwardEditForm noa={noa} />
        </SectionCard>
      )}
    </div>
  );
};
