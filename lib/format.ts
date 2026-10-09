const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** 4000 -> "$4.000" */
export function formatCOP(value: number): string {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  // Se arma a mano para garantizar "$4.000" en cualquier entorno/ICU.
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export { copFormatter };

/** "16:00" -> "4:00 PM" */
export function formatTime12(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}
