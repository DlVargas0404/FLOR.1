import { z } from 'zod';
import { slugify } from '@/lib/utils';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : null));

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), 'Debe ser una URL válida que empiece con http:// o https://')
  .transform((v) => (v ? v : null));

const optionalCoord = (min: number, max: number, label: string) =>
  z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v, ctx) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
      if (!Number.isFinite(n) || n < min || n > max) {
        ctx.addIssue({ code: 'custom', message: `${label} debe estar entre ${min} y ${max}` });
        return z.NEVER;
      }
      return n;
    });

/* ---------- Pedido (cliente) ---------- */
export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
    phone: z
      .string()
      .trim()
      .refine((v) => v.replace(/\D/g, '').length >= 7, 'Escribe un teléfono válido'),
    orderType: z.enum(['pickup', 'delivery']),
    address: z.string().trim().max(160).optional(),
    neighborhood: z.string().trim().max(80).optional(),
    reference: z.string().trim().max(160).optional(),
    payment: z.enum(['cash', 'transfer', 'other']),
    notes: z.string().trim().max(300).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.orderType === 'delivery') {
      if (!v.address) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Escribe la dirección de entrega' });
      if (!v.neighborhood) ctx.addIssue({ code: 'custom', path: ['neighborhood'], message: 'Escribe el barrio' });
    }
  });

export type CheckoutValues = z.input<typeof checkoutSchema>;

/* ---------- Admin: categorías ---------- */
export const categorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(60),
  slug: z.string().trim().optional(),
  description: optionalText(200),
  emoji: optionalText(8),
  sort_order: z.coerce.number().int('Debe ser un número entero').min(0, 'No puede ser negativo').max(9999),
  is_active: z.boolean(),
}).transform((v) => ({ ...v, slug: slugify(v.slug || v.name) }))
  .refine((v) => v.slug.length > 0, { message: 'No se pudo generar el identificador', path: ['name'] });

/* ---------- Admin: productos ---------- */
export const productSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  description: optionalText(500),
  price: z.coerce
    .number({ invalid_type_error: 'Escribe un precio válido' })
    .int('El precio debe ser un número entero (sin decimales)')
    .min(0, 'El precio no puede ser negativo')
    .max(10_000_000, 'Precio demasiado alto'),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int('Debe ser un número entero').min(0, 'No puede ser negativo').max(9999),
  needs_review: z.boolean(),
  review_note: optionalText(300),
});

/* ---------- Admin: ubicaciones ---------- */
export const locationSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  address: z.string().trim().min(3, 'La dirección es obligatoria').max(160),
  neighborhood: optionalText(80),
  city: optionalText(80),
  department: optionalText(80),
  phone: optionalText(30),
  hours_text: optionalText(200),
  latitude: optionalCoord(-90, 90, 'La latitud'),
  longitude: optionalCoord(-180, 180, 'La longitud'),
  maps_url: optionalUrl,
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
}).refine((v) => (v.latitude === null) === (v.longitude === null), {
  message: 'Si indicas latitud debes indicar también la longitud (y viceversa)',
  path: ['longitude'],
});

/* ---------- Admin: negocio ---------- */
export const businessSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  tagline: optionalText(120),
  short_description: optionalText(200),
  long_description: optionalText(1500),
  phone: optionalText(30),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{10,15}$/.test(v.replace(/\D/g, '')), 'Número de WhatsApp inválido')
    .transform((v) => (v ? v.replace(/\D/g, '') : null)),
  address: optionalText(160),
  neighborhood: optionalText(80),
  city: optionalText(80),
  department: optionalText(80),
  country: optionalText(80),
  rating: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v, ctx) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = Number(String(v).replace(',', '.'));
      if (!Number.isFinite(n) || n < 0 || n > 5) {
        ctx.addIssue({ code: 'custom', message: 'La calificación debe estar entre 0 y 5' });
        return z.NEVER;
      }
      return Math.round(n * 10) / 10;
    }),
  rating_source: optionalText(40),
  show_rating: z.boolean(),
});

/* ---------- Admin: configuración ---------- */
export const settingsSchema = z.object({
  accept_orders: z.boolean(),
  closed_message: optionalText(300),
  order_greeting: optionalText(200),
  order_closing: optionalText(200),
  delivery_note: optionalText(300),
});

/* ---------- Admin: redes ---------- */
export const socialUrlSchema = optionalUrl;

/* ---------- Admin: login ---------- */
export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/** Convierte los errores de zod en { campo: mensaje }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
