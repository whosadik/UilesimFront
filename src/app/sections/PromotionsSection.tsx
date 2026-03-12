import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../../shared/api/ApiError';
import { clickOffer, listHomePromotions } from '../../shared/api/offers';
import { mapOfferPayloadsToPromotions, type OfferPromotionCard } from '../../shared/offers/presentation';

type PromoCardItem = OfferPromotionCard & {
  onClick?: () => void;
};

export function PromotionsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [promos, setPromos] = useState<PromoCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const handleOfferClick = async (assignmentId: number) => {
      try {
        await clickOffer(assignmentId, { source: 'home_promotions' });
      } catch (clickError) {
        if (clickError instanceof ApiError && (clickError.status === 401 || clickError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
        }
      }
    };

    const loadPromotions = async () => {
      setIsLoading(true);
      setError(null);
      setRequiresAuth(false);

      try {
        const payload = await listHomePromotions();

        if (cancelled) {
          return;
        }

        const dynamicPromos = mapOfferPayloadsToPromotions(payload.banners);
        if (dynamicPromos.length === 0) {
          setPromos([]);
          return;
        }

        setPromos(
          dynamicPromos.map((promo) => ({
            ...promo,
            onClick: () => {
              if (promo.assignmentId === undefined) {
                return;
              }

              void handleOfferClick(promo.assignmentId);
            },
          })),
        );
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setPromos([]);
          setRequiresAuth(true);
          return;
        }

        setPromos([]);
        setError(loadError instanceof Error ? loadError.message : 'could not load promotions');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPromotions();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader title="promotions and offers" />

        {error ? (
          <ErrorState
            title="could not load promotions"
            description="something went wrong while loading the home offers. try again."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : requiresAuth ? (
          <EmptyState
            title="promotions are available after sign in"
            description="sign in to see personalized offer banners on the home page."
            action={{
              label: 'sign in',
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && promos.length === 0 ? (
          <EmptyState
            title="no promotions yet"
            description="there are no active offer banners for the home page right now."
            action={{
              label: 'refresh',
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {isLoading
                ? [...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="min-w-[280px] md:min-w-[320px] rounded-2xl border border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 p-6 animate-pulse"
                    >
                      <div className="h-4 w-20 bg-white/80 rounded mb-4" />
                      <div className="h-7 w-2/3 bg-white/80 rounded mb-3" />
                      <div className="h-4 w-full bg-white/70 rounded mb-2" />
                      <div className="h-4 w-4/5 bg-white/70 rounded mb-6" />
                      <div className="h-10 w-32 bg-white rounded-xl" />
                    </div>
                  ))
                : promos.map((promo) => <PromoBannerCard key={promo.id} {...promo} />)}
            </div>

            <div className="lg:hidden relative -mt-4 h-4">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-pink-50/30 via-pink-50/20 to-transparent pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
