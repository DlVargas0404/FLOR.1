'use client';

import { useEffect, useState } from 'react';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useSite } from '@/components/layout/SiteProvider';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#menu', label: 'Menú' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#ubicacion', label: 'Ubicación' },
  { href: '#contacto', label: 'Contacto' },
];

export function Navbar() {
  const { business } = useSite();
  const { count, openCart, pulse } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/10 bg-brand transition-shadow',
        scrolled && 'shadow-lg shadow-black/30',
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <Logo name={business.name} logoUrl={business.logo_url} />

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-white/90 transition hover:bg-white/15 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#menu" className="btn-gold hidden sm:inline-flex">
            Ver menú
          </a>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span
                key={pulse}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-gold px-1 text-xs font-extrabold text-ink"
              >
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Principal móvil" className="animate-fade-up border-t border-white/10 bg-brand-dark lg:hidden">
          <ul className="container-x flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3.5 font-display text-2xl uppercase tracking-wide text-white hover:bg-white/10"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#menu" onClick={() => setOpen(false)} className="btn-gold w-full">
                Ver menú
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
