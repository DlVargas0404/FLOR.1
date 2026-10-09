'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/database';

interface CategoryTabsProps {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Centra la pestaña activa dentro de la barra (solo scroll horizontal, nunca mueve la página).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const list = listRef.current;
    const tab = activeRef.current;
    if (!list || !tab) return;
    list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const tabs = [{ slug: 'todos', name: 'Todos', emoji: '✨' }, ...categories.map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji }))];

  return (
    <div ref={listRef} role="tablist" aria-label="Categorías del menú" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:flex-wrap sm:px-0">
      {tabs.map((t) => {
        const selected = t.slug === active;
        return (
          <button
            key={t.slug}
            ref={selected ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(t.slug)}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold uppercase tracking-wide transition active:scale-95',
              selected ? 'bg-brand text-white shadow-pop' : 'bg-white text-ink ring-1 ring-black/10 hover:ring-brand hover:text-brand',
            )}
          >
            {t.emoji && <span aria-hidden>{t.emoji}</span>}
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
