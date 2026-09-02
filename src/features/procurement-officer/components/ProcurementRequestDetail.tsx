import { Check, File, FileText, Image, Printer } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RichTextContent } from '@/components/ui/rich-text-content';
import { Textarea } from '@/components/ui/textarea';
import { RequestStatusBadge, useRequestStatusHistories } from '@/features/requests';
import type { PurchaseRequest, PurchaseRequestStatus, PrStatusHistory, User } from '@/types';
import { cn } from '@/utils';
import {
  useGeneratePurchaseOrder,
  usePurchaseOrderForRequest,
} from '../api/purchase-orders';
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

// ─── Procurement review panel ──────────────────────────────────────────────────

type PpuDisapprovalFromStatus = 'forwarded_to_ppu' | 'pr_prepared';

const PPU_DISAPPROVAL_SOURCES: PpuDisapprovalFromStatus[] = ['forwarded_to_ppu', 'pr_prepared'];

const isPpuDisapproval = (request: PurchaseRequest, histories: PrStatusHistory[]) =>
  request.status === 'disapproved' &&
  histories.some(
    (h) =>
      h.to_status === 'disapproved' &&
      h.from_status !== null &&
      (PPU_DISAPPROVAL_SOURCES as string[]).includes(h.from_status),
  );

const findHistoryEntry = (
  histories: PrStatusHistory[],
  toStatus: PurchaseRequestStatus,
): PrStatusHistory | undefined => histories.find((h) => h.to_status === toStatus);

interface ProcurementReviewPanelProps {
  request: PurchaseRequest;
  histories: PrStatusHistory[];
}

const ProcurementReviewPanel = ({ request, histories }: ProcurementReviewPanelProps) => {
  const [remarks, setRemarks] = useState('');
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRequestStatus(request.id);
  const { mutate: generatePo, isPending: isGenerating } = useGeneratePurchaseOrder(request.id);

  const isPoBearingStatus =
    request.status === 'abstract_prepared' ||
    request.status === 'bac_resolution_noa' ||
    request.status === 'po_prepared' ||
    request.status === 'completed';

  const { data: poResponse } = usePurchaseOrderForRequest(request.id, isPoBearingStatus);
  const purchaseOrder = poResponse?.data[0];

  // ── State 1: forwarded_to_ppu ──────────────────────────────────────────────
  if (request.status === 'forwarded_to_ppu') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            PR Preparation
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
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">PR #</p>
            <span className="text-sm font-semibold text-gray-400">TBA</span>
          </div>
          <div className="mt-5">
            <label
              htmlFor="pr-remarks"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Remarks (Optional)
            </label>
            <Textarea
              id="pr-remarks"
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
              disabled={isUpdating}
              onClick={() =>
                updateStatus({ status: 'pr_prepared', remarks: remarks.trim() || undefined })
              }
            >
              {isUpdating ? 'Saving…' : 'Generate PR #'}
            </Button>
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700"
              disabled={isUpdating}
              onClick={() =>
                updateStatus({ status: 'disapproved', remarks: remarks.trim() || undefined })
              }
            >
              Disapprove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── State 2: pr_prepared ────────────────────────────────────────────────────
  if (request.status === 'pr_prepared') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            PR Preparation
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
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">PR #</p>
            <span className="text-sm font-semibold text-gray-800">
              {request.pr_number ?? 'TBA'}
            </span>
          </div>
          <div className="mb-4">
            <label
              htmlFor="pr-prepared-remarks"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Remarks (Optional)
            </label>
            <Textarea
              id="pr-prepared-remarks"
              placeholder="Add a comment..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="resize-none text-sm"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => window.print()}
            >
              <Printer className="mr-1.5 size-4" aria-hidden="true" />
              Print Purchase Request
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-green-700 text-white hover:bg-green-800"
                disabled={isUpdating}
                onClick={() =>
                  updateStatus({ status: 'pr_approved', remarks: remarks.trim() || undefined })
                }
              >
                {isUpdating ? 'Saving…' : 'Approve PR'}
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                disabled={isUpdating}
                onClick={() =>
                  updateStatus({ status: 'disapproved', remarks: remarks.trim() || undefined })
                }
              >
                Disapprove PR
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── State 3: pr_approved | rfq_prepared | canvassing ───────────────────────
  if (
    request.status === 'pr_approved' ||
    request.status === 'rfq_prepared' ||
    request.status === 'canvassing'
  ) {
    const prApprovalEntry = findHistoryEntry(histories, 'pr_approved');
    const previousRemarks = prApprovalEntry?.remarks ?? '';

    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            PO Preparation
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
          {previousRemarks && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <Textarea
                value={previousRemarks}
                readOnly
                className="resize-none text-sm"
                rows={3}
                aria-label="Previous remarks"
              />
            </div>
          )}
          <Button
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
            disabled={isGenerating}
            onClick={() => generatePo()}
          >
            {isGenerating ? 'Generating…' : 'Generate Purchase Order'}
          </Button>
        </div>
      </div>
    );
  }

  // ── State 5 (PPU disapproval detection — before state 4 fallback) ──────────
  if (isPpuDisapproval(request, histories)) {
    const disapprovalEntry = histories.find(
      (h) =>
        h.to_status === 'disapproved' &&
        h.from_status !== null &&
        (PPU_DISAPPROVAL_SOURCES as string[]).includes(h.from_status),
    );
    const previousRemarks = disapprovalEntry?.remarks ?? '';

    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            PR Preparation
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
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Remarks
            </p>
            <Textarea
              value={previousRemarks}
              readOnly
              className="resize-none text-sm"
              rows={3}
              aria-label="Disapproval remarks"
            />
          </div>
          <div className="rounded-lg bg-red-100 py-6 text-center text-xl font-bold text-red-600">
            Disapproved
          </div>
        </div>
      </div>
    );
  }

  // ── State 4: abstract_prepared | bac_resolution_noa | po_prepared | completed
  if (
    request.status === 'abstract_prepared' ||
    request.status === 'bac_resolution_noa' ||
    request.status === 'po_prepared' ||
    request.status === 'completed'
  ) {
    const prApprovalEntry = findHistoryEntry(histories, 'pr_approved');
    const previousRemarks = prApprovalEntry?.remarks ?? '';

    const poNumber = purchaseOrder?.po_number ?? 'N/A';
    const poId = purchaseOrder?.id;

    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            PO Preparation
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
          {previousRemarks && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <Textarea
                value={previousRemarks}
                readOnly
                className="resize-none text-sm"
                rows={3}
                aria-label="Remarks"
              />
            </div>
          )}
          <div className="rounded bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-700">
            PO Generated: {poNumber}
          </div>
          {poId && (
            <Button
              variant="outline"
              className="mt-3 w-full"
              render={<Link to={`/procurement-officer/purchase-orders/${poId}`} />}
            >
              View PO
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Fallback: read-only Grand Total ────────────────────────────────────────
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Summary</h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-wide text-gray-400">Grand Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(request.total_amount)}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Approval chain card ───────────────────────────────────────────────────────

const ApprovalChain = ({
  request,
  histories,
}: {
  request: PurchaseRequest;
  histories: PrStatusHistory[];
}) => {
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

interface ProcurementRequestDetailProps {
  request: PurchaseRequest;
}

export const ProcurementRequestDetail = ({ request }: ProcurementRequestDetailProps) => {
  const items = request.items ?? [];
  const attachments = request.attachments ?? [];
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
  const { data: historiesResponse } = useRequestStatusHistories(request.id);
  const histories = historiesResponse?.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* ─── Left column ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
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

        <SectionCard title="Line Items">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">No items found.</p>
          ) : (
            <>
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
        <ProcurementReviewPanel request={request} histories={histories} />
        <ApprovalChain request={request} histories={histories} />
      </div>
    </div>
  );
};
