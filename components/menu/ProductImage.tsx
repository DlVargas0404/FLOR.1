import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string | null;
  alt: string;
  emoji?: string | null;
  sizes: string;
  className?: string;
  grayscale?: boolean;
  priority?: boolean;
}

/** Imagen del producto con respaldo visual (emoji de la categoría) si aún no tiene foto. */
export function ProductImage({ src, alt, emoji, sizes, className, grayscale, priority }: ProductImageProps) {
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand to-brand-dark', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover transition duration-500 group-hover:scale-105', grayscale && 'grayscale')}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center" aria-hidden>
          <span className={cn('text-6xl drop-shadow-lg transition duration-300 group-hover:scale-110', grayscale && 'grayscale')}>
            {emoji || '🍔'}
          </span>
        </div>
      )}
    </div>
  );
}
