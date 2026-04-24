import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import {
  listMyOffers,
  listPromotionBanners,
  nextOffer,
  type PromotionBanner,
} from '../../shared/api/offers';
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
    campaignsTitle: 'Текущие кампании',
    details: 'Подробнее',
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
    campaignsTitle: 'Ағымдағы науқандар',
    details: 'Толығырақ',
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
    campaignsTitle: 'Current campaigns',
    details: 'Learn more',
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
  const [campaignBanners, setCampaignBanners] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listPromotionBanners()
      .then((res) => {
        if (!cancelled) {
          setCampaignBanners(res.banners ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCampaignBanners([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

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

        {campaignBanners.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">{copy.campaignsTitle}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignBanners.map((banner) => (
                <Link
                  key={banner.id}
                  to={`/promotions/${banner.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20 hover:shadow-xl transition-all aspect-[16/9] block"
                >
                  {banner.banner_url && (
                    <img
                      src={banner.banner_url}
                      alt={banner.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="text-base font-semibold leading-tight">{banner.name}</div>
                    {banner.promo_text && (
                      <div className="text-sm text-white/90 mt-1 line-clamp-2">{banner.promo_text}</div>
                    )}
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-white text-[#111827] text-xs font-medium">
                      {copy.details} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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

