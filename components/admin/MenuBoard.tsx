'use client';

import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Card, ErrorBox, LoadingList, PageHeader, Toggle } from '@/components/admin/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { formatCOP } from '@/lib/format';
import { categoriesApi, productsApi } from '@/services/admin';
import type { Product } from '@/types/database';

/** Vista rápida del menú: cambiar precios y disponibilidad sin abrir formularios. */
export function MenuBoard() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(async () => {
    const [categories, products] = await Promise.all([categoriesApi.list(), productsApi.list()]);
    return { categories, products };
  });

  const categories = data?.categories ?? [];
  const products = data?.products ?? [];

  const save = async (p: Product, values: Partial<Product>, message: string) => {
    try {
      await productsApi.update(p.id, values);
      toast.success(message);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    }
  };

  return (
    <>
      <PageHeader
        title="Menú"
        description="Cambia precios y disponibilidad en un solo lugar. Escribe el nuevo precio y pulsa ✓ (o Enter)."
      />
      {loading ? (
        <LoadingList rows={8} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : products.length === 0 ? (
        <EmptyState icon="🍔" title="Menú vacío">Ejecuta supabase/seed.sql o crea productos en la sección Productos.</EmptyState>
      ) : (
        <div className="space-y-6">
          {categories.map((c) => {
            const items = products.filter((p) => p.category_id === c.id);
            if (items.length === 0) return null;
            return (
              <Card key={c.id} className="p-0 sm:p-0">
                <h2 className="flex items-center gap-2 border-b border-black/10 px-4 py-3 font-display text-2xl uppercase tracking-wide">
                  <span aria-hidden>{c.emoji}</span> {c.name}
                  {!c.is_active && <span className="rounded-full bg-black/10 px-2 py-0.5 font-sans text-[10px] font-extrabold">INACTIVA</span>}
                </h2>
                <ul className="divide-y divide-black/10">
                  {items.map((p) => (
                    <PriceRow key={p.id} product={p} onPrice={(price) => save(p, { price }, 'Precio actualizado correctamente')} onAvailable={(v) => save(p, { is_available: v }, v ? 'Producto disponible' : 'Producto marcado como agotado')} />
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function PriceRow({ product, onPrice, onAvailable }: { product: Product; onPrice: (price: number) => void; onAvailable: (v: boolean) => void }) {
  const [value, setValue] = useState(String(product.price));
  const [error, setError] = useState('');
  const dirty = value !== String(product.price);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (value.trim() === '' || !Number.isInteger(n)) return setError('Precio inválido');
    if (n < 0) return setError('No puede ser negativo');
    if (n > 10_000_000) return setError('Demasiado alto');
    setError('');
    onPrice(n);
  };

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 basis-44">
        <p className="flex items-center gap-1.5 truncate font-bold">
          {product.name}
          {product.is_featured && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" aria-label="Destacado" />}
        </p>
        <p className="text-xs text-black/50">Actual: {formatCOP(product.price)}</p>
      </div>
      <form onSubmit={submit} noValidate className="flex items-center gap-1.5">
        <label htmlFor={`price-${product.id}`} className="sr-only">Precio de {product.name}</label>
        <span className="font-bold text-black/50" aria-hidden>$</span>
        <input
          id={`price-${product.id}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          aria-invalid={!!error}
          className="input w-28 py-2"
        />
        <button type="submit" disabled={!dirty} aria-label={`Guardar precio de ${product.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white disabled:bg-black/15 disabled:text-black/30">
          <Check className="h-5 w-5" />
        </button>
      </form>
      {error && <p role="alert" className="w-full text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex items-center gap-2 text-xs font-semibold text-black/60">
        <Toggle checked={product.is_available} onChange={onAvailable} label={`${product.name} disponible`} />
        {product.is_available ? 'Disponible' : 'Agotado'}
      </div>
    </li>
  );
}
