import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { CheckCircle, Clock, FileText, Pencil, ShoppingBag } from 'lucide-react';
import { cn } from '@/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────

const BUDGET_MONTHLY = [
  165000, 255000, 390000, 490000, 365000, 605000,
  698000, 530000, 465000, 385000, 273000, 507500,
];

const SECTION_LABELS = [
  'Engineering',
  'Operations',
  'Administrative',
  'Finance',
  "Regional Manager's Office",
];
const SECTION_COLORS = ['#ef4444', '#a855f7', '#eab308', '#22c55e', '#0ea5e9'];

const CATEGORY_LABELS = [
  'Office Equipment & Supplies',
  'General Services & Equipment',
  'ICT Equipment & Supplies',
  'Vehicle Supplies & Materials',
  'Others',
];
const CATEGORY_COLORS = ['#06b6d4', '#7c3aed', '#3b82f6', '#84cc16', '#f43f5e'];

const RECENT_REQUESTS = [
  { pr: 'PR-2025-145', requestor: 'Adam Williams', amount: 50000, status: 'Pending Review' },
  { pr: 'PR-2025-144', requestor: 'Samantha Jones', amount: 23000, status: 'Approved' },
  { pr: 'PR-2025-143', requestor: 'Joseph Smith', amount: 190000, status: 'Disapproved' },
  { pr: 'PR-2025-142', requestor: 'John Simmons', amount: 49000, status: 'PO Generated' },
];

const HIGH_VALUE_REQUESTS = [
  { item: 'High-end Laptop', office: 'Engineering', amount: 190000 },
  { item: '2 units of Industrial Outdoor Fan', office: 'Administrative', amount: 140000 },
  { item: '6.0 HP Floor-type Aircon', office: 'Administrative', amount: 139500 },
  { item: 'Commercial Printer for Publishing', office: "Regional Manager's Office", amount: 550000 },
];

const YEARS = ['2023', '2024', '2025'];
const PERIODS = [
  { value: 'whole_year', label: 'Whole Year' },
  { value: 'q1', label: 'Q1 (Jan – Mar)' },
  { value: 'q2', label: 'Q2 (Apr – Jun)' },
  { value: 'q3', label: 'Q3 (Jul – Sep)' },
  { value: 'q4', label: 'Q4 (Oct – Dec)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES: Record<string, string> = {
  'Pending Review': 'bg-amber-100 text-amber-700',
  'Approved': 'bg-green-100 text-green-700',
  'Disapproved': 'bg-rose-100  text-rose-700',
  'PO Generated': 'bg-blue-100  text-blue-700',
};

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

const budgetBarOptions: ApexOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#818cf8'],
  plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    tickAmount: 2,
    min: 0,
    max: 700000,
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
};

const makeDonutOptions = (
  labels: string[],
  colors: string[],
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
  tooltip: { y: { formatter: (val) => `${val}` } },
  responsive: [
    {
      breakpoint: 480,
      options: { legend: { position: 'bottom' } },
    },
  ],
});

const sectionDonutOptions = makeDonutOptions(SECTION_LABELS, SECTION_COLORS);
const categoryDonutOptions = makeDonutOptions(CATEGORY_LABELS, CATEGORY_COLORS);

// ─── Section donut with amount labels ─────────────────────────────────────────

const budgetSectionOptions: ApexOptions = {
  ...makeDonutOptions(SECTION_LABELS, ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9']),
  tooltip: { y: { formatter: (val) => `₱${fmt(val)}` } },
};

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

// ─── Recent Requests table ────────────────────────────────────────────────────

const RecentRequestsTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[480px] text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['PR No.', 'Requestor', 'Amount', 'Status', 'Action'].map((h) => (
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
        {RECENT_REQUESTS.map((row) => (
          <tr key={row.pr} className="hover:bg-gray-50">
            <td className="py-3 text-sm font-medium text-gray-800">{row.pr}</td>
            <td className="py-3 text-sm text-gray-600">{row.requestor}</td>
            <td className="py-3 text-sm tabular-nums text-gray-600">{fmt(row.amount)}</td>
            <td className="py-3">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  STATUS_STYLES[row.status],
                )}
              >
                {row.status}
              </span>
            </td>
            <td className="py-3">
              <button
                type="button"
                aria-label={`Edit ${row.pr}`}
                className="text-gray-400 hover:text-gray-700"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── High-Value Requests table ────────────────────────────────────────────────

const HighValueTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[400px] text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['Item', 'Office (Section)', 'Amount', 'Action'].map((h) => (
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
        {HIGH_VALUE_REQUESTS.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="py-3 text-sm text-gray-800">{row.item}</td>
            <td className="py-3 text-sm text-gray-600">{row.office}</td>
            <td className="py-3 text-sm tabular-nums text-gray-600">{fmt(row.amount)}</td>
            <td className="py-3">
              <button
                type="button"
                aria-label={`Edit ${row.item}`}
                className="text-gray-400 hover:text-gray-700"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const BacDashboard = () => {
  const [year, setYear] = useState('2025');
  const [period, setPeriod] = useState('whole_year');

  const budgetTotal = BUDGET_MONTHLY.reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-full p-4 sm:p-6">
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Select year"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600/40"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
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
          value={178}
          icon={FileText}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Pending Requests"
          value={72}
          icon={Clock}
          iconBg="bg-pink-100"
          iconColor="text-pink-600"
        />
        <StatCard
          label="Approved Requests"
          value={63}
          icon={CheckCircle}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Completed Requests"
          value={43}
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
              series={[{ name: 'Budget', data: BUDGET_MONTHLY }]}
              options={budgetBarOptions}
              height={260}
            />
          </Card>

          {/* Recent Requests */}
          <Card title="Recent Requests">
            <RecentRequestsTable />
          </Card>

          {/* Recent High-Value Requests */}
          <Card title="Recent High-Value Requests">
            <HighValueTable />
          </Card>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Requests Per Section */}
          <Card title="Requests Per Section">
            <ReactApexChart
              type="donut"
              series={[52, 38, 45, 28, 15]}
              options={sectionDonutOptions}
              height={220}
            />
          </Card>

          {/* Budget Utilization Per Section */}
          <Card title="Budget Utilization Per Section">
            <ReactApexChart
              type="donut"
              series={[1850000, 1250000, 980000, 620000, 428500]}
              options={budgetSectionOptions}
              height={220}
            />
          </Card>

          {/* Requests Per Category */}
          <Card title="Requests Per Category">
            <ReactApexChart
              type="donut"
              series={[42, 35, 48, 28, 25]}
              options={categoryDonutOptions}
              height={220}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
