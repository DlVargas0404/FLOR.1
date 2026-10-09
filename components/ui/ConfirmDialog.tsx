'use client';

import { Modal } from '@/components/ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={busy ? () => undefined : onCancel} title={title} className="sm:max-w-md">
      <div className="space-y-5 p-5">
        <p className="text-sm text-ink-soft">{message}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
