import { Hero } from '../components/Hero';
import { Reveal } from '../components/Reveal';
import { TrustStripSection } from '../sections/TrustStripSection';
import { LoyaltyStripSection } from '../sections/LoyaltyStripSection';
import { ForYouSection } from '../sections/ForYouSection';
import { TrendingSection } from '../sections/TrendingSection';
import { NewArrivalsSection } from '../sections/NewArrivalsSection';
import { PromotionsSection } from '../sections/PromotionsSection';
import { BrandSpotlightSection } from '../sections/BrandSpotlightSection';
import { ProductFeedSection } from '../sections/ProductFeedSection';
import { EditorialBannerSection } from '../sections/EditorialBannerSection';
import { useHomeRecommendations } from '../sections/useHomeRecommendations';
import { useI18n } from '../../shared/i18n/LanguageContext';

export default function HomePage() {
  useI18n();
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
      <Reveal>
        <TrustStripSection />
      </Reveal>
      <Reveal delay={60}>
        <LoyaltyStripSection />
      </Reveal>
      <Reveal>
        <ForYouSection
          products={forYouProducts}
          isLoading={isLoading}
          error={error}
          requiresAuth={requiresAuth}
          onRetry={retry}
          onEvent={createSectionEventHandler('for_you')}
        />
      </Reveal>
      <Reveal delay={80}>
        <EditorialBannerSection />
      </Reveal>
      <Reveal>
        <PromotionsSection />
      </Reveal>
      <Reveal>
        <TrendingSection
          products={trendingProducts}
          isLoading={isLoading}
          error={error}
          requiresAuth={requiresAuth}
          onRetry={retry}
          onEvent={createSectionEventHandler('trending')}
        />
      </Reveal>
      <Reveal>
        <BrandSpotlightSection />
      </Reveal>
      <Reveal>
        <NewArrivalsSection />
      </Reveal>
      <Reveal>
        <ProductFeedSection />
      </Reveal>
    </>
  );
}
