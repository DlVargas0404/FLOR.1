'use client';

import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { LocationForm } from '@/components/admin/LocationForm';
import { Card, ErrorBox, LoadingList, PageHeader, Toggle } from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { locationsApi } from '@/services/admin';
import type { Location } from '@/types/database';

export function LocationsManager() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => locationsApi.list());
  const [editing, setEditing] = useState<Location | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);
  const [busy, setBusy] = useState(false);
  const locations = data ?? [];

  const toggle = async (l: Location, v: boolean) => {
    try {
      await locationsApi.update(l.id, { is_active: v });
      toast.success(v ? 'Ubicación activada' : 'Ubicación desactivada');
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
      await locationsApi.remove(deleting.id);
      toast.success('Ubicación eliminada');
      setDeleting(null);
      await reload(true);
      await publish();
    } catch (e) {
      toast.error(explainError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ubicaciones"
        description="Sedes del restaurante. Puedes agregar más en el futuro."
        actions={
          <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Nueva ubicación
          </button>
        }
      />
      {loading ? (
        <LoadingList rows={2} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : locations.length === 0 ? (
        <EmptyState icon="📍" title="Sin ubicaciones">Agrega la dirección del restaurante para mostrarla en la web.</EmptyState>
      ) : (
        <div className="space-y-3">
          {locations.map((l) => (
            <Card key={l.id} className="flex flex-wrap items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-bold">{l.name}</p>
                <p className="text-sm text-black/70">
                  {[l.address, l.neighborhood && `Barrio ${l.neighborhood}`, l.city, l.department].filter(Boolean).join(', ')}
                </p>
                {l.phone && <p className="text-xs text-black/50">📞 {l.phone}</p>}
                <p className="text-xs text-black/50">
                  {l.latitude != null && l.longitude != null ? `Coordenadas: ${l.latitude}, ${l.longitude}` : 'Sin coordenadas (se busca por dirección)'}
                  {l.maps_url ? ' · URL de Maps configurada' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={l.is_active} onChange={(v) => toggle(l, v)} label={`Ubicación ${l.name} activa`} />
                <button type="button" onClick={() => setEditing(l)} aria-label={`Editar ${l.name}`} className="rounded-full p-2.5 hover:bg-black/5">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setDeleting(l)} aria-label={`Eliminar ${l.name}`} className="rounded-full p-2.5 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva ubicación' : 'Editar ubicación'} className="sm:max-w-2xl">
        {editing && (
          <LocationForm
            key={editing === 'new' ? 'new' : editing.id}
            location={editing === 'new' ? null : editing}
            nextOrder={locations.reduce((m, l) => Math.max(m, l.sort_order), 0) + 1}
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
        title="Eliminar ubicación"
        message={`¿Eliminar "${deleting?.name}"? Dejará de mostrarse en la web. Esta acción no se puede deshacer.`}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
