import { Hero } from '../components/Hero';
import { ForYouSection } from '../sections/ForYouSection';
import { TrendingSection } from '../sections/TrendingSection';
import { NewArrivalsSection } from '../sections/NewArrivalsSection';
import { PromotionsSection } from '../sections/PromotionsSection';
import { BrandSpotlightSection } from '../sections/BrandSpotlightSection';
import { ProductFeedSection } from '../sections/ProductFeedSection';
import { useHomeRecommendations } from '../sections/useHomeRecommendations';

export default function HomePage() {
  const {
    forYouProducts,
    trendingProducts,
    isLoading,
    error,
    requiresAuth,
    retry,
    createSectionEventHandler,
  } = useHomeRecommendations();

  return (
    <>
      <Hero />
      <ForYouSection
        products={forYouProducts}
        isLoading={isLoading}
        error={error}
        requiresAuth={requiresAuth}
        onRetry={retry}
        onEvent={createSectionEventHandler('for_you')}
      />
      <TrendingSection
        products={trendingProducts}
        isLoading={isLoading}
        error={error}
        requiresAuth={requiresAuth}
        onRetry={retry}
        onEvent={createSectionEventHandler('trending')}
      />
      <NewArrivalsSection />
      <PromotionsSection />
      <BrandSpotlightSection />
      <ProductFeedSection />
    </>
  );
}
