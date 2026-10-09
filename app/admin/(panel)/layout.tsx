import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login');

  // Segunda barrera (además del middleware): sesión válida + estar en admin_users.
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin/login?error=forbidden');

  return <AdminShell email={user.email ?? ''}>{children}</AdminShell>;
}
