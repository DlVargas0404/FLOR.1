'use client';

import { Plus, Star } from 'lucide-react';
import { ProductImage } from '@/components/menu/ProductImage';
import { formatCOP } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  emoji: string | null;
  canOrder: boolean;
  onOpen: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({ product, emoji, canOrder, onOpen, onQuickAdd }: ProductCardProps) {
  const soldOut = !product.is_available;
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl',
        soldOut && 'opacity-80',
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalle de ${product.name}`}
        className="flex flex-1 flex-col text-left"
      >
        <div className="relative">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            emoji={emoji}
            grayscale={soldOut}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {product.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-extrabold uppercase text-ink shadow">
                <Star className="h-3 w-3 fill-ink" aria-hidden /> Destacado
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-extrabold uppercase text-white shadow">Agotado</span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
          <h3 className="font-display text-xl uppercase leading-tight tracking-wide sm:text-2xl">{product.name}</h3>
          {product.description && <p className="line-clamp-3 text-[13px] leading-snug text-black/60 sm:text-sm">{product.description}</p>}
        </div>
      </button>
      <div className="flex items-center justify-between gap-2 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
        <span className="font-display text-2xl tracking-wide text-brand sm:text-3xl">{formatCOP(product.price)}</span>
        <button
          type="button"
          disabled={soldOut || !canOrder}
          onClick={() => onQuickAdd(product)}
          aria-label={soldOut ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
          className="flex h-11 items-center gap-1 rounded-full bg-brand px-3.5 text-sm font-extrabold uppercase text-white shadow-pop transition hover:bg-brand-dark active:scale-90 disabled:cursor-not-allowed disabled:bg-black/25 disabled:shadow-none"
        >
          <Plus className="h-5 w-5" aria-hidden />
          <span className="hidden min-[400px]:inline">Agregar</span>
        </button>
      </div>
    </article>
  );
}
