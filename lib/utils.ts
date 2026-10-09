export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Normaliza texto para búsquedas sin tildes ni mayúsculas. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Deja solo los dígitos de un teléfono. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Convierte un teléfono colombiano a formato internacional de WhatsApp (sin "+"). */
export function toWhatsappNumber(value: string | null | undefined, fallback = '573176363783'): string {
  if (!value) return fallback;
  const d = digitsOnly(value);
  if (!d) return fallback;
  if (d.startsWith('57') && d.length >= 12) return d;
  if (d.length === 10) return `57${d}`;
  return d;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
