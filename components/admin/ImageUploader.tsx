'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/admin/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { ImageError } from '@/lib/image';
import { explainError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { uploadImage, type MediaFolder, type UploadedImage } from '@/services/storage';

interface ImageUploaderProps {
  label: string;
  url: string | null;
  folder: MediaFolder;
  onUploaded: (image: UploadedImage) => void;
  onRemove?: () => void;
  maxDimension?: number;
  aspectClass?: string;
  hint?: string;
}

/** Sube una imagen a Supabase Storage (optimizada a WEBP). Acepta JPG, PNG y WEBP. */
export function ImageUploader({ label, url, folder, onUploaded, onRemove, maxDimension, aspectClass = 'aspect-[4/3]', hint }: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, folder, maxDimension);
      onUploaded(uploaded);
      toast.success('Imagen subida correctamente');
    } catch (e) {
      const msg = e instanceof ImageError ? e.message : explainError(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className={cn('relative overflow-hidden rounded-2xl border-2 border-dashed border-black/15 bg-black/[0.03]', aspectClass)}>
        {url ? (
          <Image src={url} alt={`Vista previa: ${label}`} fill sizes="400px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-black/40">
            <ImagePlus className="h-8 w-8" aria-hidden />
            <span className="text-xs font-semibold">Sin imagen</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-sm font-bold">
            <Spinner className="h-5 w-5" /> Subiendo…
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={busy}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <label htmlFor={inputId} className={cn('btn-ghost min-h-[40px] cursor-pointer text-xs', busy && 'pointer-events-none opacity-50')}>
          {url ? <RefreshCw className="h-4 w-4" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          {url ? 'Cambiar imagen' : 'Subir imagen'}
        </label>
        {url && onRemove && (
          <button type="button" onClick={onRemove} disabled={busy} className="btn-danger min-h-[40px] text-xs">
            <Trash2 className="h-4 w-4" aria-hidden /> Quitar
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-black/50">{hint ?? 'JPG, PNG o WEBP. Se optimiza automáticamente.'}</p>
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
