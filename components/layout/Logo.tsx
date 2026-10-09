import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  name: string;
  logoUrl?: string | null;
  className?: string;
  href?: string;
}

/** Logo tipográfico: la última palabra grande (ERIK) y el resto en trazo manuscrito. */
export function Logo({ name, logoUrl, className, href = '#inicio' }: LogoProps) {
  const words = name.trim().split(/\s+/);
  const main = words.length > 1 ? words[words.length - 1] : name;
  const rest = words.length > 1 ? words.slice(0, -1).join(' ') : '';
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)} aria-label={`${name} - Inicio`}>
      {logoUrl && (
        <Image src={logoUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-gold" />
      )}
      <span className="flex flex-col leading-none">
        {rest && <span className="font-script -mb-1 text-sm text-gold sm:text-base">{rest}</span>}
        <span className="font-display text-3xl uppercase tracking-wider text-white sm:text-4xl">{main}</span>
      </span>
    </Link>
  );
}
