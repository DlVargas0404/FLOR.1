import type { Metadata, Viewport } from 'next';
import { Anton, Inter, Permanent_Marker } from 'next/font/google';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const display = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const script = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-script', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const TITLE = 'STOP BURGER ERIK | Hamburguesas y Comidas Rápidas en Cúcuta';
const DESCRIPTION =
  'Hamburguesas, perros, salchipapas, parrillas, picadas y más en Cúcuta. Mira el menú, arma tu pedido y envíalo por WhatsApp. Av. 12 #10a-67, Barrio San Jose.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | STOP BURGER ERIK' },
  description: DESCRIPTION,
  applicationName: 'STOP BURGER ERIK',
  keywords: ['hamburguesas Cúcuta', 'comidas rápidas Cúcuta', 'STOP BURGER ERIK', 'salchipapas', 'perros calientes', 'parrilla', 'domicilios Cúcuta'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITE_URL,
    siteName: 'STOP BURGER ERIK',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: '#D90000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
