'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { toWhatsappNumber } from '@/lib/utils';
import type { SiteData } from '@/types/database';

interface SiteContextValue extends SiteData {
  whatsappNumber: string;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ data, children }: { data: SiteData; children: ReactNode }) {
  const value: SiteContextValue = { ...data, whatsappNumber: toWhatsappNumber(data.business.whatsapp) };
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite debe usarse dentro de <SiteProvider>');
  return ctx;
}
