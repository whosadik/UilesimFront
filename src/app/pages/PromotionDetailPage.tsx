import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { Button } from '../components/Button';
import { ProductGrid } from '../components/ProductGrid';
import { getPromotionBanner, type PromotionDetailResponse } from '../../shared/api/offers';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../shared/catalog/presentation';
import { mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

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

const promotionProductsCopy = {
  ru: {
    brandsTitle: 'Бренды',
    productIdsTitle: 'Конкретные товары',
    productsTitle: 'Товары по акции',
    productsCount: (count: number) => `Подходит товаров: ${count}`,
    productsShown: (shown: number, total: number) => `Показаны первые ${shown} из ${total}. Остальные доступны в каталоге со скидкой.`,
    emptyProducts: 'Для этой акции пока не найдено подходящих товаров.',
    offerProductsCount: (count: number) => `Товаров участвует: ${count}`,
  },
  kk: {
    brandsTitle: 'Брендтер',
    productIdsTitle: 'Нақты тауарлар',
    productsTitle: 'Акциядағы тауарлар',
    productsCount: (count: number) => `Сәйкес тауарлар: ${count}`,
    productsShown: (shown: number, total: number) => `Алғашқы ${shown} / ${total} тауар көрсетілді. Қалғандары каталогта жеңілдікпен қолжетімді.`,
    emptyProducts: 'Бұл акцияға сәйкес тауарлар әзірге табылмады.',
    offerProductsCount: (count: number) => `${count} тауар қатысады`,
  },
  en: {
    brandsTitle: 'Brands',
    productIdsTitle: 'Specific products',
    productsTitle: 'Products in this promotion',
    productsCount: (count: number) => `Eligible products: ${count}`,
    productsShown: (shown: number, total: number) => `Showing the first ${shown} of ${total}. The rest are available in the catalog with the discount.`,
    emptyProducts: 'No matching products were found for this promotion yet.',
    offerProductsCount: (count: number) => `${count} products included`,
  },
} as const;

const extraScopeCopy = {
  ru: { brand: 'на бренд' },
  kk: { brand: 'брендке' },
  en: { brand: 'on brand' },
} as const;

export default function PromotionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, messages } = useI18n();
  const copy = copyByLanguage[language];
  const productCopy = promotionProductsCopy[language];

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
  const campaignCategories = campaign?.allowed_categories ?? [];
  const campaignSteps = campaign?.allowed_steps ?? [];
  const campaignBrands = campaign?.allowed_brands ?? [];
  const campaignProductIds = campaign?.allowed_product_ids ?? [];
  const campaignProducts = useMemo(
    () =>
      (data?.products ?? []).map((item, index) =>
        mapApiProductToGrid(item, index, {
          fallbackIdPrefix: 'promotion-product',
          fallbackImageUrl: FALLBACK_IMAGE_URL,
          fallbackProductLabel: (productId) => `Product #${productId}`,
        }),
      ),
    [data?.products],
  );
  const productsCount = data?.products_count ?? campaignProducts.length;

  const formatValue = (offerType: string, value: string) => {
    if (offerType === 'discount') return `-${value}%`;
    if (offerType === 'points_multiplier') return `×${value}`;
    return value;
  };

  const formatCategory = (value: string) =>
    formatCatalogCategoryLabel(value, language) ?? value;

  const formatStep = (value: string) =>
    formatCatalogProductTypeLabel(value, language) ?? value;

  const formatScope = (value: string) =>
    (copy.scope as Record<string, string>)[value] ??
    (extraScopeCopy[language] as Record<string, string>)[value] ??
    value;

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="app-page-container py-8 lg:py-12">
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

            {(campaignCategories.length > 0 ||
              campaignSteps.length > 0 ||
              campaignBrands.length > 0 ||
              campaignProductIds.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {campaignCategories.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{copy.categoriesTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaignCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-pink-700 border border-pink-200"
                        >
                          {formatCategory(cat)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {campaignBrands.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{productCopy.brandsTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaignBrands.map((brand) => (
                        <span
                          key={brand}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-pink-700 border border-pink-200"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {campaignSteps.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{copy.stepsTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaignSteps.map((step) => (
                        <span
                          key={step}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {formatStep(step)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {campaignProductIds.length > 0 && (
                  <div className="rounded-xl border border-[#EAE6EF] bg-white p-4">
                    <div className="text-xs text-[#9CA3AF] mb-2">{productCopy.productIdsTitle}</div>
                    <div className="flex flex-wrap gap-2">
                      {campaignProductIds.map((productId) => (
                        <span
                          key={productId}
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          #{productId}
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
                        {formatScope(offer.target_scope)}
                      </div>
                      {typeof offer.products_count === 'number' && (
                        <div className="mt-2 text-xs font-medium text-[#111827]">
                          {productCopy.offerProductsCount(offer.products_count)}
                        </div>
                      )}
                      {offer.allowed_categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {offer.allowed_categories.map((c) => (
                            <span key={c} className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                              #{formatCategory(c)}
                            </span>
                          ))}
                        </div>
                      )}
                      {(offer.allowed_brands ?? []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(offer.allowed_brands ?? []).map((brand) => (
                            <span key={brand} className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                              #{brand}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold text-[#111827]">{productCopy.productsTitle}</h2>
                <div className="text-sm text-[#6B7280]">{productCopy.productsCount(productsCount)}</div>
              </div>
              {campaignProducts.length === 0 ? (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  {productCopy.emptyProducts}
                </div>
              ) : (
                <>
                  <ProductGrid products={campaignProducts} columns={3} />
                  {productsCount > campaignProducts.length && (
                    <p className="mt-4 text-sm text-[#6B7280]">
                      {productCopy.productsShown(campaignProducts.length, productsCount)}
                    </p>
                  )}
                </>
              )}
            </div>

            <Button variant="primary" onClick={() => navigate('/catalog?sale=true')}>
              {copy.cta}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
