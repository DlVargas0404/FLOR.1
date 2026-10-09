'use client';

import { Clock, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { SocialLinks } from '@/components/layout/SocialLinks';
import { useSite } from '@/components/layout/SiteProvider';
import { describeDay } from '@/lib/hours';
import { DAY_NAMES } from '@/lib/constants';
import { buildWhatsappUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/Icons';

export function Footer() {
  const { business, hours, whatsappNumber, locations } = useSite();
  const main = locations[0];
  const address = main
    ? [main.address, main.neighborhood && `Barrio ${main.neighborhood}`, main.city, main.department].filter(Boolean).join(', ')
    : [business.address, business.neighborhood && `Barrio ${business.neighborhood}`, business.city, business.department].filter(Boolean).join(', ');

  // Resumen del horario: si todos los días son iguales se muestra una sola línea.
  const days = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ d, text: describeDay(hours.find((h) => h.day_of_week === d)) }));
  const allSame = hours.length === 7 && days.every((x) => x.text === days[0].text);

  return (
    <footer id="contacto-footer" className="bg-ink text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo name={business.name} logoUrl={business.logo_url} />
          {business.short_description && <p className="text-sm text-white/70">{business.short_description}</p>}
          <SocialLinks tone="dark" />
        </div>

        <div>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide text-gold">Contacto</h3>
          <ul className="space-y-3 text-sm text-white/80">
            {address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                {address}
              </li>
            )}
            {business.phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href={`tel:+${whatsappNumber}`} className="hover:text-gold">
                  {business.phone}
                </a>
              </li>
            )}
            <li className="flex gap-2">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-wa" />
              <a href={buildWhatsappUrl(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                WhatsApp {business.phone ?? ''}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide text-gold">Horario</h3>
          {hours.length === 0 ? (
            <p className="text-sm text-white/60">Horario no disponible.</p>
          ) : allSame ? (
            <p className="flex gap-2 text-sm text-white/80">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>
                Todos los días
                <br />
                {days[0].text}
              </span>
            </p>
          ) : (
            <ul className="space-y-1 text-sm text-white/80">
              {days.map(({ d, text }) => (
                <li key={d} className="flex justify-between gap-3">
                  <span>{DAY_NAMES[d]}</span>
                  <span className="text-right text-white/60">{text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Enlaces del pie">
          <h3 className="mb-3 font-display text-xl uppercase tracking-wide text-gold">Enlaces</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {[
              ['#inicio', 'Inicio'],
              ['#menu', 'Menú'],
              ['#ubicacion', 'Ubicación'],
              ['#contacto', 'Contacto'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-gold">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © 2026 STOP BURGER ERIK. Todos los derechos reservados.
      </div>
    </footer>
  );
}
