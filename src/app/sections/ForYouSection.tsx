import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import type { HomeRecommendationProduct } from './useHomeRecommendations';

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

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader
          title="for you"
          subtitle="picked from your profile and recent activity"
        />

        {error ? (
          <ErrorState
            title="could not load recommendations"
            description="something went wrong while loading this section. try again."
            onRetry={onRetry}
          />
        ) : requiresAuth ? (
          <EmptyState
            title="recommendations unlock after sign in"
            description="sign in to see a personalized feed and keep your recommendation history."
            action={{
              label: 'sign in',
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title="no recommendations yet"
            description="complete your profile and check back later for a more tailored feed."
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
