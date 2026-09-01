import { Check, File, FileText, Image } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { Textarea } from '@/components/ui/textarea';
import { RequestStatusBadge, useRequestStatusHistories } from '@/features/requests';
import type { PurchaseRequest, PurchaseRequestStatus, PrStatusHistory, User } from '@/types';
import { cn } from '@/utils';
import { useUpdateRequestStatus } from '../api/requests';

// ─── Formatters ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: string | number) =>
  Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatName = (user: User) =>
  [user.first_name, user.middle_name, user.last_name, user.extension_name]
    .filter(Boolean)
    .join(' ');

// ─── Approval chain ────────────────────────────────────────────────────────────

const STATUS_COMPLETED_COUNT: Record<PurchaseRequestStatus, number> = {
  draft: 0,
  submitted: 1,
  under_review: 1,
  returned: 1,
  for_budget_approval: 2,
  budget_approved: 3,
  disapproved: 3,
  forwarded_to_ppu: 4,
  pr_prepared: 4,
  pr_approved: 4,
  rfq_prepared: 5,
  canvassing: 5,
  abstract_prepared: 6,
  bac_resolution_noa: 6,
  po_prepared: 6,
  completed: 7,
};

interface ChainStep {
  label: string;
  completionStatuses: PurchaseRequestStatus[];
}

const CHAIN_STEPS: ChainStep[] = [
  { label: 'Request Form Submission', completionStatuses: ['submitted'] },
  { label: 'BAC Review', completionStatuses: ['for_budget_approval'] },
  { label: 'Budget Officer Review', completionStatuses: ['budget_approved', 'disapproved'] },
  {
    label: 'PR Preparation',
    completionStatuses: ['forwarded_to_ppu', 'pr_prepared', 'pr_approved'],
  },
  { label: 'For Quotation', completionStatuses: ['rfq_prepared', 'canvassing'] },
  {
    label: 'PO Preparation',
    completionStatuses: ['abstract_prepared', 'bac_resolution_noa', 'po_prepared'],
  },
  { label: 'Delivery & Inspection', completionStatuses: ['completed'] },
];

const findStepHistory = (
  histories: PrStatusHistory[],
  step: ChainStep,
): PrStatusHistory | undefined =>
  histories.find((h) => step.completionStatuses.includes(h.to_status));

// ─── Layout primitives ─────────────────────────────────────────────────────────

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

const LabelValue = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-1 text-sm text-gray-900">{children}</div>
  </div>
);

// ─── Budget Officer Review panel ───────────────────────────────────────────────

interface BudgetOfficerReviewPanelProps {
  request: PurchaseRequest;
  histories: PrStatusHistory[];
}

const BudgetOfficerReviewPanel = ({ request, histories }: BudgetOfficerReviewPanelProps) => {
  const [remarks, setRemarks] = useState('');
  const { mutate, isPending } = useUpdateRequestStatus(request.id);

  const canAct = request.status === 'for_budget_approval';

  const isApproved = request.status === 'budget_approved';

  const isDisapproved =
    request.status === 'disapproved' &&
    histories.some(
      (h) => h.to_status === 'disapproved' && h.from_status === 'for_budget_approval',
    );

  const budgetHistory = histories.find(
    (h) =>
      h.to_status === 'budget_approved' ||
      (h.to_status === 'disapproved' && h.from_status === 'for_budget_approval'),
  );
  const previousRemarks = budgetHistory?.remarks ?? '';

  const handleApprove = () => {
    mutate({ status: 'budget_approved', remarks: remarks.trim() || undefined });
  };

  const handleDisapprove = () => {
    mutate({ status: 'disapproved', remarks: remarks.trim() || undefined });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Budget Officer Review
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-wide text-gray-400">Grand Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(request.total_amount)}
          </p>
        </div>

        <hr className="my-4 border-gray-200" />

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Budget Impact
            </p>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              Funds Available
            </span>
          </div>
          <div
            className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
            role="img"
            aria-label="Budget usage: current spend (gray) vs this request (green)"
          >
            <div className="h-full bg-gray-400" style={{ width: '80%' }} />
            <div className="h-full bg-green-500" style={{ width: '20%' }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Current Spend{' '}
            <span className="font-medium text-gray-700">(Dark Gray)</span>
            {' '}vs This Request{' '}
            <span className="font-medium text-green-600">(Green)</span>
          </p>
        </div>

        {canAct && (
          <>
            <div className="mt-5">
              <label
                htmlFor="bo-remarks"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Remarks (Optional)
              </label>
              <Textarea
                id="bo-remarks"
                placeholder="Add a comment..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="w-full bg-green-700 text-white hover:bg-green-800"
                disabled={isPending}
                onClick={handleApprove}
              >
                {isPending ? 'Saving…' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
                disabled={isPending}
                onClick={handleDisapprove}
              >
                Disapprove
              </Button>
            </div>
          </>
        )}

        {(isApproved || isDisapproved) && (
          <>
            <div className="mt-5">
              <label
                htmlFor="bo-remarks-readonly"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Remarks
              </label>
              <Textarea
                id="bo-remarks-readonly"
                value={previousRemarks}
                readOnly
                className="resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="mt-4">
              {isApproved ? (
                <div className="rounded-lg bg-green-100 py-4 text-center text-xl font-bold text-green-700">
                  Approved
                </div>
              ) : (
                <div className="rounded-lg bg-red-100 py-4 text-center text-xl font-bold text-red-600">
                  Disapproved
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Approval chain card ───────────────────────────────────────────────────────

interface ApprovalChainProps {
  request: PurchaseRequest;
  histories: PrStatusHistory[];
}

const ApprovalChain = ({ request, histories }: ApprovalChainProps) => {
  const completedCount = STATUS_COMPLETED_COUNT[request.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Request Approval Chain
      </h2>
      <ol>
        {CHAIN_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = index < completedCount;
          const isActive = completedCount > 0 && index === completedCount && completedCount < 7;
          const isLast = index === CHAIN_STEPS.length - 1;

          const historyEntry = isDone ? findStepHistory(histories, step) : undefined;
          const actorName = historyEntry?.actor ? formatName(historyEntry.actor) : undefined;
          const actedAt = historyEntry ? formatDate(historyEntry.acted_at) : undefined;

          return (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                {isDone ? (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-600">
                    <Check className="size-3.5 text-white" aria-hidden="true" />
                  </div>
                ) : isActive ? (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-green-600 bg-white">
                    <span className="text-xs font-bold text-green-700">{stepNumber}</span>
                  </div>
                ) : (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
                    <span className="text-xs font-medium text-gray-400">{stepNumber}</span>
                  </div>
                )}
                {!isLast && (
                  <div
                    className={cn(
                      'mt-1 min-h-5 w-0.5 flex-1',
                      isDone ? 'bg-green-400' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>

              <div className={cn('pb-4', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-medium leading-7',
                    isDone ? 'text-gray-700' : isActive ? 'text-green-700' : 'text-gray-400',
                  )}
                >
                  {step.label}
                </p>
                {isDone && actorName && (
                  <p className="text-xs text-gray-500">
                    {actorName}
                    {actedAt && ` · ${actedAt}`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

interface BudgetOfficerRequestDetailProps {
  request: PurchaseRequest;
}

export const BudgetOfficerRequestDetail = ({ request }: BudgetOfficerRequestDetailProps) => {
  const items = request.items ?? [];
  const attachments = request.attachments ?? [];
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
  const { data: historiesResponse } = useRequestStatusHistories(request.id);
  const histories = historiesResponse?.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* ─── Left column ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* General Information */}
        <SectionCard title="General Information">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-x-8">
            <LabelValue label="RF #">{request.rf_number ?? '—'}</LabelValue>
            <LabelValue label="PR #">{request.pr_number ?? 'TBA'}</LabelValue>
            <LabelValue label="Date Submitted">{formatDate(request.submitted_at)}</LabelValue>
            <LabelValue label="Status">
              <RequestStatusBadge status={request.status} />
            </LabelValue>
            <LabelValue label="Requested By">
              {request.requester ? formatName(request.requester) : '—'}
            </LabelValue>
            <LabelValue label="End-User">
              {request.requester ? formatName(request.requester) : '—'}
            </LabelValue>
            <LabelValue label="Office (Section)">
              {request.requesting_office?.name ?? '—'}
            </LabelValue>
            <LabelValue label="Category">{request.category?.name ?? '—'}</LabelValue>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-5">
            <LabelValue label="Justification">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {request.purpose}
              </p>
            </LabelValue>
          </div>
        </SectionCard>

        {/* Line Items */}
        <SectionCard title="Line Items">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">No items found.</p>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {items.map((item) => (
                  <div key={item.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.item_description}</p>
                        {item.specifications && (
                          <RichTextContent
                            html={item.specifications}
                            className="mt-0.5 italic text-gray-500 [&_p]:text-xs"
                          />
                        )}
                      </div>
                      <p className="shrink-0 tabular-nums font-medium text-gray-900">
                        {formatCurrency(item.total_cost)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="tabular-nums">{formatCurrency(item.unit_cost)}</span>
                      {' × '}
                      <span className="tabular-nums">
                        {parseFloat(item.quantity).toLocaleString()}
                      </span>
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t-2 border-gray-300 pt-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {totalQty.toLocaleString()} {totalQty === 1 ? 'item' : 'items'}
                      {' · '}
                    </span>
                    <span className="tabular-nums font-bold text-gray-900">
                      {formatCurrency(request.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop: table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Item Description
                      </th>
                      <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Unit Price
                      </th>
                      <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Qty
                      </th>
                      <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{item.item_description}</p>
                          {item.specifications && (
                            <RichTextContent
                              html={item.specifications}
                              className="mt-0.5 italic text-gray-500 [&_p]:text-xs"
                            />
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-gray-700">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-gray-700">
                          {parseFloat(item.quantity).toLocaleString()}
                        </td>
                        <td className="py-3 text-right tabular-nums font-medium text-gray-900">
                          {formatCurrency(item.total_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td className="pt-3 font-semibold text-gray-900">Total</td>
                      <td />
                      <td className="pt-3 pr-4 text-right tabular-nums font-semibold text-gray-900">
                        {totalQty.toLocaleString()}
                      </td>
                      <td className="pt-3 text-right tabular-nums font-bold text-gray-900">
                        {formatCurrency(request.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </SectionCard>

        {/* Attachments */}
        <SectionCard title="Attachments">
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400">No attachments uploaded.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {attachments.map((att) => {
                const isPdf = att.mime_type === 'application/pdf';
                const isImage = att.mime_type.startsWith('image/');
                const Icon = isPdf ? FileText : isImage ? Image : File;
                const iconClass = isPdf
                  ? 'text-red-500'
                  : isImage
                    ? 'text-blue-500'
                    : 'text-gray-500';

                return (
                  <div
                    key={att.id}
                    className="flex w-40 flex-col items-center gap-1.5 rounded-lg border border-gray-200 p-3 text-center"
                  >
                    <Icon className={cn('size-8', iconClass)} aria-hidden="true" />
                    <p className="w-full truncate text-xs font-medium text-gray-700">
                      {att.file_name}
                    </p>
                    <p className="text-xs text-gray-400">{formatFileSize(att.file_size)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ─── Right column ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        <BudgetOfficerReviewPanel request={request} histories={histories} />
        <ApprovalChain request={request} histories={histories} />
      </div>
    </div>
  );
};
