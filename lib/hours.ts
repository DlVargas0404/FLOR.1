import { BUSINESS_TIMEZONE, DAY_NAMES } from '@/lib/constants';
import { formatTime12 } from '@/lib/format';
import type { BusinessHour, TimeSlot } from '@/types/database';

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Hora actual en Colombia: día de la semana (0=domingo) y minutos desde las 00:00. */
export function nowInBusinessTz(date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = weekdays.indexOf(get('weekday'));
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  return { day: day < 0 ? 0 : day, minutes };
}

export function crossesMidnight(slot: TimeSlot): boolean {
  return toMinutes(slot.close) <= toMinutes(slot.open);
}

export interface OpenStatus {
  isOpen: boolean;
  /** Texto corto: "Cierra a la 1:30 AM" / "Abre hoy a las 4:00 PM" */
  detail: string | null;
}

export function getOpenStatus(hours: BusinessHour[], date = new Date()): OpenStatus {
  if (hours.length === 0) return { isOpen: false, detail: null };
  const { day, minutes } = nowInBusinessTz(date);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));
  const today = byDay.get(day);
  const yesterday = byDay.get((day + 6) % 7);

  // Franja de ayer que cruza la medianoche y sigue vigente.
  if (yesterday && !yesterday.is_closed) {
    for (const s of yesterday.slots) {
      if (crossesMidnight(s) && minutes < toMinutes(s.close)) {
        return { isOpen: true, detail: `Cierra a la${closeSuffix(s.close)}` };
      }
    }
  }

  if (today && !today.is_closed) {
    for (const s of today.slots) {
      const open = toMinutes(s.open);
      const close = toMinutes(s.close);
      if (crossesMidnight(s)) {
        if (minutes >= open) return { isOpen: true, detail: `Cierra a la${closeSuffix(s.close)}` };
      } else if (minutes >= open && minutes < close) {
        return { isOpen: true, detail: `Cierra a la${closeSuffix(s.close)}` };
      }
    }
    // Próxima apertura de hoy
    const next = [...today.slots]
      .filter((s) => toMinutes(s.open) > minutes)
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
    if (next) return { isOpen: false, detail: `Abre hoy a las ${formatTime12(next.open)}` };
  }

  // Próximo día abierto
  for (let i = 1; i <= 7; i++) {
    const d = byDay.get((day + i) % 7);
    if (d && !d.is_closed && d.slots.length > 0) {
      const first = [...d.slots].sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
      const label = i === 1 ? 'mañana' : DAY_NAMES[(day + i) % 7].toLowerCase();
      return { isOpen: false, detail: `Abre ${label} a las ${formatTime12(first.open)}` };
    }
  }
  return { isOpen: false, detail: null };
}

function closeSuffix(close: string): string {
  const hour = Number(close.split(':')[0]);
  // "a la 1:30 AM" / "a las 11:00 PM"
  return `${hour % 12 === 1 || hour === 13 ? '' : 's'} ${formatTime12(close)}`;
}

export function describeDay(hour: BusinessHour | undefined): string {
  if (!hour || hour.is_closed || hour.slots.length === 0) return 'Cerrado';
  return hour.slots.map((s) => `${formatTime12(s.open)} - ${formatTime12(s.close)}`).join('  ·  ');
}
