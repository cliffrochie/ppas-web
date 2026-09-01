import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

export interface ComboboxOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface SearchComboboxProps {
  id?: string;
  value: number | undefined;
  displayValue: string;
  onChange: (id: number, label: string) => void;
  options: ComboboxOption[];
  isLoading: boolean;
  isError?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  hasError?: boolean;
  disabled?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

/**
 * Generic searchable dropdown used across the procurement-officer create
 * forms (RFQ → PR / prepared-by picker, Abstract → RFQ picker,
 * BAC Resolution → Abstract picker, Notice of Award → BAC Resolution picker).
 * Mirrors the EndUserCombobox pattern in requests/CreateRequestForm.tsx but
 * resolves to a numeric id (foreign key) instead of a free-text name.
 */
export const SearchCombobox = ({
  id,
  value,
  displayValue,
  onChange,
  options,
  isLoading,
  isError,
  search,
  onSearchChange,
  placeholder,
  ariaLabel,
  hasError,
  disabled,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: SearchComboboxProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open || !hasNextPage || !onFetchNextPage) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) onFetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onSearchChange('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onSearchChange]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          onSearchChange('');
        }
      }}
    >
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={hasError || undefined}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive ring-3 ring-destructive/20',
          !displayValue && 'text-muted-foreground',
        )}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="border-b border-border p-2">
            <Input
              autoFocus
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 text-sm"
              aria-label={ariaLabel}
            />
          </div>

          <ul role="listbox" aria-label={ariaLabel} className="max-h-56 overflow-y-auto p-1">
            {isLoading ? (
              <li className="px-2 py-4 text-center text-sm text-muted-foreground">Loading...</li>
            ) : isError ? (
              <li className="px-2 py-4 text-center text-sm text-destructive" role="alert">
                Failed to load options
              </li>
            ) : options.length === 0 ? (
              <li className="px-2 py-4 text-center text-sm text-muted-foreground">No results found</li>
            ) : (
              <>
                {options.map((option) => {
                  const selected = value === option.id;
                  return (
                    <li
                      key={option.id}
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(option.id, option.label);
                        setOpen(false);
                        onSearchChange('');
                      }}
                      className={cn(
                        'flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground',
                        selected && 'bg-accent/50 font-medium',
                      )}
                    >
                      <Check
                        className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
                        aria-hidden="true"
                      />
                      <span className="flex flex-col">
                        <span>{option.label}</span>
                        {option.sublabel && (
                          <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                        )}
                      </span>
                    </li>
                  );
                })}

                {hasNextPage && (
                  <li
                    ref={sentinelRef}
                    aria-hidden="true"
                    className="px-2 py-1.5 text-center text-xs text-muted-foreground"
                  >
                    {isFetchingNextPage ? 'Loading more...' : ''}
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
