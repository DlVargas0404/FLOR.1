'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { BurgerIllustration } from '@/components/home/BurgerIllustration';
import { OpenBadge } from '@/components/home/OpenBadge';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { useSite } from '@/components/layout/SiteProvider';
import { buildWhatsappUrl } from '@/lib/whatsapp';

export function Hero({ categoryNames }: { categoryNames: string[] }) {
  const { business, whatsappNumber } = useSite();
  const words = business.name.trim().split(/\s+/);
  const main = words.length > 1 ? words[words.length - 1] : business.name;
  const rest = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  const waUrl = buildWhatsappUrl(whatsappNumber, `Hola, ${business.name} 👋 Quisiera hacer un pedido.`);
  const marquee = categoryNames.length > 0 ? categoryNames : ['Hamburguesas', 'Perros', 'Parrillas', 'Picadas'];

  return (
    <section id="inicio" className="relative overflow-hidden bg-brand text-white">
      {/* fondo */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#ff2a1a_0%,#D90000_40%,#8B0000_100%)]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(45deg,#fff_0,#fff_2px,transparent_2px,transparent_22px)]"
      />

      <div className="container-x relative grid items-center gap-8 pb-16 pt-10 sm:pt-14 lg:grid-cols-2 lg:gap-4 lg:pb-24 lg:pt-16">
        <div className="animate-fade-up text-center lg:text-left">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <OpenBadge />
            {business.show_rating && business.rating != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold">
                <Star className="h-4 w-4 fill-gold text-gold" aria-hidden />
                {business.rating.toFixed(1)}/5 en {business.rating_source || 'Google'}
              </span>
            )}
          </div>

          <h1 className="leading-[0.85]">
            {rest && <span className="font-script block text-3xl text-gold sm:text-5xl">{rest}</span>}
            <span className="font-display block text-[22vw] uppercase tracking-wide drop-shadow-[0_6px_0_rgba(0,0,0,.25)] sm:text-9xl lg:text-[9.5rem]">
              {main}
            </span>
          </h1>

          {business.tagline && (
            <p className="mx-auto mt-5 max-w-md text-xl font-semibold text-white/90 sm:text-2xl lg:mx-0">{business.tagline}</p>
          )}

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a href="#menu" className="btn-gold px-8 py-3.5 text-base shadow-pop">
              Ver menú
            </a>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa px-8 py-3.5 text-base">
              <WhatsAppIcon className="h-5 w-5" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-xl">
          <div aria-hidden className="absolute inset-6 rounded-full bg-gold/25 blur-3xl" />
          {business.hero_image_url ? (
            <div className="relative aspect-square animate-float overflow-hidden rounded-[2.5rem] border-4 border-gold shadow-2xl">
              <Image
                src={business.hero_image_url}
                alt={`Hamburguesa de ${business.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
              />
            </div>
          ) : (
            <BurgerIllustration className="relative h-auto w-full animate-float drop-shadow-2xl" />
          )}
        </div>
      </div>

      {/* cinta */}
      <div className="relative border-y-4 border-ink bg-gold py-2.5 text-ink" aria-hidden>
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-xl uppercase tracking-wider">
          {[0, 1].map((n) => (
            <div key={n} className="flex gap-8">
              {Array.from({ length: 3 }).flatMap(() => marquee).map((name, i) => (
                <span key={`${n}-${i}`} className="flex items-center gap-8">
                  {name}
                  <span>★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
