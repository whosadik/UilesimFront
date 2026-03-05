import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';

type BrandProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  isNew?: boolean;
  inStock?: boolean;
  pointsEarned?: number;
};

type ApiProduct = Record<string, unknown>;

type BrandData = {
  name: string;
  productCount: number;
  products: BrandProduct[];
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

function toNumber(value: unknown): number | undefined {
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
}

function mapApiProduct(item: ApiProduct, index: number): BrandProduct {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `product-${index}`;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : `Товар #${id}`;
  const brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand : 'Uilesim';
  const price = toNumber(item.price) ?? 0;
  const originalPrice = toNumber(item.original_price);
  const discount =
    toNumber(item.discount) ??
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined);

  return {
    id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    image:
      (typeof item.image_url === 'string' && item.image_url) ||
      (typeof item.image === 'string' && item.image) ||
      FALLBACK_IMAGE,
    category:
      (typeof item.category === 'string' && item.category) ||
      (typeof item.product_type === 'string' && item.product_type) ||
      'skincare',
    isNew: Boolean(item.is_new),
    inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
    pointsEarned: toNumber(item.points_earned),
  };
}

function extractItems(payload: unknown): ApiProduct[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)
      ? (payload as { results: unknown[] }).results
      : [];

  return rawItems.filter((item): item is ApiProduct => Boolean(item) && typeof item === 'object');
}

function getBrandData(payload: unknown): BrandData | null {
  const items = extractItems(payload);
  if (items.length === 0) {
    return null;
  }

  const byBrand = new Map<string, { name: string; items: ApiProduct[] }>();

  for (const item of items) {
    const brandValue = item.brand;
    if (typeof brandValue !== 'string') {
      continue;
    }

    const normalized = brandValue.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    const current = byBrand.get(key);

    if (current) {
      current.items.push(item);
    } else {
      byBrand.set(key, { name: normalized, items: [item] });
    }
  }

  if (byBrand.size === 0) {
    return null;
  }

  const topBrand = Array.from(byBrand.values()).sort(
    (a, b) => (b.items.length - a.items.length) || a.name.localeCompare(b.name),
  )[0];

  return {
    name: topBrand.name,
    productCount: topBrand.items.length,
    products: topBrand.items.slice(0, 4).map((item, index) => mapApiProduct(item, index)),
  };
}

export function BrandSpotlightSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadBrandData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listProducts();
        const data = getBrandData(response);

        if (!cancelled) {
          setBrandData(data);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setBrandData(null);
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить подборку бренда');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBrandData();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Бренд недели</h2>
          <ErrorState
            title="Не удалось загрузить бренд недели"
            description="Произошла ошибка при загрузке данных бренда. Попробуйте ещё раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        </div>
      </section>
    );
  }

  if (!isLoading && (!brandData || brandData.products.length === 0)) {
    return (
      <section className="py-12">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Бренд недели</h2>
          <EmptyState
            title="Пока нет данных по брендам"
            description="Сейчас не удалось собрать товары бренда. Попробуйте обновить позже."
            action={{
              label: 'Обновить',
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        </div>
      </section>
    );
  }

  const brandName = brandData?.name ?? 'Drunk Elephant';
  const productCount = brandData?.productCount ?? 0;
  const products = brandData?.products ?? [];

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Бренд недели</h2>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          <div className="relative rounded-3xl p-6 md:p-8 lg:p-10 bg-gradient-to-br from-[#FFE1F2] via-pink-50 to-rose-50 border border-[#FFE1F2] overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-200/40 to-pink-200/40 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#FF4DB8] to-[#FF2AA8] flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl md:text-3xl">{brandName[0]?.toUpperCase() ?? 'B'}</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#111827] mb-2 md:mb-3">{brandName}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6 md:mb-8 max-w-md">
                Подборка товаров бренда на основе актуального каталога. Описание бренда не приходит из API,
                поэтому здесь показан базовый текст.
              </p>

              <Button variant="primary" className="w-full sm:w-auto">Смотреть бренд</Button>

              <div className="mt-6 md:mt-8 pt-6 border-t border-pink-200/50 flex gap-6 md:gap-8">
                <div>
                  <div className="text-xl md:text-2xl font-bold text-[#111827]">{productCount}</div>
                  <div className="text-xs text-[#6B7280]">Продуктов</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-[#111827]">4.8</div>
                  <div className="text-xs text-[#6B7280]">Рейтинг</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Хиты бренда</h4>
            <div className="grid grid-cols-2 gap-4">
              {isLoading
                ? [...Array(4)].map((_, index) => <ProductCardSkeleton key={index} variant="grid" />)
                : products.map((product) => <ProductCard key={product.id} product={product} variant="grid" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
