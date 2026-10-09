'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { Card, ErrorBox, LoadingList, PageHeader, Toggle } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { categoriesApi, productsApi } from '@/services/admin';
import type { Category } from '@/types/database';

export function CategoriesManager() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(async () => {
    const [categories, products] = await Promise.all([categoriesApi.list(), productsApi.list()]);
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
    return { categories, counts };
  });
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = data?.categories ?? [];
  const counts = data?.counts ?? new Map<string, number>();

  const toggleActive = async (c: Category, value: boolean) => {
    try {
      await categoriesApi.update(c.id, { is_active: value });
      toast.success(value ? 'Categoría activada' : 'Categoría desactivada');
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const a = categories[index];
    const b = categories[index + dir];
    if (!a || !b) return;
    try {
      await categoriesApi.swapOrder(a, b);
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
      await categoriesApi.remove(deleting.id);
      toast.success('Categoría eliminada');
      setDeleting(null);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    } finally {
      setBusy(false);
    }
  };

  const nextOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), 0) + 1;
  const deletingCount = deleting ? (counts.get(deleting.id) ?? 0) : 0;

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organiza el menú. Puedes crear, ordenar, ocultar o eliminar categorías."
        actions={
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Nueva categoría
          </button>
        }
      />

      {loading ? (
        <LoadingList />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : categories.length === 0 ? (
        <EmptyState icon="🏷️" title="Sin categorías">Crea tu primera categoría para empezar a armar el menú.</EmptyState>
      ) : (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-black/10">
            {categories.map((c, i) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="text-2xl" aria-hidden>{c.emoji || '🍽️'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{c.name}</p>
                  <p className="text-xs text-black/50">
                    {counts.get(c.id) ?? 0} producto(s) · /{c.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${c.name}`} className="rounded-full p-2.5 hover:bg-black/5 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label={`Bajar ${c.name}`} className="rounded-full p-2.5 hover:bg-black/5 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <Toggle checked={c.is_active} onChange={(v) => toggleActive(c, v)} label={`Categoría ${c.name} activa`} />
                <button type="button" onClick={() => setEditing(c)} aria-label={`Editar ${c.name}`} className="rounded-full p-2.5 hover:bg-black/5">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setDeleting(c)} aria-label={`Eliminar ${c.name}`} className="rounded-full p-2.5 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva categoría' : 'Editar categoría'}>
        {editing && (
          <CategoryForm
            category={editing === 'new' ? null : editing}
            nextOrder={nextOrder}
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
        title="Eliminar categoría"
        message={
          deletingCount > 0
            ? `"${deleting?.name}" tiene ${deletingCount} producto(s). Primero muévelos o elimínalos; de lo contrario no se podrá borrar. También puedes desactivarla.`
            : `¿Eliminar la categoría "${deleting?.name}"? Esta acción no se puede deshacer.`
        }
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
