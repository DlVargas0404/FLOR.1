import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { FloatingCart } from '@/components/cart/FloatingCart';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { SiteProvider } from '@/components/layout/SiteProvider';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { getSiteData } from '@/services/site';

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  return (
    <SiteProvider data={data}>
      <ToastProvider>
        <CartProvider>
          <a href="#menu" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-bold">
            Saltar al menú
          </a>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <FloatingCart />
          <WhatsAppButton />
          <CartDrawer />
        </CartProvider>
      </ToastProvider>
    </SiteProvider>
  );
}
