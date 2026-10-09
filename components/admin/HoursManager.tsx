'use client';

import { useEffect, useState } from 'react';
import { Copy, Plus, X } from 'lucide-react';
import { Card, ErrorBox, LoadingList, PageHeader, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { DAY_NAMES, DAY_ORDER } from '@/lib/constants';
import { explainError } from '@/lib/errors';
import { toMinutes } from '@/lib/hours';
import { hoursApi } from '@/services/admin';
import type { TimeSlot } from '@/types/database';

interface DayState {
  id?: string;
  day_of_week: number;
  is_closed: boolean;
  slots: TimeSlot[];
}

const DEFAULT_SLOT: TimeSlot = { open: '16:00', close: '01:30' };

export function HoursManager() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => hoursApi.list());
  const [days, setDays] = useState<DayState[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setDays(
      DAY_ORDER.map((d) => {
        const row = data.find((r) => r.day_of_week === d);
        return row
          ? { id: row.id, day_of_week: d, is_closed: row.is_closed, slots: row.slots.length ? row.slots : [{ ...DEFAULT_SLOT }] }
          : { day_of_week: d, is_closed: false, slots: [{ ...DEFAULT_SLOT }] };
      }),
    );
  }, [data]);

  const update = (d: number, fn: (s: DayState) => DayState) => {
    setDays((all) => all.map((x) => (x.day_of_week === d ? fn(x) : x)));
    setErrors((e) => ({ ...e, [d]: '' }));
  };

  const copyFirstToAll = () => {
    const first = days[0];
    if (!first) return;
    setDays((all) => all.map((x) => ({ ...x, is_closed: first.is_closed, slots: first.slots.map((s) => ({ ...s })) })));
    toast.info(`Se copió el horario de ${DAY_NAMES[first.day_of_week]} a todos los días. Pulsa Guardar.`);
  };

  const validate = (): boolean => {
    const errs: Record<number, string> = {};
    for (const d of days) {
      if (d.is_closed) continue;
      if (d.slots.length === 0) {
        errs[d.day_of_week] = 'Agrega al menos una franja o marca el día como cerrado.';
        continue;
      }
      for (const s of d.slots) {
        if (!s.open || !s.close) {
          errs[d.day_of_week] = 'Completa la hora de apertura y cierre.';
          break;
        }
        if (s.open === s.close) {
          errs[d.day_of_week] = 'La hora de apertura y cierre no pueden ser iguales.';
          break;
        }
      }
      // Franjas del mismo día que se solapan
      const sorted = [...d.slots].filter((s) => s.open && s.close).sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
      for (let i = 0; i < sorted.length - 1 && !errs[d.day_of_week]; i++) {
        const end = toMinutes(sorted[i].close) <= toMinutes(sorted[i].open) ? 24 * 60 : toMinutes(sorted[i].close);
        if (end > toMinutes(sorted[i + 1].open)) errs[d.day_of_week] = 'Las franjas se solapan.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.error('Revisa los horarios marcados');
      return;
    }
    setBusy(true);
    try {
      await hoursApi.save(days.map((d) => ({ id: d.id, day_of_week: d.day_of_week, is_closed: d.is_closed, slots: d.is_closed ? [] : d.slots })));
      toast.success('Horarios actualizados correctamente');
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
        title="Horarios"
        description="Define cuándo abres. Si cierras después de medianoche (ej. 1:30 AM) el sistema lo entiende solo. Puedes dividir el horario en varias franjas."
        actions={
          <button type="button" onClick={copyFirstToAll} className="btn-ghost" disabled={days.length === 0}>
            <Copy className="h-4 w-4" aria-hidden /> Copiar lunes a todos
          </button>
        }
      />
      {loading ? (
        <LoadingList rows={7} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : (
        <>
          <div className="space-y-3">
            {days.map((d) => (
              <Card key={d.day_of_week}>
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="w-28 font-display text-xl uppercase tracking-wide">{DAY_NAMES[d.day_of_week]}</h2>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Toggle checked={!d.is_closed} onChange={(open) => update(d.day_of_week, (s) => ({ ...s, is_closed: !open, slots: s.slots.length ? s.slots : [{ ...DEFAULT_SLOT }] }))} label={`${DAY_NAMES[d.day_of_week]} abierto`} />
                    {d.is_closed ? <span className="text-black/50">Cerrado</span> : <span className="text-emerald-700">Abierto</span>}
                  </span>
                </div>
                {!d.is_closed && (
                  <div className="mt-3 space-y-2">
                    {d.slots.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`o-${d.day_of_week}-${i}`}>Abre</label>
                        <input
                          id={`o-${d.day_of_week}-${i}`}
                          type="time"
                          className="input w-36"
                          value={s.open}
                          onChange={(e) => update(d.day_of_week, (x) => ({ ...x, slots: x.slots.map((t, j) => (j === i ? { ...t, open: e.target.value } : t)) }))}
                        />
                        <span className="text-sm text-black/50">a</span>
                        <label className="sr-only" htmlFor={`c-${d.day_of_week}-${i}`}>Cierra</label>
                        <input
                          id={`c-${d.day_of_week}-${i}`}
                          type="time"
                          className="input w-36"
                          value={s.close}
                          onChange={(e) => update(d.day_of_week, (x) => ({ ...x, slots: x.slots.map((t, j) => (j === i ? { ...t, close: e.target.value } : t)) }))}
                        />
                        {toMinutes(s.close) <= toMinutes(s.open) && s.open && s.close && <span className="text-xs text-black/50">cierra al día siguiente</span>}
                        {d.slots.length > 1 && (
                          <button type="button" aria-label="Quitar franja" onClick={() => update(d.day_of_week, (x) => ({ ...x, slots: x.slots.filter((_, j) => j !== i) }))} className="rounded-full p-2.5 text-red-600 hover:bg-red-50">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {d.slots.length < 3 && (
                      <button type="button" onClick={() => update(d.day_of_week, (x) => ({ ...x, slots: [...x.slots, { open: '12:00', close: '15:00' }] }))} className="btn-ghost min-h-[40px] text-xs">
                        <Plus className="h-4 w-4" aria-hidden /> Agregar franja (horario dividido)
                      </button>
                    )}
                  </div>
                )}
                {errors[d.day_of_week] && (
                  <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
                    {errors[d.day_of_week]}
                  </p>
                )}
              </Card>
            ))}
          </div>
          <div className="sticky bottom-0 -mx-4 mt-4 flex justify-end border-t border-black/10 bg-neutral-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <button type="button" onClick={save} disabled={busy} className="btn-primary">
              {busy ? 'Guardando…' : 'Guardar horarios'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
