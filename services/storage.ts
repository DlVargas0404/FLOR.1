import { STORAGE_BUCKET } from '@/lib/constants';
import { optimizeImage } from '@/lib/image';
import { getBrowserClient } from '@/lib/supabase/client';

export type MediaFolder = 'products' | 'gallery' | 'branding';

export interface UploadedImage {
  url: string;
  path: string;
}

/** Optimiza (WEBP, máx. 1600px) y sube una imagen al bucket público "media". */
export async function uploadImage(file: File, folder: MediaFolder, maxDimension = 1600): Promise<UploadedImage> {
  const { blob, ext, contentType } = await optimizeImage(file, maxDimension);
  const supabase = getBrowserClient();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Borra un archivo de Storage. No lanza error si ya no existe. */
export async function removeImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await getBrowserClient().storage.from(STORAGE_BUCKET).remove([path]);
  if (error) console.warn('[removeImage]', error.message);
}
