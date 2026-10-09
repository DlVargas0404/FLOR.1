'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { CART_STORAGE_KEY } from '@/lib/constants';
import { fetchLiveProducts } from '@/services/cart-sync';
import { useToast } from '@/components/ui/ToastProvider';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/database';

type Action =
  | { type: 'hydrate'; items: CartItem[] }
  | { type: 'add'; item: CartItem }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'replace'; items: CartItem[] }
  | { type: 'clear' };

const MAX_QTY = 50;

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'hydrate':
    case 'replace':
      return action.items;
    case 'add': {
      const existing = state.find((i) => i.key === action.item.key);
      if (existing) {
        return state.map((i) =>
          i.key === action.item.key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + action.item.quantity) } : i,
        );
      }
      return [...state, action.item];
    }
    case 'setQty':
      return state
        .map((i) => (i.key === action.key ? { ...i, quantity: Math.min(MAX_QTY, action.quantity) } : i))
        .filter((i) => i.quantity > 0);
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'clear':
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  hydrated: boolean;
  isOpen: boolean;
  /** Se incrementa cada vez que se agrega algo (para animar el icono) */
  pulse: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity: number, notes: string, emoji?: string | null) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function makeKey(productId: string, notes: string): string {
  return `${productId}::${notes.trim().toLowerCase()}`;
}

function isValidItem(x: unknown): x is CartItem {
  const i = x as CartItem;
  return (
    !!i &&
    typeof i.key === 'string' &&
    typeof i.productId === 'string' &&
    typeof i.name === 'string' &&
    typeof i.price === 'number' &&
    i.price >= 0 &&
    typeof i.quantity === 'number' &&
    i.quantity > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const toast = useToast();
  const synced = useRef(false);

  // Carga desde localStorage (tolerando que no exista o esté dañado)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', items: parsed.filter(isValidItem) });
      }
    } catch {
      /* carrito dañado o storage bloqueado: se empieza vacío */
    }
    setHydrated(true);
  }, []);

  // Guarda cada cambio
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage lleno o bloqueado */
    }
  }, [items, hydrated]);

  // Sincroniza precios y disponibilidad con la base de datos una vez al cargar
  useEffect(() => {
    if (!hydrated || synced.current || items.length === 0) return;
    synced.current = true;
    (async () => {
      try {
        const live = await fetchLiveProducts([...new Set(items.map((i) => i.productId))]);
        if (live.length === 0) return;
        const map = new Map(live.map((p) => [p.id, p]));
        const removed: string[] = [];
        const changed: string[] = [];
        const next: CartItem[] = [];
        for (const item of items) {
          const p = map.get(item.productId);
          if (!p || !p.is_available) {
            removed.push(item.name);
            continue;
          }
          if (p.price !== item.price) changed.push(item.name);
          next.push({ ...item, name: p.name, price: p.price, imageUrl: p.image_url });
        }
        if (removed.length || changed.length) {
          dispatch({ type: 'replace', items: next });
          if (removed.length) toast.info(`Ya no está disponible: ${removed.join(', ')}`);
          if (changed.length) toast.info('Actualizamos algunos precios de tu carrito.');
        }
      } catch {
        /* sin conexión: se conservan los datos guardados */
      }
    })();
  }, [hydrated, items, toast]);

  const addItem = useCallback((product: Product, quantity: number, notes: string, emoji?: string | null) => {
    const cleanNotes = notes.trim().slice(0, 200);
    dispatch({
      type: 'add',
      item: {
        key: makeKey(product.id, cleanNotes),
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        emoji: emoji ?? null,
        quantity: Math.max(1, Math.min(MAX_QTY, Math.floor(quantity))),
        notes: cleanNotes,
      },
    });
    setPulse((p) => p + 1);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.quantity * i.price, 0),
      hydrated,
      isOpen,
      pulse,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQuantity: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items, hydrated, isOpen, pulse, addItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
