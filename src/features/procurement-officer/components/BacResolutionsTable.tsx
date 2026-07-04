import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BacResolution } from '@/types';

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

interface BacResolutionsTableProps {
  data: BacResolution[];
  isLoading: boolean;
}

const TABLE_COLUMNS = ['Resolution #', 'Abstract', 'Prepared By', 'Issued At'];
const SKELETON_ROWS = Array.from({ length: 8 });

export const BacResolutionsTable = ({ data, isLoading }: BacResolutionsTableProps) => {
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
                No BAC resolutions found.
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
        {data.map((resolution) => (
          <Link
            key={resolution.id}
            to={`/procurement-officer/bac-resolutions/${resolution.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <span className="font-medium text-green-700">{resolution.resolution_number}</span>
            <p className="mt-1 text-sm text-gray-600">
              Abstract #{resolution.abstract_of_quotation_id} · {formatDate(resolution.issued_at)}
            </p>
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
            {data.map((resolution) => (
              <TableRow key={resolution.id}>
                <TableCell>
                  <Link
                    to={`/procurement-officer/bac-resolutions/${resolution.id}`}
                    className="font-medium text-green-700 hover:underline"
                  >
                    {resolution.resolution_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/procurement-officer/abstracts/${resolution.abstract_of_quotation_id}`}
                    className="text-gray-600 hover:underline"
                  >
                    #{resolution.abstract_of_quotation_id}
                  </Link>
                </TableCell>
                <TableCell>
                  {resolution.prepared_by
                    ? [resolution.prepared_by.first_name, resolution.prepared_by.last_name]
                        .filter(Boolean)
                        .join(' ')
                    : '—'}
                </TableCell>
                <TableCell>{formatDate(resolution.issued_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
