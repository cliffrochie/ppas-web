import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import ppasLogo from '@/assets/ppas-logo.svg';

interface RequesterLayoutProps {
  children: ReactNode;
}

export const RequesterLayout = ({ children }: RequesterLayoutProps) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="border-b border-gray-200 bg-white">
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

            {/* Username — desktop only */}
            <span className="hidden text-sm font-medium text-gray-700 md:inline">
              {userName}
            </span>

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
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
};
