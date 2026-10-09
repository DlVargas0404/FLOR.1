'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { ProductCard } from '@/components/menu/ProductCard';
import { ProductModal } from '@/components/menu/ProductModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/components/cart/CartProvider';
import { useSite } from '@/components/layout/SiteProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { normalize, cn } from '@/lib/utils';
import type { Category, Product } from '@/types/database';

type StockFilter = 'all' | 'featured' | 'available' | 'soldout';

const FILTERS: { key: StockFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'featured', label: '⭐ Destacados' },
  { key: 'available', label: 'Disponibles' },
  { key: 'soldout', label: 'Agotados' },
];

interface MenuSectionProps {
  categories: Category[];
  products: Product[];
  /** false cuando Supabase no está configurado o falló la carga */
  configured: boolean;
}

export function MenuSection({ categories, products, configured }: MenuSectionProps) {
  const { settings } = useSite();
  const { addItem } = useCart();
  const toast = useToast();
  const [category, setCategory] = useState('todos');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const canOrder = settings.accept_orders;

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    const visible = products.filter((p) => {
      const cat = catById.get(p.category_id);
      if (!cat) return false;
      if (category !== 'todos' && cat.slug !== category) return false;
      if (filter === 'featured' && !p.is_featured) return false;
      if (filter === 'available' && !p.is_available) return false;
      if (filter === 'soldout' && p.is_available) return false;
      if (q && !normalize(`${p.name} ${p.description ?? ''} ${cat.name}`).includes(q)) return false;
      return true;
    });
    return categories
      .map((c) => ({ category: c, items: visible.filter((p) => p.category_id === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [categories, products, catById, category, query, filter]);

  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const hasFilters = query !== '' || filter !== 'all' || category !== 'todos';

  const quickAdd = (p: Product) => {
    addItem(p, 1, '', catById.get(p.category_id)?.emoji);
    toast.success(`${p.name} agregado al carrito`);
  };

  return (
    <section id="menu" className="bg-cream py-14 sm:py-20">
      <div className="container-x">
        <div className="mb-8 text-center">
          <p className="font-script text-xl text-brand sm:text-2xl">Antójate</p>
          <h2 className="section-title">Nuestro menú</h2>
        </div>

        {categories.length === 0 || products.length === 0 ? (
          <EmptyState icon="🍔" title="Menú no disponible">
            {configured
              ? 'Todavía no hay productos publicados. Vuelve pronto.'
              : 'El menú se carga desde Supabase. Configura las variables de entorno y ejecuta el seed (ver README).'}
          </EmptyState>
        ) : (
          <>
            <div className="sticky top-16 z-30 -mx-4 space-y-2 bg-cream/95 px-4 pb-2 pt-2 backdrop-blur sm:mx-0 sm:px-0">
              <CategoryTabs categories={categories} active={category} onChange={setCategory} />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" aria-hidden />
                  <label htmlFor="menu-search" className="sr-only">
                    Buscar productos
                  </label>
                  <input
                    id="menu-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar hamburguesa, perro, salchipapa…"
                    className="input pl-10"
                  />
                </div>
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar productos">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={filter === f.key}
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        'min-h-[40px] shrink-0 rounded-full px-3.5 text-xs font-extrabold uppercase tracking-wide transition',
                        filter === f.key ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-black/10 hover:ring-ink',
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!canOrder && (
              <p className="mt-4 rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white">
                {settings.closed_message || 'Por ahora no recibimos pedidos por la web.'}
              </p>
            )}

            <div key={`${category}-${filter}`} className="mt-6 animate-fade-up">
              {total === 0 ? (
                <EmptyState icon="🔍" title="No hay productos disponibles">
                  No encontramos productos con esos filtros.
                  {hasFilters && (
                    <button
                      type="button"
                      className="btn-primary mt-4"
                      onClick={() => {
                        setQuery('');
                        setFilter('all');
                        setCategory('todos');
                      }}
                    >
                      <X className="h-4 w-4" aria-hidden /> Limpiar filtros
                    </button>
                  )}
                </EmptyState>
              ) : (
                <div className="space-y-12">
                  {groups.map(({ category: c, items }) => (
                    <div key={c.id} id={`cat-${c.slug}`}>
                      <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-1 border-b-4 border-brand pb-2">
                        <h3 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                          <span aria-hidden>{c.emoji} </span>
                          {c.name}
                        </h3>
                        {c.description && <p className="pb-1 text-sm font-semibold text-black/60">{c.description}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {items.map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            emoji={c.emoji}
                            canOrder={canOrder}
                            onOpen={setSelected}
                            onQuickAdd={quickAdd}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ProductModal
        product={selected}
        emoji={selected ? (catById.get(selected.category_id)?.emoji ?? null) : null}
        canOrder={canOrder}
        onClose={() => setSelected(null)}
        onAdd={(p, qty, notes) => {
          addItem(p, qty, notes, catById.get(p.category_id)?.emoji);
          toast.success('Producto agregado al carrito');
        }}
      />
    </section>
  );
}
