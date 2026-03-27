import { Check, Sparkles, Info } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
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
    match: (value: number) => `${value}% совпадение`,
    alreadyOwned: "Уже есть",
    openProduct: "Посмотреть товар",
    stepDetails: "Подробнее о шаге",
  },
  kk: {
    fallbackStep: "Күтім қадамы",
    fallbackDescription: "Жеке roadmap қадамы.",
    current: "Ағымдағы",
    match: (value: number) => `${value}% сәйкестік`,
    alreadyOwned: "Бар",
    openProduct: "Тауарды ашу",
    stepDetails: "Қадам туралы толығырақ",
  },
  en: {
    fallbackStep: "Care step",
    fallbackDescription: "Personal roadmap step.",
    current: "Current",
    match: (value: number) => `${value}% match`,
    alreadyOwned: "Already owned",
    openProduct: "View product",
    stepDetails: "More about this step",
  },
} as const;

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

  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
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
  const stepNumber = step.step_number ?? step.step_index ?? 1;

  const normalizedStatus = normalizeStatus(step.status);
  const isCompleted = normalizedStatus === "completed" || step.is_owned === true;
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
      className={`relative p-6 bg-white rounded-lg border transition-all ${
        isCompleted
          ? "border-green-200 bg-green-50/30"
          : isCurrent
            ? "border-pink-200 shadow-sm"
            : "border-gray-200"
      }`}
    >
      <div className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full text-sm font-semibold shadow-sm">
        {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
      </div>

      {isCurrent && (
        <div className="absolute -top-3 -right-3">
          <Badge variant="secondary" className="bg-pink-500 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            {copy.current}
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {productId && productName && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start gap-3">
              {productImage && (
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md border border-gray-200 overflow-hidden">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{productName}</p>
                <div className="flex items-center gap-2">
                  {price !== undefined && (
                    <p className="text-sm font-semibold text-gray-900">
                      {price.toLocaleString(locale)} ₸
                    </p>
                  )}
                  {recommendationScore !== undefined && recommendationScore > 0 && (
                    <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                      {copy.match(recommendationScore)}
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                      {copy.alreadyOwned}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!isCompleted && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3"
                onClick={() => onProductClick?.(productId)}
              >
                {copy.openProduct}
              </Button>
            )}
          </div>
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
