'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { formatCOP } from '@/lib/format';

/** Acceso rápido al carrito: 🛒 3 · $27.000 */
export function FloatingCart() {
  const { count, total, openCart, pulse, hydrated } = useCart();
  if (!hydrated || count === 0) return null;
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Abrir carrito: ${count} productos, total ${formatCOP(total)}`}
      className="fixed bottom-4 left-4 right-20 z-40 mx-auto flex max-w-xs animate-fade-up items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-white shadow-card ring-2 ring-gold transition hover:bg-ink-soft active:scale-95 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
    >
      <span className="flex items-center gap-2">
        <ShoppingCart key={pulse} className="h-5 w-5 animate-pop text-gold" aria-hidden />
        <span className="font-extrabold">{count}</span>
      </span>
      <span className="font-display text-xl tracking-wide text-gold">{formatCOP(total)}</span>
      <span className="text-xs font-bold uppercase text-white/70">Ver</span>
    </button>
  );
}
