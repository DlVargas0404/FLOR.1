'use client';

import { useState } from 'react';
import { Bike, Store } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useSite } from '@/components/layout/SiteProvider';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/ToastProvider';
import { formatCOP } from '@/lib/format';
import { checkoutSchema, fieldErrors, type CheckoutValues } from '@/lib/validation';
import { buildOrderMessage, buildWhatsappUrl, type OrderDetails } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const INITIAL: CheckoutValues = {
  name: '',
  phone: '',
  orderType: 'pickup',
  address: '',
  neighborhood: '',
  reference: '',
  payment: 'cash',
  notes: '',
};

/**
 * Los datos del cliente NO se guardan (ni en la base de datos ni en localStorage):
 * solo viven en memoria hasta abrir WhatsApp.
 */
export function CheckoutForm({ onSent }: { onSent: (url: string) => void }) {
  const { items, total } = useCart();
  const { whatsappNumber, settings } = useSite();
  const toast = useToast();
  const [values, setValues] = useState<CheckoutValues>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.accept_orders) {
      toast.error(settings.closed_message || 'Por ahora no recibimos pedidos por la web.');
      return;
    }
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error('Revisa los datos del formulario');
      return;
    }
    const message = buildOrderMessage(items, parsed.data as OrderDetails, {
      greeting: settings.order_greeting,
      closing: settings.order_closing,
      deliveryNote: settings.delivery_note,
    });
    const url = buildWhatsappUrl(whatsappNumber, message);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      // Ventanas emergentes bloqueadas: se muestra el enlace manual en el paso siguiente.
      toast.info('Pulsa el botón para abrir WhatsApp');
    }
    onSent(url);
  };

  const isDelivery = values.orderType === 'delivery';

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label="Nombre" htmlFor="co-name" error={errors.name}>
          <input id="co-name" className="input" autoComplete="name" value={values.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Teléfono" htmlFor="co-phone" error={errors.phone}>
          <input
            id="co-phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="300 123 4567"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            aria-invalid={!!errors.phone}
          />
        </Field>

        <fieldset>
          <legend className="label">Tipo de pedido</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['pickup', 'Recoger en el local', Store],
                ['delivery', 'Domicilio', Bike],
              ] as const
            ).map(([val, label, Icon]) => (
              <label
                key={val}
                className={cn(
                  'flex min-h-[56px] cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold',
                  values.orderType === val ? 'border-brand bg-brand/10 text-brand' : 'border-black/10 bg-white',
                )}
              >
                <input type="radio" name="orderType" value={val} checked={values.orderType === val} onChange={() => set('orderType', val)} className="sr-only" />
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {isDelivery && (
          <div className="space-y-4 rounded-2xl bg-white p-3 ring-1 ring-black/5">
            <Field label="Dirección" htmlFor="co-address" error={errors.address}>
              <input id="co-address" className="input" autoComplete="street-address" value={values.address ?? ''} onChange={(e) => set('address', e.target.value)} aria-invalid={!!errors.address} />
            </Field>
            <Field label="Barrio" htmlFor="co-hood" error={errors.neighborhood}>
              <input id="co-hood" className="input" value={values.neighborhood ?? ''} onChange={(e) => set('neighborhood', e.target.value)} aria-invalid={!!errors.neighborhood} />
            </Field>
            <Field label="Referencia (opcional)" htmlFor="co-ref" error={errors.reference}>
              <input id="co-ref" className="input" placeholder="Ej: casa blanca, portón negro" value={values.reference ?? ''} onChange={(e) => set('reference', e.target.value)} />
            </Field>
            {settings.delivery_note && <p className="text-xs font-semibold text-black/60">ℹ️ {settings.delivery_note}</p>}
          </div>
        )}

        <Field label="Método de pago" htmlFor="co-pay" error={errors.payment}>
          <select id="co-pay" className="input" value={values.payment} onChange={(e) => set('payment', e.target.value as CheckoutValues['payment'])}>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </select>
        </Field>

        <Field label="Observaciones generales (opcional)" htmlFor="co-notes" error={errors.notes}>
          <textarea id="co-notes" rows={2} maxLength={300} className="input resize-none" value={values.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </Field>

        <p className="text-xs text-black/50">No guardamos tus datos: solo se usan para armar el mensaje de WhatsApp.</p>
      </div>

      <footer className="space-y-2 border-t border-black/10 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-xl uppercase">Total</span>
          <span className="font-display text-3xl text-brand">{formatCOP(total)}</span>
        </div>
        <button type="submit" className="btn-wa w-full py-3.5 text-base" disabled={items.length === 0 || !settings.accept_orders}>
          <WhatsAppIcon className="h-5 w-5" />
          Pedir por WhatsApp
        </button>
      </footer>
    </form>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
