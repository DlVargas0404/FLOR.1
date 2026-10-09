import { FALLBACK_BUSINESS, FALLBACK_SETTINGS } from '@/lib/constants';
import { getPublicClient } from '@/lib/supabase/public';
import type {
  BusinessHour,
  BusinessInfo,
  Category,
  GalleryImage,
  Location,
  MenuData,
  Product,
  SiteData,
  SiteSettings,
  SocialLink,
} from '@/types/database';

/**
 * Lecturas públicas (Server Components). Todas toleran que Supabase no esté
 * configurado o falle: devuelven datos vacíos en lugar de romper la página.
 */

export async function getMenu(): Promise<MenuData> {
  const supabase = getPublicClient();
  if (!supabase) return { categories: [], products: [] };

  const [cats, prods] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').order('name'),
    supabase.from('products').select('*').order('sort_order').order('name'),
  ]);

  if (cats.error || prods.error) {
    console.error('[getMenu]', cats.error?.message ?? prods.error?.message);
    return { categories: [], products: [] };
  }
  const categories = (cats.data ?? []) as Category[];
  const activeIds = new Set(categories.map((c) => c.id));
  const products = ((prods.data ?? []) as Product[]).filter((p) => activeIds.has(p.category_id));
  return { categories, products };
}

export async function getSiteData(): Promise<SiteData> {
  const supabase = getPublicClient();
  if (!supabase) {
    return {
      business: FALLBACK_BUSINESS,
      settings: FALLBACK_SETTINGS,
      hours: [],
      locations: [],
      social: [],
      gallery: [],
      configured: false,
    };
  }

  const [biz, set, hrs, locs, soc, gal] = await Promise.all([
    supabase.from('business_info').select('*').eq('id', 1).maybeSingle(),
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('business_hours').select('*').is('location_id', null),
    supabase.from('locations').select('*').eq('is_active', true).order('sort_order').order('name'),
    supabase.from('social_links').select('*').eq('is_active', true),
    supabase.from('gallery').select('*').eq('is_active', true).order('is_primary', { ascending: false }).order('sort_order'),
  ]);

  const failed = [biz, set, hrs, locs, soc, gal].find((r) => r.error);
  if (failed?.error) console.error('[getSiteData]', failed.error.message);

  return {
    business: { ...FALLBACK_BUSINESS, ...((biz.data as BusinessInfo | null) ?? {}) },
    settings: { ...FALLBACK_SETTINGS, ...((set.data as SiteSettings | null) ?? {}) },
    hours: ((hrs.data ?? []) as BusinessHour[]).map(normalizeHour),
    locations: (locs.data ?? []) as Location[],
    social: (soc.data ?? []) as SocialLink[],
    gallery: (gal.data ?? []) as GalleryImage[],
    configured: !failed?.error,
  };
}

function normalizeHour(h: BusinessHour): BusinessHour {
  return { ...h, slots: Array.isArray(h.slots) ? h.slots : [] };
}
