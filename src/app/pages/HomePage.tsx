import { Hero } from '../components/Hero';
import { ForYouSection } from '../sections/ForYouSection';
import { TrendingSection } from '../sections/TrendingSection';
import { NewArrivalsSection } from '../sections/NewArrivalsSection';
import { PromotionsSection } from '../sections/PromotionsSection';
import { BrandSpotlightSection } from '../sections/BrandSpotlightSection';
import { ProductFeedSection } from '../sections/ProductFeedSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ForYouSection />
      <TrendingSection />
      <NewArrivalsSection />
      <PromotionsSection />
      <BrandSpotlightSection />
      <ProductFeedSection />
    </>
  );
}
