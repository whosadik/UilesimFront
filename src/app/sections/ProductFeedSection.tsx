import { useEffect, useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { listProducts, type ProductListResponse } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';

type ApiProduct = Record<string, unknown>;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const PRODUCT_FEED_PAGE_SIZE = 12;

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

function mapApiProduct(
  item: ApiProduct,
  index: number,
  fallbackProductPrefix: string,
): Product {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `product-${index}`;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : `${fallbackProductPrefix} #${id}`;
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

function toPagedPayload(payload: Product[] | ProductListResponse): ProductListResponse {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }

  return payload;
}

export function ProductFeedSection() {
  const { messages } = useI18n();
  const fallbackProductPrefix = messages.productCard.productFallback;
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
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
        const response = await listProducts({ page: 1, page_size: PRODUCT_FEED_PAGE_SIZE });
        const payload = toPagedPayload(response);
        const mapped = payload.results.map((item, index) =>
          mapApiProduct(item as ApiProduct, index, fallbackProductPrefix),
        );

        if (!cancelled) {
          setProducts(mapped);
          setTotalCount(typeof payload.count === 'number' ? payload.count : mapped.length);
          setNextPage(payload.next ? 2 : null);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setProducts([]);
          setTotalCount(0);
          setNextPage(null);
          return;
        }

        setProducts([]);
        setTotalCount(0);
        setNextPage(null);
        setError(loadError instanceof Error ? loadError.message : messages.home.productFeed.errorTitle);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [fallbackProductPrefix, messages.home.productFeed.errorTitle, retryKey]);

  const handleLoadMore = async () => {
    if (isLoadingMore || nextPage === null) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await listProducts({ page: nextPage, page_size: PRODUCT_FEED_PAGE_SIZE });
      const payload = toPagedPayload(response);
      const currentLength = products.length;
      const mapped = payload.results.map((item, index) =>
        mapApiProduct(item as ApiProduct, currentLength + index, fallbackProductPrefix),
      );

      setProducts((current) => [...current, ...mapped]);
      setTotalCount(typeof payload.count === 'number' ? payload.count : currentLength + mapped.length);
      setNextPage(payload.next ? nextPage + 1 : null);
    } catch (loadError) {
      if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
        setNextPage(null);
        return;
      }

      setError(loadError instanceof Error ? loadError.message : messages.home.productFeed.errorTitle);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (error) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            {messages.home.productFeed.title}
          </h2>
          <FilterBar />
          <ErrorState
            title={messages.home.productFeed.errorTitle}
            description={messages.home.productFeed.errorDescription}
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
            {messages.home.productFeed.title}
          </h2>
          <FilterBar />
          <EmptyState
            title={messages.home.productFeed.emptyTitle}
            description={messages.home.productFeed.emptyDescription}
            action={{
              label: messages.home.productFeed.refreshList,
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
          {messages.home.productFeed.title}
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
            {messages.home.productFeed.showing(products.length, totalCount || products.length)}
          </div>
          {nextPage !== null ? (
            <Button onClick={handleLoadMore} variant="ghost" disabled={isLoadingMore}>
              {isLoadingMore ? messages.home.productFeed.loadingMore : messages.home.productFeed.showMore}
            </Button>
          ) : (
            <div className="text-xs text-gray-500">{messages.home.productFeed.endOfFeed}</div>
          )}
        </div>
      </div>
    </section>
  );
}
