import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ApiMeta } from '@/types';
import { cn } from '@/utils';

interface RequestsPaginationProps {
  meta: ApiMeta;
  onPageChange: (page: number) => void;
}

export const RequestsPagination = ({ meta, onPageChange }: RequestsPaginationProps) => {
  const { current_page, last_page, per_page, total } = meta;

  const rangeStart = total === 0 ? 0 : (current_page - 1) * per_page + 1;
  const rangeEnd = Math.min(current_page * per_page, total);

  const pageNumbers = Array.from({ length: last_page }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {rangeStart} to {rangeEnd} of {total} results
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="First page"
          disabled={current_page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronFirst />
        </Button>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          <ChevronLeft />
        </Button>

        {/* Numbered page buttons — desktop only */}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant="outline"
            size="icon-sm"
            aria-label={`Page ${page}`}
            aria-current={page === current_page ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={cn(
              'hidden sm:inline-flex',
              page === current_page && 'bg-foreground text-background hover:bg-foreground/90',
            )}
          >
            {page}
          </Button>
        ))}

        {/* Current page indicator — mobile only */}
        <span className="px-2 text-sm text-muted-foreground sm:hidden" aria-live="polite">
          {current_page} / {last_page}
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={current_page === last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          <ChevronRight />
        </Button>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Last page"
          disabled={current_page === last_page}
          onClick={() => onPageChange(last_page)}
        >
          <ChevronLast />
        </Button>
      </nav>
    </div>
  );
};
