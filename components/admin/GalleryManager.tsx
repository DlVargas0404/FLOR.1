'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ImagePlus, RefreshCw, Star, Trash2 } from 'lucide-react';
import { ErrorBox, LoadingList, PageHeader, Spinner, Toggle } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { ImageError } from '@/lib/image';
import { galleryApi } from '@/services/admin';
import { removeImage, uploadImage } from '@/services/storage';
import type { GalleryImage } from '@/types/database';

export function GalleryManager() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => galleryApi.list());
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);
  const [busy, setBusy] = useState(false);
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<GalleryImage | null>(null);

  const images = data ?? [];

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(e instanceof ImageError ? e.message : explainError(e));
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    let order = images.reduce((m, i) => Math.max(m, i.sort_order), 0);
    let done = 0;
    for (const [idx, file] of list.entries()) {
      setUploading(`Subiendo ${idx + 1} de ${list.length}…`);
      try {
        const up = await uploadImage(file, 'gallery');
        try {
          await galleryApi.create({ image_url: up.url, image_path: up.path, sort_order: ++order });
          done++;
        } catch (e) {
          await removeImage(up.path);
          throw e;
        }
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof ImageError ? e.message : explainError(e)}`);
      }
    }
    setUploading(null);
    if (addRef.current) addRef.current.value = '';
    if (done > 0) {
      toast.success(done === 1 ? 'Imagen subida correctamente' : `${done} imágenes subidas correctamente`);
      await reload(true);
      await publish();
    }
  };

  const replaceFile = async (file: File | undefined) => {
    const target = replaceTarget.current;
    if (!file || !target) return;
    setUploading('Reemplazando imagen…');
    try {
      const up = await uploadImage(file, 'gallery');
      try {
        await galleryApi.update(target.id, { image_url: up.url, image_path: up.path });
      } catch (e) {
        await removeImage(up.path);
        throw e;
      }
      await removeImage(target.image_path);
      toast.success('Imagen reemplazada correctamente');
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(e instanceof ImageError ? e.message : explainError(e));
    } finally {
      setUploading(null);
      replaceTarget.current = null;
      if (replaceRef.current) replaceRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await galleryApi.remove(deleting.id);
      await removeImage(deleting.image_path);
      toast.success('Imagen eliminada');
      setDeleting(null);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Fotos"
        description="Galería pública “Conoce STOP BURGER ERIK”. La imagen principal se muestra grande. Formatos: JPG, PNG, WEBP."
        actions={
          <>
            <input ref={addRef} id="gallery-add" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => addFiles(e.target.files)} disabled={!!uploading} />
            <label htmlFor="gallery-add" className={`btn-primary cursor-pointer ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              {uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" aria-hidden />}
              {uploading ?? 'Subir fotos'}
            </label>
          </>
        }
      />
      <input ref={replaceRef} id="gallery-replace" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => replaceFile(e.target.files?.[0])} aria-label="Elegir imagen de reemplazo" />

      {loading ? (
        <LoadingList rows={3} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : images.length === 0 ? (
        <EmptyState icon="📷" title="Aún no hay fotos">Sube fotos del restaurante, de los productos o de la preparación.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="relative aspect-[4/3] bg-black/5">
                <Image src={img.image_url} alt={img.caption || `Foto ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className={`object-cover ${img.is_active ? '' : 'opacity-40 grayscale'}`} />
                {img.is_primary && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-extrabold uppercase text-ink">
                    <Star className="h-3 w-3 fill-ink" aria-hidden /> Principal
                  </span>
                )}
              </div>
              <div className="space-y-3 p-3">
                <CaptionInput image={img} onSave={(caption) => run(() => galleryApi.update(img.id, { caption }), 'Descripción guardada')} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => run(() => galleryApi.swapOrder(img, images[i - 1]), 'Orden actualizado')} disabled={i === 0} aria-label="Mover a la izquierda" className="rounded-full p-2.5 hover:bg-black/5 disabled:opacity-30">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => run(() => galleryApi.swapOrder(img, images[i + 1]), 'Orden actualizado')} disabled={i === images.length - 1} aria-label="Mover a la derecha" className="rounded-full p-2.5 hover:bg-black/5 disabled:opacity-30">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => run(() => galleryApi.setPrimary(img.id), 'Imagen principal establecida')} disabled={img.is_primary} aria-label="Establecer como principal" title="Establecer como principal" className="rounded-full p-2.5 hover:bg-amber-50 disabled:text-amber-400">
                      <Star className={`h-4 w-4 ${img.is_primary ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        replaceTarget.current = img;
                        replaceRef.current?.click();
                      }}
                      aria-label="Reemplazar imagen"
                      title="Reemplazar imagen"
                      className="rounded-full p-2.5 hover:bg-black/5"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleting(img)} aria-label="Eliminar imagen" className="rounded-full p-2.5 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="flex items-center gap-2 text-xs font-semibold text-black/60">
                    <Toggle checked={img.is_active} onChange={(v) => run(() => galleryApi.update(img.id, { is_active: v }), v ? 'Imagen visible' : 'Imagen oculta')} label="Visible en la web" />
                    {img.is_active ? 'Visible' : 'Oculta'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar imagen"
        message="¿Eliminar esta imagen de la galería? También se borrará el archivo. No se puede deshacer."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

function CaptionInput({ image, onSave }: { image: GalleryImage; onSave: (caption: string | null) => void }) {
  const [value, setValue] = useState(image.caption ?? '');
  const commit = () => {
    const v = value.trim();
    if (v !== (image.caption ?? '')) onSave(v || null);
  };
  return (
    <div>
      <label htmlFor={`cap-${image.id}`} className="sr-only">Descripción de la foto</label>
      <input
        id={`cap-${image.id}`}
        className="input py-2"
        placeholder="Descripción (opcional)"
        maxLength={120}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
      />
    </div>
  );
}
