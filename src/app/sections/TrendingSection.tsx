import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import type { HomeRecommendationProduct } from './useHomeRecommendations';
import { useI18n } from '../../shared/i18n/LanguageContext';

interface TrendingSectionProps {
  products: HomeRecommendationProduct[];
  isLoading: boolean;
  error: string | null;
  requiresAuth: boolean;
  onRetry: () => void;
  onEvent?: (eventType: string, data: any) => void;
}

export function TrendingSection({
  products,
  isLoading,
  error,
  requiresAuth,
  onRetry,
  onEvent,
}: TrendingSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages } = useI18n();

  return (
    <section className="py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
        <CarouselHeader
          title={messages.home.trending.title}
          subtitle={messages.home.trending.subtitle}
          eyebrow="LIVE NOW"
          showViewAll={false}
          live
        />

        {error ? (
          <ErrorState
            title={messages.home.trending.errorTitle}
            description={messages.home.trending.errorDescription}
            onRetry={onRetry}
          />
        ) : requiresAuth ? (
          <EmptyState
            title={messages.home.trending.authTitle}
            description={messages.home.trending.authDescription}
            action={{
              label: messages.common.signIn,
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title={messages.home.trending.emptyTitle}
            description={messages.home.trending.emptyDescription}
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
