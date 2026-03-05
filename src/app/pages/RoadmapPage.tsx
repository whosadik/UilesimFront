import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Map, RefreshCw, Sparkles, Star } from "lucide-react";
import { RoadmapStepCard, type RoadmapStep } from "../components/RoadmapStepCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { AlertBanner } from "../components/AlertBanner";
import { ErrorState } from "../components/ErrorState";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import {
  clickRoadmapStep,
  getRoadmap,
  refreshRoadmap,
  type RoadmapPlanApi,
  type RoadmapStepApi,
  type RoadmapSummaryApi,
} from "../../shared/api/roadmap";

type UiRoadmapStep = RoadmapStep & {
  apiStepId?: number;
  productType: string;
  rawStatus: string;
  why: string[];
};

type StepMeta = {
  points: number;
  why: string;
  improves: string;
  benefit: string;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";

const CATEGORIES = [
  { id: "skincare", label: "Уход за кожей", icon: "✨" },
  { id: "makeup", label: "Макияж", icon: "💄" },
  { id: "haircare", label: "Уход за волосами", icon: "💇" },
  { id: "fragrance", label: "Парфюмерия", icon: "🌸" },
];

const STEP_TEXT_BY_TYPE: Record<string, { title: string; description: string }> = {
  cleanser: {
    title: "Очищение",
    description: "Начните с мягкого очищающего средства для вашего типа кожи.",
  },
  toner: {
    title: "Тонизирование",
    description: "Восстановите баланс кожи с помощью подходящего тоника.",
  },
  serum: {
    title: "Сыворотка",
    description: "Добавьте активный этап для решения конкретной задачи кожи.",
  },
  moisturizer: {
    title: "Увлажнение",
    description: "Закрепите уход увлажняющим средством для поддержания барьера кожи.",
  },
  spf: {
    title: "Защита SPF",
    description: "Завершите дневной уход средством с солнцезащитой.",
  },
  shampoo: {
    title: "Очищение кожи головы",
    description: "Выберите шампунь по типу кожи головы и частоте мытья.",
  },
  conditioner: {
    title: "Кондиционирование",
    description: "Используйте кондиционер для защиты длины и блеска волос.",
  },
  hair_mask: {
    title: "Маска для волос",
    description: "Добавьте еженедельный восстановительный этап ухода.",
  },
  hair_oil: {
    title: "Масло для волос",
    description: "Используйте масло для защиты и гладкости длины.",
  },
  scalp_serum: {
    title: "Сыворотка для кожи головы",
    description: "Добавьте целевой уход для кожи головы и корней.",
  },
  foundation: {
    title: "Тон",
    description: "Подберите основу, подходящую по тону и типу кожи.",
  },
  eyeshadow: {
    title: "Акцент для глаз",
    description: "Добавьте продукт для акцента и завершения макияжа.",
  },
  lipstick: {
    title: "Акцент для губ",
    description: "Завершите образ подходящим оттенком для губ.",
  },
  perfume: {
    title: "Парфюмерная база",
    description: "Подберите аромат, который соответствует вашим предпочтениям.",
  },
};

const STEP_META_BY_TYPE: Record<string, StepMeta> = {
  cleanser: {
    points: 120,
    why: "Базовый шаг для стабильной рутины.",
    improves: "Очищение и подготовка кожи.",
    benefit: "Первые изменения обычно заметны в течение недели.",
  },
  toner: {
    points: 90,
    why: "Помогает выровнять баланс после очищения.",
    improves: "Комфорт и текстура кожи.",
    benefit: "Кожа выглядит более ровной и спокойной.",
  },
  serum: {
    points: 140,
    why: "Целевой шаг под вашу текущую задачу.",
    improves: "Выраженность ключевой проблемы.",
    benefit: "Результат обычно проявляется через 2–4 недели.",
  },
  moisturizer: {
    points: 130,
    why: "Закрепляет эффект предыдущих шагов.",
    improves: "Защитный барьер и эластичность.",
    benefit: "Меньше сухости и дискомфорта.",
  },
  spf: {
    points: 190,
    why: "Ключевой этап дневной защиты кожи.",
    improves: "Профилактику пигментации и фотостарения.",
    benefit: "Долгосрочная защита результата ухода.",
  },
  shampoo: {
    points: 100,
    why: "Основа регулярного ухода за волосами.",
    improves: "Состояние кожи головы.",
    benefit: "Чистота и комфорт между мытьем.",
  },
  conditioner: {
    points: 110,
    why: "Нужен для защиты длины после очищения.",
    improves: "Мягкость и управляемость волос.",
    benefit: "Меньше спутывания и ломкости.",
  },
  hair_mask: {
    points: 150,
    why: "Усиливает базовый уход раз в неделю.",
    improves: "Плотность и восстановление длины.",
    benefit: "Волосы выглядят более гладкими.",
  },
  hair_oil: {
    points: 130,
    why: "Защищает длину от пересушивания.",
    improves: "Гладкость и блеск.",
    benefit: "Меньше пушения и сухости кончиков.",
  },
  scalp_serum: {
    points: 145,
    why: "Целевой уход за кожей головы.",
    improves: "Баланс и комфорт кожи головы.",
    benefit: "Повышает эффективность всей рутины.",
  },
};

const DEFAULT_META: StepMeta = {
  points: 100,
  why: "Персональный шаг подобран на основе ваших данных.",
  improves: "Результат вашей рутины.",
  benefit: "Улучшения обычно заметны при регулярном использовании.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

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

function toWhyList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function formatProductType(productType: string): string {
  const prepared = productType.replace(/_/g, " ").trim();
  if (!prepared) {
    return "Шаг ухода";
  }

  return prepared[0].toUpperCase() + prepared.slice(1);
}

function getStepPresentation(productType: string): { title: string; description: string } {
  return (
    STEP_TEXT_BY_TYPE[productType] ?? {
      title: formatProductType(productType),
      description: "Персональный шаг, добавленный в ваш roadmap.",
    }
  );
}

function mapStatusToUiStatus(
  apiStatus: string,
  isCurrent: boolean,
): "pending" | "completed" | "current" {
  if (isCurrent) {
    return "current";
  }

  if (apiStatus === "completed" || apiStatus === "owned" || apiStatus === "skipped") {
    return "completed";
  }

  return "pending";
}

function buildUiSteps(plan: RoadmapPlanApi): UiRoadmapStep[] {
  const rawSteps = Array.isArray(plan.steps) ? plan.steps : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : undefined;
  const nextStep = summary && isRecord(summary.next_step) ? summary.next_step : undefined;

  const nextStepId = typeof nextStep?.id === "number" ? nextStep.id : undefined;
  const nextStepIndex = typeof nextStep?.step_index === "number" ? nextStep.step_index : undefined;

  const firstCurrentCandidate = rawSteps.find((step) =>
    step &&
    typeof step === "object" &&
    (step.status === "missing" || step.status === "recommended"),
  );

  const fallbackCurrentId =
    firstCurrentCandidate && typeof firstCurrentCandidate.id === "number"
      ? firstCurrentCandidate.id
      : undefined;

  return rawSteps.map((step, index) => {
    const apiStep = isRecord(step) ? (step as RoadmapStepApi) : {};
    const apiStepId = typeof apiStep.id === "number" ? apiStep.id : undefined;
    const stepIndex = typeof apiStep.step_index === "number" ? apiStep.step_index : index + 1;
    const productType = typeof apiStep.product_type === "string" && apiStep.product_type
      ? apiStep.product_type
      : "routine_step";
    const apiStatus = typeof apiStep.status === "string" ? apiStep.status : "missing";

    const isCurrent =
      (nextStepId !== undefined && apiStepId === nextStepId) ||
      (nextStepId === undefined && nextStepIndex !== undefined && stepIndex === nextStepIndex) ||
      (nextStepId === undefined && nextStepIndex === undefined && apiStepId !== undefined && apiStepId === fallbackCurrentId);

    const recommendedProduct = isRecord(apiStep.recommended_product)
      ? apiStep.recommended_product
      : null;

    const productId =
      recommendedProduct && (typeof recommendedProduct.id === "number" || typeof recommendedProduct.id === "string")
        ? String(recommendedProduct.id)
        : undefined;

    const productName =
      recommendedProduct && typeof recommendedProduct.name === "string"
        ? recommendedProduct.name
        : undefined;

    const presentation = getStepPresentation(productType);

    return {
      id: apiStepId !== undefined ? String(apiStepId) : `step-${index + 1}`,
      apiStepId,
      productType,
      rawStatus: apiStatus,
      why: toWhyList(apiStep.why),
      step_number: stepIndex,
      title: presentation.title,
      description: presentation.description,
      product_id: productId,
      product_name: productName,
      product_image: productId ? FALLBACK_IMAGE : undefined,
      status: mapStatusToUiStatus(apiStatus, isCurrent),
      recommendation_score: toPercent(apiStep.score),
      price: toNumber(recommendedProduct?.price),
      is_owned: apiStatus === "owned" || apiStatus === "completed",
    };
  });
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState("skincare");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [steps, setSteps] = useState<UiRoadmapStep[]>([]);
  const [summary, setSummary] = useState<RoadmapSummaryApi | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoadmap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const plan = await getRoadmap(selectedCategory);
        const mappedSteps = buildUiSteps(plan);

        if (!cancelled) {
          setSteps(mappedSteps);
          setSummary(isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        setSteps([]);
        setSummary(null);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить roadmap");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRoadmap();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey, selectedCategory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const plan = await refreshRoadmap({ category: selectedCategory });
      const mappedSteps = buildUiSteps(plan);
      setSteps(mappedSteps);
      setSummary(isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null);
      toast.success("Roadmap обновлен с учетом ваших предпочтений");
    } catch (refreshError) {
      if (refreshError instanceof ApiError && (refreshError.status === 401 || refreshError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error("Не удалось обновить roadmap");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProductClick = (productId: string) => {
    const matchedStep = steps.find((step) => step.product_id === productId && step.apiStepId !== undefined);

    if (matchedStep?.apiStepId !== undefined) {
      void clickRoadmapStep(matchedStep.apiStepId).catch((clickError) => {
        if (clickError instanceof ApiError && (clickError.status === 401 || clickError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      });
    }

    navigate(`/product/${productId}`);
  };

  const handleStepClick = (stepId: string) => {
    const selectedStep = steps.find((step) => step.id === stepId);

    if (selectedStep?.apiStepId !== undefined) {
      void clickRoadmapStep(selectedStep.apiStepId).catch((clickError) => {
        if (clickError instanceof ApiError && (clickError.status === 401 || clickError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      });
    }

    const reason = selectedStep?.why[0];
    toast.info(reason ?? "Подробная информация о шаге");
  };

  const totalSteps =
    typeof summary?.total_steps === "number" && summary.total_steps > 0
      ? summary.total_steps
      : steps.length;

  const completedCount =
    typeof summary?.missing_steps_count === "number" && totalSteps > 0
      ? Math.max(0, totalSteps - summary.missing_steps_count)
      : steps.filter((step) => step.status === "completed").length;

  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const totalPointsAvailable = useMemo(
    () =>
      steps.reduce((sum, step) => {
        const meta = STEP_META_BY_TYPE[step.productType] ?? DEFAULT_META;
        return sum + meta.points;
      }, 0),
    [steps],
  );

  const earnedPoints = useMemo(
    () =>
      steps
        .filter((step) => step.status === "completed")
        .reduce((sum, step) => {
          const meta = STEP_META_BY_TYPE[step.productType] ?? DEFAULT_META;
          return sum + meta.points;
        }, 0),
    [steps],
  );

  const isFullyCompleted = totalSteps > 0 && completedCount >= totalSteps;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Map className="w-7 h-7 text-gray-700 flex-shrink-0" />
              <h1 className="text-3xl font-semibold text-gray-900">Персональный Roadmap</h1>
            </div>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
          <p className="text-gray-600 mb-6">
            Пошаговый план построения рутины на основе вашего профиля.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Прогресс рутины</span>
                <span className="text-sm font-bold text-gray-900">
                  {completedCount}/{totalSteps} шагов
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                  <span className="text-sm font-semibold text-gray-700">Баллы за Roadmap</span>
                </div>
                <span className="text-sm font-bold text-[#FF4DB8]">
                  {earnedPoints}/{totalPointsAvailable}
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4DB8] transition-all duration-500 rounded-full"
                  style={{
                    width: `${totalPointsAvailable > 0 ? (earnedPoints / totalPointsAvailable) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-1.5">
                До полного завершения осталось {Math.max(0, totalPointsAvailable - earnedPoints)} баллов
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>

        <div className="mb-6">
          <AlertBanner
            variant="info"
            message="Roadmap формируется из ваших предпочтений и истории покупок."
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Загружаем roadmap" />
          </div>
        ) : error ? (
          <ErrorState
            title="Не удалось загрузить roadmap"
            description="Произошла ошибка при загрузке. Попробуйте еще раз."
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step) => {
              const meta = STEP_META_BY_TYPE[step.productType] ?? DEFAULT_META;

              return (
                <div key={step.id} className="relative">
                  <RoadmapStepCard
                    step={step}
                    onProductClick={handleProductClick}
                    onStepClick={handleStepClick}
                  />

                  {step.status !== "completed" ? (
                    <div
                      className={`mt-1 mx-1 px-4 py-3 rounded-b-xl border border-t-0 bg-gray-50 border-gray-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${
                        step.status === "current" ? "border-[#FF4DB8]/20 bg-[#FFE1F2]/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
                          ✦ {meta.why}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280] text-[10px]">
                          ↑ {meta.improves}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                        <span className="text-xs text-[#6B7280]">{meta.benefit}</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#FF4DB8]/30">
                          <Sparkles className="w-3 h-3 text-[#FF4DB8]" />
                          <span className="text-xs font-semibold text-[#FF4DB8]">+{meta.points} б.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 mx-1 px-4 py-2 rounded-b-xl border border-t-0 bg-emerald-50 border-emerald-100 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">+{meta.points} баллов начислено</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isFullyCompleted && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Поздравляем! Вы завершили все шаги.
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы завершили roadmap и получили {totalPointsAvailable} баллов.
                </p>
                <Button variant="primary" onClick={handleRefresh}>
                  Создать новый Roadmap
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Map className="w-12 h-12" />}
            title="Roadmap не найден"
            description="Заполните профиль, чтобы получить персональные рекомендации."
            action={{ label: "Заполнить профиль", onClick: () => navigate("/me") }}
          />
        )}
      </div>
    </div>
  );
}
