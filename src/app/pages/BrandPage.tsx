import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as Tabs from '@radix-ui/react-tabs';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ApiError } from '../../shared/api/ApiError';
import { listProducts } from '../../shared/api/catalog';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const BRAND_DESCRIPTION_FALLBACK =
  'Эффективная косметика с прозрачными формулами и доступными ценами. Научный подход к уходу за кожей.';

const toBrandSlug = (value: string): string => value.toLowerCase().trim().replace(/\s+/g, '-');

const fromBrandSlugToLabel = (value: string): string =>
  decodeURIComponent(value)
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

export default function BrandPage() {
  const { brand } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('hits');
  const [products, setProducts] = useState<Product[]>([]);
  const [brandName, setBrandName] = useState('Бренд');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!brand) {
      setBrandName('Бренд');
      setProducts([]);
      setError('Бренд не найден.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadBrandProducts = async () => {
      setIsLoading(true);
      setError(null);

      const brandSlug = decodeURIComponent(brand).toLowerCase();
      const brandLabelFromSlug = fromBrandSlugToLabel(brandSlug);
      const brandNameQuery = brandSlug.replace(/-/g, ' ').trim();

      try {
        const primaryResponse = await listProducts({ brand: brandNameQuery });
        let items = extractProducts(primaryResponse);

        if (items.length === 0) {
          const fallbackResponse = await listProducts();
          items = extractProducts(fallbackResponse).filter((item) => {
            const brandValue = typeof item.brand === 'string' ? item.brand : '';
            return toBrandSlug(brandValue) === brandSlug;
          });
        }

        if (cancelled) {
          return;
        }

        const mappedProducts = items.map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'brand-product',
            fallbackImageUrl: FALLBACK_IMAGE,
          }),
        );
        setProducts(mappedProducts);

        if (mappedProducts.length > 0) {
          setBrandName(mappedProducts[0].brand);
        } else {
          setBrandName(brandLabelFromSlug || 'Бренд');
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (isAuthError(loadError)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setProducts([]);
        setBrandName(brandLabelFromSlug || 'Бренд');
        setError('Не удалось загрузить товары бренда из API. Попробуйте еще раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBrandProducts().catch((loadError) => {
      if (cancelled) {
        return;
      }

      if (isAuthError(loadError)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      setProducts([]);
      setError('Не удалось загрузить страницу бренда. Попробуйте еще раз.');
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [brand, location.pathname, navigate, retryKey]);

  const newProducts = useMemo(() => products.filter((product) => product.isNew), [products]);
  const hitsProducts = useMemo(() => products.slice(0, 8), [products]);
  const tabProducts = activeTab === 'new' ? newProducts : activeTab === 'all' ? products : hitsProducts;

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="relative py-12 lg:py-16 bg-gradient-to-br from-[#FFE1F2] to-pink-50 border-b border-[#FF4DB8]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4DB8]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Бренды', href: '/brands' },
              { label: brandName },
            ]}
          />

          <div className="mt-8 flex items-center gap-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white border border-[#EAE6EF] flex items-center justify-center text-3xl font-bold text-[#FF4DB8] flex-shrink-0">
              {brandName.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-2">{brandName}</h1>
              <p className="text-base text-[#6B7280] max-w-2xl">{BRAND_DESCRIPTION_FALLBACK}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge>{products.length} товаров</Badge>
                {newProducts.length > 0 && <Badge>Новинки</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {isLoading ? (
          <LoadingSpinner size="lg" text="Загружаем товары бренда..." />
        ) : error ? (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm text-[#B42318]">{error}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
            >
              Повторить
            </button>
          </div>
        ) : (
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex items-center gap-1 mb-8 pb-4 border-b border-[#EAE6EF]">
              <Tabs.Trigger
                value="hits"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
              >
                Хиты
              </Tabs.Trigger>
              <Tabs.Trigger
                value="new"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
              >
                Новинки
              </Tabs.Trigger>
              <Tabs.Trigger
                value="all"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
              >
                Все товары
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              {tabProducts.length > 0 ? (
                <ProductGrid products={tabProducts} columns={4} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  Товары для выбранной вкладки пока не найдены.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </div>
  );
}
