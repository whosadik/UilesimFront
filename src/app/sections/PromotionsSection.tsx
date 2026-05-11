import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../../shared/api/ApiError';
import { clickOffer, listHomePromotions } from '../../shared/api/offers';
import { mapOfferPayloadsToPromotions, type OfferPromotionCard } from '../../shared/offers/presentation';
import { useI18n } from '../../shared/i18n/LanguageContext';

type PromoCardItem = OfferPromotionCard & {
  onClick?: () => void;
};

export function PromotionsSection() {
  const { language, messages } = useI18n();
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

        const dynamicPromos = mapOfferPayloadsToPromotions(payload.banners, language);
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
              navigate(`/promotions/offers/${promo.assignmentId}`);
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
        setError(loadError instanceof Error ? loadError.message : messages.home.promotions.errorTitle);
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
  }, [language, location.pathname, messages.home.promotions.errorTitle, navigate, retryKey]);

  return (
    <section className="relative py-12 lg:py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-[#FFF8F5] via-white/60 to-transparent"
        aria-hidden
      />
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader title={messages.home.promotions.title} />

        {error ? (
          <ErrorState
            title={messages.home.promotions.errorTitle}
            description={messages.home.promotions.errorDescription}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : requiresAuth ? (
          <EmptyState
            title={messages.home.promotions.authTitle}
            description={messages.home.promotions.authDescription}
            action={{
              label: messages.common.signIn,
              onClick: () => navigate('/login', { state: { from: location.pathname } }),
            }}
          />
        ) : !isLoading && promos.length === 0 ? (
          <EmptyState
            title={messages.home.promotions.emptyTitle}
            description={messages.home.promotions.emptyDescription}
            action={{
              label: messages.common.refresh,
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
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 via-white/40 to-transparent pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
