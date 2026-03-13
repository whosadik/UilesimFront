import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { listMyOffers, nextOffer } from '../../shared/api/offers';
import { ApiError } from '../../shared/api/ApiError';
import {
  mapOfferPayloadsToPromotions,
  type OfferPromotionCard,
  type OfferPromotionType,
} from '../../shared/offers/presentation';

type PromotionFilter = 'all' | OfferPromotionType;
type PromotionCard = OfferPromotionCard;

const FILTER_LABELS: Record<PromotionFilter, string> = {
  all: 'all',
  discount: 'discounts',
  points: '2x points',
  gift: 'gift',
  personal: 'personal',
};

export default function PromotionsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PromotionFilter>('all');
  const [promotions, setPromotions] = useState<PromotionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadPromotions = async () => {
      setIsLoading(true);
      setLoadError(null);
      setRequiresAuth(false);

      try {
        const offers = await listMyOffers();
        let mapped = mapOfferPayloadsToPromotions(offers);

        if (mapped.length === 0) {
          mapped = mapOfferPayloadsToPromotions(await nextOffer());
        }

        if (!cancelled) {
          setPromotions(mapped);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setPromotions([]);
          setRequiresAuth(true);
          return;
        }

        setPromotions([]);
        setLoadError('failed to load promotions. please try again.');
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
  }, [reloadKey]);

  const filteredPromotions = useMemo(
    () => promotions.filter((promo) => filter === 'all' || promo.type === filter),
    [filter, promotions],
  );

  const emptyMessage =
    promotions.length === 0
      ? 'there are no promotions for this account yet.'
      : 'no promotions match the selected filter.';

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'home', href: '/' }, { label: 'promotions' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">promotions</h1>
          <p className="text-base text-[#6B7280]">special offers and promo banners</p>
        </div>

        {requiresAuth ? (
          <EmptyState
            title="promotions are available after sign in"
            description="sign in to see your personal offers and bonus campaigns."
            action={{
              label: 'sign in',
              onClick: () => navigate('/login', { state: { from: '/promotions' } }),
            }}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {(Object.keys(FILTER_LABELS) as PromotionFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === value
                      ? 'bg-[#111827] text-white'
                      : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
                  }`}
                >
                  {FILTER_LABELS[value]}
                </button>
              ))}
            </div>

            {isLoading ? (
              <LoadingSpinner size="md" text="loading promotions..." />
            ) : loadError ? (
              <ErrorState
                title="failed to load promotions"
                description={loadError}
                onRetry={() => setReloadKey((value) => value + 1)}
              />
            ) : filteredPromotions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPromotions.map((promo) => (
                  <PromoBannerCard key={promo.id} {...promo} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                {emptyMessage}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

