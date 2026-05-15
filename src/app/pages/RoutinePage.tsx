import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronRight, Clock, Sparkles, CheckCircle, AlertCircle, History, Sun, Moon } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertBanner } from "../components/AlertBanner";
import { Badge } from "../components/Badge";
import { ErrorState } from "../components/ErrorState";
import { ProfileGate } from "../components/ProfileGate";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { useI18n } from "../../shared/i18n/LanguageContext";
import {
  formatCatalogProductTypeLabel,
  formatCatalogTokenList,
} from "../../shared/catalog/presentation";
import {
  generateRoutine,
  getSavedRoutine,
  saveRoutine,
  validateRoutine,
  type RoutineGenerateResponseApi,
  type RoutineProductApi,
  type RoutineStepApi,
  type RoutineValidateResponseApi,
  type SaveRoutinePayload,
  type ValidateRoutinePayload,
} from "../../shared/api/routines";

interface RoutineStep {
  step_number: number;
  api_step: string;
  action: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  duration?: string;
  notes?: string;
}

interface Routine {
  morning: RoutineStep[];
  evening: RoutineStep[];
  notes: string[];
}

interface RoutineValidationAlternative {
  id: string;
  name: string;
  brand?: string;
  image: string;
}

interface RoutineValidationSuggestion {
  key: string;
  step: string;
  apiStep: string;
  currentProductId?: string;
  currentProductName?: string;
  alternatives: RoutineValidationAlternative[];
}

interface RoutineValidationResult {
  is_valid: boolean;
  conflicts: string[];
  suggestions: RoutineValidationSuggestion[];
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";

const routinePageCopy = {
  ru: {
    stepLabels: { cleanser: "Очищение", toner: "Тонизирование", serum: "Сыворотка", moisturizer: "Увлажнение", spf: "SPF защита" },
    durations: { cleanser: "1-2 мин", toner: "30 сек", serum: "1 мин", moisturizer: "1 мин", spf: "1 мин" },
    spfNote: "Наносите каждый день как завершающий утренний шаг.",
    defaultTips: [
      "Следуйте рутине регулярно для достижения лучших результатов.",
      "Дайте каждому средству впитаться перед нанесением следующего.",
      "Рутина сформирована на основе вашего профиля и доступных продуктов.",
      "Обновляйте рутину при изменении профиля или покупках новых средств.",
    ],
    history: "История",
    stepFallback: "Шаг ухода",
    productFallback: (id: string) => `Товар #${id}`,
    valid: "Рутина валидна",
    warnings: "Есть предупреждения",
    alternativesFound: "Мы нашли альтернативы для шагов с конфликтующими активами.",
    currentProduct: (name: string) => `Текущий продукт: ${name}`,
    softerAlternatives: "Для этого шага найдены более мягкие альтернативы.",
    alternatives: "Альтернативы",
    open: "Открыть",
    apply: "Использовать",
    applied: "Продукт заменён в рутине.",
    saveError: "Не удалось сохранить изменения.",
    noAlternatives: "Пока нет подходящих альтернатив в каталоге.",
    generating: "Создаём вашу персональную рутину...",
    loadErrorTitle: "Не удалось загрузить рутину",
    createTitle: "Создайте свою рутину",
    createDescription: "Сгенерируйте персональный план ухода за кожей на основе вашего профиля и предпочтений.",
    createButton: "Сгенерировать рутину",
    morning: "Утренняя",
    evening: "Вечерняя",
    totalTime: "Общее время",
    minutes: (value: number) => `~${value} минут`,
    details: "Подробнее",
    tips: "Советы",
    generated: "Рутина создана на основе вашего профиля.",
    generateError: "Не удалось сгенерировать рутину. Попробуйте ещё раз.",
    generateToastError: "Не удалось сгенерировать рутину.",
    validated: "Рутина проверена.",
    validateError: "Не удалось проверить рутину.",
    title: "Моя рутина",
    subtitle: "Персональный план ухода за кожей, созданный на основе вашего профиля",
    validating: "Проверка...",
    validate: "Проверить",
    generatingButton: "Генерация...",
    generate: "Сгенерировать",
    activeConflictMessage: (pair: string[]) => `Конфликт активов в одной рутине: ${pair.join(" + ")}.`,
    tooManyStrongActives: (actives: string[]) =>
      `В вечерней рутине слишком много сильных активов: ${actives.join(", ")}.`,
  },
  kk: {
    stepLabels: { cleanser: "Тазарту", toner: "Тонерлеу", serum: "Сарысу", moisturizer: "Ылғалдандыру", spf: "SPF қорғаныс" },
    durations: { cleanser: "1-2 мин", toner: "30 сек", serum: "1 мин", moisturizer: "1 мин", spf: "1 мин" },
    spfNote: "Күн сайын таңертеңгі соңғы қадам ретінде жағыңыз.",
    defaultTips: [
      "Жақсы нәтижеге жету үшін рутинаны тұрақты ұстаныңыз.",
      "Келесі өнімді жағар алдында әр құралдың сіңуіне уақыт беріңіз.",
      "Рутина сіздің профиліңіз бен қолжетімді өнімдер негізінде құрылды.",
      "Профиль өзгергенде немесе жаңа өнімдер сатып алғанда рутинаны жаңартыңыз.",
    ],
    history: "Тарих",
    stepFallback: "Күтім қадамы",
    productFallback: (id: string) => `Тауар #${id}`,
    valid: "Рутина жарамды",
    warnings: "Ескертулер бар",
    alternativesFound: "Белсенді ингредиенттері қайшы келетін қадамдар үшін баламалар таптық.",
    currentProduct: (name: string) => `Ағымдағы өнім: ${name}`,
    softerAlternatives: "Бұл қадам үшін жұмсағырақ баламалар табылды.",
    alternatives: "Баламалар",
    open: "Ашу",
    apply: "Қолдану",
    applied: "Өнім рутинада ауыстырылды.",
    saveError: "Өзгерістерді сақтау мүмкін болмады.",
    noAlternatives: "Каталогта әзірге қолайлы баламалар жоқ.",
    generating: "Жеке рутинаны құрып жатырмыз...",
    loadErrorTitle: "Рутинаны жүктеу мүмкін болмады",
    createTitle: "Рутинаны жасаңыз",
    createDescription: "Профиль мен қалауыңыз негізінде тері күтімінің жеке жоспарын жасаңыз.",
    createButton: "Рутинаны жасау",
    morning: "Таңертеңгі",
    evening: "Кешкі",
    totalTime: "Жалпы уақыт",
    minutes: (value: number) => `~${value} минут`,
    details: "Толығырақ",
    tips: "Кеңестер",
    generated: "Рутина профиліңіз негізінде құрылды.",
    generateError: "Рутинаны жасау мүмкін болмады. Қайталап көріңіз.",
    generateToastError: "Рутинаны жасау мүмкін болмады.",
    validated: "Рутина тексерілді.",
    validateError: "Рутинаны тексеру мүмкін болмады.",
    title: "Менің рутинам",
    subtitle: "Профильге негізделген жеке тері күтімі жоспары",
    validating: "Тексеру...",
    validate: "Тексеру",
    generatingButton: "Жасалып жатыр...",
    generate: "Жасау",
    activeConflictMessage: (pair: string[]) => `Бір рутинаның ішінде белсенді заттар қайшы келеді: ${pair.join(" + ")}.`,
    tooManyStrongActives: (actives: string[]) =>
      `Кешкі рутинаның ішінде күшті белсенділер тым көп: ${actives.join(", ")}.`,
  },
  en: {
    stepLabels: { cleanser: "Cleanse", toner: "Tone", serum: "Serum", moisturizer: "Moisturize", spf: "SPF protection" },
    durations: { cleanser: "1-2 min", toner: "30 sec", serum: "1 min", moisturizer: "1 min", spf: "1 min" },
    spfNote: "Apply every day as the final morning step.",
    defaultTips: [
      "Follow the routine consistently for better results.",
      "Let each product absorb before applying the next one.",
      "The routine is built from your profile and available products.",
      "Refresh the routine when your profile changes or when you buy new products.",
    ],
    history: "History",
    stepFallback: "Care step",
    productFallback: (id: string) => `Product #${id}`,
    valid: "Routine is valid",
    warnings: "There are warnings",
    alternativesFound: "We found alternatives for steps with conflicting active ingredients.",
    currentProduct: (name: string) => `Current product: ${name}`,
    softerAlternatives: "Softer alternatives were found for this step.",
    alternatives: "Alternatives",
    open: "Open",
    apply: "Use",
    applied: "Product replaced in the routine.",
    saveError: "Could not save changes.",
    noAlternatives: "There are no suitable alternatives in the catalog yet.",
    generating: "Creating your personal routine...",
    loadErrorTitle: "Could not load routine",
    createTitle: "Create your routine",
    createDescription: "Generate a personal skincare plan based on your profile and preferences.",
    createButton: "Generate routine",
    morning: "Morning",
    evening: "Evening",
    totalTime: "Total time",
    minutes: (value: number) => `~${value} min`,
    details: "Details",
    tips: "Tips",
    generated: "Routine created based on your profile.",
    generateError: "Could not generate routine. Please try again.",
    generateToastError: "Could not generate routine.",
    validated: "Routine validated.",
    validateError: "Could not validate routine.",
    title: "My routine",
    subtitle: "A personal skincare plan created from your profile",
    validating: "Validating...",
    validate: "Validate",
    generatingButton: "Generating...",
    generate: "Generate",
    activeConflictMessage: (pair: string[]) => `Active ingredient conflict in one routine: ${pair.join(" + ")}.`,
    tooManyStrongActives: (actives: string[]) =>
      `Too many strong actives in the evening routine: ${actives.join(", ")}.`,
  },
} as const;

type RoutinePageCopy = (typeof routinePageCopy)[keyof typeof routinePageCopy];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function firstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function getRoutineProductImage(
  product: RoutineStepApi["product"] | RoutineProductApi | null | undefined,
): string | undefined {
  if (!isRecord(product)) {
    return undefined;
  }

  const images = Array.isArray(product.image_urls)
    ? product.image_urls.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  return firstNonEmptyString(product.image_url, ...images);
}

function formatStepName(
  step: string,
  labels: Record<string, string>,
  fallback: string,
  language: keyof typeof routinePageCopy,
): string {
  if (labels[step]) {
    return labels[step];
  }

  const catalogLabel = formatCatalogProductTypeLabel(step, language);
  if (catalogLabel) {
    return catalogLabel;
  }

  const prepared = step.replace(/_/g, " ").trim();
  if (!prepared) {
    return fallback;
  }

  return prepared[0].toUpperCase() + prepared.slice(1);
}

function toOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRoutineSteps(
  items: RoutineStepApi[] | undefined,
  copy: (typeof routinePageCopy)[keyof typeof routinePageCopy],
  language: keyof typeof routinePageCopy,
): RoutineStep[] {
  const source = Array.isArray(items) ? items : [];

  return source.map((item, index) => {
    const stepKey = typeof item.step === "string" ? item.step : "routine_step";
    const product = isRecord(item.product) ? item.product : null;

    const productId =
      product && (typeof product.id === "number" || typeof product.id === "string")
        ? String(product.id)
        : undefined;

    const productName =
      product && typeof product.name === "string" && product.name.trim().length > 0
        ? product.name
        : undefined;

    const stepNote =
      firstNonEmptyString(item.note) ??
      firstNonEmptyString(product?.application_text) ??
      (stepKey === "spf" ? copy.spfNote : undefined);

    return {
      step_number: index + 1,
      api_step: stepKey,
      action:
        firstNonEmptyString(item.display_step) ??
        formatStepName(stepKey, copy.stepLabels, copy.stepFallback, language),
      product_id: productId,
      product_name: productName,
      product_image: productId ? getRoutineProductImage(item.product) ?? FALLBACK_IMAGE : undefined,
      duration:
        firstNonEmptyString(item.duration_label) ??
        copy.durations[stepKey as keyof typeof copy.durations],
      notes: stepNote,
    };
  });
}

function mapGeneratedRoutine(
  response: RoutineGenerateResponseApi,
  copy: (typeof routinePageCopy)[keyof typeof routinePageCopy],
  language: keyof typeof routinePageCopy,
): Routine {
  const notes = Array.isArray(response.notes)
    ? response.notes.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    morning: mapRoutineSteps(response.am, copy, language),
    evening: mapRoutineSteps(response.pm, copy, language),
    notes,
  };
}

function mapValidationConflictMessage(
  conflict: unknown,
  copy: RoutinePageCopy,
  language: keyof typeof routinePageCopy,
): string | null {
  if (typeof conflict === "string" && conflict.trim().length > 0) {
    return conflict.trim();
  }

  if (!isRecord(conflict)) {
    return null;
  }

  if (conflict.type === "active_conflict" && Array.isArray(conflict.pair)) {
    const pair = formatCatalogTokenList(conflict.pair, language);
    if (pair.length >= 2) {
      return copy.activeConflictMessage(pair);
    }
  }

  if (conflict.type === "too_many_strong_actives" && Array.isArray(conflict.actives)) {
    const actives = formatCatalogTokenList(conflict.actives, language);
    if (actives.length > 0) {
      return copy.tooManyStrongActives(actives);
    }
  }

  return firstNonEmptyString(conflict.message) ?? null;
}

function mapValidationAlternativeProduct(product: unknown, copy: RoutinePageCopy): RoutineValidationAlternative | null {
  if (!isRecord(product)) {
    return null;
  }

  const productId =
    typeof product.id === "number" || typeof product.id === "string"
      ? String(product.id)
      : undefined;

  if (!productId) {
    return null;
  }

  return {
    id: productId,
    name: firstNonEmptyString(product.name) ?? copy.productFallback(productId),
    brand: firstNonEmptyString(product.brand),
    image: getRoutineProductImage(product) ?? FALLBACK_IMAGE,
  };
}

function mapValidationResult(
  response: RoutineValidateResponseApi,
  copy: RoutinePageCopy,
  language: keyof typeof routinePageCopy,
): RoutineValidationResult {
  const conflicts = Array.isArray(response.conflicts)
    ? response.conflicts
        .map((conflict) => mapValidationConflictMessage(conflict, copy, language))
        .filter((item): item is string => Boolean(item))
    : [];

  const suggestions = Array.isArray(response.suggestions)
    ? response.suggestions
        .map((item) => {
          if (!isRecord(item)) {
            return null;
          }

          const stepLabel =
            firstNonEmptyString(item.display_step) ??
            (typeof item.step === "string" && item.step
              ? formatStepName(item.step, copy.stepLabels, copy.stepFallback, language)
              : copy.stepFallback);
          const alternatives = Array.isArray(item.alternative_products)
            ? item.alternative_products
                .map((product) => mapValidationAlternativeProduct(product, copy))
                .filter((value): value is RoutineValidationAlternative => Boolean(value))
            : [];
          const currentProduct = mapValidationAlternativeProduct(item.current_product, copy);

          return {
            key: `${String(item.step ?? "step")}-${currentProduct?.id ?? "current"}`,
            step: stepLabel,
            apiStep: typeof item.step === "string" ? item.step : "",
            currentProductId: currentProduct?.id,
            currentProductName: currentProduct?.name,
            alternatives,
          };
        })
        .filter((value): value is RoutineValidationSuggestion => Boolean(value))
    : [];

  return {
    is_valid: Boolean(response.is_valid),
    conflicts,
    suggestions,
  };
}

function RoutinePageContent() {
  const { language } = useI18n();
  const copy = routinePageCopy[language];
  const navigate = useNavigate();
  const location = useLocation();

  const copyRef = useRef(copy);
  const languageRef = useRef(language);
  copyRef.current = copy;
  languageRef.current = language;
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<RoutineValidationResult | null>(null);
  const [selectedTime, setSelectedTime] = useState<"morning" | "evening">("morning");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getSavedRoutine();
        if (cancelled) return;
        if (response.routine) {
          setRoutine(mapGeneratedRoutine(response.routine, copyRef.current, languageRef.current));
        }
      } catch (loadError) {
        if (cancelled) return;
        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toSavePayload = (value: Routine): SaveRoutinePayload => ({
    am: value.morning.map((step) => ({
      step: step.api_step || "routine_step",
      product_id: toOptionalNumber(step.product_id) ?? null,
    })),
    pm: value.evening.map((step) => ({
      step: step.api_step || "routine_step",
      product_id: toOptionalNumber(step.product_id) ?? null,
    })),
    notes: value.notes,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await generateRoutine({ use_owned: true });
      const mapped = mapGeneratedRoutine(response, copy, language);
      setRoutine(mapped);
      toast.success(copy.generated);
    } catch (generateError) {
      if (generateError instanceof ApiError && (generateError.status === 401 || generateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      setError(
        generateError instanceof Error
          ? generateError.message
          : copy.generateError,
      );
      toast.error(copy.generateToastError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!routine) return;

    setIsValidating(true);
    setValidationResult(null);

    const payload: ValidateRoutinePayload = {
      am: routine.morning.map((step) => ({
        step: step.api_step || "routine_step",
        product_id: toOptionalNumber(step.product_id),
      })),
      pm: routine.evening.map((step) => ({
        step: step.api_step || "routine_step",
        product_id: toOptionalNumber(step.product_id),
      })),
    };

    try {
      const response = await validateRoutine(payload);
      setValidationResult(mapValidationResult(response, copy, language));
      toast.success(copy.validated);
    } catch (validateError) {
      if (validateError instanceof ApiError && (validateError.status === 401 || validateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error(copy.validateError);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyAlternative = async (
    suggestion: RoutineValidationSuggestion,
    alternative: RoutineValidationAlternative,
  ) => {
    if (!routine) return;

    const previous = routine;
    const replaceStep = (steps: RoutineStep[]): RoutineStep[] =>
      steps.map((step) => {
        const matchesStep = step.api_step === suggestion.apiStep;
        const matchesProduct = suggestion.currentProductId
          ? step.product_id === suggestion.currentProductId
          : true;
        if (!matchesStep || !matchesProduct) return step;
        return {
          ...step,
          product_id: alternative.id,
          product_name: alternative.name,
          product_image: alternative.image,
        };
      });

    const updated: Routine = {
      morning: replaceStep(routine.morning),
      evening: replaceStep(routine.evening),
      notes: routine.notes,
    };

    setRoutine(updated);
    setValidationResult((prev) =>
      prev
        ? {
            ...prev,
            suggestions: prev.suggestions.filter((item) => item.key !== suggestion.key),
          }
        : prev,
    );

    try {
      const response = await saveRoutine(toSavePayload(updated));
      if (response.routine) {
        setRoutine(mapGeneratedRoutine(response.routine, copy, language));
      }
      toast.success(copy.applied);
    } catch (saveError) {
      setRoutine(previous);
      if (saveError instanceof ApiError && (saveError.status === 401 || saveError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.saveError);
    }
  };

  const currentSteps = routine ? routine[selectedTime] : [];
  const tips = routine && routine.notes.length > 0 ? routine.notes : copy.defaultTips;
  const totalTime = currentSteps.reduce((sum, step) => {
    if (!step.duration) return sum;
    const minutes = parseInt(step.duration, 10);
    return sum + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="app-page-container py-8">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-7 h-7 text-gray-700 flex-shrink-0" />
                <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
              </div>
              <p className="text-gray-600">{copy.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/me/routine/history")}
                disabled={isGenerating || isValidating}
              >
                <History className="w-4 h-4 mr-2" />
                {copy.history}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleValidate}
                disabled={!routine || isValidating || isGenerating}
              >
                {isValidating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {copy.validating}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {copy.validate}
                  </>
                )}
              </Button>
              <Button variant="primary" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {copy.generatingButton}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {copy.generate}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-page-container py-8">
        <div className="max-w-3xl mx-auto">
        {validationResult && (
          <div className="mb-6 space-y-4">
            <AlertBanner
              variant={validationResult.is_valid ? "success" : "warning"}
                title={validationResult.is_valid ? copy.valid : copy.warnings}
                message={
                  validationResult.conflicts.length > 0
                    ? validationResult.conflicts.join(" ")
                  : validationResult.suggestions.length > 0
                    ? copy.alternativesFound
                  : copy.valid
                }
              dismissible
            />

            {!validationResult.is_valid && validationResult.suggestions.length > 0 && (
              <div className="space-y-3">
                {validationResult.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.key}
                    className="p-4 bg-white rounded-xl border border-yellow-200"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {suggestion.step}
                        </p>
                        <p className="text-xs text-gray-600">
                          {suggestion.currentProductName
                            ? copy.currentProduct(suggestion.currentProductName)
                            : copy.softerAlternatives}
                        </p>
                      </div>
                      <Badge className="bg-white border-yellow-300 text-yellow-700">
                        {copy.alternatives}
                      </Badge>
                    </div>

                    {suggestion.alternatives.length > 0 ? (
                      <div className="space-y-2">
                        {suggestion.alternatives.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-white rounded-md overflow-hidden border border-gray-200">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.brand && (
                                <p className="text-xs text-gray-500">{product.brand}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                className="px-3 py-2 text-xs"
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                {copy.open}
                              </Button>
                              <Button
                                variant="primary"
                                className="px-3 py-2 text-xs"
                                onClick={() => handleApplyAlternative(suggestion, product)}
                              >
                                {copy.apply}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {copy.noAlternatives}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isLoading && !routine ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : isGenerating && !routine ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">{copy.generating}</p>
          </div>
        ) : error && !routine ? (
          <ErrorState
            title={copy.loadErrorTitle}
            description={error}
            onRetry={handleGenerate}
          />
        ) : !routine ? (
          <EmptyState
            icon={<Clock className="w-12 h-12" />}
            title={copy.createTitle}
            description={copy.createDescription}
            action={{
              label: copy.createButton,
              onClick: handleGenerate,
            }}
          />
        ) : (
          <>
            {/* Segmented control + total time */}
            <div className="mb-6 p-1.5 bg-white rounded-2xl border border-gray-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedTime("morning")}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                  selectedTime === "morning"
                    ? "bg-[#FF4DB8] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Sun className="w-4 h-4" />
                {copy.morning}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTime("evening")}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                  selectedTime === "evening"
                    ? "bg-[#FF4DB8] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Moon className="w-4 h-4" />
                {copy.evening}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 mb-5 px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {copy.totalTime}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {copy.minutes(totalTime)}
              </span>
            </div>

            <ol className="relative list-none p-0 m-0 space-y-3">
              {currentSteps.map((step, index) => {
                const isLast = index === currentSteps.length - 1;
                return (
                  <li
                    key={index}
                    className="relative grid grid-cols-[40px_1fr] sm:grid-cols-[44px_1fr] gap-3 sm:gap-4"
                  >
                    {/* Timeline column */}
                    <div className="relative flex flex-col items-center">
                      <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-gray-900 text-white font-semibold text-sm">
                        {step.step_number}
                      </div>
                      {!isLast && (
                        <div className="flex-1 w-0.5 mt-1 bg-gray-200" aria-hidden />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 pb-1">
                      <div className="p-4 sm:p-5 bg-white rounded-xl border border-gray-200 transition-shadow hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 leading-tight">
                            {step.action}
                          </h3>
                          {step.duration && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 flex-shrink-0">
                              {step.duration}
                            </Badge>
                          )}
                        </div>

                        {step.product_id && step.product_name && (
                          <button
                            type="button"
                            onClick={() => navigate(`/product/${step.product_id}`)}
                            aria-label={`${copy.details}: ${step.product_name}`}
                            className="w-full text-left p-2 rounded-lg border bg-gray-50 border-gray-100 inline-flex items-center gap-2.5 transition-colors hover:bg-white hover:border-gray-200 group"
                          >
                            {step.product_image ? (
                              <div className="flex-shrink-0 w-11 h-11 bg-white rounded-md border border-gray-200 overflow-hidden">
                                <img
                                  src={step.product_image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-11 h-11 bg-white rounded-md border border-gray-200" />
                            )}
                            <p className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
                              {step.product_name}
                            </p>
                            <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-[#FF4DB8] transition-colors" />
                          </button>
                        )}

                        {step.notes && (
                          <div className="flex items-start gap-2 mt-3 text-xs text-gray-600 leading-relaxed">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />
                            <p>{step.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <Sparkles className="w-4 h-4 text-[#FF4DB8]" />
                {copy.tips}
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {tips.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[#FF4DB8]">•</span>
                    <span className="flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

export default function RoutinePage() {
  return (
    <ProfileGate>
      <RoutinePageContent />
    </ProfileGate>
  );
}

