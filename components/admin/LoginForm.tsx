'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { FormField, SubmitButton } from '@/components/admin/ui';
import { explainError } from '@/lib/errors';
import { getBrowserClient } from '@/lib/supabase/client';
import { fieldErrors, loginSchema } from '@/lib/validation';

export function LoginForm({ configured, forbidden }: { configured: boolean; forbidden: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(
    forbidden ? 'Tu usuario no está autorizado como administrador.' : null,
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        setFormError(error.message.toLowerCase().includes('invalid login') ? 'Correo o contraseña incorrectos.' : explainError(error));
        return;
      }
      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (adminError || !admin) {
        await supabase.auth.signOut();
        setFormError(adminError ? explainError(adminError) : 'Tu usuario no está autorizado como administrador.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setFormError(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand to-brand-deep px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-script text-brand">Stop Burger</p>
          <h1 className="font-display text-4xl uppercase tracking-wide">Panel Erik</h1>
          <p className="mt-1 text-sm text-black/60">Acceso solo para administradores</p>
        </div>

        {!configured && (
          <p role="alert" className="mb-4 rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
            Supabase no está configurado. Copia <code>.env.example</code> a <code>.env.local</code> y completa las variables (ver README).
          </p>
        )}
        {formError && (
          <p role="alert" className="mb-4 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">
            {formError}
          </p>
        )}

        <form onSubmit={submit} noValidate className="space-y-4">
          <FormField label="Correo electrónico" htmlFor="login-email" error={errors.email}>
            <input id="login-email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!configured} />
          </FormField>
          <FormField label="Contraseña" htmlFor="login-password" error={errors.password}>
            <input id="login-password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!configured} />
          </FormField>
          <SubmitButton busy={busy} className="w-full py-3.5">
            Iniciar sesión
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
