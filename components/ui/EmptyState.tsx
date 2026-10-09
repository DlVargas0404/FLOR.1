import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-black/15 bg-white/60 px-6 py-12 text-center', className)}>
      {icon && <div className="text-4xl" aria-hidden>{icon}</div>}
      <p className="font-display text-2xl uppercase tracking-wide">{title}</p>
      {children && <div className="max-w-md text-sm text-black/60">{children}</div>}
    </div>
  );
}
