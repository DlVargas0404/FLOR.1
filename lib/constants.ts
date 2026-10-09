import type { BusinessInfo, SiteSettings, SocialPlatform } from '@/types/database';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const STORAGE_BUCKET = 'media';

export const CART_STORAGE_KEY = 'stopburger-cart-v1';

/** Zona horaria del negocio (Colombia no usa horario de verano). */
export const BUSINESS_TIMEZONE = 'America/Bogota';

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;
/** Orden de presentación: lunes a domingo (valores de day_of_week). */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // límite de entrada; se comprime antes de subir
export const MAX_STORED_BYTES = 5 * 1024 * 1024; // límite del bucket

export const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string; placeholder: string }[] = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/…' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/…' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@…' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'Vacío = usa el número del negocio' },
  { key: 'google_maps', label: 'Google Maps', placeholder: 'Vacío = usa la ubicación principal' },
];

/**
 * Valores de respaldo cuando la base de datos aún no tiene datos
 * o Supabase no está configurado. El contenido real vive en Supabase.
 */
export const FALLBACK_BUSINESS: BusinessInfo = {
  id: 1,
  name: 'STOP BURGER ERIK',
  tagline: 'El sabor que siempre quieres repetir',
  short_description: 'Hamburguesas y comidas rápidas en Cúcuta.',
  long_description: null,
  phone: '317 636 3783',
  whatsapp: '573176363783',
  address: 'Av. 12 #10a-67',
  neighborhood: 'San Jose',
  city: 'Cúcuta',
  department: 'Norte de Santander',
  country: 'Colombia',
  logo_url: null,
  logo_path: null,
  hero_image_url: null,
  hero_image_path: null,
  rating: null,
  rating_source: 'Google',
  show_rating: true,
};

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  accept_orders: true,
  closed_message: null,
  order_greeting: 'Hola, STOP BURGER ERIK 👋',
  order_closing: 'Gracias.',
  delivery_note: null,
};
