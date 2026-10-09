'use client';

import { useEffect, useState } from 'react';
import { getOpenStatus, type OpenStatus } from '@/lib/hours';
import type { BusinessHour } from '@/types/database';

/**
 * Estado "abierto ahora" calculado en el navegador (la página está cacheada,
 * así que no puede calcularse en el servidor). Devuelve null antes de montar
 * para evitar diferencias de hidratación.
 */
export function useOpenStatus(hours: BusinessHour[]): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(hours));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [hours]);

  return status;
}
