'use client';

import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from '@/components/ui/Icons';
import { useSite } from '@/components/layout/SiteProvider';
import { buildWhatsappUrl } from '@/lib/whatsapp';
import { mapsSearchUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SocialPlatform } from '@/types/database';

const ICONS: Record<SocialPlatform, { label: string; icon: ReactNode }> = {
  facebook: { label: 'Facebook', icon: <FacebookIcon className="h-5 w-5" /> },
  instagram: { label: 'Instagram', icon: <InstagramIcon className="h-5 w-5" /> },
  tiktok: { label: 'TikTok', icon: <TikTokIcon className="h-5 w-5" /> },
  whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon className="h-5 w-5" /> },
  google_maps: { label: 'Google Maps', icon: <MapPin className="h-5 w-5" /> },
};

const ORDER: SocialPlatform[] = ['facebook', 'instagram', 'tiktok', 'whatsapp', 'google_maps'];

/** Muestra solo las redes que tienen un enlace configurado (WhatsApp y Maps usan respaldos). */
export function SocialLinks({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const { social, whatsappNumber, locations, business } = useSite();

  const links = ORDER.flatMap((platform) => {
    const row = social.find((s) => s.platform === platform);
    if (row && !row.is_active) return [];
    let url = row?.url?.trim() || '';
    if (!url && platform === 'whatsapp') url = buildWhatsappUrl(whatsappNumber);
    if (!url && platform === 'google_maps') {
      const loc = locations[0];
      url =
        loc?.maps_url ||
        mapsSearchUrl([loc?.address ?? business.address, loc?.neighborhood ?? business.neighborhood, loc?.city ?? business.city].filter(Boolean).join(', '));
    }
    return url ? [{ platform, url }] : [];
  });

  if (links.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {links.map(({ platform, url }) => (
        <li key={platform}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ICONS[platform].label}
            title={ICONS[platform].label}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full transition hover:-translate-y-0.5',
              tone === 'dark' ? 'bg-white/10 text-white hover:bg-gold hover:text-ink' : 'bg-black/5 text-ink hover:bg-brand hover:text-white',
            )}
          >
            {ICONS[platform].icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
