import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="bg-background flex min-h-screen">
      <aside className="border-border bg-sidebar w-64 shrink-0 border-r" aria-label="Sidebar navigation">
        <div className="border-border flex h-16 items-center border-b px-6">
          <span className="text-foreground font-semibold">PPAS</span>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-border flex h-16 shrink-0 items-center border-b px-6">
          <span className="text-muted-foreground text-sm">Header</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
