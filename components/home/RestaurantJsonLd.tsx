import { SITE_URL } from '@/lib/constants';
import type { BusinessHour, BusinessInfo, Location, SocialLink } from '@/types/database';

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Datos estructurados Schema.org (Restaurant) generados desde la base de datos. */
export function RestaurantJsonLd({
  business,
  hours,
  location,
  social,
  image,
}: {
  business: BusinessInfo;
  hours: BusinessHour[];
  location?: Location;
  social: SocialLink[];
  image?: string | null;
}) {
  const openingHoursSpecification = hours
    .filter((h) => !h.is_closed)
    .flatMap((h) =>
      h.slots.map((s) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SCHEMA_DAYS[h.day_of_week],
        opens: s.open,
        closes: s.close,
      })),
    );

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: business.name,
    description: business.short_description ?? undefined,
    url: SITE_URL,
    telephone: business.phone ? `+${(business.whatsapp ?? '').replace(/\D/g, '') || business.phone}` : undefined,
    servesCuisine: ['Comida rápida', 'Hamburguesas', 'Perros calientes', 'Parrilla'],
    priceRange: '$',
    image: image ?? business.hero_image_url ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [location?.address ?? business.address, location?.neighborhood ?? (business.neighborhood && `Barrio ${business.neighborhood}`)]
        .filter(Boolean)
        .join(', '),
      addressLocality: location?.city ?? business.city ?? undefined,
      addressRegion: location?.department ?? business.department ?? undefined,
      addressCountry: 'CO',
    },
    openingHoursSpecification: openingHoursSpecification.length ? openingHoursSpecification : undefined,
    sameAs: social.filter((s) => s.url && ['facebook', 'instagram', 'tiktok'].includes(s.platform)).map((s) => s.url),
  };

  // Solo se publican coordenadas reales configuradas por el administrador.
  if (location?.latitude != null && location?.longitude != null) {
    data.geo = { '@type': 'GeoCoordinates', latitude: location.latitude, longitude: location.longitude };
  }

  return (
    <script
      type="application/ld+json"
      // Se escapa "<" para evitar cerrar el <script> con contenido de la BD.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
