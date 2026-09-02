import { LogOut, Menu, Settings } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import ppasLogo from '@/assets/ppas-logo.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/features/auth';
import { NotificationBell } from '@/features/notifications';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface AppSidebarLayoutProps {
  navItems: NavItem[];
  homeHref: string;
  roleName: string;
  /** Role-prefixed base path for PR detail pages, e.g. '/bac/requests'. */
  requestsPathPrefix: string;
  children: ReactNode;
}

export const AppSidebarLayout = ({
  navItems,
  homeHref,
  roleName,
  requestsPathPrefix,
  children,
}: AppSidebarLayoutProps) => {
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const userName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : 'User';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
        {/* Mobile drawer toggle */}
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setMobileSidebarOpen(true)}
          className="mr-3 rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <NavLink
          to={homeHref}
          className="flex shrink-0 items-center gap-2.5 no-underline"
          aria-label="PPAS Home"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-green-700">
            <img src={ppasLogo} alt="" aria-hidden="true" className="size-5 brightness-0 invert" />
          </div>
          <span className="hidden text-sm font-bold text-green-700 sm:inline lg:text-base">
            Procurement Process Automation System
          </span>
          <span className="text-sm font-bold text-green-700 sm:hidden">PPAS</span>
        </NavLink>
        <div className="ml-auto">
          <NotificationBell requestsPathPrefix={requestsPathPrefix} />
        </div>
      </header>

      <div className="flex flex-1">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside
          aria-label="Sidebar navigation"
          className={cn(
            'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col bg-green-900 transition-all duration-300',
            'lg:sticky lg:translate-x-0',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-60',
            'w-60',
          )}
        >
          {/* Collapse toggle — desktop only */}
          <div className={cn('hidden px-2 pt-2 lg:flex', sidebarCollapsed ? 'justify-center' : 'justify-end')}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((p) => !p)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="rounded-md p-1.5 text-green-300 hover:bg-green-800 hover:text-white"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-2 py-2" aria-label="Main navigation">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileSidebarOpen(false)}
                title={sidebarCollapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-800 hover:text-white',
                    sidebarCollapsed && 'lg:justify-center lg:px-2',
                  )
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className={cn(sidebarCollapsed && 'lg:hidden')}>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-green-800 p-3">
            <div className={cn('flex items-center gap-3', sidebarCollapsed && 'lg:justify-center')}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                {initial}
              </div>
              <div className={cn('min-w-0 flex-1', sidebarCollapsed && 'lg:hidden')}>
                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                <p className="truncate text-xs text-green-300">{roleName}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Settings"
                  className={cn(
                    'shrink-0 text-green-300 hover:text-white focus-visible:outline-none',
                    sidebarCollapsed && 'lg:hidden',
                  )}
                >
                  <Settings className="size-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={isLoggingOut}
                    onClick={() => logout()}
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut aria-hidden="true" />
                    {isLoggingOut ? 'Logging out…' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};
