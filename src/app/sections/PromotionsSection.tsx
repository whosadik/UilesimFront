import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../../shared/api/ApiError';
import { clickOffer, nextOffer } from '../../shared/api/offers';
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

    const loadOffer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await nextOffer();

        if (cancelled) {
          return;
        }

        const dynamicPromo = mapOfferPayloadsToPromotions(payload)[0];
        if (!dynamicPromo) {
          setPromos([]);
          return;
        }

        setPromos([
          {
            ...dynamicPromo,
            onClick: () => {
              if (dynamicPromo.assignmentId === undefined) {
                return;
              }

              void handleOfferClick(dynamicPromo.assignmentId);
            },
          },
        ]);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setPromos([]);
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить акции');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOffer();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader title="Акции и предложения" />

        {error ? (
          <ErrorState
            title="Не удалось загрузить акции"
            description="Произошла ошибка при загрузке персонального оффера. Попробуйте ещё раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : !isLoading && promos.length === 0 ? (
          <EmptyState
            title="Акций пока нет"
            description="Сейчас нет доступных предложений. Проверьте позже."
            action={{
              label: 'Обновить',
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
