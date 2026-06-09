import { useEffect, useState } from 'react';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { ErrorState } from '../components/ErrorState';
import { listProducts, type ProductListResponse } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';

type CarouselProduct = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category?: string;
  isNew?: boolean;
  inStock?: boolean;
  pointsEarned?: number;
};

type ApiProduct = Record<string, unknown>;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const NEW_ARRIVALS_LIMIT = 10;

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

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numeric = toNumber(value);
    if (numeric !== undefined) {
      return numeric;
    }
  }
  return undefined;
}

function mapApiProduct(
  item: ApiProduct,
  index: number,
  fallbackProductPrefix: string,
): CarouselProduct {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `product-${index}`;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : `${fallbackProductPrefix} #${id}`;
  const brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand : 'Uilesim';
  const price = toNumber(item.price) ?? 0;
  const rawMeta = item.raw_meta && typeof item.raw_meta === 'object' ? item.raw_meta as Record<string, unknown> : {};
  const originalPriceRaw = firstNumber(
    item.original_price,
    item.originalPrice,
    item.old_price,
    item.price_old,
    item.compare_at_price,
    rawMeta.original_price,
    rawMeta.old_price,
    rawMeta.price_old,
    rawMeta.rrp,
    rawMeta.compare_at_price,
  );
  const originalPrice = originalPriceRaw !== undefined && originalPriceRaw > price ? originalPriceRaw : undefined;
  const explicitDiscount = firstNumber(item.discount, item.discount_percent, rawMeta.discount);
  const discount =
    explicitDiscount !== undefined && explicitDiscount > 0
      ? Math.round(explicitDiscount)
      : originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

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
    isNew: item.is_new === undefined ? true : Boolean(item.is_new),
    inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
    pointsEarned: toNumber(item.points_earned),
  };
}

function toResults(payload: CarouselProduct[] | ProductListResponse): ApiProduct[] {
  if (Array.isArray(payload)) {
    return payload as unknown as ApiProduct[];
  }

  return Array.isArray(payload.results) ? (payload.results as unknown as ApiProduct[]) : [];
}

export function NewArrivalsSection() {
  const { messages } = useI18n();
  const fallbackProductPrefix = messages.productCard.productFallback;
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listProducts({ new: true, page: 1, page_size: NEW_ARRIVALS_LIMIT });
        const mapped = toResults(response).map((item, index) =>
          mapApiProduct(item, index, fallbackProductPrefix),
        );

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setProducts([]);
          return;
        }

        setProducts([]);
        setError(loadError instanceof Error ? loadError.message : messages.home.newArrivals.errorTitle);
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
  }, [fallbackProductPrefix, messages.home.newArrivals.errorTitle, retryKey]);

  if (!isLoading && !error && products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
        <CarouselHeader
          title={messages.home.newArrivals.title}
          subtitle={messages.home.newArrivals.subtitle}
          eyebrow="JUST IN"
          showViewAll={false}
        />

        {error ? (
          <ErrorState
            title={messages.home.newArrivals.errorTitle}
            description={messages.home.newArrivals.errorDescription}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : (
          <ProductCarousel products={products} loading={isLoading} />
        )}
      </div>
    </section>
  );
}
