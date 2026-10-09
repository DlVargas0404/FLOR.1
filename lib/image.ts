import { ACCEPTED_IMAGE_TYPES, MAX_STORED_BYTES, MAX_UPLOAD_BYTES } from '@/lib/constants';

export class ImageError extends Error {}

export function validateImageFile(file: File): void {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new ImageError('Formato no permitido. Usa JPG, JPEG, PNG o WEBP.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError('No se pudo leer la imagen. Puede estar dañada.'));
    };
    img.src = url;
  });
}

/**
 * Optimiza para web: reduce a `maxDimension` px por lado y convierte a WEBP.
 * Si el navegador no puede, sube el archivo original (ya validado).
 */
export async function optimizeImage(file: File, maxDimension = 1600, quality = 0.82): Promise<{ blob: Blob; ext: string; contentType: string }> {
  validateImageFile(file);
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no-canvas');
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    if (blob && blob.type === 'image/webp' && blob.size <= MAX_STORED_BYTES) {
      return { blob, ext: 'webp', contentType: 'image/webp' };
    }
  } catch (e) {
    if (e instanceof ImageError) throw e;
  }
  if (file.size > MAX_STORED_BYTES) throw new ImageError('La imagen es demasiado grande (máximo 5 MB).');
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  return { blob: file, ext, contentType: file.type };
}
