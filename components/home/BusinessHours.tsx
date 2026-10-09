'use client';

import { Clock } from 'lucide-react';
import { OpenBadge } from '@/components/home/OpenBadge';
import { useSite } from '@/components/layout/SiteProvider';
import { DAY_NAMES, DAY_ORDER } from '@/lib/constants';
import { describeDay, nowInBusinessTz } from '@/lib/hours';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function BusinessHours() {
  const { hours } = useSite();
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(nowInBusinessTz().day);
  }, []);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-black/5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
          <Clock className="h-5 w-5 text-brand" aria-hidden /> Horario
        </h3>
        <OpenBadge showDetail={false} />
      </div>
      {hours.length === 0 ? (
        <p className="text-sm text-black/60">Horario no disponible por el momento.</p>
      ) : (
        <ul className="divide-y divide-black/10">
          {DAY_ORDER.map((d) => {
            const row = hours.find((h) => h.day_of_week === d);
            const text = describeDay(row);
            const isToday = today === d;
            return (
              <li
                key={d}
                className={cn('flex items-center justify-between gap-3 py-2.5 text-sm', isToday && '-mx-2 rounded-xl bg-gold/30 px-2 font-bold')}
              >
                <span>
                  {DAY_NAMES[d]}
                  {isToday && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Hoy</span>}
                </span>
                <span className={cn('text-right', text === 'Cerrado' && 'text-black/40')}>{text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
