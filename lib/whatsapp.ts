import { formatCOP } from '@/lib/format';
import type { CartItem } from '@/types/cart';

export type OrderType = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'transfer' | 'other';

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  pickup: 'Recoger en el local',
  delivery: 'Domicilio',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  other: 'Otro',
};

export interface OrderDetails {
  name: string;
  phone: string;
  orderType: OrderType;
  address?: string;
  neighborhood?: string;
  reference?: string;
  payment: PaymentMethod;
  notes?: string;
}

export interface MessageOptions {
  greeting?: string | null;
  closing?: string | null;
  deliveryNote?: string | null;
}

const LINE = '--------------------------------';

export function lineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}

export function buildOrderMessage(items: CartItem[], details: OrderDetails, opts: MessageOptions = {}): string {
  const out: string[] = [];
  out.push(opts.greeting?.trim() || 'Hola, STOP BURGER ERIK 👋');
  out.push('');
  out.push('Quiero realizar el siguiente pedido:');
  out.push('');

  for (const item of items) {
    out.push(`${item.emoji || '🍽️'} ${item.quantity}x ${item.name}`);
    out.push(formatCOP(lineTotal(item)));
    if (item.notes) out.push(`📝 ${item.notes}`);
    out.push('');
  }

  out.push(LINE);
  out.push(`TOTAL: ${formatCOP(cartTotal(items))}`);
  out.push(LINE);
  out.push('');

  if (details.notes?.trim()) {
    out.push('Observaciones:');
    out.push(details.notes.trim());
    out.push('');
  }

  out.push('Nombre:');
  out.push(details.name.trim());
  out.push('');
  out.push('Teléfono:');
  out.push(details.phone.trim());
  out.push('');
  out.push('Forma de entrega:');
  out.push(ORDER_TYPE_LABEL[details.orderType]);
  out.push('');

  if (details.orderType === 'delivery') {
    out.push('Dirección:');
    out.push(details.address?.trim() || '');
    out.push('');
    out.push('Barrio:');
    out.push(details.neighborhood?.trim() || '');
    out.push('');
    if (details.reference?.trim()) {
      out.push('Referencia:');
      out.push(details.reference.trim());
      out.push('');
    }
    if (opts.deliveryNote?.trim()) {
      out.push(`ℹ️ ${opts.deliveryNote.trim()}`);
      out.push('');
    }
  }

  out.push('Método de pago:');
  out.push(PAYMENT_LABEL[details.payment]);
  out.push('');
  out.push(opts.closing?.trim() || 'Gracias.');

  return out.join('\n');
}

/** Abre un chat con mensaje precargado. `number` en formato internacional sin "+". */
export function buildWhatsappUrl(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
