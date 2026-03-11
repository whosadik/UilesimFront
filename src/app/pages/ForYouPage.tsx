import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Sparkles, ArrowRight, TrendingUp, ShoppingBag,
  ChevronRight, Clock, Check, RefreshCw, Zap, Map,
  Plus, Minus, Star, Settings, Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../shared/auth/AuthContext';
import { ApiError } from '../../shared/api/ApiError';
import { getLoyalty, getProfile, updateProfile } from '../../shared/api/me';
import { nextOffer } from '../../shared/api/offers';
import { home, sendEvent, type HomeRecsResponse } from '../../shared/api/recommendations';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import {
  clickRoadmapStep,
  getRoadmap,
  type RoadmapPlanApi,
  type RoadmapStepApi,
  type RoadmapStepSnapshotApi,
  type RoadmapSummaryApi,
} from '../../shared/api/roadmap';
import {
  DEFAULT_ROADMAP_STEP_META,
  ROADMAP_CATEGORY_LABELS,
  getRoadmapStepMeta,
} from '../../shared/roadmap/presentation';

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/profile → { name, skin_type, goals, loyalty: { tier, points } }
 * - GET /api/me/recommendations/home → { sections: [...] }
 * - GET /api/me/next-best-action → { type, title, description, benefit, cta }
 * - GET /api/me/next-offer → { title, discount, saving_amount, expires_at }
 * - PATCH /api/me/profile { skin_type, goals } → quick prefs update
 * - POST /api/me/recommendations/event { action, product_id, page, section_key, context }
 */

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SKIN_TYPES = ['Жирная', 'Комбинированная', 'Сухая', 'Нормальная', 'Чувствительная'];
const GOALS = ['Увлажнение', 'Сияние', 'Антивозрастной', 'Очищение', 'Выравнивание тона', 'Защита SPF'];

const SKIN_TYPE_UI_TO_API: Record<string, string> = {
  'Жирная': 'oily',
  'Комбинированная': 'combination',
  'Сухая': 'dry',
  'Нормальная': 'normal',
  'Чувствительная': 'sensitive',
};

const SKIN_TYPE_API_TO_UI: Record<string, string> = {
  oily: 'Жирная',
  combination: 'Комбинированная',
  dry: 'Сухая',
  normal: 'Нормальная',
  sensitive: 'Чувствительная',
};

const GOAL_UI_TO_API: Record<string, string> = {
  'Увлажнение': 'hydration',
  'Сияние': 'glow',
  'Антивозрастной': 'anti_aging',
  'Очищение': 'cleansing',
  'Выравнивание тона': 'even_tone',
  'Защита SPF': 'spf',
};

const GOAL_API_TO_UI: Record<string, string> = {
  hydration: 'Увлажнение',
  moisturizing: 'Увлажнение',
  glow: 'Сияние',
  brightening: 'Сияние',
  anti_aging: 'Антивозрастной',
  aging: 'Антивозрастной',
  cleansing: 'Очищение',
  acne: 'Очищение',
  even_tone: 'Выравнивание тона',
  pigmentation: 'Выравнивание тона',
  spf: 'Защита SPF',
  sun_protection: 'Защита SPF',
};

type RecommendationCard = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  pointsEarned: number;
  recommendationScore: number;
  whyRecommended: string;
  whatImproves: string;
  expectedBenefit: string;
  section: string;
};

const FALLBACK_RECOMMENDATION_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

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

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  return [];
};

const toTextList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim().length > 0) {
          return item.trim();
        }
      }
    }
  }

  return undefined;
};

const ROADMAP_CATEGORIES = new Set(['skincare', 'haircare', 'makeup', 'fragrance']);

const normalizeRoadmapCategory = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return ROADMAP_CATEGORIES.has(normalized) ? normalized : undefined;
};

const formatCategoryLabel = (value: unknown): string | undefined => {
  const normalized = normalizeRoadmapCategory(value);
  if (normalized) {
    return ROADMAP_CATEGORY_LABELS[normalized] ?? normalized;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const prepared = value.trim().replace(/_/g, ' ');
  return prepared[0].toUpperCase() + prepared.slice(1);
};

const formatProductTypeLabel = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const prepared = value.trim().replace(/_/g, ' ');
  return prepared[0].toUpperCase() + prepared.slice(1);
};

const formatOfferValueLabel = (value: number): string => {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
};

const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

type PersonalOfferCard = {
  assignmentId?: number;
  title: string;
  description: string;
  highlight: string;
  expiresAt: Date | null;
};

type RoadmapLikeStep = RoadmapStepApi | RoadmapStepSnapshotApi;

type RoadmapOverview = {
  nextStepId?: number;
  nextStepTitle: string;
  nextStepDescription: string;
  nextStepWhy: string;
  nextStepPoints?: number;
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  steps: Array<{
    key: string;
    title: string;
    state: 'completed' | 'current' | 'pending';
    stepIndex: number;
  }>;
};

type SidebarQuickAction = {
  key: string;
  title: string;
  description: string;
  accent: string;
  done?: boolean;
  muted?: boolean;
};

const FALLBACK_ROADMAP_OVERVIEW: RoadmapOverview = {
  nextStepTitle: 'Добавьте тоник в рутину',
  nextStepDescription: 'Вы завершили очищение. Следующий шаг поможет сбалансировать кожу и подготовить её к увлажнению.',
  nextStepWhy: 'Этот этап логично следует за очищением и помогает быстрее увидеть результат рутины.',
  nextStepPoints: 89,
  currentStepIndex: 2,
  totalSteps: 5,
  progressPercent: 20,
  steps: [
    { key: 'roadmap-cleanser', title: 'Очищение', state: 'completed', stepIndex: 1 },
    { key: 'roadmap-toner', title: 'Тоник', state: 'current', stepIndex: 2 },
    { key: 'roadmap-moisturizer', title: 'Увлажнение', state: 'pending', stepIndex: 3 },
    { key: 'roadmap-spf', title: 'SPF', state: 'pending', stepIndex: 4 },
    { key: 'roadmap-special', title: 'Спецуход', state: 'pending', stepIndex: 5 },
  ],
};

const buildPersonalOfferCard = (value: Record<string, unknown>): PersonalOfferCard | null => {
  const offer = isRecord(value.offer) ? value.offer : null;
  if (!offer) {
    return null;
  }

  const target = isRecord(value.target) ? value.target : {};
  const reason = isRecord(value.reason) ? value.reason : {};

  const offerType = firstString(offer.type);
  const offerName = firstString(offer.name);
  const offerValue = toNumber(offer.value);
  const assignmentId = toNumber(value.assignment_id);
  const categoryLabel = formatCategoryLabel(target.category);
  const productTypeLabel = formatProductTypeLabel(target.product_type);
  const scope = firstString(target.scope);
  const minBasketAmount = toNumber(
    value.base_amount ??
      value.min_basket_amount ??
      target.min_basket_amount,
  );
  const savingAmount = toNumber(value.saving_amount ?? value.discount_amount);
  const roadmapReason = isRecord(reason.roadmap) ? reason.roadmap : null;

  let title = offerName ?? 'Персональный оффер';
  if (offerType === 'discount' && offerValue !== undefined) {
    const valueLabel = formatOfferValueLabel(offerValue);
    if (productTypeLabel) {
      title = `Скидка ${valueLabel}% на ${productTypeLabel.toLowerCase()}`;
    } else if (categoryLabel) {
      title = `Скидка ${valueLabel}% на ${categoryLabel.toLowerCase()}`;
    } else {
      title = `Скидка ${valueLabel}% для вас`;
    }
  } else if (offerType === 'points_multiplier' && offerValue !== undefined) {
    title = `x${formatOfferValueLabel(offerValue)} баллы на следующую покупку`;
  } else if (offerType === 'gift') {
    title = offerName ?? 'Подарок к заказу';
  }

  let description = 'Персональное предложение доступно прямо сейчас.';
  if (scope === 'cart' && minBasketAmount !== undefined) {
    description = `Применяется автоматически к следующей корзине от ${minBasketAmount.toLocaleString('ru')} ₸.`;
  } else if (scope === 'category' && categoryLabel) {
    description = `Предложение действует на категорию «${categoryLabel}».`;
  } else if (scope === 'product_type' && productTypeLabel) {
    description = `Предложение действует на товары типа «${productTypeLabel}».`;
  } else if (scope === 'product_id' && productTypeLabel) {
    description = `Сработает на рекомендованный товар типа «${productTypeLabel}».`;
  } else if (roadmapReason && productTypeLabel) {
    description = `Оффер связан с roadmap и поддерживает шаг «${productTypeLabel}».`;
  }

  let highlight = 'Предложение уже закреплено за вашим профилем.';
  if (savingAmount !== undefined && minBasketAmount !== undefined) {
    highlight = `На корзине ${minBasketAmount.toLocaleString('ru')} ₸ вы сэкономите ${savingAmount.toLocaleString('ru')} ₸`;
  } else if (offerType === 'discount' && offerValue !== undefined) {
    highlight = `Скидка ${formatOfferValueLabel(offerValue)}% применится автоматически на подходящую покупку`;
  } else if (offerType === 'points_multiplier' && offerValue !== undefined) {
    highlight = `Получите x${formatOfferValueLabel(offerValue)} баллы на следующую подходящую покупку`;
  } else if (offerType === 'gift') {
    highlight = 'Подарок добавится автоматически при выполнении условий оффера';
  }

  const expiresAtRaw = firstString(value.expires_at);
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  return {
    assignmentId: assignmentId !== undefined ? Math.round(assignmentId) : undefined,
    title,
    description,
    highlight,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
};

const isCompletedRoadmapStatus = (value: unknown): boolean =>
  value === 'completed' || value === 'owned' || value === 'skipped';

const pickRoadmapNextStep = (plan: RoadmapPlanApi): RoadmapLikeStep | null => {
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null;
  const summaryNextStep = summary && isRecord(summary.next_step)
    ? (summary.next_step as RoadmapStepSnapshotApi)
    : null;

  const nextStepId =
    typeof summaryNextStep?.id === 'number'
      ? summaryNextStep.id
      : typeof summaryNextStep?.step_id === 'number'
        ? summaryNextStep.step_id
        : undefined;
  const nextStepIndex = toNumber(summaryNextStep?.step_index);

  if (steps.length > 0 && (nextStepId !== undefined || nextStepIndex !== undefined)) {
    const matchedStep = steps.find((step) =>
      isRecord(step) &&
      (
        (nextStepId !== undefined && (step.id === nextStepId || step.step_id === nextStepId)) ||
        (nextStepId === undefined && nextStepIndex !== undefined && step.step_index === nextStepIndex)
      ),
    );

    if (matchedStep && isRecord(matchedStep)) {
      return matchedStep as RoadmapStepApi;
    }
  }

  if (summaryNextStep) {
    return summaryNextStep;
  }

  const fallbackStep = steps.find(
    (step) =>
      isRecord(step) &&
      (step.status === 'missing' || step.status === 'recommended'),
  );

  return fallbackStep && isRecord(fallbackStep) ? (fallbackStep as RoadmapStepApi) : null;
};

const buildRoadmapOverview = (plan: RoadmapPlanApi | null): RoadmapOverview | null => {
  if (!plan) {
    return null;
  }

  const rawSteps = Array.isArray(plan.steps)
    ? plan.steps.filter((step): step is RoadmapStepApi => isRecord(step))
    : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null;
  const nextStep = pickRoadmapNextStep(plan);

  if (!nextStep && rawSteps.length === 0) {
    return null;
  }

  const totalSteps = Math.max(0, Math.round(toNumber(summary?.total_steps) ?? rawSteps.length));
  const missingStepsCount = toNumber(summary?.missing_steps_count);
  const completedCount = missingStepsCount !== undefined && totalSteps > 0
    ? Math.max(0, totalSteps - Math.round(missingStepsCount))
    : rawSteps.filter((step) => isCompletedRoadmapStatus(step.status)).length;

  const nextStepId =
    typeof nextStep?.id === 'number'
      ? nextStep.id
      : typeof nextStep?.step_id === 'number'
        ? nextStep.step_id
        : undefined;
  const currentStepIndex = Math.max(
    1,
    Math.round(
      toNumber(nextStep?.step_index) ??
        (completedCount < totalSteps ? completedCount + 1 : totalSteps || 1),
    ),
  );
  const currentProductType = firstString(nextStep?.product_type);
  const stepMeta = currentProductType
    ? getRoadmapStepMeta(currentProductType)
    : DEFAULT_ROADMAP_STEP_META;
  const recommendedProduct = nextStep && isRecord(nextStep.recommended_product)
    ? nextStep.recommended_product
    : null;

  const stepsForUi = rawSteps.slice(0, 5).map((step, index) => {
    const stepIndex = Math.max(1, Math.round(toNumber(step.step_index) ?? index + 1));
    const stepId = typeof step.id === 'number' ? step.id : undefined;
    const isCurrent =
      (nextStepId !== undefined && stepId === nextStepId) ||
      (nextStepId === undefined && stepIndex === currentStepIndex && !isCompletedRoadmapStatus(step.status));

    return {
      key: stepId !== undefined ? `roadmap-step-${stepId}` : `roadmap-step-${stepIndex}`,
      title: firstString(step.title, formatProductTypeLabel(step.product_type), `Шаг ${stepIndex}`) ?? `Шаг ${stepIndex}`,
      state: isCurrent ? 'current' : isCompletedRoadmapStatus(step.status) ? 'completed' : 'pending',
      stepIndex,
    };
  });

  return {
    nextStepId,
    nextStepTitle:
      firstString(nextStep?.title, formatProductTypeLabel(nextStep?.product_type)) ??
      'Следующий шаг roadmap',
    nextStepDescription:
      firstString(nextStep?.description) ??
      'Откройте roadmap, чтобы увидеть следующий шаг.',
    nextStepWhy:
      firstString(toTextList(nextStep?.why), stepMeta.why) ??
      stepMeta.why,
    nextStepPoints:
      toNumber(recommendedProduct?.points_earned) ??
      stepMeta.points,
    currentStepIndex,
    totalSteps,
    progressPercent:
      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0,
    steps: stepsForUi.length > 0 ? stepsForUi : FALLBACK_ROADMAP_OVERVIEW.steps,
  };
};

const buildSidebarQuickActions = ({
  skinType,
  goals,
  roadmapPlan,
  roadmapOverview,
  personalOffer,
  recommendations,
  trendingRecommendations,
}: {
  skinType: string;
  goals: string[];
  roadmapPlan: RoadmapPlanApi | null;
  roadmapOverview: RoadmapOverview;
  personalOffer: PersonalOfferCard | null;
  recommendations: RecommendationCard[];
  trendingRecommendations: RecommendationCard[];
}): SidebarQuickAction[] => {
  const profileConfigured = Boolean(skinType.trim()) && goals.length > 0;
  const topRecommendation = recommendations[0] ?? trendingRecommendations[0] ?? null;
  const hasRoadmap = roadmapPlan !== null && roadmapOverview.totalSteps > 0;

  return [
    profileConfigured
      ? {
          key: 'profile',
          title: 'Профиль настроен',
          description: 'Тип кожи и цели уже участвуют в персонализации.',
          accent: 'Готово',
          done: true,
        }
      : {
          key: 'profile',
          title: 'Уточните профиль',
          description: 'Добавьте тип кожи и цели, чтобы рекомендации стали точнее.',
          accent: 'Профиль',
        },
    hasRoadmap
      ? {
          key: 'roadmap',
          title: 'Следующий шаг roadmap',
          description: roadmapOverview.nextStepTitle,
          accent: roadmapOverview.nextStepPoints ? `+${roadmapOverview.nextStepPoints}` : 'Roadmap',
        }
      : {
          key: 'roadmap',
          title: 'Roadmap формируется',
          description: 'Когда план будет готов, следующий шаг появится здесь.',
          accent: 'Скоро',
          muted: true,
        },
    personalOffer
      ? {
          key: 'offer',
          title: 'Текущий персональный оффер',
          description: personalOffer.highlight,
          accent: 'Активен',
        }
      : {
          key: 'offer',
          title: 'Оффер появится позже',
          description: 'Когда для вас будет назначено предложение, оно отобразится здесь.',
          accent: 'Ожидание',
          muted: true,
        },
    topRecommendation
      ? {
          key: 'recommendation',
          title: 'Рекомендация для корзины',
          description: `${topRecommendation.name} • +${topRecommendation.pointsEarned} баллов после покупки`,
          accent: `+${topRecommendation.pointsEarned}`,
        }
      : {
          key: 'recommendation',
          title: 'Рекомендации загружаются',
          description: 'Как только API вернет персональные товары, они появятся слева.',
          accent: 'Каталог',
          muted: true,
        },
  ];
};

const loadForYouRoadmap = async (): Promise<RoadmapPlanApi | null> => {
  try {
    return await getRoadmap();
  } catch (error) {
    if (isAuthError(error)) {
      throw error;
    }

    return null;
  }
};

const mapApiSkinTypeToUi = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  return SKIN_TYPE_API_TO_UI[value.toLowerCase()] ?? null;
};

const mapUiSkinTypeToApi = (value: string): string =>
  SKIN_TYPE_UI_TO_API[value] ?? 'normal';

const mapApiGoalsToUi = (value: unknown): string[] => {
  const mapped = toStringArray(value)
    .map((goal) => GOAL_API_TO_UI[goal.toLowerCase()] ?? null)
    .filter((goal): goal is string => Boolean(goal));

  return Array.from(new Set(mapped));
};

const mapUiGoalsToApi = (value: string[]): string[] => {
  const mapped = value
    .map((goal) => GOAL_UI_TO_API[goal] ?? null)
    .filter((goal): goal is string => Boolean(goal));

  return Array.from(new Set(mapped));
};

const formatTierLabel = (value: string): string => {
  const normalized = value.toLowerCase();
  if (normalized === 'bronze') {
    return 'Bronze';
  }
  if (normalized === 'silver') {
    return 'Silver';
  }
  if (normalized === 'gold') {
    return 'Gold';
  }
  if (normalized === 'platinum') {
    return 'Platinum';
  }
  return value || 'Gold';
};

type HomeResultItem = { item: unknown; sectionKey?: string };

const extractHomeResults = (response: HomeRecsResponse): HomeResultItem[] => {
  if (Array.isArray(response)) {
    return response.map((item) => ({ item }));
  }
  if (response && typeof response === 'object') {
    const record = response as {
      results?: unknown[];
      sections?: Array<{ key?: unknown; results?: unknown[] }>;
    };

    if (Array.isArray(record.sections)) {
      return record.sections.flatMap((section) => {
        if (!Array.isArray(section.results)) {
          return [];
        }

        const sectionKey = typeof section.key === 'string' ? section.key : undefined;
        return section.results.map((item) => ({ item, sectionKey }));
      });
    }

    if (Array.isArray(record.results)) {
      return record.results.map((item) => ({ item }));
    }
  }
  return [];
};

const formatFreeTextLabel = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const prepared = value.trim().replace(/_/g, ' ');
  return prepared[0].toUpperCase() + prepared.slice(1);
};

const resolveRecommendationSection = (source: Record<string, unknown>, sectionKey?: string): string => {
  if (sectionKey) {
    return sectionKey;
  }

  if (typeof source.section === 'string' && source.section.trim().length > 0) {
    return source.section.trim();
  }

  return 'for_you';
};

const buildRecommendationWhy = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
  section: string,
): string => {
  const whySource = source.why;
  const whyList = Array.isArray(whySource)
    ? whySource.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  if (typeof whySource === 'string' && whySource.trim().length > 0) {
    return whySource.trim();
  }
  if (whyList.length > 0) {
    return whyList.slice(0, 2).join(' · ');
  }
  if (typeof source.whyRecommended === 'string' && source.whyRecommended.trim().length > 0) {
    return source.whyRecommended.trim();
  }

  const supportedSkinType = toStringArray(product.supported_skin_types)[0];
  const supportedSkinTypeLabel =
    typeof supportedSkinType === 'string'
      ? SKIN_TYPE_API_TO_UI[supportedSkinType] ?? formatFreeTextLabel(supportedSkinType)
      : undefined;
  const productTypeLabel = formatProductTypeLabel(product.product_type);
  const categoryLabel = formatCategoryLabel(product.category);

  if (supportedSkinTypeLabel) {
    return `Подходит для ${supportedSkinTypeLabel.toLowerCase()} кожи`;
  }
  if (section === 'because_you_bought') {
    return 'Дополняет прошлые покупки';
  }
  if (section === 'trending') {
    return 'Популярно среди похожих профилей';
  }
  if (productTypeLabel) {
    return `Подбор по типу ${productTypeLabel.toLowerCase()}`;
  }
  if (categoryLabel) {
    return `Подбор по категории ${categoryLabel.toLowerCase()}`;
  }
  return 'Персональная рекомендация';
};

const buildRecommendationImprovement = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
): string => {
  if (typeof source.whatImproves === 'string' && source.whatImproves.trim().length > 0) {
    return source.whatImproves.trim();
  }

  const firstConcern = formatFreeTextLabel(toStringArray(product.concerns)[0]);
  if (firstConcern) {
    return firstConcern;
  }

  const firstActive = formatFreeTextLabel(toStringArray(product.actives)[0]);
  if (firstActive) {
    return firstActive;
  }

  const productTypeLabel = formatProductTypeLabel(product.product_type);
  if (productTypeLabel) {
    return productTypeLabel;
  }

  const categoryLabel = formatCategoryLabel(product.category);
  return categoryLabel ?? 'Под ваш профиль';
};

const buildRecommendationBenefit = (
  source: Record<string, unknown>,
  product: Record<string, unknown>,
  section: string,
): string => {
  if (typeof source.expectedBenefit === 'string' && source.expectedBenefit.trim().length > 0) {
    return source.expectedBenefit.trim();
  }

  const strengthLabel = formatFreeTextLabel(product.strength);
  if (strengthLabel) {
    return `Интенсивность: ${strengthLabel.toLowerCase()}`;
  }

  const actives = toStringArray(product.actives).slice(0, 2);
  if (actives.length > 0) {
    return `Активы: ${actives.join(', ')}`;
  }

  if (section === 'because_you_bought') {
    return 'Хорошо сочетается с вашими предыдущими покупками';
  }
  if (section === 'trending') {
    return 'Часто выбирают пользователи с похожим профилем';
  }

  return 'Откройте карточку товара для деталей и способа применения';
};

const normalizeRec = (item: unknown, index: number, sectionKey?: string): RecommendationCard => {
  const source = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
  const product = (
    source.product && typeof source.product === 'object' ? source.product : source
  ) as Record<string, unknown>;
  const section = resolveRecommendationSection(source, sectionKey);
  const fallbackId = `rec-${section}-${index + 1}`;

  const id = String(product.id ?? source.id ?? fallbackId);
  const price = toNumber(product.price ?? source.price) ?? 0;
  const originalPrice = toNumber(product.original_price ?? source.original_price ?? source.originalPrice);
  const score = toNumber(source.score ?? source.recommendationScore ?? product.recommendation_score) ?? 0;
  const pointsEarned =
    toNumber(product.points_earned ?? source.points_earned ?? source.pointsEarned) ??
    Math.max(0, Math.round(price * 0.1));
  const whyRecommended = buildRecommendationWhy(source, product, section);

  return {
    id,
    name:
      (typeof product.name === 'string' && product.name) ||
      (typeof source.name === 'string' && source.name) ||
      `Товар #${id}`,
    brand:
      (typeof product.brand === 'string' && product.brand) ||
      (typeof source.brand === 'string' && source.brand) ||
      'Uilesim',
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    image:
      (typeof product.image_url === 'string' && product.image_url) ||
      (Array.isArray(product.image_urls) && typeof product.image_urls[0] === 'string' ? product.image_urls[0] : undefined) ||
      (typeof product.image === 'string' && product.image) ||
      (typeof source.image_url === 'string' && source.image_url) ||
      (typeof source.image === 'string' && source.image) ||
      FALLBACK_RECOMMENDATION_IMAGE,
    pointsEarned: Math.max(0, Math.round(pointsEarned)),
    recommendationScore: Math.max(0, Math.min(100, Math.round(score))),
    whyRecommended,
    whatImproves: buildRecommendationImprovement(source, product),
    expectedBenefit: buildRecommendationBenefit(source, product, section),
    section,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoyaltyProgressMini({ points, tier }: { points: number; tier: string }) {
  const tiers = [
    { name: 'Bronze', min: 0, max: 500, color: '#CD7F32' },
    { name: 'Silver', min: 500, max: 1000, color: '#9CA3AF' },
    { name: 'Gold', min: 1000, max: 1500, color: '#F59E0B' },
    { name: 'Platinum', min: 1500, max: 2500, color: '#6366F1' },
  ];
  const currentTier = tiers.find(t => t.name.toLowerCase() === tier) || tiers[2];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const toNext = nextTier ? nextTier.min - points : 0;

  return (
    <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
          <span className="text-sm font-semibold text-[#111827]">{points.toLocaleString('ru')} баллов</span>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
        >
          {currentTier.name}
        </span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, progress)}%`, backgroundColor: currentTier.color }}
        />
      </div>

      {nextTier && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">
            До <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.name}</span>: {toNext} баллов
          </p>
          <p className="text-[10px] text-[#6B7280]">Купите на {Math.ceil(toNext / 0.1).toLocaleString('ru')} ₸</p>
        </div>
      )}
    </div>
  );
}

interface EnhancedRecCardProps {
  product: RecommendationCard;
  cartQuantity: number;
  onAdd: (product: RecommendationCard, quantity: number) => Promise<void>;
  onSetQuantity: (product: RecommendationCard, quantity: number) => Promise<void>;
  onProductClick?: (product: RecommendationCard) => void;
}

function EnhancedRecCard({ product, cartQuantity, onAdd, onSetQuantity, onProductClick }: EnhancedRecCardProps) {
  const [isCartPending, setIsCartPending] = useState(false);
  const inCart = cartQuantity > 0;
  const qty = inCart ? cartQuantity : 1;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      await onAdd(product, 1);
    } finally {
      setIsCartPending(false);
    }
  };

  const handleQuantityChange = async (nextQuantity: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      await onSetQuantity(product, nextQuantity);
    } finally {
      setIsCartPending(false);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="block group" onClick={() => onProductClick?.(product)}>
      <div className="bg-white rounded-2xl border border-[#EAE6EF] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Score badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3 h-3 text-[#FF4DB8]" />
            <span className="text-[10px] font-semibold text-[#111827]">{product.recommendationScore}% совпадение</span>
          </div>
        </div>

        <div className="p-4">
          {/* Why chip */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
              ✦ {product.whyRecommended}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280] text-[10px]">
              ↑ {product.whatImproves}
            </span>
          </div>

          <p className="text-[10px] text-[#6B7280] mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-semibold text-[#111827] mb-1 line-clamp-2">{product.name}</h3>

          {/* Expected benefit */}
          <p className="text-[10px] text-[#6B7280] mb-3 flex items-center gap-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {product.expectedBenefit}
          </p>

          {/* Price + points */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#111827]">{product.price.toLocaleString('ru')} ₸</span>
              {product.originalPrice && (
                <span className="text-xs text-[#6B7280] line-through">{product.originalPrice.toLocaleString('ru')} ₸</span>
              )}
            </div>
            <span className="text-[10px] text-[#FF4DB8] font-medium">+{product.pointsEarned} б.</span>
          </div>

          {inCart ? (
            <div
              onClick={e => e.preventDefault()}
              className="flex items-center justify-between h-10 rounded-xl border-2 border-[#111827] overflow-hidden"
            >
              <button
                onClick={(e) => handleQuantityChange(qty - 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-[#111827] text-sm">{qty}</span>
              <button
                onClick={(e) => handleQuantityChange(qty + 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isCartPending}
              className="w-full h-10 rounded-xl bg-[#111827] text-white text-xs font-medium hover:bg-[#0B1220] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              В корзину
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Quick Prefs Panel
function QuickPrefsPanel({
  skinType, setSkinType, goals, setGoals, onSave, isSaving,
}: {
  skinType: string;
  setSkinType: (v: string) => void;
  goals: string[];
  setGoals: (v: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const toggleGoal = (g: string) => {
    setGoals(goals.includes(g) ? goals.filter(x => x !== g) : [...goals, g]);
  };

  return (
    <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-[#6B7280]" />
        <span className="text-sm font-semibold text-[#111827]">Мои предпочтения</span>
        <span className="ml-auto text-[10px] text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-full">влияет на рекомендации</span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#6B7280] font-medium mb-2">Тип кожи</p>
        <div className="flex flex-wrap gap-1.5">
          {SKIN_TYPES.map(s => (
            <button
              key={s}
              onClick={() => setSkinType(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                skinType === s
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              {skinType === s && <Check className="w-3 h-3 inline mr-1" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-[#6B7280] font-medium mb-2">Мои цели</p>
        <div className="flex flex-wrap gap-1.5">
          {GOALS.map(g => (
            <button
              key={g}
              onClick={() => toggleGoal(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                goals.includes(g)
                  ? 'bg-[#FF4DB8] text-white'
                  : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
              }`}
            >
              {goals.includes(g) && <Check className="w-3 h-3 inline mr-1" />}
              {g}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full h-9 rounded-xl border border-[#111827] text-[#111827] text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
        {isSaving ? 'Обновляем...' : 'Обновить рекомендации'}
      </button>
    </div>
  );
}

function RecommendationEmptyState({
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EAE6EF] bg-white p-5">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
      </div>
      <h3 className="text-sm font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-xs text-[#6B7280] mb-4">{description}</p>
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#111827] hover:text-[#FF4DB8] transition-colors"
      >
        {ctaLabel}
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function ColdStartState({
  initialSkinType,
  initialGoals,
  isSaving,
  onComplete,
}: {
  initialSkinType?: string;
  initialGoals?: string[];
  isSaving: boolean;
  onComplete: (payload: { skinType: string; goals: string[] }) => Promise<void>;
}) {
  const [step, setStep] = useState((initialGoals?.length ?? 0) > 0 ? 2 : 1);
  const [skinType, setSkinType] = useState(initialSkinType ?? '');
  const [goals, setGoals] = useState<string[]>(initialGoals ?? []);

  const toggleGoal = (goal: string) => {
    setGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((item) => item !== goal)
        : [...currentGoals, goal],
    );
  };

  const handleFinish = async () => {
    if (!skinType || goals.length === 0 || isSaving) {
      toast.error('Выберите тип кожи и хотя бы одну цель');
      return;
    }

    await onComplete({ skinType, goals });
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-8 justify-center">
        {[1, 2].map((item) => (
          <div
            key={item}
            className={`rounded-full transition-all ${
              item === step ? 'w-8 h-2 bg-[#111827]' : item < step ? 'w-2 h-2 bg-[#111827]' : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FFE1F2] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#FF4DB8]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111827] mb-2">Давайте настроим вашу персонализацию</h2>
          <p className="text-[#6B7280] mb-8">Ответьте на два быстрых вопроса, и платформа сразу перестроит рекомендации под вас.</p>

          <div className="text-left mb-6">
            <p className="text-sm font-semibold text-[#111827] mb-3">Какой у вас тип кожи?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SKIN_TYPES.map((value) => (
                <button
                  key={value}
                  onClick={() => setSkinType(value)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                    skinType === value
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#EAE6EF] text-[#111827] hover:border-[#111827]/30'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => skinType && setStep(2)}
            disabled={!skinType}
            className="w-full h-12 rounded-xl bg-[#111827] text-white font-medium text-sm hover:bg-[#0B1220] transition-colors disabled:bg-gray-200 disabled:text-[#6B7280] flex items-center justify-center gap-2"
          >
            Далее <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#111827]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111827] mb-2">Какие у вас цели?</h2>
          <p className="text-[#6B7280] mb-8">Можно выбрать несколько, а рекомендации и roadmap подстроятся автоматически.</p>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                  goals.includes(goal)
                    ? 'border-[#FF4DB8] bg-[#FF4DB8] text-white'
                    : 'border-[#EAE6EF] text-[#111827] hover:border-[#FF4DB8]/30'
                }`}
              >
                {goals.includes(goal) && '✓ '}{goal}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 rounded-xl border border-[#EAE6EF] text-[#111827] font-medium text-sm hover:bg-gray-50"
            >
              Назад
            </button>
            <button
              onClick={() => void handleFinish()}
              disabled={goals.length === 0 || isSaving}
              className="flex-2 flex-1 h-12 rounded-xl bg-[#111827] text-white font-medium text-sm hover:bg-[#0B1220] transition-colors disabled:bg-gray-200 disabled:text-[#6B7280] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSaving ? 'Сохраняем...' : 'Показать мои рекомендации'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function EmailVerificationNotice({
  email,
  isSending,
  onResend,
}: {
  email: string;
  isSending: boolean;
  onResend: () => void;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Mail className="w-4 h-4" />
            Confirm your email
          </div>
          <p className="mt-1 text-sm text-amber-800">
            We sent a confirmation link to <span className="font-medium">{email}</span>. Confirm it to finish account setup.
          </p>
        </div>
        <button
          type="button"
          onClick={onResend}
          disabled={isSending}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
          {isSending ? 'Sending...' : 'Resend email'}
        </button>
      </div>
    </div>
  );
}

export default function ForYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading, resendVerificationEmail } = useAuth();
  const { addToCart, getCartQuantity, setCartQuantity } = useCommerce();

  const [skinType, setSkinType] = useState('Жирная');
  const [goals, setGoals] = useState(['Увлажнение', 'Сияние']);
  const [isSaving, setIsSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [trendingRecommendations, setTrendingRecommendations] = useState<RecommendationCard[]>([]);
  const [personalOffer, setPersonalOffer] = useState<PersonalOfferCard | null>(null);
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlanApi | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1247);
  const [loyaltyTier, setLoyaltyTier] = useState('gold');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showAutoOnboarding, setShowAutoOnboarding] = useState(false);
  const [isOnboardingSaving, setIsOnboardingSaving] = useState(false);
  const [isVerificationEmailSending, setIsVerificationEmailSending] = useState(false);
  const [onboardingInitialSkinType, setOnboardingInitialSkinType] = useState('');
  const [onboardingInitialGoals, setOnboardingInitialGoals] = useState<string[]>([]);

  const roadmapOverview = buildRoadmapOverview(roadmapPlan) ?? FALLBACK_ROADMAP_OVERVIEW;
  const roadmapHeading = roadmapOverview.totalSteps > 0
    ? `Шаг ${Math.min(roadmapOverview.currentStepIndex, roadmapOverview.totalSteps)} из ${roadmapOverview.totalSteps}: ${roadmapOverview.nextStepTitle}`
    : roadmapOverview.nextStepTitle;
  const sidebarQuickActions = buildSidebarQuickActions({
    skinType,
    goals,
    roadmapPlan,
    roadmapOverview,
    personalOffer,
    recommendations,
    trendingRecommendations,
  });
  const offerCountdownMs = personalOffer?.expiresAt
    ? personalOffer.expiresAt.getTime() - Date.now()
    : null;
  const hasOfferCountdown = offerCountdownMs !== null && offerCountdownMs > 0;
  const shouldShowEmailVerificationNotice = Boolean(user?.email && user.email_verified === false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadPersonalization = async () => {
      setIsDataLoading(true);
      setLoadError(null);

      try {
        const [homeResult, offerResult, profileResult, loyaltyResult] = await Promise.allSettled([
          home(),
          nextOffer(),
          getProfile(),
          getLoyalty(),
        ]);

        if (cancelled) {
          return;
        }

        const rejectedReasons: unknown[] = [];
        for (const result of [homeResult, offerResult, profileResult, loyaltyResult]) {
          if (result.status === 'rejected') {
            rejectedReasons.push(result.reason);
          }
        }

        const authError = rejectedReasons.find(
          (reason) =>
            reason instanceof ApiError &&
            (reason.status === 401 || reason.status === 403),
        );

        if (authError) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (profileResult.status === 'fulfilled') {
          const profile = profileResult.value as Record<string, unknown>;
          const nextSkinType = mapApiSkinTypeToUi(profile.skin_type) ?? '';
          const nextGoals = mapApiGoalsToUi(profile.goals);
          const isProfileCompleted =
            typeof profile.profile_completed_at === 'string' &&
            profile.profile_completed_at.trim().length > 0;

          setOnboardingInitialSkinType(nextGoals.length > 0 ? nextSkinType : '');
          setOnboardingInitialGoals(nextGoals);

          if (nextSkinType) {
            setSkinType(nextSkinType);
          }

          if (nextGoals.length > 0) {
            setGoals(nextGoals);
          }

          setShowAutoOnboarding(!isProfileCompleted);
        } else {
          setShowAutoOnboarding(false);
        }

        if (loyaltyResult.status === 'fulfilled') {
          const points = toNumber(loyaltyResult.value.points_balance);
          if (points !== undefined) {
            setLoyaltyPoints(Math.max(0, Math.round(points)));
          }

          if (typeof loyaltyResult.value.tier === 'string' && loyaltyResult.value.tier.trim()) {
            setLoyaltyTier(loyaltyResult.value.tier.toLowerCase());
          }
        }

        const homeResponse = homeResult.status === 'fulfilled' ? homeResult.value : null;
        const normalized = homeResponse
          ? extractHomeResults(homeResponse).map(({ item, sectionKey }, index) =>
              normalizeRec(item, index, sectionKey),
            )
          : [];

        if (normalized.length > 0) {
          const forYou = normalized.filter((item) => item.section === 'for_you');
          const becauseYouBought = normalized.filter((item) => item.section === 'because_you_bought');
          const trending = normalized.filter((item) => item.section === 'trending');
          const primaryPool = forYou.length > 0 ? [...forYou, ...becauseYouBought] : normalized;
          const primary = primaryPool.slice(0, 6);
          const primaryIds = new Set(primary.map((item) => item.id));
          const secondaryPool =
            trending.length > 0
              ? trending.filter((item) => !primaryIds.has(item.id))
              : normalized.filter((item) => !primaryIds.has(item.id));

          setRecommendations(primary);
          setTrendingRecommendations(secondaryPool.slice(0, 4));
        } else {
          setRecommendations([]);
          setTrendingRecommendations([]);
        }

        const homeNextOffer =
          homeResponse && typeof homeResponse === 'object' && !Array.isArray(homeResponse)
            ? (homeResponse as { next_offer?: unknown }).next_offer
            : undefined;
        const effectiveOffer =
          homeNextOffer && typeof homeNextOffer === 'object'
            ? (homeNextOffer as Record<string, unknown>)
            : offerResult.status === 'fulfilled'
              ? offerResult.value
              : null;

        setPersonalOffer(
          effectiveOffer && isRecord(effectiveOffer)
            ? buildPersonalOfferCard(effectiveOffer)
            : null,
        );

        try {
          const nextRoadmapPlan = await loadForYouRoadmap();
          if (cancelled) {
            return;
          }
          setRoadmapPlan(nextRoadmapPlan);
        } catch (error) {
          if (isAuthError(error)) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
          }
        }

        if (homeResult.status === 'rejected' && offerResult.status === 'rejected') {
          setLoadError('Не удалось загрузить рекомендации. Попробуйте ещё раз.');
        } else if (homeResult.status === 'rejected') {
          setLoadError('Часть персональных данных недоступна. Некоторые разделы рекомендаций могут быть временно пустыми.');
        } else if (offerResult.status === 'rejected') {
          setLoadError('Не удалось загрузить персональный оффер. Остальные данные отображаются.');
        }
      } catch {
        if (!cancelled) {
          setLoadError('Не удалось загрузить рекомендации. Попробуйте ещё раз.');
        }
      } finally {
        if (!cancelled) {
          setIsDataLoading(false);
        }
      }
    };

    loadPersonalization().catch(() => {
      if (!cancelled) {
        setLoadError('Не удалось загрузить рекомендации. Попробуйте ещё раз.');
        setIsDataLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, retryKey, user]);

  const handleRecommendationClick = (product: RecommendationCard) => {
    const productId = Number(product.id);
    if (!Number.isFinite(productId)) {
      return;
    }

    void sendEvent({
      action: 'click',
      product_id: productId,
      page: 'for_you',
      section_key: product.section,
      context: { assignment_id: personalOffer?.assignmentId },
    }).catch(() => undefined);
  };

  const handleRecommendationAddToCart = async (product: RecommendationCard, quantity: number) => {
    try {
      const nextQuantity = await addToCart(product.id, quantity);
      toast.success('Р”РѕР±Р°РІР»РµРЅРѕ РІ РєРѕСЂР·РёРЅСѓ!', {
        description:
          nextQuantity > 1
            ? `РўРµРїРµСЂСЊ РІ РєРѕСЂР·РёРЅРµ ${nextQuantity} С€С‚.`
            : `+${product.pointsEarned} Р±Р°Р»Р»РѕРІ РїРѕСЃР»Рµ РїРѕРєСѓРїРєРё`,
      });

      const productId = Number(product.id);
      if (Number.isFinite(productId)) {
        void sendEvent({
          action: 'add_to_cart',
          product_id: productId,
          page: 'for_you',
          section_key: product.section,
          context: { assignment_id: personalOffer?.assignmentId },
        }).catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ РґРѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ РІ РєРѕСЂР·РёРЅСѓ');
    }
  };

  const handleRecommendationQuantityChange = async (product: RecommendationCard, quantity: number) => {
    try {
      await setCartQuantity(product.id, quantity);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ РєРѕСЂР·РёРЅСѓ');
    }
  };

  const handleRoadmapClick = () => {
    if (roadmapOverview.nextStepId === undefined) {
      return;
    }

    void clickRoadmapStep(roadmapOverview.nextStepId).catch(() => undefined);
  };

  const handleSavePrefs = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        skin_type: mapUiSkinTypeToApi(skinType),
        goals: mapUiGoalsToApi(goals),
      });
      setRetryKey((value) => value + 1);
      toast.success('Рекомендации обновлены!');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Не удалось сохранить настройки.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteOnboarding = async ({
    skinType: nextSkinType,
    goals: nextGoals,
  }: {
    skinType: string;
    goals: string[];
  }) => {
    setIsOnboardingSaving(true);
    try {
      await updateProfile({
        skin_type: mapUiSkinTypeToApi(nextSkinType),
        goals: mapUiGoalsToApi(nextGoals),
      });
      setSkinType(nextSkinType);
      setGoals(nextGoals);
      setOnboardingInitialSkinType(nextSkinType);
      setOnboardingInitialGoals(nextGoals);
      setShowAutoOnboarding(false);
      setRetryKey((value) => value + 1);
      toast.success('Рекомендации персонализированы!');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Не удалось сохранить персонализацию.');
      }
    } finally {
      setIsOnboardingSaving(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (isVerificationEmailSending) {
      return;
    }

    setIsVerificationEmailSending(true);
    try {
      const response = await resendVerificationEmail();
      if (response.already_verified) {
        toast.success('Email already confirmed.');
      } else {
        toast.success(`Confirmation email sent to ${response.email}.`);
      }
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(error instanceof Error ? error.message : 'Unable to send confirmation email.');
    } finally {
      setIsVerificationEmailSending(false);
    }
  };

  if (showAutoOnboarding) {
    return (
      <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[800px] mx-auto px-6 py-8 lg:py-12">
          {shouldShowEmailVerificationNotice && user?.email ? (
            <EmailVerificationNotice
              email={user.email}
              isSending={isVerificationEmailSending}
              onResend={() => void handleResendVerificationEmail()}
            />
          ) : null}
          <ColdStartState
            initialSkinType={onboardingInitialSkinType || undefined}
            initialGoals={onboardingInitialGoals}
            isSaving={isOnboardingSaving}
            onComplete={handleCompleteOnboarding}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {shouldShowEmailVerificationNotice && user?.email ? (
          <EmailVerificationNotice
            email={user.email}
            isSending={isVerificationEmailSending}
            onResend={() => void handleResendVerificationEmail()}
          />
        ) : null}

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-[#6B7280] mb-1">Персональный центр</p>
            <h1 className="text-3xl font-semibold text-[#111827]">
              Привет, {user?.username ?? 'Аяла'} ✦
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-[#EAE6EF]">
              <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
              <span className="text-sm font-semibold text-[#111827]">{loyaltyPoints.toLocaleString('ru')} баллов</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold ml-1">
                {formatTierLabel(loyaltyTier)}
              </span>
            </div>
          </div>
        </div>

        {isDataLoading && (
          <div className="mb-4 p-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#6B7280]">
            Загружаем персональные данные...
          </div>
        )}

        {loadError && (
          <div className="mb-4 p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
            <p className="text-sm text-[#B42318]">{loadError}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
            >
              Повторить
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ─── Main column ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ─── Next Best Action ─────────────────────────────── */}
            <div className="relative bg-[#111827] rounded-2xl p-6 mb-6 overflow-hidden">
              {/* decorative */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-[#FF4DB8]/10 translate-y-1/2 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF4DB8]/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[#FF4DB8]" />
                  </div>
                  <span className="text-xs text-white/60 font-medium uppercase tracking-wide">Ваш следующий шаг</span>
                </div>

                <h2 className="text-xl font-semibold text-white mb-2">
                  {roadmapHeading}
                </h2>
                <p className="text-sm text-white/70 mb-1">
                  {roadmapOverview.nextStepDescription}
                </p>

                {/* Relevance tag */}
                <p className="text-xs text-[#FF4DB8] mb-5 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Почему сейчас: {roadmapOverview.nextStepWhy}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Link
                    to="/me/roadmap"
                    onClick={handleRoadmapClick}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#111827] text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Перейти к шагу
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  {roadmapOverview.nextStepPoints ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
                      <span>+{roadmapOverview.nextStepPoints} баллов после покупки</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ─── Recommendations: For You ─────────────────────── */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFE1F2] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Специально для вас</h2>
                    <p className="text-xs text-[#6B7280]">На основе: {skinType.toLowerCase()} кожа · {goals.join(', ').toLowerCase()}</p>
                  </div>
                </div>
                <Link to="/catalog" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 transition-colors">
                  Все <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map(p => (
                    <EnhancedRecCard
                      key={p.id}
                      product={p}
                      cartQuantity={getCartQuantity(p.id)}
                      onAdd={handleRecommendationAddToCart}
                      onSetQuantity={handleRecommendationQuantityChange}
                      onProductClick={handleRecommendationClick}
                    />
                  ))}
                </div>
              ) : (
                <RecommendationEmptyState
                  title="Персональные рекомендации формируются"
                  description="Когда API соберёт товары под ваш профиль и roadmap, они появятся в этом блоке."
                  ctaLabel="Открыть каталог"
                  ctaTo="/catalog"
                />
              )}
            </section>

            {/* ─── Recommendations: Trending ──────────────────────── */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#111827]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">В тренде для вас</h2>
                    <p className="text-xs text-[#6B7280]">Популярно среди Gold-пользователей с похожим профилем</p>
                  </div>
                </div>
                <Link to="/new" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 transition-colors">
                  Все <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {trendingRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trendingRecommendations.map(p => (
                    <EnhancedRecCard
                      key={p.id}
                      product={p}
                      cartQuantity={getCartQuantity(p.id)}
                      onAdd={handleRecommendationAddToCart}
                      onSetQuantity={handleRecommendationQuantityChange}
                      onProductClick={handleRecommendationClick}
                    />
                  ))}
                </div>
              ) : (
                <RecommendationEmptyState
                  title="Тренды для вашего профиля пока не готовы"
                  description="Как только backend вернёт популярные товары для похожих пользователей, они появятся здесь."
                  ctaLabel="Смотреть новинки"
                  ctaTo="/new"
                />
              )}
            </section>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">

            {/* Loyalty Progress */}
            <LoyaltyProgressMini points={loyaltyPoints} tier={loyaltyTier} />

            {/* Roadmap Progress */}
            <Link to="/me/roadmap" className="block group" onClick={handleRoadmapClick}>
              <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF] hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-semibold text-[#111827]">Мой Roadmap</span>
                  <span className="ml-auto text-[10px] text-[#FF4DB8] font-semibold flex items-center gap-1">
                    Шаг {Math.min(roadmapOverview.currentStepIndex, Math.max(1, roadmapOverview.totalSteps))}/{Math.max(1, roadmapOverview.totalSteps)} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#111827] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, roadmapOverview.progressPercent))}%` }}
                  />
                </div>
                <div className="flex gap-1 mt-3">
                  {roadmapOverview.steps.map((step) => (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        step.state === 'completed' ? 'bg-[#111827] text-white' :
                        step.state === 'current' ? 'bg-[#FF4DB8] text-white' :
                        'bg-gray-100 text-[#6B7280]'
                      }`}>
                        {step.state === 'completed' ? <Check className="w-3 h-3" /> : step.stepIndex}
                      </div>
                      <span className="text-[8px] text-[#6B7280] text-center hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* Active Offer */}
            <div className="p-5 bg-white rounded-2xl border border-[#EAE6EF]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF4DB8] text-white">ОФФЕР</span>
                <span className="text-xs text-[#6B7280]">Персональный</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mt-2 mb-1">
                {personalOffer?.title ?? 'РџРµСЂСЃРѕРЅР°Р»СЊРЅС‹Р№ РѕС„С„РµСЂ РїРѕРєР° РЅРµРґРѕСЃС‚СѓРїРµРЅ'}
              </h3>
              <p className="text-xs text-[#6B7280] mb-3">
                {personalOffer?.description ?? 'РљРѕРіРґР° API РїРѕРґР±РµСЂС‘С‚ РїРѕРґС…РѕРґСЏС‰РµРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ, РѕРЅРѕ РїРѕСЏРІРёС‚СЃСЏ Р·РґРµСЃСЊ.'}
              </p>

              {/* Saving highlight */}
              <div className="flex items-center gap-2 p-3 bg-[#FFE1F2] rounded-xl mb-3">
                <Sparkles className="w-4 h-4 text-[#FF4DB8] flex-shrink-0" />
                <p className="text-xs text-[#111827]">
                  {personalOffer?.highlight ?? 'РЎРµР№С‡Р°СЃ РґР»СЏ РІР°С€РµРіРѕ РїСЂРѕС„РёР»СЏ РЅРµС‚ Р°РєС‚РёРІРЅРѕРіРѕ РїСЂРµРґР»РѕР¶РµРЅРёСЏ.'}
                </p>
              </div>

              {/* Countdown */}
              {hasOfferCountdown ? (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Истекает через:</span>
                  <span className="font-semibold text-[#111827]">
                    {Math.floor((offerCountdownMs ?? 0) / 3600000)}ч{' '}
                    {Math.floor(((offerCountdownMs ?? 0) % 3600000) / 60000)}мин
                  </span>
                </div>
              ) : null}
            </div>

            {/* Quick Preferences */}
            <QuickPrefsPanel
              skinType={skinType}
              setSkinType={setSkinType}
              goals={goals}
              setGoals={setGoals}
              onSave={handleSavePrefs}
              isSaving={isSaving}
            />

            {/* Quick actions */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-[#EAE6EF]">
              <p className="text-xs font-semibold text-[#111827] mb-3">Быстрые действия</p>
              <div className="flex flex-col gap-2.5">
                {sidebarQuickActions.map((item) => (
                  <div key={item.key} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? 'bg-[#111827]'
                        : item.muted
                          ? 'border border-[#D1D5DB] bg-white'
                          : 'border border-gray-300 bg-white'
                    }`}>
                      {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${
                        item.done
                          ? 'text-[#6B7280] line-through'
                          : item.muted
                            ? 'text-[#6B7280]'
                            : 'text-[#111827]'
                      }`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${
                      item.muted ? 'text-[#9CA3AF]' : 'text-[#FF4DB8]'
                    }`}>
                      {item.accent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
