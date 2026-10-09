'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { ProductImage } from '@/components/menu/ProductImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { formatCOP } from '@/lib/format';
import { cn } from '@/lib/utils';

type Step = 'cart' | 'checkout' | 'sent';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select';

export function CartDrawer() {
  const { isOpen, closeCart, items, total, count, setQuantity, removeItem, clear } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [sentUrl, setSentUrl] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Al cerrar se vuelve al paso inicial (salvo que ya se envió: ahí se vacía el estado)
  useEffect(() => {
    if (!isOpen) {
      const t = window.setTimeout(() => setStep((s) => (s === 'sent' ? 'cart' : s === 'checkout' ? 'cart' : s)), 300);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
      if (e.key === 'Tab' && panel) {
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart, step]);

  // Si el carrito queda vacío durante el checkout, regresa al paso 1
  useEffect(() => {
    if (items.length === 0 && step === 'checkout') setStep('cart');
  }, [items.length, step]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCart} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-cream shadow-2xl"
      >
        <header className="flex items-center justify-between gap-2 bg-brand px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button type="button" onClick={() => setStep('cart')} aria-label="Volver al carrito" className="rounded-full p-2 hover:bg-white/15">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="font-display text-2xl uppercase tracking-wide">
              {step === 'cart' ? 'Tu pedido' : step === 'checkout' ? 'Tus datos' : '¡Listo!'}
            </h2>
            {step === 'cart' && count > 0 && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-extrabold text-ink">{count}</span>
            )}
          </div>
          <button type="button" onClick={closeCart} aria-label="Cerrar carrito" className="rounded-full p-2 hover:bg-white/15">
            <X className="h-5 w-5" />
          </button>
        </header>

        {step === 'sent' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wa text-white">
              <Check className="h-10 w-10" aria-hidden />
            </div>
            <h3 className="font-display text-3xl uppercase tracking-wide">¡Pedido preparado!</h3>
            <p className="text-sm text-black/70">
              Abrimos WhatsApp con tu pedido listo. Solo pulsa <strong>enviar</strong> en el chat para confirmarlo.
            </p>
            <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn-wa w-full">
              <WhatsAppIcon className="h-5 w-5" /> Abrir WhatsApp de nuevo
            </a>
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => {
                clear();
                setStep('cart');
                closeCart();
              }}
            >
              Ya lo envié · vaciar carrito
            </button>
            <button type="button" className="text-sm font-semibold text-black/60 underline" onClick={() => setStep('cart')}>
              Volver al carrito
            </button>
          </div>
        ) : step === 'checkout' ? (
          <CheckoutForm
            onSent={(url) => {
              setSentUrl(url);
              setStep('sent');
            }}
          />
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center p-5">
            <EmptyState icon={<ShoppingBag className="mx-auto h-10 w-10 text-brand" />} title="Tu carrito está vacío" className="w-full">
              Agrega hamburguesas, perros y más desde el menú.
              <button type="button" className="btn-primary mt-4" onClick={closeCart}>
                Ver menú
              </button>
            </EmptyState>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage src={item.imageUrl} alt={item.name} emoji={item.emoji} sizes="80px" className="aspect-square h-full" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-lg uppercase leading-tight tracking-wide">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Eliminar ${item.name}`}
                        className="-mr-1 -mt-1 rounded-full p-2 text-black/40 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.notes && <p className="text-xs text-black/60">📝 {item.notes}</p>}
                    <p className="text-xs text-black/50">{formatCOP(item.price)} c/u</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full bg-black/5" role="group" aria-label={`Cantidad de ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-7 text-center text-sm font-extrabold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-display text-xl text-brand">{formatCOP(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className={cn('space-y-3 border-t border-black/10 bg-white p-4')}>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-black/60">
                  <dt>Subtotal</dt>
                  <dd>{formatCOP(total)}</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-display text-xl uppercase">Total</dt>
                  <dd className="font-display text-3xl text-brand">{formatCOP(total)}</dd>
                </div>
              </dl>
              <button type="button" className="btn-primary w-full py-3.5 text-base" onClick={() => setStep('checkout')}>
                Continuar pedido
              </button>
              <button type="button" className="w-full text-center text-xs font-semibold text-black/50 underline" onClick={clear}>
                Vaciar carrito
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
