import { getBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export interface LiveProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

/** Consulta el precio/disponibilidad actuales de los productos del carrito (lectura pública). */
export async function fetchLiveProducts(ids: string[]): Promise<LiveProduct[]> {
  if (!isSupabaseConfigured() || ids.length === 0) return [];
  const { data, error } = await getBrowserClient()
    .from('products')
    .select('id,name,price,image_url,is_available')
    .in('id', ids);
  if (error) throw error;
  return (data ?? []) as LiveProduct[];
}
