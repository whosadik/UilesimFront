import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FilterBar } from '../components/FilterBar';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';

type ApiProduct = Record<string, unknown>;

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

function mapApiProduct(item: ApiProduct, index: number): Product {
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

export function ProductFeedSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listProducts();
        const items = Array.isArray(response) ? response : response.results;
        const mapped = items.map((item, index) => mapApiProduct(item as ApiProduct, index));

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setProducts([]);
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить товары');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1500);
  };

  if (error) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Все товары
          </h2>
          <FilterBar />
          <ErrorState
            title="Не удалось загрузить товары"
            description="Произошла ошибка при загрузке товаров. Попробуйте ещё раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        </div>
      </section>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Все товары
          </h2>
          <FilterBar />
          <EmptyState
            title="Ничего не найдено"
            description="Пока нет доступных товаров. Обновите список позже."
            action={{
              label: 'Обновить список',
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          Все товары
        </h2>

        <FilterBar />

        <ProductGrid products={products} columns={4} loading={isLoading} />

        {isLoadingMore && (
          <div className="mt-6">
            <ProductGrid products={[]} columns={4} loading />
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-sm text-gray-600">
            Показано {products.length} из {products.length} товаров
          </div>
          <Button onClick={handleLoadMore} variant="ghost">
            Показать ещё
          </Button>
        </div>
      </div>
    </section>
  );
}
