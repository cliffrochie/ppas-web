import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Notification } from '@/types';
import { cn } from '@/utils';
import { useMarkNotificationRead, useNotifications } from '../api/notifications';

interface NotificationBellProps {
  /** Role-prefixed base path for PR detail pages, e.g. '/requests', '/bac/requests'. */
  requestsPathPrefix: string;
}

const formatRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NotificationBell = ({ requestsPathPrefix }: NotificationBellProps) => {
  const navigate = useNavigate();

  // Separate query just for the unread badge count — `meta.total` reflects
  // the full unread count regardless of the (backend-fixed) page size, so
  // there's no need to request more than page 1.
  const unreadQuery = useNotifications({ is_read: false });
  const recentQuery = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  const unreadCount = unreadQuery.data?.meta.total ?? 0;
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);
  const notifications = recentQuery.data?.data ?? [];

  const handleItemClick = (notification: Notification) => {
    if (!notification.is_read) {
      markRead(notification.id);
    }
    if (notification.purchase_request_id) {
      navigate(`${requestsPathPrefix}/${notification.purchase_request_id}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="relative rounded-full border border-gray-300 p-1.5 text-gray-600 hover:text-gray-900"
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold leading-none text-white"
          >
            {badgeLabel}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentQuery.isLoading && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading…</div>
        )}

        {recentQuery.isError && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Unable to load notifications.
          </div>
        )}

        {!recentQuery.isLoading && !recentQuery.isError && notifications.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}

        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            onClick={() => handleItemClick(notification)}
            className="flex flex-col items-start gap-0.5 whitespace-normal py-2"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  'text-sm',
                  notification.is_read ? 'font-medium text-gray-600' : 'font-semibold text-gray-900',
                )}
              >
                {notification.title}
              </span>
              {!notification.is_read && (
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-green-700" />
              )}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(notification.created_at)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
