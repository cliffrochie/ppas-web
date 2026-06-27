import type { ReactNode } from 'react';

interface ContentLayoutProps {
  title: string;
  children: ReactNode;
}

export const ContentLayout = ({ title, children }: ContentLayoutProps) => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
      {children}
    </div>
  );
};
