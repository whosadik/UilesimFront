import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import type { HomeRecommendationProduct } from './useHomeRecommendations';
import { useI18n } from '../../shared/i18n/LanguageContext';

interface ForYouSectionProps {
  products: HomeRecommendationProduct[];
  isLoading: boolean;
  error: string | null;
  requiresAuth: boolean;
  onRetry: () => void;
  onEvent?: (eventType: string, data: any) => void;
}

export function ForYouSection({
  products,
  isLoading,
  error,
  requiresAuth,
  onRetry,
  onEvent,
}: ForYouSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages } = useI18n();

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader
          title={messages.home.forYou.title}
          subtitle={messages.home.forYou.subtitle}
          eyebrow="PERSONAL"
          showViewAll={false}
        />

        {error ? (
          <ErrorState
            title={messages.home.forYou.errorTitle}
            description={messages.home.forYou.errorDescription}
            onRetry={onRetry}
          />
        ) : requiresAuth ? (
          <EmptyState
            title={messages.home.forYou.authTitle}
            description={messages.home.forYou.authDescription}
            action={{
              label: messages.common.signIn,
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title={messages.home.forYou.emptyTitle}
            description={messages.home.forYou.emptyDescription}
            action={{
              label: messages.common.refresh,
              onClick: onRetry,
            }}
          />
        ) : (
          <ProductCarousel products={products} loading={isLoading} onEvent={onEvent} />
        )}
      </div>
    </section>
  );
}
