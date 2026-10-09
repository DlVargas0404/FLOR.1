'use client';

import { useCallback } from 'react';
import { revalidatePublicSite } from '@/app/admin/actions';
import { useToast } from '@/components/ui/ToastProvider';

/** Devuelve una función que refresca la web pública tras guardar. Nunca lanza error. */
export function usePublish() {
  const toast = useToast();
  return useCallback(async () => {
    try {
      const res = await revalidatePublicSite();
      if (!res.ok) throw new Error('not-ok');
    } catch {
      toast.info('Guardado. La página pública puede tardar hasta 1 minuto en actualizarse.');
    }
  }, [toast]);
}
