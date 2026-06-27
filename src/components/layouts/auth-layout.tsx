import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface AuthLayoutProps {
  children: ReactNode;
  /** Override the inner container width. Defaults to max-w-md (login). */
  containerClassName?: string;
}

export const AuthLayout = ({ children, containerClassName }: AuthLayoutProps) => {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className={cn('w-full max-w-md px-6 py-12', containerClassName)}>
        {children}
      </div>
    </div>
  );
};
