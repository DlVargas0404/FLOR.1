'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';

/**
 * Invalida la caché de la página pública después de que el administrador guarda cambios,
 * para que se vean de inmediato. Solo funciona si quien llama es un administrador.
 */
export async function revalidatePublicSite(): Promise<{ ok: boolean }> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) return { ok: false };

  revalidatePath('/', 'layout');
  return { ok: true };
}
