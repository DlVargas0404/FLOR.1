'use client';

import { useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { FormField, SubmitButton, ToggleRow } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/ToastProvider';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { fieldErrors, productSchema } from '@/lib/validation';
import { productsApi } from '@/services/admin';
import { removeImage, type UploadedImage } from '@/services/storage';
import type { Category, Product } from '@/types/database';

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, defaultCategoryId, nextOrder, onDone, onCancel }: ProductFormProps) {
  const toast = useToast();
  const publish = usePublish();
  const [values, setValues] = useState({
    name: product?.name ?? '',
    category_id: product?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
    sort_order: String(product?.sort_order ?? nextOrder),
    needs_review: product?.needs_review ?? false,
    review_note: product?.review_note ?? '',
  });
  const [image, setImage] = useState<{ url: string | null; path: string | null }>({
    url: product?.image_url ?? null,
    path: product?.image_path ?? null,
  });
  // Imágenes subidas durante esta edición que no se guardaron (se borran al cancelar)
  const uploadedPaths = useRef<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values, v: string | boolean) => {
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const onUploaded = (img: UploadedImage) => {
    uploadedPaths.current.push(img.path);
    setImage({ url: img.url, path: img.path });
  };

  const cancel = async () => {
    // Limpia archivos huérfanos subidos y no guardados
    await Promise.all(uploadedPaths.current.map((p) => removeImage(p)));
    onCancel();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error('Revisa los campos marcados');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...parsed.data, image_url: image.url, image_path: image.path };
      if (product) await productsApi.update(product.id, payload);
      else await productsApi.create(payload);

      // Borra del Storage la imagen anterior (si fue reemplazada/quitada) y las subidas descartadas
      const keep = image.path;
      const toDelete = new Set<string>(uploadedPaths.current.filter((p) => p !== keep));
      if (product?.image_path && product.image_path !== keep) toDelete.add(product.image_path);
      await Promise.all([...toDelete].map((p) => removeImage(p)));

      toast.success(product ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
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
      {product?.needs_review && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-bold">Dato pendiente de revisión</p>
            {product.review_note && <p>{product.review_note}</p>}
          </div>
        </div>
      )}

      <FormField label="Nombre" htmlFor="prod-name" error={errors.name}>
        <input id="prod-name" className="input" value={values.name} onChange={(e) => set('name', e.target.value)} maxLength={120} autoFocus />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Categoría" htmlFor="prod-cat" error={errors.category_id}>
          <select id="prod-cat" className="input" value={values.category_id} onChange={(e) => set('category_id', e.target.value)}>
            {categories.length === 0 && <option value="">Primero crea una categoría</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
                {!c.is_active ? ' (inactiva)' : ''}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Precio (COP)" htmlFor="prod-price" error={errors.price} hint="Sin puntos ni signos. Ej: 15000">
          <input id="prod-price" type="number" inputMode="numeric" min={0} step={100} className="input" value={values.price} onChange={(e) => set('price', e.target.value)} />
        </FormField>
      </div>

      <FormField label="Descripción" htmlFor="prod-desc" error={errors.description}>
        <textarea id="prod-desc" rows={3} maxLength={500} className="input resize-none" value={values.description} onChange={(e) => set('description', e.target.value)} />
      </FormField>

      <ImageUploader
        label="Fotografía"
        url={image.url}
        folder="products"
        onUploaded={onUploaded}
        onRemove={() => setImage({ url: null, path: null })}
        maxDimension={1200}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleRow id="prod-available" label="Disponible" description="Apágalo si se agotó." checked={values.is_available} onChange={(v) => set('is_available', v)} />
        <ToggleRow id="prod-featured" label="Destacado" description="Aparece con etiqueta ⭐." checked={values.is_featured} onChange={(v) => set('is_featured', v)} />
      </div>

      <FormField label="Orden dentro de la categoría" htmlFor="prod-order" error={errors.sort_order} hint="Menor número = aparece primero.">
        <input id="prod-order" type="number" min={0} className="input" value={values.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
      </FormField>

      {(product?.needs_review || values.needs_review) && (
        <ToggleRow
          id="prod-review"
          label="Pendiente de revisión"
          description="Desactívalo cuando hayas verificado nombre, precio y descripción."
          checked={values.needs_review}
          onChange={(v) => set('needs_review', v)}
        />
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={cancel} className="btn-ghost" disabled={busy}>
          Cancelar
        </button>
        <SubmitButton busy={busy}>{product ? 'Guardar cambios' : 'Crear producto'}</SubmitButton>
      </div>
    </form>
  );
}
