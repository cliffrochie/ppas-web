import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks';
import { useAuthorization } from '@/lib/authorization';
import { useRequest, useUsersInfinite } from '@/features/requests';
import { cn } from '@/utils';
import type { Rfq, RfqItem, RfqStatus, CanvassResponse, PurchaseRequestItem } from '@/types';
import { RfqStatusBadge } from './RfqsTable';
import {
  useUpdateRfq,
  useRfqItems,
  useCreateRfqItem,
  useUpdateRfqItem,
  useDeleteRfqItem,
  useCanvassResponses,
  useCreateCanvassResponse,
  useUpdateCanvassResponse,
  useDeleteCanvassResponse,
} from '../api/rfqs';
import { SearchCombobox } from './SearchCombobox';

// ─── Formatters ───────────────────────────────────────────────────────────────

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

// ─── Layout primitives ─────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {action}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// ─── RFQ edit form (prepared_by / deadline / status / file) ────────────────────

const rfqEditSchema = z.object({
  prepared_by_id: z.number({ message: 'Please select a preparer' }).int().positive(),
  deadline: z.string().optional(),
  status: z.enum(['draft', 'for_signature', 'signed', 'canvassing', 'closed']),
});

type RfqEditValues = z.infer<typeof rfqEditSchema>;

const RFQ_STATUS_OPTIONS: RfqStatus[] = ['draft', 'for_signature', 'signed', 'canvassing', 'closed'];

const RfqEditForm = ({ rfq }: { rfq: Rfq }) => {
  const [file, setFile] = useState<File | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userDisplay, setUserDisplay] = useState(rfq.prepared_by ? getFullName(rfq.prepared_by) : '');
  const debouncedUserSearch = useDebounce(userSearch, 300);

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsersInfinite(debouncedUserSearch);

  const { mutate, isPending } = useUpdateRfq(rfq.id);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RfqEditValues>({
    resolver: zodResolver(rfqEditSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      prepared_by_id: rfq.prepared_by_id,
      deadline: rfq.deadline ?? '',
      status: rfq.status,
    },
  });

  const userOptions = (usersData?.pages.flatMap((page) => page.data) ?? []).map((u) => ({
    id: u.id,
    label: getFullName(u),
  }));

  const onSubmit = (values: RfqEditValues) => {
    mutate({
      prepared_by_id: values.prepared_by_id,
      deadline: values.deadline || null,
      status: values.status,
      file: file ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rfq_edit_prepared_by">Prepared By</Label>
        <Controller
          control={control}
          name="prepared_by_id"
          render={({ field }) => (
            <SearchCombobox
              id="rfq_edit_prepared_by"
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
        <Label htmlFor="rfq_edit_deadline">Deadline</Label>
        <Input id="rfq_edit_deadline" type="date" {...register('deadline')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rfq_edit_status_trigger">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(val) => val && field.onChange(val)}>
              <SelectTrigger id="rfq_edit_status_trigger" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RFQ_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rfq_edit_file">Replace Document</Label>
        {file ? (
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3">
            <span className="truncate text-sm text-gray-700">{file.name}</span>
            <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>
              <X className="size-3.5 text-muted-foreground hover:text-destructive" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="rfq_edit_file"
            className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-green-400"
          >
            <Upload className="size-3.5 text-gray-400" aria-hidden="true" />
            Upload new file
            <input id="rfq_edit_file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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

// ─── Canvass response dialog form ──────────────────────────────────────────────

const canvassSchema = z.object({
  supplier_name: z.string().min(1, 'Required'),
  unit_price: z.number({ message: 'Enter a valid price' }).positive('Must be greater than 0'),
  total_price: z.number({ message: 'Enter a valid amount' }).positive('Must be greater than 0'),
  notes: z.string().optional(),
});

type CanvassValues = z.infer<typeof canvassSchema>;

const CanvassFormDialog = ({
  rfqId,
  rfqItemId,
  canvassResponse,
  trigger,
}: {
  rfqId: number;
  rfqItemId: number;
  canvassResponse?: CanvassResponse;
  trigger: React.ReactElement;
}) => {
  const [open, setOpen] = useState(false);
  const { mutate: createMutate, isPending: creating } = useCreateCanvassResponse();
  const { mutate: updateMutate, isPending: updating } = useUpdateCanvassResponse(
    canvassResponse?.id ?? 0,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CanvassValues>({
    resolver: zodResolver(canvassSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: canvassResponse
      ? {
          supplier_name: canvassResponse.supplier_name,
          unit_price: parseFloat(canvassResponse.unit_price),
          total_price: parseFloat(canvassResponse.total_price),
          notes: canvassResponse.notes ?? '',
        }
      : { supplier_name: '', unit_price: 0, total_price: 0, notes: '' },
  });

  const onSubmit = (values: CanvassValues) => {
    const payload = {
      rfq_id: rfqId,
      rfq_item_id: rfqItemId,
      supplier_name: values.supplier_name,
      unit_price: values.unit_price,
      total_price: values.total_price,
      notes: values.notes || undefined,
    };

    const onSuccess = () => {
      setOpen(false);
      reset();
    };

    if (canvassResponse) {
      updateMutate(payload, { onSuccess });
    } else {
      createMutate(payload, { onSuccess });
    }
  };

  const isPending = creating || updating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{canvassResponse ? 'Edit Canvass Response' : 'Add Canvass Response'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="canvass_supplier">Supplier Name</Label>
            <Input id="canvass_supplier" {...register('supplier_name')} />
            {errors.supplier_name && (
              <p className="text-xs text-destructive">{errors.supplier_name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="canvass_unit_price">Unit Price</Label>
              <Input
                id="canvass_unit_price"
                type="number"
                step="0.01"
                {...register('unit_price', { valueAsNumber: true })}
              />
              {errors.unit_price && (
                <p className="text-xs text-destructive">{errors.unit_price.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="canvass_total_price">Total Price</Label>
              <Input
                id="canvass_total_price"
                type="number"
                step="0.01"
                {...register('total_price', { valueAsNumber: true })}
              />
              {errors.total_price && (
                <p className="text-xs text-destructive">{errors.total_price.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="canvass_notes">Notes</Label>
            <Input id="canvass_notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-green-700 text-white hover:bg-green-800">
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Canvass responses sub-table ───────────────────────────────────────────────

const formatCurrency = (amount: string | number) =>
  Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CanvassSection = ({
  rfqId,
  rfqItem,
  canManage,
}: {
  rfqId: number;
  rfqItem: RfqItem;
  canManage: boolean;
}) => {
  const { data: response, isLoading } = useCanvassResponses({ rfq_item_id: rfqItem.id });
  const { mutate: deleteMutate } = useDeleteCanvassResponse();
  const responses = response?.data ?? [];

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this canvass response?')) deleteMutate(id);
  };

  return (
    <div className="mt-3 rounded-md border border-gray-100 bg-gray-50/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Canvass Responses
        </p>
        {canManage && (
          <CanvassFormDialog
            rfqId={rfqId}
            rfqItemId={rfqItem.id}
            trigger={
              <Button variant="outline" size="icon-xs" aria-label="Add canvass response">
                <Plus />
              </Button>
            }
          />
        )}
      </div>

      {isLoading ? (
        <div className="h-8 animate-pulse rounded bg-muted" />
      ) : responses.length === 0 ? (
        <p className="text-xs text-gray-400">No canvass responses yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-1.5 font-semibold uppercase tracking-wide">Supplier</th>
                <th className="pb-1.5 text-right font-semibold uppercase tracking-wide">Unit Price</th>
                <th className="pb-1.5 text-right font-semibold uppercase tracking-wide">Total</th>
                <th className="pb-1.5 font-semibold uppercase tracking-wide">Notes</th>
                {canManage && <th className="pb-1.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {responses.map((cr) => (
                <tr key={cr.id}>
                  <td className="py-1.5 text-gray-800">{cr.supplier_name}</td>
                  <td className="py-1.5 text-right tabular-nums text-gray-700">
                    {formatCurrency(cr.unit_price)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums font-medium text-gray-900">
                    {formatCurrency(cr.total_price)}
                  </td>
                  <td className="py-1.5 text-gray-500">{cr.notes ?? '—'}</td>
                  {canManage && (
                    <td className="py-1.5">
                      <div className="flex items-center justify-end gap-1">
                        <CanvassFormDialog
                          rfqId={rfqId}
                          rfqItemId={rfqItem.id}
                          canvassResponse={cr}
                          trigger={
                            <Button variant="ghost" size="icon-xs" aria-label={`Edit response from ${cr.supplier_name}`}>
                              <Pencil />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Delete response from ${cr.supplier_name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cr.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── RFQ item dialog form ───────────────────────────────────────────────────────

const rfqItemSchema = z.object({
  pr_item_id: z.number({ message: 'Please select a PR line item' }).int().positive(),
  item_description: z.string().min(1, 'Required'),
  unit_of_measure: z.string().min(1, 'Required'),
  quantity: z.number({ message: 'Enter a valid quantity' }).positive('Must be greater than 0'),
});

type RfqItemValues = z.infer<typeof rfqItemSchema>;

const RfqItemFormDialog = ({
  rfqId,
  prItems,
  rfqItem,
  trigger,
}: {
  rfqId: number;
  prItems: PurchaseRequestItem[];
  rfqItem?: RfqItem;
  trigger: React.ReactElement;
}) => {
  const [open, setOpen] = useState(false);
  const { mutate: createMutate, isPending: creating } = useCreateRfqItem(rfqId);
  const { mutate: updateMutate, isPending: updating } = useUpdateRfqItem(rfqItem?.id ?? 0, rfqId);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RfqItemValues>({
    resolver: zodResolver(rfqItemSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: rfqItem
      ? {
          pr_item_id: rfqItem.pr_item_id,
          item_description: rfqItem.item_description,
          unit_of_measure: rfqItem.unit_of_measure,
          quantity: parseFloat(rfqItem.quantity),
        }
      : { item_description: '', unit_of_measure: '', quantity: 0 },
  });

  const onSubmit = (values: RfqItemValues) => {
    const onSuccess = () => {
      setOpen(false);
      reset();
    };

    if (rfqItem) {
      updateMutate(
        {
          pr_item_id: values.pr_item_id,
          item_description: values.item_description,
          unit_of_measure: values.unit_of_measure,
          quantity: values.quantity,
        },
        { onSuccess },
      );
    } else {
      createMutate(
        {
          rfq_id: rfqId,
          pr_item_id: values.pr_item_id,
          item_description: values.item_description,
          unit_of_measure: values.unit_of_measure,
          quantity: values.quantity,
        },
        { onSuccess },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{rfqItem ? 'Edit RFQ Item' : 'Add RFQ Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfq_item_pr_item_trigger">PR Line Item</Label>
            <Controller
              control={control}
              name="pr_item_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(val) => {
                    if (!val) return;
                    const numeric = Number(val);
                    field.onChange(numeric);
                    const prItem = prItems.find((item) => item.id === numeric);
                    if (prItem) {
                      setValue('item_description', prItem.item_description);
                      setValue('unit_of_measure', prItem.unit_of_measure);
                      setValue('quantity', parseFloat(prItem.quantity));
                    }
                  }}
                >
                  <SelectTrigger id="rfq_item_pr_item_trigger" className="h-10 w-full">
                    <SelectValue>
                      {(value: string | null) => {
                        if (!value) return 'Select PR line item...';
                        return prItems.find((i) => String(i.id) === value)?.item_description ?? value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {prItems.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        No line items available
                      </SelectItem>
                    ) : (
                      prItems.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.item_description}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.pr_item_id && (
              <p className="text-xs text-destructive">{errors.pr_item_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfq_item_description">Item Description</Label>
            <Input id="rfq_item_description" {...register('item_description')} />
            {errors.item_description && (
              <p className="text-xs text-destructive">{errors.item_description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rfq_item_uom">Unit of Measure</Label>
              <Input id="rfq_item_uom" {...register('unit_of_measure')} />
              {errors.unit_of_measure && (
                <p className="text-xs text-destructive">{errors.unit_of_measure.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rfq_item_quantity">Quantity</Label>
              <Input
                id="rfq_item_quantity"
                type="number"
                step="1"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || updating}
              className="bg-green-700 text-white hover:bg-green-800"
            >
              {creating || updating ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Items section ─────────────────────────────────────────────────────────────

const ItemsSection = ({
  rfqId,
  prItems,
  canManage,
}: {
  rfqId: number;
  prItems: PurchaseRequestItem[];
  canManage: boolean;
}) => {
  const { data: response, isLoading } = useRfqItems({ rfq_id: rfqId });
  const { mutate: deleteMutate } = useDeleteRfqItem(rfqId);
  const items = response?.data ?? [];

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this RFQ item and its canvass responses?')) deleteMutate(id);
  };

  return (
    <SectionCard
      title="RFQ Items"
      action={
        canManage && (
          <RfqItemFormDialog
            rfqId={rfqId}
            prItems={prItems}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" aria-hidden="true" />
                Add Item
              </Button>
            }
          />
        )
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No RFQ items yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.item_description}</p>
                  <p className="text-xs text-gray-500">
                    {parseFloat(item.quantity).toLocaleString()} {item.unit_of_measure}
                  </p>
                </div>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <RfqItemFormDialog
                      rfqId={rfqId}
                      prItems={prItems}
                      rfqItem={item}
                      trigger={
                        <Button variant="ghost" size="icon-xs" aria-label={`Edit item ${item.item_description}`}>
                          <Pencil />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Delete item ${item.item_description}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>

              <CanvassSection rfqId={rfqId} rfqItem={item} canManage={canManage} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────────

interface RfqDetailProps {
  rfq: Rfq;
}

export const RfqDetail = ({ rfq }: RfqDetailProps) => {
  const { hasRole } = useAuthorization();
  const canManage = hasRole(['procurement_officer']);
  const { data: prResponse } = useRequest(rfq.purchase_request_id);
  const prItems = prResponse?.data.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{rfq.rfq_number}</h1>
            <RfqStatusBadge status={rfq.status} />
          </div>
        </div>
        <div className={cn('mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500')}>
          <span>
            Purchase Request:{' '}
            <Link
              to={`/procurement-officer/requests/${rfq.purchase_request_id}`}
              className="text-green-700 hover:underline"
            >
              {prResponse?.data.rf_number ?? `#${rfq.purchase_request_id}`}
            </Link>
          </span>
          <span>Deadline: {formatDate(rfq.deadline)}</span>
          <span>Prepared By: {rfq.prepared_by ? getFullName(rfq.prepared_by) : '—'}</span>
        </div>
      </div>

      {canManage && (
        <SectionCard title="Update RFQ">
          <RfqEditForm rfq={rfq} />
        </SectionCard>
      )}

      <ItemsSection rfqId={rfq.id} prItems={prItems} canManage={canManage} />
    </div>
  );
};
