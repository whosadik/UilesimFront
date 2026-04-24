import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { Button } from '../components/Button';
import { getPromotionBanner, type PromotionDetailResponse } from '../../shared/api/offers';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';

const copyByLanguage = {
  ru: {
    breadcrumbPromotions: 'Акции',
    back: 'Все акции',
    validFrom: 'Действует с',
    validUntil: 'Действует до',
    offersTitle: 'Что входит в кампанию',
    emptyOffers: 'Офферы для этой кампании пока не настроены.',
    categoriesTitle: 'Категории',
    stepsTitle: 'Шаги рутины',
    loading: 'Загружаем кампанию...',
    errorTitle: 'Не удалось загрузить кампанию',
    notFound: 'Кампания не найдена',
    cta: 'К каталогу',
    offerType: {
      discount: 'Скидка',
      points_multiplier: 'Множитель баллов',
      gift: 'Подарок',
    } as Record<string, string>,
    scope: {
      cart: 'на всю корзину',
      category: 'на категорию',
      product_type: 'на тип продукта',
      product_id: 'на конкретный товар',
    } as Record<string, string>,
  },
  kk: {
    breadcrumbPromotions: 'Акциялар',
    back: 'Барлық акциялар',
    validFrom: 'Басталу күні',
    validUntil: 'Аяқталу күні',
    offersTitle: 'Науқан аясындағы ұсыныстар',
    emptyOffers: 'Бұл науқан үшін офферлер әзірге жоқ.',
    categoriesTitle: 'Категориялар',
    stepsTitle: 'Рутина қадамдары',
    loading: 'Науқанды жүктеп жатырмыз...',
    errorTitle: 'Науқанды жүктеу мүмкін болмады',
    notFound: 'Науқан табылмады',
    cta: 'Каталогқа өту',
    offerType: {
      discount: 'Жеңілдік',
      points_multiplier: 'Ұпай көбейткіші',
      gift: 'Сыйлық',
    } as Record<string, string>,
    scope: {
      cart: 'бүкіл себетке',
      category: 'категорияға',
      product_type: 'өнім түріне',
      product_id: 'нақты өнімге',
    } as Record<string, string>,
  },
  en: {
    breadcrumbPromotions: 'Promotions',
    back: 'All promotions',
    validFrom: 'Valid from',
    validUntil: 'Valid until',
    offersTitle: "What's inside this campaign",
    emptyOffers: 'No offers configured for this campaign yet.',
    categoriesTitle: 'Categories',
    stepsTitle: 'Routine steps',
    loading: 'Loading campaign...',
    errorTitle: 'Could not load campaign',
    notFound: 'Campaign not found',
    cta: 'Go to catalog',
    offerType: {
      discount: 'Discount',
      points_multiplier: 'Points multiplier',
      gift: 'Gift',
    } as Record<string, string>,
    scope: {
      cart: 'on the whole cart',
      category: 'on category',
      product_type: 'on product type',
      product_id: 'on a specific product',
    } as Record<string, string>,
  },
} as const;

export default function PromotionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, messages } = useI18n();
  const copy = copyByLanguage[language];

  const [data, setData] = useState<PromotionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    getPromotionBanner(id)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage(copy.notFound);
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(copy.errorTitle);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey, copy.errorTitle, copy.notFound]);

  const campaign = data?.campaign;
  const offers = data?.offers ?? [];

  const formatValue = (offerType: string, value: string) => {
    if (offerType === 'discount') return `-${value}%`;
    if (offerType === 'points_multiplier') return `×${value}`;
    return value;
  };

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: messages.common.home, href: '/' },
              { label: copy.breadcrumbPromotions, href: '/promotions' },
              { label: campaign?.name ?? '...' },
            ]}
          />
        </div>

        <Link to="/promotions" className="inline-block mb-6 text-sm text-[#6B7280] hover:text-[#111827]">
          ← {copy.back}
        </Link>

        {isLoading ? (
          <LoadingSpinner size="md" text={copy.loading} />
        ) : errorMessage ? (
          <ErrorState
            title={copy.errorTitle}
            description={errorMessage}
            onRetry={() => setReloadKey((v) => v + 1)}
          />
        ) : campaign ? (
          <>
            {campaign.banner_url && (
              <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[21/9] bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20">
                <img
                  src={campaign.banner_url}
                  alt={campaign.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">{campaign.name}</h1>

            {campaign.promo_text && (
              <p className="text-lg text-[#374151] leading-relaxed mb-6 whitespace-pre-line">
                {campaign.promo_text}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {campaign.start_date && (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                  <div className="text-xs text-[#9CA3AF] mb-1">{copy.validFrom}</div>
                  <div className="text-sm font-medium text-[#111827]">{campaign.start_date}</div>
                </div>
              )}
              {campaign.end_date && (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                  <div className="text-xs text-[#9CA3AF] mb-1">{copy.validUntil}</div>
                  <div className="text-sm font-medium text-[#111827]">{campaign.end_date}</div>
                </div>
              )}
            </div>

            {(campaign.allowed_categories.length > 0 || campaign.allowed_steps.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {campaign.allowed_categories.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{copy.categoriesTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.allowed_categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-pink-700 border border-pink-200"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {campaign.allowed_steps.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{copy.stepsTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.allowed_steps.map((step) => (
                        <span
                          key={step}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#111827] mb-4">{copy.offersTitle}</h2>
              {offers.length === 0 ? (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  {copy.emptyOffers}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-xl border border-[#EAE6EF] bg-white p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="font-semibold text-[#111827]">{offer.name}</div>
                        <span className="inline-flex flex-shrink-0 px-2 py-0.5 rounded-full text-xs bg-pink-50 text-pink-700 border border-pink-200 font-medium">
                          {formatValue(offer.offer_type, offer.value)}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {copy.offerType[offer.offer_type] ?? offer.offer_type}{' '}
                        {copy.scope[offer.target_scope] ?? offer.target_scope}
                      </div>
                      {offer.allowed_categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {offer.allowed_categories.map((c) => (
                            <span key={c} className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                              #{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="primary" onClick={() => navigate('/catalog')}>
              {copy.cta}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
