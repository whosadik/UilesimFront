import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Check, Flag, Map, RefreshCw, Sparkles, Star } from "lucide-react";
import { RoadmapStepCard, type RoadmapStep } from "../components/RoadmapStepCard";
import { RoadmapRewardModal } from "../components/RoadmapRewardModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { AlertBanner } from "../components/AlertBanner";
import { ErrorState } from "../components/ErrorState";
import { ProfileGate } from "../components/ProfileGate";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { useI18n } from "../../shared/i18n/LanguageContext";
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
  type RoadmapLanguage,
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

const roadmapPageCopy = {
  ru: {
    loadError: "Не удалось загрузить roadmap",
    refreshed: "Roadmap обновлен с учетом ваших предпочтений",
    created: "Новый Roadmap создан",
    refreshError: "Не удалось обновить roadmap",
    stepCompleted: "Шаг отмечен как выполненный",
    stepSkipped: "Шаг пропущен и roadmap обновлен",
    stepUpdateError: "Не удалось обновить статус шага",
    stepDetails: "Подробная информация о шаге",
    title: "Персональный Roadmap",
    refresh: "Обновить",
    subtitle: "Пошаговый план построения рутины на основе вашего профиля.",
    progress: "Прогресс рутины",
    stepsLabel: (done: number, total: number) => `${done}/${total} шагов`,
    stepsLabelShort: "шагов",
    points: "Баллы за Roadmap",
    pointsRemaining: (value: number) => `До полного завершения осталось ${value} баллов`,
    banner: "Roadmap формируется из ваших предпочтений и истории покупок.",
    loading: "Загружаем roadmap",
    errorTitle: "Не удалось загрузить roadmap",
    errorDescription: "Произошла ошибка при загрузке. Попробуйте еще раз.",
    whyLabel: "Почему",
    improvesLabel: "Улучшает",
    benefitLabel: "Эффект",
    pointsShort: "б.",
    pointsHint: "при покупке",
    saving: "Сохраняем...",
    skip: "Пропустить",
    skippedNoPoints: "Шаг пропущен, баллы не начислены",
    stepClosedByOwned: "Шаг уже закрыт вашим текущим продуктом",
    pointsGranted: (value: number) => `+${value} баллов начислено`,
    allDoneTitle: "Поздравляем! Вы завершили все шаги.",
    allDoneDescription: (value: number) => `Вы завершили roadmap и получили ${value} баллов.`,
    createNew: "Создать новый Roadmap",
    emptyTitle: "Roadmap не найден",
    emptyDescription: "Заполните профиль, чтобы получить персональные рекомендации.",
    fillProfile: "Заполнить профиль",
    finishLabel: "Цель: завершить рутину",
  },
  kk: {
    loadError: "Roadmap жүктеу мүмкін болмады",
    refreshed: "Roadmap сіздің қалауыңызға сай жаңартылды",
    created: "Жаңа Roadmap құрылды",
    refreshError: "Roadmap жаңарту мүмкін болмады",
    stepCompleted: "Қадам орындалды деп белгіленді",
    stepSkipped: "Қадам өткізіліп, roadmap жаңартылды",
    stepUpdateError: "Қадам күйін жаңарту мүмкін болмады",
    stepDetails: "Қадам туралы толық ақпарат",
    title: "Жеке Roadmap",
    refresh: "Жаңарту",
    subtitle: "Профильге негізделген рутинаны құрудың қадамдық жоспары.",
    progress: "Рутина прогресі",
    stepsLabel: (done: number, total: number) => `${done}/${total} қадам`,
    stepsLabelShort: "қадам",
    points: "Roadmap ұпайлары",
    pointsRemaining: (value: number) => `Толық аяқтауға дейін ${value} ұпай қалды`,
    banner: "Roadmap сіздің қалауларыңыз бен сатып алу тарихыңыздан құралады.",
    loading: "Roadmap жүктеп жатырмыз",
    errorTitle: "Roadmap жүктеу мүмкін болмады",
    errorDescription: "Жүктеу кезінде қате шықты. Қайталап көріңіз.",
    whyLabel: "Неге",
    improvesLabel: "Жақсартады",
    benefitLabel: "Әсері",
    pointsShort: "ұп.",
    pointsHint: "сатып алғанда",
    saving: "Сақтап жатырмыз...",
    skip: "Өткізу",
    skippedNoPoints: "Қадам өткізілді, ұпай есептелмеді",
    stepClosedByOwned: "Қадам сіздегі ағымдағы өніммен жабылған",
    pointsGranted: (value: number) => `+${value} ұпай есептелді`,
    allDoneTitle: "Құттықтаймыз! Барлық қадам аяқталды.",
    allDoneDescription: (value: number) => `Сіз roadmap-ты аяқтап, ${value} ұпай алдыңыз.`,
    createNew: "Жаңа Roadmap құру",
    emptyTitle: "Roadmap табылмады",
    emptyDescription: "Жеке ұсыныстар алу үшін профильді толтырыңыз.",
    fillProfile: "Профильді толтыру",
    finishLabel: "Мақсат: рутинаны аяқтау",
  },
  en: {
    loadError: "Could not load roadmap",
    refreshed: "Roadmap refreshed based on your preferences",
    created: "New roadmap created",
    refreshError: "Could not refresh roadmap",
    stepCompleted: "Step marked as completed",
    stepSkipped: "Step skipped and roadmap refreshed",
    stepUpdateError: "Could not update step status",
    stepDetails: "Step details",
    title: "Personal roadmap",
    refresh: "Refresh",
    subtitle: "A step-by-step routine plan based on your profile.",
    progress: "Routine progress",
    stepsLabel: (done: number, total: number) => `${done}/${total} steps`,
    stepsLabelShort: "steps",
    points: "Roadmap points",
    pointsRemaining: (value: number) => `${value} points remaining to complete all steps`,
    banner: "Roadmap is built from your preferences and purchase history.",
    loading: "Loading roadmap",
    errorTitle: "Could not load roadmap",
    errorDescription: "An error occurred while loading. Please try again.",
    whyLabel: "Why",
    improvesLabel: "Improves",
    benefitLabel: "Effect",
    pointsShort: "pts",
    pointsHint: "on purchase",
    saving: "Saving...",
    skip: "Skip",
    skippedNoPoints: "Step skipped, no points granted",
    stepClosedByOwned: "Step already closed by your current product",
    pointsGranted: (value: number) => `+${value} points granted`,
    allDoneTitle: "Congratulations! You completed all steps.",
    allDoneDescription: (value: number) => `You completed the roadmap and earned ${value} points.`,
    createNew: "Create new roadmap",
    emptyTitle: "Roadmap not found",
    emptyDescription: "Complete your profile to get personal recommendations.",
    fillProfile: "Complete profile",
    finishLabel: "Goal: complete the routine",
  },
} as const;

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

function buildUiSteps(plan: RoadmapPlanApi, language: RoadmapLanguage): UiRoadmapStep[] {
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
    const fallbackPresentation = getRoadmapStepPresentation(productType, language);

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
      status: apiStatus === "skipped" ? "skipped" : mapRoadmapStatusToUiStatus(apiStatus, isCurrent),
      recommendation_score:
        typeof apiStep.match_percent === "number"
          ? apiStep.match_percent
          : toPercent(apiStep.score),
      price: productPrice,
      is_owned: apiStatus === "owned" || apiStatus === "completed",
    };
  });
}

function RoadmapPageContent() {
  const { language } = useI18n();
  const copy = roadmapPageCopy[language];
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingStepId, setPendingStepId] = useState<number | null>(null);
  const [rewardPoints, setRewardPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [steps, setSteps] = useState<UiRoadmapStep[]>([]);
  const [summary, setSummary] = useState<RoadmapSummaryApi | null>(null);
  const [planCategory, setPlanCategory] = useState<string | null>(null);

  const applyPlan = (plan: RoadmapPlanApi) => {
    setSteps(buildUiSteps(plan, language));
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
        setError(loadError instanceof Error ? loadError.message : copy.loadError);
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
  }, [copy.loadError, language, location.pathname, navigate, retryKey]);

  const handleRefresh = async (forceNew = false) => {
    setIsRefreshing(true);

    try {
      const plan = await refreshRoadmap({
        ...(planCategory ? { category: planCategory } : {}),
        ...(forceNew ? { force_new: true } : {}),
      });
      applyPlan(plan);
      toast.success(forceNew ? copy.created : copy.refreshed);
    } catch (refreshError) {
      if (refreshError instanceof ApiError && (refreshError.status === 401 || refreshError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(copy.refreshError);
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
      const response = await updateRoadmapStep(step.apiStepId, nextStatus);
      const nextPlan = await getRoadmap(planCategory ?? undefined);
      applyPlan(nextPlan);
      const awarded = typeof response?.awarded_points === "number" ? response.awarded_points : 0;
      if (nextStatus === "completed" && awarded > 0) {
        setRewardPoints(awarded);
      } else {
        toast.success(
          nextStatus === "completed"
            ? copy.stepCompleted
            : copy.stepSkipped,
        );
      }
    } catch (updateError) {
      if (updateError instanceof ApiError && (updateError.status === 401 || updateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(
        updateError instanceof Error
          ? updateError.message
          : copy.stepUpdateError,
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
    toast.info(reason ?? copy.stepDetails);
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
        const localizedMeta = getRoadmapStepMeta(step.productType, language) ?? DEFAULT_ROADMAP_STEP_META;
        return sum + (step.stepPoints ?? localizedMeta.points);
      }, 0),
    [language, steps],
  );

  const earnedPoints = useMemo(
    () =>
      steps
        .filter((step) => step.rawStatus === "completed" || step.rawStatus === "owned")
        .reduce((sum, step) => {
          const localizedMeta = getRoadmapStepMeta(step.productType, language) ?? DEFAULT_ROADMAP_STEP_META;
          return sum + (step.stepPoints ?? localizedMeta.points);
        }, 0),
    [language, steps],
  );

  const isFullyCompleted = totalSteps > 0 && completedCount >= totalSteps;

  return (
    <>
    <RoadmapRewardModal
      open={rewardPoints !== null && rewardPoints > 0}
      points={rewardPoints ?? 0}
      onClose={() => setRewardPoints(null)}
    />
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="app-page-container py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Map className="w-7 h-7 text-gray-700 flex-shrink-0" />
                <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleRefresh()} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {copy.refresh}
              </Button>
            </div>
            <p className="text-gray-600 mb-6">{copy.subtitle}</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    {copy.progress}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-bold text-gray-900 leading-none">
                    {completedCount}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    / {totalSteps} {copy.stepsLabelShort}
                  </span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      {copy.points}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#FF4DB8]">
                    {totalPointsAvailable > 0
                      ? Math.round((earnedPoints / totalPointsAvailable) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-bold text-[#FF4DB8] leading-none">
                    {earnedPoints}
                  </span>
                  <span className="text-base font-medium text-pink-400">
                    / {totalPointsAvailable}
                  </span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4DB8] transition-all duration-500 rounded-full"
                    style={{
                      width: `${totalPointsAvailable > 0 ? (earnedPoints / totalPointsAvailable) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-page-container py-8">
        <div className="mb-6 max-w-3xl mx-auto">
          <AlertBanner
            variant="info"
            message={copy.banner}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text={copy.loading} />
          </div>
        ) : error ? (
          <ErrorState
            title={copy.errorTitle}
            description={copy.errorDescription}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : steps.length > 0 ? (
          <ol className="relative list-none p-0 m-0 max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const meta = getRoadmapStepMeta(step.productType, language) ?? DEFAULT_ROADMAP_STEP_META;
              const stepWhy = step.stepWhy ?? meta.why;
              const stepImproves = step.stepImproves ?? meta.improves;
              const stepBenefit = step.stepBenefit ?? meta.benefit;
              const stepPoints = step.stepPoints ?? meta.points;
              const isPendingUpdate = step.apiStepId !== undefined && pendingStepId === step.apiStepId;
              const isRewarded = step.rawStatus === "completed" || step.rawStatus === "owned";
              const isSkipped = step.rawStatus === "skipped";
              const isCompleted = isRewarded || isSkipped;
              const isCurrent = step.status === "current" && !isCompleted;
              const canUpdateStatus =
                step.apiStepId !== undefined &&
                !isPendingUpdate &&
                !isSkipped &&
                step.rawStatus !== "completed" &&
                step.rawStatus !== "owned";

              const isFirst = index === 0;
              const isLast = index === steps.length - 1;
              const prevStep = index > 0 ? steps[index - 1] : null;
              const prevDone = prevStep
                ? ["completed", "owned", "skipped"].includes(prevStep.rawStatus)
                : false;

              const stepNumber = step.step_number ?? index + 1;

              const circleClass = isRewarded
                ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200/70"
                : isSkipped
                  ? "bg-white border-amber-300 text-amber-600"
                  : isCurrent
                    ? "bg-[#FF4DB8] border-[#FF4DB8] text-white shadow-md shadow-pink-200"
                    : "bg-white border-gray-300 text-gray-500";

              const topLineColor = prevDone ? "bg-green-300" : "bg-gray-200";
              const bottomLineColor = isRewarded
                ? "bg-green-300"
                : isSkipped
                  ? "bg-gray-200"
                  : "bg-gray-200";

              return (
                <li
                  key={step.id}
                  className="relative grid grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] gap-3 sm:gap-5"
                >
                  {/* Timeline column */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-0.5 ${isFirst ? "h-2 bg-transparent" : `h-4 ${topLineColor}`}`}
                      aria-hidden
                    />
                    <div
                      className={`relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all ${circleClass}`}
                    >
                      {isRewarded ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        <span>{stepNumber}</span>
                      )}
                      {isCurrent && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping bg-pink-400/40"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div
                      className={`flex-1 w-0.5 mt-2 ${isLast ? "bg-transparent" : bottomLineColor}`}
                      aria-hidden
                    />
                  </div>

                  {/* Content column */}
                  <div className="min-w-0 pb-6">
                    <RoadmapStepCard
                      step={step}
                      onProductClick={handleProductClick}
                      onStepClick={handleStepClick}
                    />

                    {!isRewarded && !isSkipped ? (
                      <div
                        className={`px-4 py-3 rounded-b-xl border ${
                          isCurrent
                            ? "border-pink-300 bg-pink-50/40"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <dl className="space-y-1.5">
                          <div className="flex gap-2 text-xs leading-snug">
                            <dt className="flex-shrink-0 font-semibold text-[#FF4DB8] w-[68px]">
                              {copy.whyLabel}
                            </dt>
                            <dd className="text-gray-700">{stepWhy}</dd>
                          </div>
                          <div className="flex gap-2 text-xs leading-snug">
                            <dt className="flex-shrink-0 font-semibold text-gray-500 w-[68px]">
                              {copy.improvesLabel}
                            </dt>
                            <dd className="text-gray-700">{stepImproves}</dd>
                          </div>
                          <div className="flex gap-2 text-xs leading-snug">
                            <dt className="flex-shrink-0 font-semibold text-gray-500 w-[68px]">
                              {copy.benefitLabel}
                            </dt>
                            <dd className="text-gray-700">{stepBenefit}</dd>
                          </div>
                        </dl>
                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#FF4DB8]/30">
                            <Sparkles className="w-3 h-3 text-[#FF4DB8]" />
                            <span className="text-xs font-semibold text-[#FF4DB8]">
                              +{stepPoints} {copy.pointsShort}
                            </span>
                            <span className="text-[10px] text-gray-500 hidden sm:inline">
                              {copy.pointsHint}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="h-8 px-3 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleStepStatusChange(step, "skipped")}
                            disabled={!canUpdateStatus}
                          >
                            {isPendingUpdate ? copy.saving : copy.skip}
                          </button>
                        </div>
                      </div>
                    ) : isSkipped ? (
                      <div className="px-4 py-2.5 rounded-b-xl border bg-amber-50 border-amber-200 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">{copy.skippedNoPoints}</span>
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-b-xl border bg-emerald-50 border-green-200 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs text-emerald-700 font-medium">
                          {step.rawStatus === "owned" ? copy.stepClosedByOwned : copy.pointsGranted(stepPoints)}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}

            {/* Finish marker */}
            <li className="relative grid grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] gap-3 sm:gap-5">
              <div className="relative flex flex-col items-center">
                <div className={`w-0.5 h-4 ${isFullyCompleted ? "bg-green-300" : "bg-gray-200"}`} aria-hidden />
                <div
                  className={`relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                    isFullyCompleted
                      ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200/70"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  <Flag className="w-5 h-5" strokeWidth={2.5} />
                </div>
              </div>
              <div className="min-w-0 pt-1.5 sm:pt-2 pb-2">
                {isFullyCompleted ? (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-green-600" />
                    <h3 className="font-semibold text-gray-900 mb-2">{copy.allDoneTitle}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {copy.allDoneDescription(totalPointsAvailable)}
                    </p>
                    <Button variant="primary" onClick={() => handleRefresh(true)} disabled={isRefreshing}>
                      {copy.createNew}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-500 pt-1">
                    {copy.finishLabel}
                  </p>
                )}
              </div>
            </li>
          </ol>
        ) : (
          <EmptyState
            icon={<Map className="w-12 h-12" />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={{ label: copy.fillProfile, onClick: () => navigate("/me") }}
          />
        )}
      </div>
    </div>
    </>
  );
}

export default function RoadmapPage() {
  return (
    <ProfileGate>
      <RoadmapPageContent />
    </ProfileGate>
  );
}
