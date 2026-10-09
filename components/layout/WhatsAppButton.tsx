'use client';

import { WhatsAppIcon } from '@/components/ui/Icons';
import { useSite } from '@/components/layout/SiteProvider';
import { buildWhatsappUrl } from '@/lib/whatsapp';

/** Botón flotante de WhatsApp (abre el chat con el número del negocio). */
export function WhatsAppButton() {
  const { whatsappNumber, business } = useSite();
  const url = buildWhatsappUrl(whatsappNumber, `Hola, ${business.name} 👋`);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-wa text-white shadow-card transition hover:scale-110 hover:bg-wa-dark active:scale-95"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-wa/40 [animation-duration:2.5s]" aria-hidden />
      <WhatsAppIcon className="relative h-8 w-8" />
    </a>
  );
}
