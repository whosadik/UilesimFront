import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { ApiError } from '../../shared/api/ApiError';
import { createRequestId } from '../../shared/api/httpClient';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { getProfile } from '../../shared/api/me';
import { home, sendEvent, type HomeRecsResponse } from '../../shared/api/recommendations';
import { recommendationScoreToPercent } from '../../shared/recommendations/score';

export type HomeRecommendationSectionKey = 'for_you' | 'trending';

export type HomeRecommendationProduct = {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
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
  profileNeedsQuestionnaire: boolean;
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

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numeric = toNumber(value);
    if (numeric !== undefined) {
      return numeric;
    }
  }
  return undefined;
}

function hasRequiredProfileAnswers(profile: unknown): boolean {
  if (!isRecord(profile)) {
    return false;
  }

  if ('profile_completed_at' in profile) {
    return (
      typeof profile.profile_completed_at === 'string' &&
      profile.profile_completed_at.trim().length > 0
    );
  }

  const skinType = typeof profile.skin_type === 'string' ? profile.skin_type.trim() : '';
  const hasGoals = Array.isArray(profile.goals) && profile.goals.length > 0;
  const budget = profile.budget;
  const hasBudget =
    typeof budget === 'number'
      ? Number.isFinite(budget)
      : typeof budget === 'string'
        ? budget.trim().length > 0
        : Boolean(budget);

  return Boolean(skinType) && hasGoals && hasBudget;
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

  const scorePercent = recommendationScoreToPercent(item.score, item.components);
  const rawMeta = isRecord(product.raw_meta) ? product.raw_meta : {};
  const price = toNumber(product.price) ?? 0;
  const originalPriceRaw = firstNumber(
    product.original_price,
    product.originalPrice,
    product.old_price,
    product.price_old,
    product.compare_at_price,
    rawMeta.original_price,
    rawMeta.old_price,
    rawMeta.price_old,
    rawMeta.rrp,
    rawMeta.compare_at_price,
  );
  const originalPrice =
    originalPriceRaw !== undefined && originalPriceRaw > price ? originalPriceRaw : undefined;
  const explicitDiscount = firstNumber(product.discount, product.discount_percent, rawMeta.discount);
  const discount =
    explicitDiscount !== undefined && explicitDiscount > 0
      ? Math.round(explicitDiscount)
      : originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

  return {
    id: String(product.id),
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      (typeof product.image === 'string' && product.image) ||
      FALLBACK_IMAGE,
    brand: typeof product.brand === 'string' ? product.brand : 'Uilesim',
    name: typeof product.name === 'string' ? product.name : fallbackProductLabel(String(product.id)),
    price,
    originalPrice,
    discount,
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
    profileNeedsQuestionnaire: false,
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
        profileNeedsQuestionnaire: false,
      }));

      try {
        const [homeResult, profileResult] = await Promise.allSettled([
          home({ requestId }),
          getProfile(),
        ]);
        if (cancelled) {
          return;
        }

        const authError = [homeResult, profileResult].some(
          (result) =>
            result.status === 'rejected' &&
            result.reason instanceof ApiError &&
            (result.reason.status === 401 || result.reason.status === 403),
        );

        if (authError) {
          setState({
            forYouProducts: [],
            trendingProducts: [],
            isLoading: false,
            error: null,
            requiresAuth: true,
            profileNeedsQuestionnaire: false,
          });
          return;
        }

        if (homeResult.status === 'rejected') {
          throw homeResult.reason;
        }

        const fallbackProductLabel = (id: string) => `${messages.productCard.productFallback} #${id}`;
        const response = homeResult.value;
        const profileNeedsQuestionnaire =
          profileResult.status === 'fulfilled'
            ? !hasRequiredProfileAnswers(profileResult.value)
            : false;

        setState({
          forYouProducts: toProducts(response, 'for_you', fallbackProductLabel),
          trendingProducts: toProducts(response, 'trending', fallbackProductLabel),
          isLoading: false,
          error: null,
          requiresAuth: false,
          profileNeedsQuestionnaire,
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
            profileNeedsQuestionnaire: false,
          });
          return;
        }

        setState({
          forYouProducts: [],
          trendingProducts: [],
          isLoading: false,
          error: loadError instanceof Error ? loadError.message : homeRecommendationErrors[language],
          requiresAuth: false,
          profileNeedsQuestionnaire: false,
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
