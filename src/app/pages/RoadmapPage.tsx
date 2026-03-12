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
  type RoadmapStepPresentationApi,
  type RoadmapStepStatusApi,
  type RoadmapSummaryApi,
  updateRoadmapStep,
} from "../../shared/api/roadmap";
import {
  DEFAULT_ROADMAP_STEP_META,
  getRoadmapStepMeta,
  getRoadmapStepPresentation,
  mapRoadmapStatusToUiStatus,
} from "../../shared/roadmap/presentation";

type UiRoadmapStep = RoadmapStep & {
  apiStepId?: number;
  productType: string;
  rawStatus: string;
  why: string[];
  stepPoints?: number;
  stepWhy?: string;
  stepImproves?: string;
  stepBenefit?: string;
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

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim().length > 0) {
          return item.trim();
        }
      }
    }
  }

  return undefined;
}

function getStepPresentation(value: unknown): RoadmapStepPresentationApi | null {
  return isRecord(value) ? (value as RoadmapStepPresentationApi) : null;
}

function buildUiSteps(plan: RoadmapPlanApi): UiRoadmapStep[] {
  const rawSteps = Array.isArray(plan.steps) ? plan.steps : [];
  const summary = isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : undefined;
  const nextStep = summary && isRecord(summary.next_step) ? summary.next_step : undefined;

  const nextStepId =
    typeof nextStep?.step_id === "number"
      ? nextStep.step_id
      : typeof nextStep?.id === "number"
        ? nextStep.id
        : undefined;
  const nextStepIndex = typeof nextStep?.step_index === "number" ? nextStep.step_index : undefined;

  const firstCurrentCandidate = rawSteps.find(
    (step) => step && typeof step === "object" && (step.status === "missing" || step.status === "recommended"),
  );

  const fallbackCurrentId =
    firstCurrentCandidate && typeof firstCurrentCandidate.id === "number"
      ? firstCurrentCandidate.id
      : undefined;

  return rawSteps.map((step, index) => {
    const apiStep = isRecord(step) ? (step as RoadmapStepApi) : {};
    const apiStepId = typeof apiStep.id === "number" ? apiStep.id : undefined;
    const stepIndex = typeof apiStep.step_index === "number" ? apiStep.step_index : index + 1;
    const productType =
      typeof apiStep.product_type === "string" && apiStep.product_type ? apiStep.product_type : "routine_step";
    const apiStatus = typeof apiStep.status === "string" ? apiStep.status : "missing";

    const isCurrent =
      (nextStepId !== undefined && apiStepId === nextStepId) ||
      (nextStepId === undefined && nextStepIndex !== undefined && stepIndex === nextStepIndex) ||
      (nextStepId === undefined &&
        nextStepIndex === undefined &&
        apiStepId !== undefined &&
        apiStepId === fallbackCurrentId);

    const recommendedProduct = isRecord(apiStep.recommended_product) ? apiStep.recommended_product : null;
    const stepPresentation = getStepPresentation(apiStep.presentation);
    const productId =
      typeof apiStep.recommended_product_id === "number"
        ? String(apiStep.recommended_product_id)
        : recommendedProduct && (typeof recommendedProduct.id === "number" || typeof recommendedProduct.id === "string")
          ? String(recommendedProduct.id)
          : undefined;

    const productName =
      recommendedProduct && typeof recommendedProduct.name === "string" ? recommendedProduct.name : undefined;
    const productImage = firstString(
      recommendedProduct?.image_url,
      recommendedProduct?.image_urls,
    );
    const productPrice = toNumber(recommendedProduct?.price);
    const fallbackPresentation = getRoadmapStepPresentation(productType);

    return {
      id: apiStepId !== undefined ? String(apiStepId) : `step-${index + 1}`,
      apiStepId,
      productType,
      rawStatus: apiStatus,
      why: toWhyList(apiStep.why),
      stepPoints: toNumber(stepPresentation?.points),
      stepWhy: firstString(stepPresentation?.why),
      stepImproves: firstString(stepPresentation?.improves),
      stepBenefit: firstString(stepPresentation?.benefit),
      step_number: stepIndex,
      title:
        firstString(stepPresentation?.title, apiStep.title) ??
        fallbackPresentation.title,
      description:
        firstString(stepPresentation?.description, apiStep.description) ??
        fallbackPresentation.description,
      product_id: productId,
      product_name: productName,
      product_image: productImage,
      recommended_product: productId
        ? {
            id: productId,
            name: productName,
            image_url: productImage,
            price: recommendedProduct?.price,
            in_stock: recommendedProduct?.in_stock,
          }
        : null,
      status: mapRoadmapStatusToUiStatus(apiStatus, isCurrent),
      recommendation_score: toPercent(apiStep.score),
      price: productPrice,
      is_owned: apiStatus === "owned" || apiStatus === "completed",
    };
  });
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [steps, setSteps] = useState<UiRoadmapStep[]>([]);
  const [summary, setSummary] = useState<RoadmapSummaryApi | null>(null);
  const [planCategory, setPlanCategory] = useState<string | null>(null);

  const applyPlan = (plan: RoadmapPlanApi) => {
    setSteps(buildUiSteps(plan));
    setSummary(isRecord(plan.summary) ? (plan.summary as RoadmapSummaryApi) : null);
    setPlanCategory(typeof plan.category === "string" && plan.category ? plan.category : null);
  };

  useEffect(() => {
    let cancelled = false;

    const loadRoadmap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const plan = await getRoadmap();

        if (!cancelled) {
          applyPlan(plan);
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
        setPlanCategory(null);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить roadmap");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRoadmap();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const plan = await refreshRoadmap(planCategory ? { category: planCategory } : {});
      applyPlan(plan);
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

  const handleStepStatusChange = async (
    step: UiRoadmapStep,
    nextStatus: Extract<RoadmapStepStatusApi, "completed" | "skipped">,
  ) => {
    if (step.apiStepId === undefined) {
      return;
    }

    setPendingStepId(step.apiStepId);

    try {
      await updateRoadmapStep(step.apiStepId, nextStatus);
      const nextPlan = await getRoadmap(planCategory ?? undefined);
      applyPlan(nextPlan);
      toast.success(
        nextStatus === "completed"
          ? "Шаг отмечен как выполненный"
          : "Шаг пропущен и roadmap обновлен",
      );
    } catch (updateError) {
      if (updateError instanceof ApiError && (updateError.status === 401 || updateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Не удалось обновить статус шага",
      );
    } finally {
      setPendingStepId(null);
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
    typeof summary?.total_steps === "number" && summary.total_steps > 0 ? summary.total_steps : steps.length;

  const completedCount =
    typeof summary?.missing_steps_count === "number" && totalSteps > 0
      ? Math.max(0, totalSteps - summary.missing_steps_count)
      : steps.filter((step) => ["completed", "owned", "skipped"].includes(step.rawStatus)).length;

  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const totalPointsAvailable = useMemo(
    () =>
      steps.reduce((sum, step) => {
        const meta = getRoadmapStepMeta(step.productType) ?? DEFAULT_ROADMAP_STEP_META;
        return sum + (step.stepPoints ?? meta.points);
      }, 0),
    [steps],
  );

  const earnedPoints = useMemo(
    () =>
      steps
        .filter((step) => step.rawStatus === "completed" || step.rawStatus === "owned")
        .reduce((sum, step) => {
          const meta = getRoadmapStepMeta(step.productType) ?? DEFAULT_ROADMAP_STEP_META;
          return sum + (step.stepPoints ?? meta.points);
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
          <p className="text-gray-600 mb-6">Пошаговый план построения рутины на основе вашего профиля.</p>

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
              const meta = getRoadmapStepMeta(step.productType) ?? DEFAULT_ROADMAP_STEP_META;
              const stepWhy = step.stepWhy ?? meta.why;
              const stepImproves = step.stepImproves ?? meta.improves;
              const stepBenefit = step.stepBenefit ?? meta.benefit;
              const stepPoints = step.stepPoints ?? meta.points;
              const isPendingUpdate = step.apiStepId !== undefined && pendingStepId === step.apiStepId;
              const isRewarded = step.rawStatus === "completed" || step.rawStatus === "owned";
              const isSkipped = step.rawStatus === "skipped";
              const canUpdateStatus =
                step.apiStepId !== undefined &&
                !isPendingUpdate &&
                !isSkipped &&
                step.rawStatus !== "completed" &&
                step.rawStatus !== "owned";

              return (
                <div key={step.id} className="relative">
                  <RoadmapStepCard
                    step={step}
                    onProductClick={handleProductClick}
                    onStepClick={handleStepClick}
                  />

                  {!isRewarded && !isSkipped ? (
                    <div
                      className={`mt-1 mx-1 px-4 py-3 rounded-b-xl border border-t-0 bg-gray-50 border-gray-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${
                        step.status === "current" ? "border-[#FF4DB8]/20 bg-[#FFE1F2]/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
                          ✦ {stepWhy}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280] text-[10px]">
                          ↑ {stepImproves}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                        <span className="text-xs text-[#6B7280]">{stepBenefit}</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#FF4DB8]/30">
                          <Sparkles className="w-3 h-3 text-[#FF4DB8]" />
                          <span className="text-xs font-semibold text-[#FF4DB8]">+{stepPoints} б.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-2">
                        <button
                          type="button"
                          className="h-9 px-3 rounded-full border border-[#E5E7EB] bg-white text-xs font-medium text-[#6B7280] transition-colors hover:border-[#D1D5DB] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleStepStatusChange(step, "skipped")}
                          disabled={!canUpdateStatus}
                        >
                          {isPendingUpdate ? "Сохраняем..." : "Пропустить"}
                        </button>
                        <button
                          type="button"
                          className="h-9 px-3 rounded-full bg-[#111827] text-xs font-medium text-white transition-colors hover:bg-[#0B1220] disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleStepStatusChange(step, "completed")}
                          disabled={!canUpdateStatus}
                        >
                          {isPendingUpdate ? "Сохраняем..." : "Выполнено"}
                        </button>
                      </div>
                    </div>
                  ) : isSkipped ? (
                    <div className="mt-1 mx-1 px-4 py-2 rounded-b-xl border border-t-0 bg-amber-50 border-amber-100 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">Шаг пропущен, баллы не начислены</span>
                    </div>
                  ) : (
                    <div className="mt-1 mx-1 px-4 py-2 rounded-b-xl border border-t-0 bg-emerald-50 border-emerald-100 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">
                        {step.rawStatus === "owned" ? "Шаг уже закрыт вашим текущим продуктом" : `+${stepPoints} баллов начислено`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {isFullyCompleted && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-2">Поздравляем! Вы завершили все шаги.</h3>
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
