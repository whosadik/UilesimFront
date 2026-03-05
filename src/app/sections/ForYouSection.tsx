import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { home } from '../../shared/api/recommendations';
import { ApiError } from '../../shared/api/ApiError';

type CarouselProduct = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  category?: string;
  inStock?: boolean;
  recommendationScore?: number;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

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

function mapRecommendationProduct(item: unknown): CarouselProduct | null {
  if (!isRecord(item)) {
    return null;
  }

  const product = isRecord(item.product) ? item.product : null;
  if (!product || (typeof product.id !== 'number' && typeof product.id !== 'string')) {
    return null;
  }

  const rawScore = toNumber(item.score);
  const scorePercent = rawScore === undefined ? undefined : rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

  return {
    id: String(product.id),
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      (typeof product.image === 'string' && product.image) ||
      FALLBACK_IMAGE,
    brand: typeof product.brand === 'string' ? product.brand : 'Uilesim',
    name: typeof product.name === 'string' ? product.name : `Товар #${String(product.id)}`,
    price: toNumber(product.price) ?? 0,
    category: typeof product.category === 'string' ? product.category : undefined,
    inStock: product.in_stock === undefined ? true : Boolean(product.in_stock),
    recommendationScore: scorePercent,
  };
}

export function ForYouSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await home();
        let results: unknown[] = [];

        if (Array.isArray(response)) {
          results = response;
        } else if (isRecord(response) && Array.isArray(response.sections)) {
          const forYouSection = response.sections.find(
            (section) => isRecord(section) && section.key === 'for_you',
          );
          if (isRecord(forYouSection) && Array.isArray(forYouSection.results)) {
            results = forYouSection.results;
          }
        } else if (isRecord(response) && Array.isArray(response.results)) {
          results = response.results;
        }

        const mapped = results
          .map(mapRecommendationProduct)
          .filter((item): item is CarouselProduct => item !== null);

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
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить рекомендации');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader
          title="Для вас"
          subtitle="Подборка на основе профиля и интересов"
        />

        {error ? (
          <ErrorState
            title="Не удалось загрузить рекомендации"
            description="Произошла ошибка при загрузке рекомендаций. Попробуйте ещё раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title="Рекомендаций пока нет"
            description="Заполните профиль и вернитесь позже, чтобы получить персональную подборку."
            action={{
              label: 'Обновить',
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        ) : (
          <ProductCarousel products={products} loading={isLoading} />
        )}
      </div>
    </section>
  );
}
