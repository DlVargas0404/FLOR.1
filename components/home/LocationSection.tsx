'use client';

import { BusinessHours } from '@/components/home/BusinessHours';
import { LocationCard, locationQuery } from '@/components/home/LocationCard';
import { Reveal } from '@/components/ui/Reveal';
import { useSite } from '@/components/layout/SiteProvider';
import { mapsEmbedUrl } from '@/lib/utils';
import type { Location } from '@/types/database';

export function LocationSection() {
  const { business, locations, whatsappNumber } = useSite();

  // Si aún no hay ubicaciones en la BD se usa la dirección del negocio como respaldo.
  const list: Location[] =
    locations.length > 0
      ? locations
      : business.address
        ? [
            {
              id: 'business',
              name: business.name,
              address: business.address,
              neighborhood: business.neighborhood,
              city: business.city,
              department: business.department,
              phone: business.phone,
              hours_text: null,
              latitude: null,
              longitude: null,
              maps_url: null,
              is_active: true,
              sort_order: 0,
            },
          ]
        : [];

  const first = list[0];

  return (
    <section id="ubicacion" className="bg-cream py-14 sm:py-20">
      <div className="container-x">
        <Reveal className="mb-10 text-center">
          <p className="font-script text-xl text-brand sm:text-2xl">Ven por el tuyo</p>
          <h2 className="section-title">Ubicación y horario</h2>
        </Reveal>

        <Reveal className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {list.map((loc) => (
              <LocationCard key={loc.id} location={loc} phoneHref={`tel:+${whatsappNumber}`} />
            ))}
            <BusinessHours />
          </div>

          {first && (
            <div className="min-h-[320px] overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5 lg:min-h-full">
              <iframe
                title={`Mapa de ${first.name}`}
                src={mapsEmbedUrl(locationQuery(first))}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-full min-h-[320px] w-full border-0"
              />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
