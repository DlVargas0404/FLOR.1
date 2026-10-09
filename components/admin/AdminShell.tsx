'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Building2,
  Clock,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Settings,
  Share2,
  Tags,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/menu', label: 'Menú', icon: BookOpen },
  { href: '/admin/categorias', label: 'Categorías', icon: Tags },
  { href: '/admin/productos', label: 'Productos', icon: UtensilsCrossed },
  { href: '/admin/fotos', label: 'Fotos', icon: Images },
  { href: '/admin/ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { href: '/admin/horarios', label: 'Horarios', icon: Clock },
  { href: '/admin/negocio', label: 'Información del negocio', icon: Building2 },
  { href: '/admin/redes', label: 'Redes sociales', icon: Share2 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    setSigningOut(true);
    await getBrowserClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const sidebar = (
    <nav aria-label="Administración" className="flex h-full flex-col">
      <div className="px-5 py-5">
        <p className="font-script text-sm text-gold">Panel</p>
        <p className="font-display text-2xl uppercase leading-none tracking-wide text-white">Stop Burger Erik</p>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-bold transition',
                  active ? 'bg-gold text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-bold text-white/80 hover:bg-white/10">
          <ExternalLink className="h-5 w-5" aria-hidden /> Ver sitio público
        </a>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-neutral-100">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink lg:block">{sidebar}</aside>

      {/* Sidebar móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-slide-in-left bg-ink">
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="absolute right-3 top-3 rounded-full p-2 text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-black/10 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú de administración" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 lg:hidden">
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="hidden text-sm text-black/60 sm:inline">
              Sesión: <strong className="text-ink">{email}</strong>
            </span>
          </div>
          <button type="button" onClick={logout} disabled={signingOut} className="btn-ghost min-h-[40px]">
            <LogOut className="h-4 w-4" aria-hidden />
            {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
