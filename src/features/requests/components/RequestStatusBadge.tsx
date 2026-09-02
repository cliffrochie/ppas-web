import { cn } from '@/utils';
import type { RequestStatus } from '../types';
import { STATUS_CONFIG } from './request-status';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
};
