import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import type { HomeRecommendationProduct } from './useHomeRecommendations';

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

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader
          title="trending"
          subtitle="what customers are picking most often right now"
        />

        {error ? (
          <ErrorState
            title="could not load trending products"
            description="something went wrong while loading this section. try again."
            onRetry={onRetry}
          />
        ) : requiresAuth ? (
          <EmptyState
            title="trending unlocks after sign in"
            description="sign in to see picks we rank for you from recent platform activity."
            action={{
              label: 'sign in',
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title="trending is empty right now"
            description="there is not enough data yet to build this list."
            action={{
              label: 'refresh',
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
