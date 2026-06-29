import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Clock, CreditCard, Link2, Menu, ShieldCheck, Users, X } from 'lucide-react';

// Social icons not available in lucide-react v1.21 — using inline SVGs
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);
import ppasLogo from '@/assets/ppas-logo.svg';

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Resources', href: '#resources' },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Accelerated Workflows',
    description:
      'Reduce cycle times with automated approval routing and electronic PO generation.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance & Control',
    description:
      'Enforce spending policies and maintain complete audit trail for every transaction.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Insights',
    description:
      'Gain instant visibility into spending with customizable dashboards and reports.',
  },
  {
    icon: Link2,
    title: 'Seamless Integrations',
    description: 'Connect easily with your existing ERP and financial systems.',
  },
  {
    icon: Users,
    title: 'Vendor Management',
    description:
      'Onboard, evaluate, and manage supplier performance in one central hub.',
  },
  {
    icon: CreditCard,
    title: 'Budget Management',
    description: 'Track spending against budgets in real-time to prevent overspending.',
  },
];

const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Docs', 'Contact Support'];

// ─── Page ─────────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-8">
          {/* Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <div className="flex size-9 items-center justify-center rounded-full bg-green-700">
              <img
                src={ppasLogo}
                alt="PPAS logo"
                className="size-5 brightness-0 invert"
              />
            </div>
            {/* Abbreviated on mobile to avoid crowding the hamburger */}
            <span className="text-sm font-bold text-green-700 sm:hidden">PPAS</span>
            <span className="hidden text-sm font-bold text-green-700 sm:inline lg:text-base">
              Procurement Process Automation System
            </span>
          </Link>

          {/* Desktop nav — centred */}
          <nav
            className="mx-auto hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Sign In + hamburger */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 md:inline-flex"
            >
              Sign In
            </Link>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
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
          <div id="mobile-nav" className="border-t border-gray-200 bg-white md:hidden">
            <nav className="space-y-1 px-4 py-3" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block rounded-full bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="px-4 py-20 text-center sm:px-8 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Streamline Your Procurement.
              <br />
              <span className="text-green-600">Simplify Your Success.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Automate workflows, ensure compliance, and gain real-time visibility. The modern
              solution for efficient and transparent purchasing.
            </p>
            <div className="mt-8">
              <a
                href="#features"
                className="inline-flex rounded-full bg-green-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="bg-gray-50 px-4 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                Smart Features for Smart Purchasing
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
                Our platform is designed to optimize every step of your procurement lifecycle.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-full border border-green-200 bg-green-50">
                    <feature.icon className="size-5 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────── */}
        <section id="solutions" className="bg-gray-800 px-4 py-16 text-center sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Ready to Modernize Your Procurement?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Join the future of purchasing. Experience efficiency, control, and savings today.
            </p>
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex rounded-full bg-green-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Get a Free Consultation
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer id="resources" className="bg-gray-900 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* Brand + copyright */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-700">
                <img
                  src={ppasLogo}
                  alt="PPAS logo"
                  className="size-4 brightness-0 invert"
                />
              </div>
              <span className="text-sm text-gray-400">
                PPAS &nbsp;|&nbsp; All Rights Reserved 2025
              </span>
            </div>

            {/* Footer links */}
            <nav
              className="flex flex-wrap justify-center gap-x-6 gap-y-2"
              aria-label="Footer links"
            >
              {FOOTER_LINKS.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 transition-colors hover:text-white">
                <FacebookIcon className="size-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 transition-colors hover:text-white">
                <TwitterIcon className="size-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-400 transition-colors hover:text-white">
                <YoutubeIcon className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
