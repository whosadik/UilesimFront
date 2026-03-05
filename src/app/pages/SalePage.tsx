import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Percent } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';

type ApiProduct = Record<string, unknown>;

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const FALLBACK_SALE_PRODUCTS: Product[] = [
  {
    id: 'fallback-1',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    category: 'skincare',
    discount: 19,
  },
  {
    id: 'fallback-2',
    name: 'Gentle Cleanser',
    brand: 'Cetaphil',
    price: 699,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    category: 'skincare',
    discount: 22,
  },
];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

const extractProducts = (payload: unknown): ApiProduct[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is ApiProduct => Boolean(toRecord(item)));
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: unknown[] }).results.filter(
      (item): item is ApiProduct => Boolean(toRecord(item)),
    );
  }

  return [];
};

const mapApiProductToGrid = (item: ApiProduct, index: number): Product => {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `sale-product-${index}`;
  const price = toNumber(item.price) ?? 0;
  const originalPrice = toNumber(item.original_price);
  const imageUrls = toStringArray(item.image_urls);
  const image =
    (typeof item.image_url === 'string' && item.image_url) ||
    (typeof item.image === 'string' && item.image) ||
    imageUrls[0] ||
    FALLBACK_IMAGE_URL;

  let discount = toNumber(item.discount);
  if (discount === undefined && originalPrice && originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return {
    id,
    name: (typeof item.name === 'string' && item.name.trim()) || `Товар #${id}`,
    brand: (typeof item.brand === 'string' && item.brand.trim()) || 'Uilesim',
    price: Math.max(0, Math.round(price)),
    originalPrice: originalPrice !== undefined ? Math.max(0, Math.round(originalPrice)) : undefined,
    image,
    category:
      (typeof item.category === 'string' && item.category) ||
      (typeof item.product_type === 'string' && item.product_type) ||
      'skincare',
    discount: discount !== undefined ? Math.max(0, Math.round(discount)) : undefined,
    inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
  };
};

export default function SalePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [saleProducts, setSaleProducts] = useState<Product[]>(FALLBACK_SALE_PRODUCTS);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadSaleProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts();
        const mapped = extractProducts(response).map(mapApiProductToGrid);
        const discounted = mapped.filter((item) => (item.discount ?? 0) > 0);

        if (!cancelled) {
          if (discounted.length > 0) {
            setSaleProducts(discounted);
            setIsUsingFallback(false);
          } else {
            setSaleProducts(FALLBACK_SALE_PRODUCTS);
            setIsUsingFallback(true);
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setLoadError('Не удалось загрузить товары со скидкой из API. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSaleProducts();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, reloadKey]);

  const productCount = saleProducts.length;

  const headerSubtitle = useMemo(
    () =>
      isUsingFallback
        ? 'Подборка специальных предложений'
        : `${productCount} товаров со специальными ценами`,
    [isUsingFallback, productCount],
  );

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Скидки' }]} />
        </div>

        <div className="mb-8 p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#FF4DB8] flex items-center justify-center">
              <Percent className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-2">
                Скидки до −50%
              </h1>
              <p className="text-base text-[#6B7280]">
                {headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text="Загружаем скидки..." />
        ) : loadError ? (
          <ErrorState
            title="Не удалось загрузить скидки"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : productCount > 0 ? (
          <ProductGrid products={saleProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            Сейчас нет доступных товаров со скидкой.
          </div>
        )}
      </div>

      <div className="hidden">
        {/* Source: GET /api/products/, fallback is used if API has no discount fields */}
      </div>
    </div>
  );
}
