'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ProductImage } from '@/components/menu/ProductImage';
import { formatCOP } from '@/lib/format';
import type { Product } from '@/types/database';

const NOTE_SUGGESTIONS = ['Sin cebolla', 'Agregar más queso', 'Sin salsa', 'Sin tomate'];

interface ProductModalProps {
  product: Product | null;
  emoji: string | null;
  canOrder: boolean;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, notes: string) => void;
}

export function ProductModal({ product, emoji, canOrder, onClose, onAdd }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setQuantity(1);
    setNotes('');
  }, [product?.id]);

  if (!product) return null;
  const soldOut = !product.is_available;

  const addSuggestion = (text: string) => {
    setNotes((n) => {
      if (n.toLowerCase().includes(text.toLowerCase())) return n;
      return n.trim() ? `${n.trim()}, ${text}` : text;
    });
  };

  return (
    <Modal open onClose={onClose} title={product.name} hideHeader className="sm:max-w-xl">
      <div className="relative">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          emoji={emoji}
          grayscale={soldOut}
          priority
          sizes="(max-width: 640px) 100vw, 576px"
          className="aspect-[16/10]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white hover:bg-black/80"
        >
          ×
        </button>
        {product.is_featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-extrabold uppercase text-ink">
            <Star className="h-3.5 w-3.5 fill-ink" aria-hidden /> Destacado
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-3xl uppercase leading-tight tracking-wide">{product.name}</h2>
          <span className="font-display text-3xl text-brand">{formatCOP(product.price)}</span>
        </div>
        {product.description && <p className="text-black/70">{product.description}</p>}

        {soldOut ? (
          <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-bold uppercase text-black/60">Producto agotado por ahora</p>
        ) : !canOrder ? (
          <p className="rounded-2xl bg-black/5 px-4 py-3 text-center text-sm font-semibold text-black/60">
            Por ahora no recibimos pedidos por la web.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="product-notes" className="label">
                Observaciones especiales <span className="font-normal text-black/50">(opcional)</span>
              </label>
              <textarea
                id="product-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder="Ej: Sin cebolla"
                className="input resize-none"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {NOTE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSuggestion(s)}
                    className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between gap-2 rounded-full bg-black/5 p-1" role="group" aria-label="Cantidad">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-lg font-extrabold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  aria-label="Aumentar cantidad"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(product, quantity, notes);
                  onClose();
                }}
                className="btn-primary flex-1 py-3.5 text-base"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden />
                Agregar al carrito · {formatCOP(product.price * quantity)}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
