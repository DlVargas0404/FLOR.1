export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_path: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  needs_review: boolean;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessInfo {
  id: number;
  name: string;
  tagline: string | null;
  short_description: string | null;
  long_description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  department: string | null;
  country: string | null;
  logo_url: string | null;
  logo_path: string | null;
  hero_image_url: string | null;
  hero_image_path: string | null;
  rating: number | null;
  rating_source: string | null;
  show_rating: boolean;
}

export interface SiteSettings {
  id: number;
  accept_orders: boolean;
  closed_message: string | null;
  order_greeting: string | null;
  order_closing: string | null;
  delivery_note: string | null;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  neighborhood: string | null;
  city: string | null;
  department: string | null;
  phone: string | null;
  hours_text: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface TimeSlot {
  open: string; // "HH:MM" 24h
  close: string; // "HH:MM" 24h. Si close <= open cruza la medianoche
}

export interface BusinessHour {
  id: string;
  location_id: string | null;
  day_of_week: number; // 0 = domingo ... 6 = sábado
  is_closed: boolean;
  slots: TimeSlot[];
}

export interface GalleryImage {
  id: string;
  image_url: string;
  image_path: string;
  caption: string | null;
  is_primary: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'google_maps';

export interface SocialLink {
  platform: SocialPlatform;
  url: string | null;
  is_active: boolean;
}

export interface MenuData {
  categories: Category[];
  products: Product[];
}

export interface SiteData {
  business: BusinessInfo;
  settings: SiteSettings;
  hours: BusinessHour[];
  locations: Location[];
  social: SocialLink[];
  gallery: GalleryImage[];
  /** false si faltan variables de entorno de Supabase o la consulta falló */
  configured: boolean;
}
