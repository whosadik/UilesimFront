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
import { useI18n } from '../../shared/i18n/LanguageContext';

const promotionsPageCopy = {
  ru: {
    filters: { all: 'Все', discount: 'Скидки', points: '2x баллы', gift: 'Подарки', personal: 'Персональные' },
    loadError: 'Не удалось загрузить акции. Попробуйте еще раз.',
    emptyAccount: 'Для этого аккаунта пока нет акций.',
    emptyFiltered: 'Нет акций, подходящих под выбранный фильтр.',
    title: 'Акции',
    subtitle: 'Специальные предложения и промо-баннеры',
    authTitle: 'Акции доступны после входа',
    authDescription: 'Войдите, чтобы увидеть персональные предложения и бонусные кампании.',
    signIn: 'Войти',
    loading: 'Загружаем акции...',
    errorTitle: 'Не удалось загрузить акции',
  },
  kk: {
    filters: { all: 'Барлығы', discount: 'Жеңілдіктер', points: '2x ұпай', gift: 'Сыйлықтар', personal: 'Жеке' },
    loadError: 'Акцияларды жүктеу мүмкін болмады. Қайталап көріңіз.',
    emptyAccount: 'Бұл аккаунт үшін әзірге акциялар жоқ.',
    emptyFiltered: 'Таңдалған сүзгіге сай акциялар жоқ.',
    title: 'Акциялар',
    subtitle: 'Арнайы ұсыныстар мен промо-баннерлер',
    authTitle: 'Акциялар кіруден кейін қолжетімді',
    authDescription: 'Жеке ұсыныстар мен бонустық науқандарды көру үшін кіріңіз.',
    signIn: 'Кіру',
    loading: 'Акцияларды жүктеп жатырмыз...',
    errorTitle: 'Акцияларды жүктеу мүмкін болмады',
  },
  en: {
    filters: { all: 'All', discount: 'Discounts', points: '2x points', gift: 'Gifts', personal: 'Personal' },
    loadError: 'Could not load promotions. Please try again.',
    emptyAccount: 'There are no promotions for this account yet.',
    emptyFiltered: 'No promotions match the selected filter.',
    title: 'Promotions',
    subtitle: 'Special offers and promo banners',
    authTitle: 'Promotions are available after sign in',
    authDescription: 'Sign in to see personal offers and bonus campaigns.',
    signIn: 'Sign in',
    loading: 'Loading promotions...',
    errorTitle: 'Could not load promotions',
  },
} as const;

type PromotionFilter = 'all' | OfferPromotionType;
type PromotionCard = OfferPromotionCard;

export default function PromotionsPage() {
  const { language, messages } = useI18n();
  const copy = promotionsPageCopy[language];
  const filterLabels: Record<PromotionFilter, string> = copy.filters;
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
        let mapped = mapOfferPayloadsToPromotions(offers, language);

        if (mapped.length === 0) {
          mapped = mapOfferPayloadsToPromotions(await nextOffer(), language);
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
        setLoadError(copy.loadError);
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
  }, [copy.loadError, language, reloadKey]);

  const filteredPromotions = useMemo(
    () => promotions.filter((promo) => filter === 'all' || promo.type === filter),
    [filter, promotions],
  );

  const emptyMessage =
    promotions.length === 0
      ? copy.emptyAccount
      : copy.emptyFiltered;

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.title }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">{copy.title}</h1>
          <p className="text-base text-[#6B7280]">{copy.subtitle}</p>
        </div>

        {requiresAuth ? (
          <EmptyState
            title={copy.authTitle}
            description={copy.authDescription}
            action={{
              label: copy.signIn,
              onClick: () => navigate('/login', { state: { from: '/promotions' } }),
            }}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-8">
              {(Object.keys(filterLabels) as PromotionFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === value
                      ? 'bg-[#111827] text-white'
                      : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
                  }`}
                >
                  {filterLabels[value]}
                </button>
              ))}
            </div>

            {isLoading ? (
              <LoadingSpinner size="md" text={copy.loading} />
            ) : loadError ? (
              <ErrorState
                title={copy.errorTitle}
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

