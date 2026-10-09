import { AboutGallery } from '@/components/home/AboutGallery';
import { ContactSection } from '@/components/home/ContactSection';
import { Hero } from '@/components/home/Hero';
import { LocationSection } from '@/components/home/LocationSection';
import { RestaurantJsonLd } from '@/components/home/RestaurantJsonLd';
import { MenuSection } from '@/components/menu/MenuSection';
import { getMenu, getSiteData } from '@/services/site';

export const revalidate = 60;

export default async function HomePage() {
  const [menu, site] = await Promise.all([getMenu(), getSiteData()]);

  return (
    <>
      <RestaurantJsonLd
        business={site.business}
        hours={site.hours}
        location={site.locations[0]}
        social={site.social}
        image={site.gallery[0]?.image_url}
      />
      <Hero categoryNames={menu.categories.map((c) => c.name)} />
      <MenuSection categories={menu.categories} products={menu.products} configured={site.configured} />
      <AboutGallery />
      <LocationSection />
      <ContactSection />
    </>
  );
}
