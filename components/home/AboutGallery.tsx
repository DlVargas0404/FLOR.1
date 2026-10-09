'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Flame, Heart, Zap } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Reveal } from '@/components/ui/Reveal';
import { useSite } from '@/components/layout/SiteProvider';

const PILLARS = [
  { icon: Flame, title: 'Hecho al momento', text: 'Cada pedido se prepara caliente y al instante.' },
  { icon: Zap, title: 'Rápido', text: 'Para recoger en el local o a domicilio.' },
  { icon: Heart, title: 'Sabor colombiano', text: 'Hamburguesas, perros, parrilla y más.' },
];

export function AboutGallery() {
  const { business, gallery } = useSite();
  const [index, setIndex] = useState<number | null>(null);
  const current = index !== null ? gallery[index] : null;

  const description = business.long_description || business.short_description;

  return (
    <section id="nosotros" className="bg-white py-14 sm:py-20">
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-script text-xl text-brand sm:text-2xl">Nosotros</p>
          <h2 className="section-title">Conoce {business.name}</h2>
          {description && <p className="mt-4 text-lg leading-relaxed text-black/70">{description}</p>}
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-cream p-6 text-center ring-1 ring-black/5">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-pop">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="font-display text-2xl uppercase tracking-wide">{title}</h3>
              <p className="mt-1 text-sm text-black/60">{text}</p>
            </div>
          ))}
        </Reveal>

        {gallery.length > 0 && (
          <Reveal className="mt-12">
            <ul className="grid auto-rows-[140px] grid-cols-2 gap-3 sm:auto-rows-[180px] md:grid-cols-4">
              {gallery.map((img, i) => (
                <li key={img.id} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={img.caption ? `Ampliar foto: ${img.caption}` : `Ampliar foto ${i + 1}`}
                    className="group relative block h-full w-full overflow-hidden rounded-3xl bg-black/10"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.caption || `Foto ${i + 1} de ${business.name}`}
                      fill
                      loading="lazy"
                      sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                    {img.caption && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {img.caption}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <Modal open={current !== null} onClose={() => setIndex(null)} title={current?.caption || 'Galería'} hideHeader className="sm:max-w-3xl">
        {current && (
          <div className="relative bg-black">
            <div className="relative aspect-[4/3] w-full">
              <Image src={current.image_url} alt={current.caption || 'Foto de la galería'} fill sizes="(max-width: 768px) 100vw, 768px" className="object-contain" />
            </div>
            {current.caption && <p className="bg-white px-5 py-3 text-sm font-semibold">{current.caption}</p>}
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white"
            >
              ×
            </button>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => ((i ?? 0) - 1 + gallery.length) % gallery.length)}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => ((i ?? 0) + 1) % gallery.length)}
                  aria-label="Foto siguiente"
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
