import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';

let client: SupabaseClient | null = null;

/**
 * Cliente anónimo SIN cookies para leer datos públicos desde Server Components.
 * Al no depender de cookies, las páginas públicas pueden cachearse (ISR).
 * Devuelve null si Supabase no está configurado.
 */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
