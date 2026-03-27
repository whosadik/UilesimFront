import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import * as Tabs from '@radix-ui/react-tabs';

import { ApiError } from '../../shared/api/ApiError';
import { getBrand, type BrandDetail } from '../../shared/api/brands';
import { listProducts } from '../../shared/api/catalog';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { fromBrandSlugToLabel } from '../utils/brandSlug';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';
import { useI18n } from '../../shared/i18n/LanguageContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const brandPageCopy = {
  ru: {
    categories: { skincare: 'Уход за кожей', haircare: 'Уход за волосами', makeup: 'Макияж', fragrance: 'Ароматы' },
    brandNotFound: 'Бренд не найден.',
    loadError: 'Не удалось загрузить страницу бренда. Попробуйте еще раз.',
    brandFallback: 'Бренд',
    descriptionFallback: 'Описание бренда пока недоступно.',
    productsCount: (count: number) => `${count} товаров`,
    newCount: (count: number) => `${count} новинок`,
    saleCount: (count: number) => `${count} со скидкой`,
    loading: 'Загружаем товары бренда...',
    errorTitle: 'Не удалось загрузить бренд',
    hits: 'Хиты',
    new: 'Новинки',
    allProducts: 'Все товары',
    empty: 'В этой вкладке пока нет товаров.',
  },
  kk: {
    categories: { skincare: 'Тері күтімі', haircare: 'Шаш күтімі', makeup: 'Макияж', fragrance: 'Хош иістер' },
    brandNotFound: 'Бренд табылмады.',
    loadError: 'Бренд бетін жүктеу мүмкін болмады. Қайталап көріңіз.',
    brandFallback: 'Бренд',
    descriptionFallback: 'Бренд сипаттамасы әзірге қолжетімсіз.',
    productsCount: (count: number) => `${count} тауар`,
    newCount: (count: number) => `${count} жаңалық`,
    saleCount: (count: number) => `${count} жеңілдікпен`,
    loading: 'Бренд тауарларын жүктеп жатырмыз...',
    errorTitle: 'Брендті жүктеу мүмкін болмады',
    hits: 'Хиттер',
    new: 'Жаңалықтар',
    allProducts: 'Барлық тауарлар',
    empty: 'Бұл қойындыда әзірге тауарлар жоқ.',
  },
  en: {
    categories: { skincare: 'Skincare', haircare: 'Haircare', makeup: 'Makeup', fragrance: 'Fragrance' },
    brandNotFound: 'Brand not found.',
    loadError: 'Could not load the brand page. Please try again.',
    brandFallback: 'Brand',
    descriptionFallback: 'Brand description is not available yet.',
    productsCount: (count: number) => `${count} items`,
    newCount: (count: number) => `${count} new items`,
    saleCount: (count: number) => `${count} on sale`,
    loading: 'Loading brand products...',
    errorTitle: 'Could not load brand',
    hits: 'Hits',
    new: 'New arrivals',
    allProducts: 'All products',
    empty: 'There are no products in this tab yet.',
  },
} as const;

export default function BrandPage() {
  const { language, messages } = useI18n();
  const copy = brandPageCopy[language];
  const { brand } = useParams();

  const [activeTab, setActiveTab] = useState('hits');
  const [products, setProducts] = useState<Product[]>([]);
  const [brandDetails, setBrandDetails] = useState<BrandDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!brand) {
      setBrandDetails(null);
      setProducts([]);
      setError(copy.brandNotFound);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadBrandPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const brandResponse = await getBrand(brand);
        const productsResponse = await listProducts({ brand: brandResponse.name });

        if (cancelled) {
          return;
        }

        const mappedProducts = extractProducts(productsResponse).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'brand-product',
            fallbackImageUrl: FALLBACK_IMAGE,
          }),
        );

        setBrandDetails(brandResponse);
        setProducts(mappedProducts);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setBrandDetails(null);
          setProducts([]);
          return;
        }

        setBrandDetails(null);
        setProducts([]);
        setError(
          loadError instanceof ApiError && loadError.status === 404
            ? copy.brandNotFound
            : copy.loadError,
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBrandPage();

    return () => {
      cancelled = true;
    };
  }, [brand, copy.brandNotFound, copy.loadError, retryKey]);

  const brandName = brandDetails?.name ?? (brand ? fromBrandSlugToLabel(brand) || copy.brandFallback : copy.brandFallback);
  const newProducts = useMemo(() => products.filter((product) => product.isNew), [products]);
  const hitsProducts = useMemo(() => products.slice(0, 8), [products]);
  const tabProducts = activeTab === 'new' ? newProducts : activeTab === 'all' ? products : hitsProducts;

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="relative border-b border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 py-12 lg:py-16">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FF4DB8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1160px] px-6 lg:px-[140px]">
          <Breadcrumbs
            items={[
              { label: messages.common.home, href: '/' },
              { label: messages.navbar.mainMenu.brands, href: '/brands' },
              { label: brandName },
            ]}
          />

          <div className="mt-8 flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#EAE6EF] bg-white text-3xl font-bold text-[#FF4DB8] lg:h-24 lg:w-24">
              {brandDetails?.logo_letter ?? brandName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-[#111827] lg:text-4xl">{brandName}</h1>
              <p className="max-w-2xl text-base text-[#6B7280]">
                {brandDetails?.description ?? copy.descriptionFallback}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{copy.productsCount(brandDetails?.product_count ?? products.length)}</Badge>
                {(brandDetails?.new_products_count ?? newProducts.length) > 0 ? (
                  <Badge>{copy.newCount(brandDetails?.new_products_count ?? newProducts.length)}</Badge>
                ) : null}
                {(brandDetails?.sale_products_count ?? 0) > 0 ? (
                  <Badge>{copy.saleCount(brandDetails?.sale_products_count)}</Badge>
                ) : null}
                {brandDetails?.categories.slice(0, 2).map((category) => (
                  <Badge key={category}>{copy.categories[category as keyof typeof copy.categories] ?? category}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        {isLoading ? (
          <LoadingSpinner size="lg" text={copy.loading} />
        ) : error ? (
          <ErrorState
            title={copy.errorTitle}
            description={error}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : (
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="mb-8 flex items-center gap-1 border-b border-[#EAE6EF] pb-4">
              <Tabs.Trigger
                value="hits"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                {copy.hits}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="new"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                {copy.new}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="all"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                {copy.allProducts}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              {tabProducts.length > 0 ? (
                <ProductGrid products={tabProducts} columns={4} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  {copy.empty}
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </div>
  );
}
