import { LoginForm } from '@/components/admin/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginForm configured={isSupabaseConfigured()} forbidden={error === 'forbidden'} />;
}
