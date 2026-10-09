import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente de navegador (usa la sesión del administrador si existe). */
export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
