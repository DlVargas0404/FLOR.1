'use client';

import { useSite } from '@/components/layout/SiteProvider';
import { useOpenStatus } from '@/hooks/useOpenStatus';
import { cn } from '@/lib/utils';

export function OpenBadge({ className, showDetail = true }: { className?: string; showDetail?: boolean }) {
  const { hours } = useSite();
  const status = useOpenStatus(hours);

  if (hours.length === 0) return null;
  if (!status) return <span className={cn('skeleton inline-block h-8 w-36 rounded-full', className)} aria-hidden />;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-extrabold uppercase tracking-wide',
        status.isOpen ? 'bg-emerald-500 text-white' : 'bg-black/70 text-white',
        className,
      )}
      role="status"
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', status.isOpen ? 'animate-pulse bg-white' : 'bg-red-400')} aria-hidden />
      {status.isOpen ? 'Abierto ahora' : 'Cerrado'}
      {showDetail && status.detail && <span className="hidden font-semibold normal-case tracking-normal opacity-90 sm:inline">· {status.detail}</span>}
    </span>
  );
}
