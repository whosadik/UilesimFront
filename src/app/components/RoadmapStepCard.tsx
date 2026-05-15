import { ChevronRight, Sparkles, Info } from "lucide-react";
import { Badge } from "./Badge";
import { useI18n } from "../../shared/i18n/LanguageContext";

type UiStatus = "pending" | "completed" | "current";
type ApiStatus = "missing" | "recommended" | "owned" | "skipped" | "completed";
type StepStatus = UiStatus | ApiStatus;

type RecommendedProduct = {
  id?: string | number;
  name?: string;
  image_url?: string;
  price?: number | string | null;
  in_stock?: boolean;
};

export interface RoadmapStep {
  id: string | number;
  step_number?: number;
  step_index?: number;
  title?: string;
  description?: string;
  product_id?: string | number;
  product_name?: string;
  product_image?: string;
  recommended_product?: RecommendedProduct | null;
  status?: StepStatus;
  recommendation_score?: number | string;
  score?: number | string | null;
  price?: number | string | null;
  is_owned?: boolean;
  product_type?: string;
}

interface RoadmapStepCardProps {
  step: RoadmapStep;
  onProductClick?: (productId: string) => void;
  onStepClick?: (stepId: string) => void;
}

const roadmapStepCardCopy = {
  ru: {
    fallbackStep: "Шаг ухода",
    fallbackDescription: "Персональный шаг roadmap.",
    current: "Текущий",
    matchIdeal: "Идеально подходит",
    matchGood: "Подходит",
    matchPartial: "Частично подходит",
    alreadyOwned: "Уже есть",
    openProduct: "Посмотреть товар",
    stepDetails: "Подробнее о шаге",
  },
  kk: {
    fallbackStep: "Күтім қадамы",
    fallbackDescription: "Жеке roadmap қадамы.",
    current: "Ағымдағы",
    matchIdeal: "Тамаша сәйкес келеді",
    matchGood: "Сәйкес келеді",
    matchPartial: "Жартылай сәйкес",
    alreadyOwned: "Бар",
    openProduct: "Тауарды ашу",
    stepDetails: "Қадам туралы толығырақ",
  },
  en: {
    fallbackStep: "Care step",
    fallbackDescription: "Personal roadmap step.",
    current: "Current",
    matchIdeal: "Perfect match",
    matchGood: "Good match",
    matchPartial: "Partial match",
    alreadyOwned: "Already owned",
    openProduct: "View product",
    stepDetails: "More about this step",
  },
} as const;

type MatchTier = "ideal" | "good" | "partial" | null;

function matchTier(percent: number | undefined): MatchTier {
  if (percent === undefined) return null;
  if (percent >= 80) return "ideal";
  if (percent >= 60) return "good";
  if (percent >= 40) return "partial";
  return null;
}

function matchLabel(copy: (typeof roadmapStepCardCopy)[keyof typeof roadmapStepCardCopy], tier: MatchTier): string | null {
  if (tier === "ideal") return copy.matchIdeal;
  if (tier === "good") return copy.matchGood;
  if (tier === "partial") return copy.matchPartial;
  return null;
}

const MATCH_TIER_CLASSES: Record<Exclude<MatchTier, null>, string> = {
  ideal: "bg-purple-50 text-purple-700",
  good: "bg-blue-50 text-blue-700",
  partial: "bg-gray-100 text-gray-700",
};

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toPercent(value: unknown): number | undefined {
  const numeric = toNumber(value);
  if (numeric === undefined) {
    return undefined;
  }

  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function normalizeStatus(status?: StepStatus): UiStatus {
  if (status === "current" || status === "recommended") {
    return "current";
  }

  if (status === "completed" || status === "owned" || status === "skipped") {
    return "completed";
  }

  return "pending";
}

export function RoadmapStepCard({ step, onProductClick, onStepClick }: RoadmapStepCardProps) {
  const { language } = useI18n();
  const copy = roadmapStepCardCopy[language];
  const locale = language === "kk" ? "kk-KZ" : language === "en" ? "en-US" : "ru-RU";
  const recommendedProduct = step.recommended_product ?? null;

  const stepId = String(step.id);

  const isSkipped = step.status === "skipped";
  const normalizedStatus = normalizeStatus(step.status);
  const isCompleted = !isSkipped && (normalizedStatus === "completed" || step.is_owned === true);
  const isCurrent = normalizedStatus === "current" && !isCompleted;

  const title =
    typeof step.title === "string" && step.title.trim()
      ? step.title
      : copy.fallbackStep;
  const description =
    typeof step.description === "string" && step.description.trim()
      ? step.description
      : copy.fallbackDescription;

  const productIdRaw = step.product_id ?? recommendedProduct?.id;
  const productId =
    productIdRaw !== undefined && productIdRaw !== null ? String(productIdRaw) : undefined;
  const productName =
    step.product_name ??
    (typeof recommendedProduct?.name === "string" ? recommendedProduct.name : undefined);
  const productImage =
    step.product_image ??
    (typeof recommendedProduct?.image_url === "string" ? recommendedProduct.image_url : undefined);

  const recommendationScore = toPercent(step.recommendation_score ?? step.score);
  const price = toNumber(step.price ?? recommendedProduct?.price);

  return (
    <div
      className={`relative p-5 sm:p-6 bg-white rounded-t-xl border border-b-0 transition-all ${
        isSkipped
          ? "border-amber-200 bg-amber-50/20"
          : isCompleted
            ? "border-green-200 bg-green-50/30"
            : isCurrent
              ? "border-pink-300 shadow-sm shadow-pink-100/60"
              : "border-gray-200"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {isCurrent && (
            <Badge
              variant="secondary"
              className="bg-pink-500 text-white border-none flex-shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {copy.current}
            </Badge>
          )}
        </div>

        {productId && productName && (
          <button
            type="button"
            onClick={() => !isCompleted && onProductClick?.(productId)}
            disabled={isCompleted}
            aria-label={!isCompleted ? `${copy.openProduct}: ${productName}` : productName}
            className={`w-full text-left p-2 rounded-lg border bg-gray-50 border-gray-100 inline-flex items-center gap-2.5 transition-colors group ${
              isCompleted ? "cursor-default" : "hover:bg-white hover:border-gray-200"
            }`}
          >
            {productImage ? (
              <div className="flex-shrink-0 w-11 h-11 bg-white rounded-md border border-gray-200 overflow-hidden">
                <img
                  src={productImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-11 h-11 bg-white rounded-md border border-gray-200" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {price !== undefined && (
                  <p className="text-sm font-semibold text-gray-900">
                    {price.toLocaleString(locale)} ₸
                  </p>
                )}
                {(() => {
                  const tier = matchTier(recommendationScore);
                  const label = matchLabel(copy, tier);
                  if (!tier || !label) return null;
                  return (
                    <Badge variant="secondary" className={`text-[10px] py-0 ${MATCH_TIER_CLASSES[tier]}`}>
                      {label}
                    </Badge>
                  );
                })()}
                {isCompleted && (
                  <Badge variant="secondary" className="text-[10px] py-0 bg-green-50 text-green-700">
                    {copy.alreadyOwned}
                  </Badge>
                )}
              </div>
            </div>
            {!isCompleted && (
              <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-[#FF4DB8] transition-colors" />
            )}
          </button>
        )}

        {!productId && !isCompleted && (
          <button
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => onStepClick?.(stepId)}
          >
            <Info className="w-4 h-4" />
            <span>{copy.stepDetails}</span>
          </button>
        )}
      </div>
    </div>
  );
}
