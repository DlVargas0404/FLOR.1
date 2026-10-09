'use client';

import { Phone } from 'lucide-react';
import { SocialLinks } from '@/components/layout/SocialLinks';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { Reveal } from '@/components/ui/Reveal';
import { useSite } from '@/components/layout/SiteProvider';
import { buildWhatsappUrl } from '@/lib/whatsapp';

export function ContactSection() {
  const { business, whatsappNumber } = useSite();
  return (
    <section id="contacto" className="relative overflow-hidden bg-brand-dark py-14 text-white sm:py-20">
      <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-script text-xl text-gold sm:text-2xl">¿Se te antojó?</p>
          <h2 className="section-title">Haz tu pedido</h2>
          <p className="mt-3 text-white/80">Escríbenos o llámanos. Respondemos rápido para que tu pedido salga caliente.</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={buildWhatsappUrl(whatsappNumber, `Hola, ${business.name} 👋 Quisiera hacer un pedido.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa px-8 py-3.5 text-base"
            >
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp {business.phone}
            </a>
            <a href={`tel:+${whatsappNumber}`} className="btn-gold px-8 py-3.5 text-base">
              <Phone className="h-5 w-5" aria-hidden /> Llamar
            </a>
          </div>
          <SocialLinks tone="dark" className="mt-8 justify-center" />
        </Reveal>
      </div>
    </section>
  );
}
