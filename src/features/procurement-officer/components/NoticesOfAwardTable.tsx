import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { NoticeOfAward } from '@/types';

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

interface NoticesOfAwardTableProps {
  data: NoticeOfAward[];
  isLoading: boolean;
}

const TABLE_COLUMNS = ['NOA #', 'BAC Resolution', 'Awarded Supplier', 'Awarded Amount', 'Issued At'];
const SKELETON_ROWS = Array.from({ length: 8 });

export const NoticesOfAwardTable = ({ data, isLoading }: NoticesOfAwardTableProps) => {
  if (isLoading) {
    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((_, i) => (
              <TableRow key={i}>
                {TABLE_COLUMNS.map((col) => (
                  <TableCell key={col}>
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={TABLE_COLUMNS.length} className="py-12 text-center text-muted-foreground">
                No notices of award found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border sm:hidden">
        {data.map((noa) => (
          <Link
            key={noa.id}
            to={`/procurement-officer/notices-of-award/${noa.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-green-700">{noa.noa_number}</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(noa.awarded_amount)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{noa.awarded_supplier}</p>
          </Link>
        ))}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((noa) => (
              <TableRow key={noa.id}>
                <TableCell>
                  <Link
                    to={`/procurement-officer/notices-of-award/${noa.id}`}
                    className="font-medium text-green-700 hover:underline"
                  >
                    {noa.noa_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/procurement-officer/bac-resolutions/${noa.bac_resolution_id}`}
                    className="text-gray-600 hover:underline"
                  >
                    #{noa.bac_resolution_id}
                  </Link>
                </TableCell>
                <TableCell>{noa.awarded_supplier}</TableCell>
                <TableCell className="tabular-nums">{formatCurrency(noa.awarded_amount)}</TableCell>
                <TableCell>{formatDate(noa.issued_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
