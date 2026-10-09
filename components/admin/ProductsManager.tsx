'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';
import { Card, ErrorBox, LoadingList, PageHeader, Toggle } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { formatCOP } from '@/lib/format';
import { normalize } from '@/lib/utils';
import { categoriesApi, productsApi } from '@/services/admin';
import { removeImage } from '@/services/storage';
import type { Product } from '@/types/database';

export function ProductsManager() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(async () => {
    const [categories, products] = await Promise.all([categoriesApi.list(), productsApi.list()]);
    return { categories, products };
  });
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyReview, setOnlyReview] = useState(false);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => data?.categories ?? [], [data]);
  const products = useMemo(() => data?.products ?? [], [data]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return products
      .filter((p) => (categoryFilter === 'all' ? true : p.category_id === categoryFilter))
      .filter((p) => (onlyReview ? p.needs_review : true))
      .filter((p) => (q ? normalize(`${p.name} ${p.description ?? ''}`).includes(q) : true))
      .sort((a, b) => {
        const ca = catById.get(a.category_id)?.sort_order ?? 0;
        const cb = catById.get(b.category_id)?.sort_order ?? 0;
        return ca - cb || a.sort_order - b.sort_order || a.name.localeCompare(b.name);
      });
  }, [products, categoryFilter, onlyReview, query, catById]);

  const reviewCount = products.filter((p) => p.needs_review).length;

  const patch = async (p: Product, values: Partial<Product>, message: string) => {
    try {
      await productsApi.update(p.id, values);
      toast.success(message);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await productsApi.remove(deleting.id);
      await removeImage(deleting.image_path);
      toast.success('Producto eliminado');
      setDeleting(null);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    } finally {
      setBusy(false);
    }
  };

  const nextOrderFor = (categoryId: string) =>
    products.filter((p) => p.category_id === categoryId).reduce((m, p) => Math.max(m, p.sort_order), 0) + 1;

  return (
    <>
      <PageHeader
        title="Productos"
        description="Crea, edita y elimina productos del menú. Los cambios se ven de inmediato en la web."
        actions={
          <button type="button" className="btn-primary" onClick={() => setEditing('new')} disabled={categories.length === 0}>
            <Plus className="h-4 w-4" aria-hidden /> Nuevo producto
          </button>
        }
      />

      {loading ? (
        <LoadingList rows={6} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : (
        <>
          {categories.length === 0 && (
            <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Primero crea al menos una categoría en la sección “Categorías”.
            </p>
          )}

          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" aria-hidden />
              <label htmlFor="prod-search" className="sr-only">Buscar producto</label>
              <input id="prod-search" type="search" className="input pl-10" placeholder="Buscar producto…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div>
              <label htmlFor="prod-filter-cat" className="sr-only">Filtrar por categoría</label>
              <select id="prod-filter-cat" className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              aria-pressed={onlyReview}
              onClick={() => setOnlyReview((v) => !v)}
              className={onlyReview ? 'btn bg-amber-500 text-white' : 'btn-ghost'}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden /> Por revisar ({reviewCount})
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="🍽️" title="No hay productos">
              {products.length === 0 ? 'Aún no has creado productos. Ejecuta seed.sql o crea uno nuevo.' : 'Ningún producto coincide con los filtros.'}
            </EmptyState>
          ) : (
            <Card className="p-0 sm:p-0">
              <ul className="divide-y divide-black/10">
                {filtered.map((p) => {
                  const cat = catById.get(p.category_id);
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand/10 text-2xl">
                        {p.image_url ? <Image src={p.image_url} alt="" fill sizes="56px" className="object-cover" /> : <span aria-hidden>{cat?.emoji || '🍽️'}</span>}
                      </div>
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="flex flex-wrap items-center gap-1.5 font-bold">
                          <span className="truncate">{p.name}</span>
                          {p.is_featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Destacado" />}
                          {p.needs_review && (
                            <span title={p.review_note ?? 'Pendiente de revisión'} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-800">
                              Revisar
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-black/50">
                          {cat?.name ?? 'Sin categoría'} · <span className="font-bold text-brand">{formatCOP(p.price)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-black/60">
                        <span className="flex items-center gap-1.5">
                          <Toggle checked={p.is_available} onChange={(v) => patch(p, { is_available: v }, v ? 'Producto disponible' : 'Producto marcado como agotado')} label={`${p.name} disponible`} />
                          <span className="hidden sm:inline">Disp.</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Toggle checked={p.is_featured} onChange={(v) => patch(p, { is_featured: v }, v ? 'Producto destacado' : 'Producto ya no es destacado')} label={`${p.name} destacado`} />
                          <span className="hidden sm:inline">Dest.</span>
                        </span>
                      </div>
                      <div className="flex">
                        <button type="button" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`} className="rounded-full p-2.5 hover:bg-black/5">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleting(p)} aria-label={`Eliminar ${p.name}`} className="rounded-full p-2.5 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'} className="sm:max-w-2xl">
        {editing && (
          <ProductForm
            // key fuerza un formulario limpio por cada producto
            key={editing === 'new' ? 'new' : editing.id}
            product={editing === 'new' ? null : editing}
            categories={categories}
            defaultCategoryId={categoryFilter !== 'all' ? categoryFilter : undefined}
            nextOrder={nextOrderFor(categoryFilter !== 'all' ? categoryFilter : (categories[0]?.id ?? ''))}
            onCancel={() => setEditing(null)}
            onDone={() => {
              setEditing(null);
              void reload(true);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar producto"
        message={`¿Eliminar "${deleting?.name}"? Desaparecerá del menú y su foto se borrará. Esta acción no se puede deshacer. Si solo se agotó, mejor márcalo como no disponible.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
