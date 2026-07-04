import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ppasLogo from '@/assets/ppas-logo.svg';

interface RequesterLayoutProps {
  children: ReactNode;
}

export const RequesterLayout = ({ children }: RequesterLayoutProps) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const userName = user
    ? [user.first_name, user.middle_name, user.last_name, user.extension_name]
        .filter(Boolean)
        .join(' ')
    : 'User';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-sm font-semibold text-green-700'
      : 'text-sm font-medium text-gray-600 hover:text-gray-900';

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'block rounded-md px-3 py-2 text-sm font-semibold text-green-700 bg-green-50'
      : 'block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        {/* Main nav row */}
        <div className="flex h-16 items-center px-4 sm:px-8">
          {/* Brand */}
          <NavLink
            to="/requests"
            className="flex shrink-0 items-center gap-3 no-underline"
            aria-label="PPAS Home"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-green-700">
              <img src={ppasLogo} alt="" aria-hidden="true" className="size-6 brightness-0 invert" />
            </div>
            {/* Abbreviated on mobile, full on md+ */}
            <span className="text-base font-bold text-green-700 md:hidden">PPAS</span>
            <span className="hidden text-base font-bold text-green-700 md:inline">
              Procurement Process Automation System
            </span>
          </NavLink>

          {/* Desktop nav links — centred between brand and user */}
          <nav
            className="mx-auto hidden items-center gap-10 md:flex"
            aria-label="Main navigation"
          >
            <NavLink to="/requests" end className={navLinkClass}>
              My Requests
            </NavLink>
            <NavLink to="/requests/new" className={navLinkClass}>
              New Request
            </NavLink>
          </nav>

          {/* Right side: bell + username (desktop) + hamburger (mobile) */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-full border border-gray-300 p-1.5 text-gray-600 hover:text-gray-900"
            >
              <Bell className="size-4" aria-hidden="true" />
            </button>

            {/* User dropdown — desktop only */}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="User menu"
                className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 md:flex"
              >
                {userName}
                <ChevronDown className="size-3.5 text-gray-500" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
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

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-gray-200 bg-white md:hidden">
            <nav className="space-y-1 px-4 py-3" aria-label="Mobile navigation">
              <NavLink to="/requests" end className={mobileNavLinkClass} onClick={closeMobileMenu}>
                My Requests
              </NavLink>
              <NavLink to="/requests/new" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                New Request
              </NavLink>
            </nav>
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => logout()}
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {isLoggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
};
