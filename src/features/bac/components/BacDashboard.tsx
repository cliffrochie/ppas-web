import type { ApexOptions } from 'apexcharts';
import { CheckCircle, Clock, FileText, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useDashboard } from '@/features/dashboard';
import type { BudgetUtilizationMonth } from '@/features/dashboard';
import { RequestStatusBadge } from '@/features/requests';
import type { PurchaseRequestStatus } from '@/types';
import { cn } from '@/utils';

// ─── Filters ──────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => String(CURRENT_YEAR - i));

const PERIODS = [
  { value: 'whole_year', label: 'Whole Year' },
  { value: 'q1', label: 'Q1 (Jan – Mar)' },
  { value: 'q2', label: 'Q2 (Apr – Jun)' },
  { value: 'q3', label: 'Q3 (Jul – Sep)' },
  { value: 'q4', label: 'Q4 (Oct – Dec)' },
] as const;

type Period = (typeof PERIODS)[number]['value'];

// The backend has no quarter/period filtering — it always returns all 12 months.
// Quarter selection is handled client-side by slicing `months` for the budget chart.
const QUARTER_RANGES: Record<Period, [number, number] | null> = {
  whole_year: null,
  q1: [1, 3],
  q2: [4, 6],
  q3: [7, 9],
  q4: [10, 12],
};

const filterMonthsByPeriod = (months: BudgetUtilizationMonth[], period: Period) => {
  const range = QUARTER_RANGES[period];
  if (!range) return months;
  const [start, end] = range;
  return months.filter((m) => m.month >= start && m.month <= end);
};

// ─── Colors ───────────────────────────────────────────────────────────────────

const SECTION_COLOR_PALETTE = [
  '#ef4444', '#a855f7', '#eab308', '#22c55e', '#0ea5e9',
  '#f97316', '#14b8a6', '#ec4899', '#6366f1', '#84cc16',
];
const BUDGET_SECTION_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9',
  '#a855f7', '#14b8a6', '#ec4899', '#6366f1', '#84cc16',
];
const CATEGORY_COLOR_PALETTE = [
  '#06b6d4', '#7c3aed', '#3b82f6', '#84cc16', '#f43f5e',
  '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#0ea5e9',
];

const cycleColors = (palette: string[], count: number) =>
  Array.from({ length: count }, (_, i) => palette[i % palette.length]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseAmount = (amount: string) => parseFloat(amount) || 0;

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) => (
  <div className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
    <div>
      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
    <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg', iconBg)}>
      <Icon className={cn('size-5', iconColor)} aria-hidden="true" />
    </div>
  </div>
);

// ─── Chart options ────────────────────────────────────────────────────────────

const makeBudgetBarOptions = (categories: string[]): ApexOptions => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#818cf8'],
  plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    labels: {
      formatter: (val) =>
        new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val),
      style: { fontSize: '11px' },
    },
  },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  tooltip: {
    y: { formatter: (val) => `₱${fmt(val)}` },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        yaxis: {
          labels: {
            formatter: (val: number) =>
              val === 0 ? '0' : `${(val / 1000).toFixed(0)}k`,
          },
        },
      },
    },
  ],
});

const makeDonutOptions = (
  labels: string[],
  colors: string[],
  formatter?: (val: number) => string,
): ApexOptions => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors,
  labels,
  legend: {
    position: 'right',
    fontSize: '11px',
    markers: { size: 8 },
    itemMargin: { vertical: 3 },
  },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '62%' } } },
  stroke: { width: 0 },
  tooltip: { y: { formatter: formatter ?? ((val) => `${val}`) } },
  responsive: [
    {
      breakpoint: 480,
      options: { legend: { position: 'bottom' } },
    },
  ],
});

// ─── Section card wrapper ─────────────────────────────────────────────────────

const Card = ({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="rounded-xl bg-white shadow-sm">
    {title && (
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <p className="py-8 text-center text-sm text-gray-400">{message}</p>
);

// ─── Recent Requests table ────────────────────────────────────────────────────

interface RecentRequestRow {
  key: string;
  identifier: string;
  requester: string;
  amount: string;
  status: PurchaseRequestStatus;
}

const RecentRequestsTable = ({ rows }: { rows: RecentRequestRow[] }) => {
  if (rows.length === 0) return <EmptyState message="No recent requests." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['RF/PR No.', 'Requester', 'Amount', 'Status'].map((h) => (
              <th
                key={h}
                className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-gray-50">
              <td className="py-3 text-sm font-medium text-gray-800">{row.identifier}</td>
              <td className="py-3 text-sm text-gray-600">{row.requester}</td>
              <td className="py-3 text-sm tabular-nums text-gray-600">{fmt(parseAmount(row.amount))}</td>
              <td className="py-3">
                <RequestStatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── High-Value Requests table ────────────────────────────────────────────────

interface HighValueRow {
  key: string;
  purpose: string;
  office: string;
  amount: string;
}

const HighValueTable = ({ rows }: { rows: HighValueRow[] }) => {
  if (rows.length === 0) return <EmptyState message="No high-value requests." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Purpose', 'Office (Section)', 'Amount'].map((h) => (
              <th
                key={h}
                className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-gray-50">
              <td className="py-3 text-sm text-gray-800">{row.purpose}</td>
              <td className="py-3 text-sm text-gray-600">{row.office}</td>
              <td className="py-3 text-sm tabular-nums text-gray-600">{fmt(parseAmount(row.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="min-h-full p-4 sm:p-6">
    <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

    <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>

    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl bg-white shadow-sm" />
        ))}
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const BacDashboard = () => {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [period, setPeriod] = useState<Period>('whole_year');

  const { data, isLoading, isError } = useDashboard({ year });

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  const filteredMonths = filterMonthsByPeriod(data.budget_utilization_by_month.months, period);
  const budgetTotal = filteredMonths.reduce((s, m) => s + m.total, 0);

  const sectionLabels = data.requests_per_section.map((s) => s.office);
  const sectionSeries = data.requests_per_section.map((s) => s.count);
  const sectionColors = cycleColors(SECTION_COLOR_PALETTE, sectionLabels.length);

  const budgetSectionLabels = data.budget_per_section.map((s) => s.office);
  const budgetSectionSeries = data.budget_per_section.map((s) => s.total);
  const budgetSectionColors = cycleColors(BUDGET_SECTION_COLOR_PALETTE, budgetSectionLabels.length);

  const categoryLabels = data.requests_per_category.map((c) => c.category);
  const categorySeries = data.requests_per_category.map((c) => c.count);
  const categoryColors = cycleColors(CATEGORY_COLOR_PALETTE, categoryLabels.length);

  const recentRequestRows: RecentRequestRow[] = data.recent_requests.map((r, i) => ({
    key: r.rf_number ?? r.pr_number ?? String(i),
    identifier: r.rf_number ?? r.pr_number ?? '—',
    requester: r.requester ?? '—',
    amount: r.total_amount,
    status: r.status,
  }));

  const highValueRows: HighValueRow[] = data.high_value_requests.map((r, i) => ({
    key: r.rf_number ?? String(i),
    purpose: r.purpose,
    office: r.office ?? '—',
    amount: r.total_amount,
  }));

  return (
    <div className="min-h-full p-4 sm:p-6">
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Select year"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600/40"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          aria-label="Select period"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600/40"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={data.kpi.total_requests}
          icon={FileText}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Pending Requests"
          value={data.kpi.pending_requests}
          icon={Clock}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <StatCard
          label="Approved Requests"
          value={data.kpi.approved_requests}
          icon={CheckCircle}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Completed Requests"
          value={data.kpi.completed_requests}
          icon={ShoppingBag}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Main grid: left column + right sidebar */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        {/* ── Left column ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Budget Utilization bar chart */}
          <Card
            title="Budget Utilization"
            action={
              <span className="text-xs text-gray-400">
                ₱{fmt(budgetTotal)} total
              </span>
            }
          >
            <ReactApexChart
              type="bar"
              series={[{ name: 'Budget', data: filteredMonths.map((m) => m.total) }]}
              options={makeBudgetBarOptions(filteredMonths.map((m) => m.label))}
              height={260}
            />
          </Card>

          {/* Recent Requests */}
          <Card title="Recent Requests">
            <RecentRequestsTable rows={recentRequestRows} />
          </Card>

          {/* Recent High-Value Requests */}
          <Card title="Recent High-Value Requests">
            <HighValueTable rows={highValueRows} />
          </Card>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Requests Per Section */}
          <Card title="Requests Per Section">
            {sectionLabels.length === 0 ? (
              <EmptyState message="No section data available." />
            ) : (
              <ReactApexChart
                type="donut"
                series={sectionSeries}
                options={makeDonutOptions(sectionLabels, sectionColors)}
                height={220}
              />
            )}
          </Card>

          {/* Budget Utilization Per Section */}
          <Card title="Budget Utilization Per Section">
            {budgetSectionLabels.length === 0 ? (
              <EmptyState message="No section data available." />
            ) : (
              <ReactApexChart
                type="donut"
                series={budgetSectionSeries}
                options={makeDonutOptions(budgetSectionLabels, budgetSectionColors, (val) => `₱${fmt(val)}`)}
                height={220}
              />
            )}
          </Card>

          {/* Requests Per Category */}
          <Card title="Requests Per Category">
            {categoryLabels.length === 0 ? (
              <EmptyState message="No category data available." />
            ) : (
              <ReactApexChart
                type="donut"
                series={categorySeries}
                options={makeDonutOptions(categoryLabels, categoryColors)}
                height={220}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
