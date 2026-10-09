import { MapPin, Navigation, Phone } from 'lucide-react';
import { mapsSearchUrl } from '@/lib/utils';
import type { Location } from '@/types/database';

export function locationQuery(loc: Pick<Location, 'address' | 'neighborhood' | 'city' | 'department' | 'latitude' | 'longitude'>): string {
  if (loc.latitude != null && loc.longitude != null) return `${loc.latitude},${loc.longitude}`;
  return [loc.address, loc.neighborhood && `Barrio ${loc.neighborhood}`, loc.city, loc.department, 'Colombia'].filter(Boolean).join(', ');
}

export function LocationCard({ location, phoneHref }: { location: Location; phoneHref?: string }) {
  const directions = location.maps_url || mapsSearchUrl(locationQuery(location));
  const fullAddress = [location.address, location.neighborhood && `Barrio ${location.neighborhood}`, location.city, location.department]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-black/5 sm:p-6">
      <h3 className="font-display text-2xl uppercase tracking-wide">{location.name}</h3>
      <p className="mt-3 flex gap-2 text-black/80">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden />
        <span>
          
          {fullAddress}
        </span>
      </p>
      {location.phone && (
        <p className="mt-2 flex items-center gap-2 text-sm text-black/70">
          <Phone className="h-4 w-4 text-brand" aria-hidden />
          <a href={phoneHref ?? `tel:${location.phone.replace(/\D/g, '')}`} className="hover:text-brand">
            {location.phone}
          </a>
        </p>
      )}
      {location.hours_text && <p className="mt-2 text-sm text-black/70">🕒 {location.hours_text}</p>}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <Navigation className="h-4 w-4" aria-hidden /> Cómo llegar
        </a>
        <a href={directions} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          🗺️ Ver en Google Maps
        </a>
      </div>
    </article>
  );
}
