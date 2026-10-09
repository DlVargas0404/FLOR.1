'use client';

import { useState } from 'react';
import { FormField, SubmitButton, ToggleRow } from '@/components/admin/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { fieldErrors, locationSchema } from '@/lib/validation';
import { locationsApi } from '@/services/admin';
import type { Location } from '@/types/database';

export function LocationForm({ location, nextOrder, onDone, onCancel }: { location: Location | null; nextOrder: number; onDone: () => void; onCancel: () => void }) {
  const toast = useToast();
  const publish = usePublish();
  const [v, setV] = useState({
    name: location?.name ?? '',
    address: location?.address ?? '',
    neighborhood: location?.neighborhood ?? '',
    city: location?.city ?? '',
    department: location?.department ?? '',
    phone: location?.phone ?? '',
    hours_text: location?.hours_text ?? '',
    latitude: location?.latitude != null ? String(location.latitude) : '',
    longitude: location?.longitude != null ? String(location.longitude) : '',
    maps_url: location?.maps_url ?? '',
    is_active: location?.is_active ?? true,
    sort_order: String(location?.sort_order ?? nextOrder),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof v, val: string | boolean) => {
    setV((s) => ({ ...s, [k]: val }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = locationSchema.safeParse(v);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error('Revisa los campos marcados');
      return;
    }
    setBusy(true);
    try {
      if (location) await locationsApi.update(location.id, parsed.data);
      else await locationsApi.create(parsed.data);
      toast.success(location ? 'Ubicación actualizada correctamente' : 'Ubicación creada correctamente');
      await publish();
      onDone();
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  const text = (k: keyof typeof v, label: string, extra?: { hint?: string; type?: string; placeholder?: string; className?: string }) => (
    <FormField label={label} htmlFor={`loc-${k}`} error={errors[k]} hint={extra?.hint} className={extra?.className}>
      <input id={`loc-${k}`} type={extra?.type ?? 'text'} className="input" placeholder={extra?.placeholder} value={String(v[k])} onChange={(e) => set(k, e.target.value)} />
    </FormField>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4 p-5">
      {text('name', 'Nombre de la sede')}
      {text('address', 'Dirección')}
      <div className="grid gap-3 sm:grid-cols-3">
        {text('neighborhood', 'Barrio')}
        {text('city', 'Ciudad')}
        {text('department', 'Departamento')}
      </div>
      {text('phone', 'Teléfono', { type: 'tel' })}
      {text('hours_text', 'Horario (texto opcional)', { hint: 'Si lo dejas vacío se usa el horario general de la sección Horarios.' })}
      <div className="grid gap-3 sm:grid-cols-2">
        {text('latitude', 'Latitud (opcional)', { hint: 'Ej: 7.8891', placeholder: 'No inventes coordenadas' })}
        {text('longitude', 'Longitud (opcional)', { hint: 'Ej: -72.4967' })}
      </div>
      {text('maps_url', 'URL de Google Maps (opcional)', { hint: 'En Google Maps: Compartir → Copiar enlace. Se usa en el botón “Cómo llegar”.' })}
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <ToggleRow id="loc-active" label="Ubicación activa" description="Si la desactivas no se muestra en la web." checked={v.is_active} onChange={(x) => set('is_active', x)} />
        {text('sort_order', 'Orden', { type: 'number' })}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy}>
          Cancelar
        </button>
        <SubmitButton busy={busy}>{location ? 'Guardar cambios' : 'Crear ubicación'}</SubmitButton>
      </div>
    </form>
  );
}
