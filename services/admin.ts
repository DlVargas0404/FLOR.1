import { getBrowserClient } from '@/lib/supabase/client';
import type {
  BusinessHour,
  BusinessInfo,
  Category,
  GalleryImage,
  Location,
  Product,
  SiteSettings,
  SocialLink,
} from '@/types/database';

/**
 * Acceso a datos del panel (cliente de navegador con la sesión del admin).
 * La seguridad la aplican las políticas RLS en la base de datos.
 */
const db = () => getBrowserClient();

function check<T>(res: { data: T; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data;
}

/* ---------- Categorías ---------- */
export const categoriesApi = {
  async list(): Promise<Category[]> {
    return check(await db().from('categories').select('*').order('sort_order').order('name')) as Category[];
  },
  async create(values: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    check(await db().from('categories').insert(values));
  },
  async update(id: string, values: Partial<Category>) {
    check(await db().from('categories').update(values).eq('id', id));
  },
  async remove(id: string) {
    check(await db().from('categories').delete().eq('id', id));
  },
  async swapOrder(a: Category, b: Category) {
    // Si tienen el mismo orden se separan para que el intercambio tenga efecto.
    const aOrder = a.sort_order === b.sort_order ? b.sort_order + (a.id < b.id ? 1 : -1) : b.sort_order;
    check(await db().from('categories').update({ sort_order: aOrder }).eq('id', a.id));
    check(await db().from('categories').update({ sort_order: a.sort_order }).eq('id', b.id));
  },
};

/* ---------- Productos ---------- */
export const productsApi = {
  async list(): Promise<Product[]> {
    return check(await db().from('products').select('*').order('sort_order').order('name')) as Product[];
  },
  async create(values: Partial<Product>) {
    check(await db().from('products').insert(values));
  },
  async update(id: string, values: Partial<Product>) {
    check(await db().from('products').update(values).eq('id', id));
  },
  async remove(id: string) {
    check(await db().from('products').delete().eq('id', id));
  },
};

/* ---------- Galería ---------- */
export const galleryApi = {
  async list(): Promise<GalleryImage[]> {
    return check(await db().from('gallery').select('*').order('sort_order').order('created_at')) as GalleryImage[];
  },
  async create(values: { image_url: string; image_path: string; caption?: string | null; sort_order: number }) {
    check(await db().from('gallery').insert(values));
  },
  async update(id: string, values: Partial<GalleryImage>) {
    check(await db().from('gallery').update(values).eq('id', id));
  },
  async remove(id: string) {
    check(await db().from('gallery').delete().eq('id', id));
  },
  /** Solo una imagen puede ser principal (índice único parcial en la BD). */
  async setPrimary(id: string) {
    check(await db().from('gallery').update({ is_primary: false }).eq('is_primary', true));
    check(await db().from('gallery').update({ is_primary: true }).eq('id', id));
  },
  async swapOrder(a: GalleryImage, b: GalleryImage) {
    const aOrder = a.sort_order === b.sort_order ? b.sort_order + (a.id < b.id ? 1 : -1) : b.sort_order;
    check(await db().from('gallery').update({ sort_order: aOrder }).eq('id', a.id));
    check(await db().from('gallery').update({ sort_order: a.sort_order }).eq('id', b.id));
  },
};

/* ---------- Ubicaciones ---------- */
export const locationsApi = {
  async list(): Promise<Location[]> {
    return check(await db().from('locations').select('*').order('sort_order').order('name')) as Location[];
  },
  async create(values: Omit<Location, 'id'>) {
    check(await db().from('locations').insert(values));
  },
  async update(id: string, values: Partial<Location>) {
    check(await db().from('locations').update(values).eq('id', id));
  },
  async remove(id: string) {
    check(await db().from('locations').delete().eq('id', id));
  },
};

/* ---------- Horarios (generales: location_id = null) ---------- */
export const hoursApi = {
  async list(): Promise<BusinessHour[]> {
    const rows = check(await db().from('business_hours').select('*').is('location_id', null)) as BusinessHour[];
    return rows.map((r) => ({ ...r, slots: Array.isArray(r.slots) ? r.slots : [] }));
  },
  async save(rows: { id?: string; day_of_week: number; is_closed: boolean; slots: BusinessHour['slots'] }[]) {
    for (const r of rows) {
      if (r.id) {
        check(await db().from('business_hours').update({ is_closed: r.is_closed, slots: r.slots }).eq('id', r.id));
      } else {
        check(
          await db()
            .from('business_hours')
            .insert({ location_id: null, day_of_week: r.day_of_week, is_closed: r.is_closed, slots: r.slots }),
        );
      }
    }
  },
};

/* ---------- Negocio y configuración (fila única id = 1) ---------- */
export const businessApi = {
  async get(): Promise<BusinessInfo | null> {
    return check(await db().from('business_info').select('*').eq('id', 1).maybeSingle()) as BusinessInfo | null;
  },
  async save(values: Partial<BusinessInfo>) {
    check(await db().from('business_info').upsert({ ...values, id: 1 }));
  },
};

export const settingsApi = {
  async get(): Promise<SiteSettings | null> {
    return check(await db().from('site_settings').select('*').eq('id', 1).maybeSingle()) as SiteSettings | null;
  },
  async save(values: Partial<SiteSettings>) {
    check(await db().from('site_settings').upsert({ ...values, id: 1 }));
  },
};

/* ---------- Redes sociales ---------- */
export const socialApi = {
  async list(): Promise<SocialLink[]> {
    return check(await db().from('social_links').select('*')) as SocialLink[];
  },
  async save(rows: SocialLink[]) {
    check(await db().from('social_links').upsert(rows, { onConflict: 'platform' }));
  },
};
