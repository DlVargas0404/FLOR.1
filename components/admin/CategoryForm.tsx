'use client';

import { useState } from 'react';
import { FormField, SubmitButton, ToggleRow } from '@/components/admin/ui';
import { categoriesApi } from '@/services/admin';
import { useToast } from '@/components/ui/ToastProvider';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { categorySchema, fieldErrors } from '@/lib/validation';
import type { Category } from '@/types/database';

interface CategoryFormProps {
  category: Category | null;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, nextOrder, onDone, onCancel }: CategoryFormProps) {
  const toast = useToast();
  const publish = usePublish();
  const [values, setValues] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    emoji: category?.emoji ?? '',
    sort_order: String(category?.sort_order ?? nextOrder),
    is_active: category?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values, v: string | boolean) => {
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = categorySchema.safeParse({
      ...values,
      // Al editar se conserva el slug existente (no rompe enlaces); al crear se genera del nombre.
      slug: category?.slug ?? '',
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    try {
      if (category) await categoriesApi.update(category.id, parsed.data);
      else await categoriesApi.create(parsed.data);
      toast.success(category ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente');
      await publish();
      onDone();
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 p-5">
      <FormField label="Nombre" htmlFor="cat-name" error={errors.name}>
        <input id="cat-name" className="input" value={values.name} onChange={(e) => set('name', e.target.value)} maxLength={60} autoFocus />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Emoji" htmlFor="cat-emoji" error={errors.emoji} hint="Ej: 🍔">
          <input id="cat-emoji" className="input" value={values.emoji} onChange={(e) => set('emoji', e.target.value)} maxLength={8} />
        </FormField>
        <FormField label="Orden" htmlFor="cat-order" error={errors.sort_order}>
          <input id="cat-order" type="number" min={0} className="input" value={values.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Descripción (opcional)" htmlFor="cat-desc" error={errors.description} hint="Se muestra bajo el título de la categoría. Ej: Todas incluyen papa ripio.">
        <input id="cat-desc" className="input" value={values.description} onChange={(e) => set('description', e.target.value)} maxLength={200} />
      </FormField>
      <ToggleRow id="cat-active" label="Categoría activa" description="Si la desactivas, no aparece en la web." checked={values.is_active} onChange={(v) => set('is_active', v)} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy}>
          Cancelar
        </button>
        <SubmitButton busy={busy}>{category ? 'Guardar cambios' : 'Crear categoría'}</SubmitButton>
      </div>
    </form>
  );
}
