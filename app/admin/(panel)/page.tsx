import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Images,
  MapPin,
  PackageCheck,
  PackageX,
  Star,
  Tags,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { Card, PageHeader } from '@/components/admin/ui';
import { getServerClient } from '@/lib/supabase/server';

interface Stat {
  label: string;
  value: number | null;
  href: string;
  icon: LucideIcon;
  tone: string;
}

export default async function DashboardPage() {
  const supabase = await getServerClient();
  const count = async (table: string, filter?: (q: any) => any) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: c, error } = await q;
    return error ? null : (c ?? 0);
  };

  const [products, categories, available, soldOut, featured, photos, locations, openDays, review, social, biz] = await Promise.all([
    count('products'),
    count('categories'),
    count('products', (q) => q.eq('is_available', true)),
    count('products', (q) => q.eq('is_available', false)),
    count('products', (q) => q.eq('is_featured', true)),
    count('gallery'),
    count('locations'),
    count('business_hours', (q) => q.is('location_id', null).eq('is_closed', false)),
    count('products', (q) => q.eq('needs_review', true)),
    count('social_links', (q) => q.not('url', 'is', null).neq('url', '')),
    supabase.from('business_info').select('whatsapp,logo_url,hero_image_url').eq('id', 1).maybeSingle(),
  ]);

  const stats: Stat[] = [
    { label: 'Productos', value: products, href: '/admin/productos', icon: UtensilsCrossed, tone: 'bg-brand' },
    { label: 'Categorías', value: categories, href: '/admin/categorias', icon: Tags, tone: 'bg-brand-dark' },
    { label: 'Disponibles', value: available, href: '/admin/menu', icon: PackageCheck, tone: 'bg-emerald-600' },
    { label: 'Agotados', value: soldOut, href: '/admin/menu', icon: PackageX, tone: 'bg-neutral-700' },
    { label: 'Destacados', value: featured, href: '/admin/productos', icon: Star, tone: 'bg-amber-500' },
    { label: 'Fotografías', value: photos, href: '/admin/fotos', icon: Images, tone: 'bg-sky-600' },
    { label: 'Ubicaciones', value: locations, href: '/admin/ubicaciones', icon: MapPin, tone: 'bg-violet-600' },
    { label: 'Días abiertos', value: openDays, href: '/admin/horarios', icon: Clock, tone: 'bg-teal-600' },
  ];

  const checklist = [
    { ok: (review ?? 0) === 0, text: `${review ?? 0} producto(s) por revisar con el cliente`, href: '/admin/productos', fix: 'Revisar' },
    { ok: Boolean(biz.data?.hero_image_url), text: 'Foto principal de la página de inicio', href: '/admin/negocio', fix: 'Subir' },
    { ok: (photos ?? 0) > 0, text: 'Fotos en la galería del restaurante', href: '/admin/fotos', fix: 'Subir' },
    { ok: (social ?? 0) > 0, text: 'Redes sociales configuradas', href: '/admin/redes', fix: 'Configurar' },
    { ok: Boolean(biz.data?.whatsapp), text: 'Número de WhatsApp para pedidos', href: '/admin/negocio', fix: 'Configurar' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen general de tu restaurante en la web." />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon, tone }) => (
          <li key={label}>
            <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${tone}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-3xl leading-none">{value ?? '—'}</span>
                <span className="text-xs font-semibold text-black/60">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-2xl uppercase tracking-wide">Para dejarlo perfecto</h2>
          <ul className="divide-y divide-black/10">
            {checklist.map((c) => (
              <li key={c.text} className="flex items-center gap-3 py-3 text-sm">
                {c.ok ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
                )}
                <span className="flex-1">{c.text}</span>
                {!c.ok && (
                  <Link href={c.href} className="btn-ghost min-h-[36px] px-3 text-xs">
                    {c.fix}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-2xl uppercase tracking-wide">Accesos rápidos</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/menu" className="btn-primary">Cambiar precios</Link>
            <Link href="/admin/productos" className="btn-gold">Nuevo producto</Link>
            <Link href="/admin/fotos" className="btn-ghost">Subir fotos</Link>
            <Link href="/admin/horarios" className="btn-ghost">Editar horarios</Link>
          </div>
          <p className="mt-4 text-xs text-black/50">
            Los cambios se publican en la web automáticamente al guardar.
          </p>
        </Card>
      </div>
    </>
  );
}
