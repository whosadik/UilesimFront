import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { ApiError } from '../../shared/api/ApiError';
import { createRequestId } from '../../shared/api/httpClient';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { home, sendEvent, type HomeRecsResponse } from '../../shared/api/recommendations';

export type HomeRecommendationSectionKey = 'for_you' | 'trending';

export type HomeRecommendationProduct = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  category?: string;
  inStock?: boolean;
  recommendationScore?: number;
};

type HomeRecommendationsState = {
  forYouProducts: HomeRecommendationProduct[];
  trendingProducts: HomeRecommendationProduct[];
  isLoading: boolean;
  error: string | null;
  requiresAuth: boolean;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const homeRecommendationErrors = {
  ru: 'Не удалось загрузить рекомендации для главной страницы.',
  kk: 'Басты беттегі ұсыныстарды жүктеу мүмкін болмады.',
  en: 'Could not load homepage recommendations.',
} as const;

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

function mapRecommendationProduct(
  item: unknown,
  fallbackProductLabel: (id: string) => string,
): HomeRecommendationProduct | null {
  if (!isRecord(item)) {
    return null;
  }

  const product = isRecord(item.product) ? item.product : null;
  if (!product || (typeof product.id !== 'number' && typeof product.id !== 'string')) {
    return null;
  }

  const rawScore = toNumber(item.score);
  const scorePercent =
    rawScore === undefined ? undefined : rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);

  return {
    id: String(product.id),
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      (typeof product.image === 'string' && product.image) ||
      FALLBACK_IMAGE,
    brand: typeof product.brand === 'string' ? product.brand : 'Uilesim',
    name: typeof product.name === 'string' ? product.name : fallbackProductLabel(String(product.id)),
    price: toNumber(product.price) ?? 0,
    category: typeof product.category === 'string' ? product.category : undefined,
    inStock: product.in_stock === undefined ? true : Boolean(product.in_stock),
    recommendationScore: scorePercent,
  };
}

function extractSectionItems(response: HomeRecsResponse, sectionKey: HomeRecommendationSectionKey): unknown[] {
  if (isRecord(response) && Array.isArray(response.sections)) {
    const section = response.sections.find((item) => isRecord(item) && item.key === sectionKey);
    if (isRecord(section) && Array.isArray(section.results)) {
      return section.results;
    }
    return [];
  }

  if (sectionKey === 'for_you') {
    if (Array.isArray(response)) {
      return response;
    }

    if (isRecord(response) && Array.isArray(response.results)) {
      return response.results;
    }
  }

  return [];
}

function toProducts(
  response: HomeRecsResponse,
  sectionKey: HomeRecommendationSectionKey,
  fallbackProductLabel: (id: string) => string,
): HomeRecommendationProduct[] {
  return extractSectionItems(response, sectionKey)
    .map((item) => mapRecommendationProduct(item, fallbackProductLabel))
    .filter((item): item is HomeRecommendationProduct => item !== null);
}

export function useHomeRecommendations() {
  const { language, messages } = useI18n();
  const location = useLocation();
  const requestIdRef = useRef<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<HomeRecommendationsState>({
    forYouProducts: [],
    trendingProducts: [],
    isLoading: true,
    error: null,
    requiresAuth: false,
  });

  useEffect(() => {
    let cancelled = false;
    const requestId = createRequestId();
    requestIdRef.current = requestId;

    const loadRecommendations = async () => {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
        requiresAuth: false,
      }));

      try {
        const response = await home({ requestId });
        if (cancelled) {
          return;
        }

        const fallbackProductLabel = (id: string) => `${messages.productCard.productFallback} #${id}`;

        setState({
          forYouProducts: toProducts(response, 'for_you', fallbackProductLabel),
          trendingProducts: toProducts(response, 'trending', fallbackProductLabel),
          isLoading: false,
          error: null,
          requiresAuth: false,
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setState({
            forYouProducts: [],
            trendingProducts: [],
            isLoading: false,
            error: null,
            requiresAuth: true,
          });
          return;
        }

        setState({
          forYouProducts: [],
          trendingProducts: [],
          isLoading: false,
          error: loadError instanceof Error ? loadError.message : homeRecommendationErrors[language],
          requiresAuth: false,
        });
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [language, location.pathname, messages.productCard.productFallback, retryKey]);

  const retry = () => {
    setRetryKey((value) => value + 1);
  };

  const createSectionEventHandler =
    (sectionKey: HomeRecommendationSectionKey) => (eventType: string, data: any) => {
      if (eventType !== 'click' && eventType !== 'add_to_cart') {
        return;
      }

      const productId = toNumber(data?.product_id);
      if (productId === undefined) {
        return;
      }

      const context =
        isRecord(data)
          ? Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'product_id'))
          : undefined;

      void sendEvent(
        {
          action: eventType,
          product_id: productId,
          page: 'home',
          section_key: sectionKey,
          ...(context && Object.keys(context).length > 0 ? { context } : {}),
        },
        { requestId: requestIdRef.current ?? undefined },
      ).catch(() => undefined);
    };

  return {
    ...state,
    retry,
    createSectionEventHandler,
  };
}
