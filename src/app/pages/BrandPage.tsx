import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

const categoryLabels: Record<string, string> = {
  skincare: 'Skincare',
  haircare: 'Haircare',
  makeup: 'Makeup',
  fragrance: 'Fragrance',
};

export default function BrandPage() {
  const { brand } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
      setError('Бренд не найден.');
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

        if (isAuthError(loadError)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setBrandDetails(null);
        setProducts([]);
        setError(
          loadError instanceof ApiError && loadError.status === 404
            ? 'Бренд не найден.'
            : 'Не удалось загрузить страницу бренда из API. Попробуйте ещё раз.',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBrandPage();

    return () => {
      cancelled = true;
    };
  }, [brand, location.pathname, navigate, retryKey]);

  const brandName = brandDetails?.name ?? (brand ? fromBrandSlugToLabel(brand) || 'Бренд' : 'Бренд');
  const newProducts = useMemo(() => products.filter((product) => product.isNew), [products]);
  const hitsProducts = useMemo(() => products.slice(0, 8), [products]);
  const tabProducts = activeTab === 'new' ? newProducts : activeTab === 'all' ? products : hitsProducts;

  return (
    <div className="min-h-screen pt-20 lg:pt-28">
      <div className="relative border-b border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 py-12 lg:py-16">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FF4DB8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1160px] px-6 lg:px-[140px]">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Бренды', href: '/brands' },
              { label: brandName },
            ]}
          />

          <div className="mt-8 flex items-center gap-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-[#EAE6EF] bg-white text-3xl font-bold text-[#FF4DB8] lg:h-24 lg:w-24">
              {brandDetails?.logo_letter ?? brandName.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-[#111827] lg:text-4xl">{brandName}</h1>
              <p className="max-w-2xl text-base text-[#6B7280]">
                {brandDetails?.description ?? 'Описание бренда пока недоступно.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{brandDetails?.product_count ?? products.length} товаров</Badge>
                {(brandDetails?.new_products_count ?? newProducts.length) > 0 && (
                  <Badge>{brandDetails?.new_products_count ?? newProducts.length} новинок</Badge>
                )}
                {(brandDetails?.sale_products_count ?? 0) > 0 && (
                  <Badge>{brandDetails?.sale_products_count} со скидкой</Badge>
                )}
                {brandDetails?.categories.slice(0, 2).map((category) => (
                  <Badge key={category}>{categoryLabels[category] ?? category}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        {isLoading ? (
          <LoadingSpinner size="lg" text="Загружаем товары бренда..." />
        ) : error ? (
          <ErrorState
            title="Не удалось загрузить бренд"
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
                Хиты
              </Tabs.Trigger>
              <Tabs.Trigger
                value="new"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                Новинки
              </Tabs.Trigger>
              <Tabs.Trigger
                value="all"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                Все товары
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              {tabProducts.length > 0 ? (
                <ProductGrid products={tabProducts} columns={4} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  Для выбранной вкладки товары пока не найдены.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>

      <div className="hidden">{/* Source: GET /api/brands/:slug + GET /api/products/?brand=... */}</div>
    </div>
  );
}
