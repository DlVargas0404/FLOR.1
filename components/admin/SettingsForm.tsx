'use client';

import { useEffect, useState } from 'react';
import { Card, ErrorBox, FormField, LoadingList, PageHeader, SubmitButton, ToggleRow } from '@/components/admin/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { getBrowserClient } from '@/lib/supabase/client';
import { fieldErrors, settingsSchema } from '@/lib/validation';
import { settingsApi } from '@/services/admin';

export function SettingsForm() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => settingsApi.get());
  const [v, setV] = useState({
    accept_orders: true,
    closed_message: '',
    order_greeting: '',
    order_closing: '',
    delivery_note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || error) return;
    setV({
      accept_orders: data?.accept_orders ?? true,
      closed_message: data?.closed_message ?? '',
      order_greeting: data?.order_greeting ?? 'Hola, STOP BURGER ERIK 👋',
      order_closing: data?.order_closing ?? 'Gracias.',
      delivery_note: data?.delivery_note ?? '',
    });
  }, [data, loading, error]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = settingsSchema.safeParse(v);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    try {
      await settingsApi.save(parsed.data);
      toast.success('Configuración actualizada correctamente');
      await publish();
      await reload(true);
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  const text = (k: 'closed_message' | 'order_greeting' | 'order_closing' | 'delivery_note', label: string, hint?: string) => (
    <FormField label={label} htmlFor={`set-${k}`} error={errors[k]} hint={hint}>
      <input id={`set-${k}`} className="input" value={v[k]} onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))} />
    </FormField>
  );

  return (
    <>
      <PageHeader title="Configuración" description="Pedidos por WhatsApp y seguridad de tu cuenta." />
      {loading ? (
        <LoadingList rows={4} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : (
        <form onSubmit={submit} noValidate className="mb-6">
          <Card className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">Pedidos</h2>
            <ToggleRow id="set-accept" label="Recibir pedidos por la web" description="Si lo apagas, el carrito no permite enviar pedidos y se muestra el aviso." checked={v.accept_orders} onChange={(x) => setV((s) => ({ ...s, accept_orders: x }))} />
            {text('closed_message', 'Aviso cuando no se reciben pedidos')}
            {text('order_greeting', 'Saludo del mensaje de WhatsApp', 'Primera línea del pedido.')}
            {text('order_closing', 'Despedida del mensaje de WhatsApp')}
            {text('delivery_note', 'Nota sobre domicilios', 'Se agrega al mensaje cuando el cliente elige domicilio. Ej: El valor del domicilio se confirma por WhatsApp.')}
            <div className="flex justify-end">
              <SubmitButton busy={busy}>Guardar cambios</SubmitButton>
            </div>
          </Card>
        </form>
      )}
      <PasswordCard />
    </>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');
    setError('');
    setBusy(true);
    try {
      const { error: err } = await getBrowserClient().auth.updateUser({ password });
      if (err) throw err;
      toast.success('Contraseña actualizada correctamente');
      setPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Card className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-wide">Cambiar contraseña</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nueva contraseña" htmlFor="pw-new">
            <input id="pw-new" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <FormField label="Repetir contraseña" htmlFor="pw-confirm" error={error}>
            <input id="pw-confirm" type="password" autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormField>
        </div>
        <div className="flex justify-end">
          <SubmitButton busy={busy}>Actualizar contraseña</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
