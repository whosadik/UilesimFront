import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Clock, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertBanner } from "../components/AlertBanner";
import { Badge } from "../components/Badge";
import { ErrorState } from "../components/ErrorState";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import {
  generateRoutine,
  validateRoutine,
  type RoutineGenerateResponseApi,
  type RoutineProductApi,
  type RoutineStepApi,
  type RoutineValidateResponseApi,
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
  currentProductName?: string;
  alternatives: RoutineValidationAlternative[];
}

interface RoutineValidationResult {
  is_valid: boolean;
  conflicts: string[];
  suggestions: RoutineValidationSuggestion[];
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";

const STEP_LABELS: Record<string, string> = {
  cleanser: "Очищение",
  toner: "Тонизирование",
  serum: "Сыворотка",
  moisturizer: "Увлажнение",
  spf: "SPF защита",
};

const STEP_DURATIONS: Record<string, string> = {
  cleanser: "1-2 мин",
  toner: "30 сек",
  serum: "1 мин",
  moisturizer: "1 мин",
  spf: "1 мин",
};

const STEP_NOTES: Record<string, string> = {
  spf: "Наносите каждый день как завершающий утренний шаг.",
};

const DEFAULT_TIPS = [
  "Следуйте рутине регулярно для достижения лучших результатов.",
  "Дайте каждому средству впитаться перед нанесением следующего.",
  "Рутина сформирована на основе вашего профиля и доступных продуктов.",
  "Обновляйте рутину при изменении профиля или покупках новых средств.",
];

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

function formatStepName(step: string): string {
  if (STEP_LABELS[step]) {
    return STEP_LABELS[step];
  }

  const prepared = step.replace(/_/g, " ").trim();
  if (!prepared) {
    return "Шаг ухода";
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

function mapRoutineSteps(items: RoutineStepApi[] | undefined): RoutineStep[] {
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
      STEP_NOTES[stepKey];

    return {
      step_number: index + 1,
      api_step: stepKey,
      action:
        firstNonEmptyString(item.display_step) ??
        formatStepName(stepKey),
      product_id: productId,
      product_name: productName,
      product_image: productId ? getRoutineProductImage(item.product) ?? FALLBACK_IMAGE : undefined,
      duration:
        firstNonEmptyString(item.duration_label) ??
        STEP_DURATIONS[stepKey],
      notes: stepNote,
    };
  });
}

function mapGeneratedRoutine(response: RoutineGenerateResponseApi): Routine {
  const notes = Array.isArray(response.notes)
    ? response.notes.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    morning: mapRoutineSteps(response.am),
    evening: mapRoutineSteps(response.pm),
    notes,
  };
}

function mapValidationConflictMessage(conflict: unknown): string | null {
  if (typeof conflict === "string" && conflict.trim().length > 0) {
    return conflict.trim();
  }

  if (!isRecord(conflict)) {
    return null;
  }

  if (conflict.type === "active_conflict" && Array.isArray(conflict.pair)) {
    const pair = conflict.pair.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (pair.length >= 2) {
      return `Конфликт активов в одной рутине: ${pair.join(" + ")}.`;
    }
  }

  if (conflict.type === "too_many_strong_actives" && Array.isArray(conflict.actives)) {
    const actives = conflict.actives.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (actives.length > 0) {
      return `В вечерней рутине слишком много сильных активов: ${actives.join(", ")}.`;
    }
  }

  return firstNonEmptyString(conflict.message) ?? null;
}

function mapValidationAlternativeProduct(product: unknown): RoutineValidationAlternative | null {
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
    name: firstNonEmptyString(product.name) ?? `Товар #${productId}`,
    brand: firstNonEmptyString(product.brand),
    image: getRoutineProductImage(product) ?? FALLBACK_IMAGE,
  };
}

function mapValidationResult(response: RoutineValidateResponseApi): RoutineValidationResult {
  const conflicts = Array.isArray(response.conflicts)
    ? response.conflicts
        .map(mapValidationConflictMessage)
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
            (typeof item.step === "string" && item.step ? formatStepName(item.step) : "Шаг");
          const alternatives = Array.isArray(item.alternative_products)
            ? item.alternative_products
                .map(mapValidationAlternativeProduct)
                .filter((value): value is RoutineValidationAlternative => Boolean(value))
            : [];
          const currentProduct = mapValidationAlternativeProduct(item.current_product);

          return {
            key: `${String(item.step ?? "step")}-${currentProduct?.id ?? "current"}`,
            step: stepLabel,
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

export default function RoutinePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<RoutineValidationResult | null>(null);
  const [selectedTime, setSelectedTime] = useState<"morning" | "evening">("morning");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await generateRoutine({ use_owned: true });
      const mapped = mapGeneratedRoutine(response);
      setRoutine(mapped);
      toast.success("Рутина создана на основе вашего профиля.");
    } catch (generateError) {
      if (generateError instanceof ApiError && (generateError.status === 401 || generateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      setError(
        generateError instanceof Error
          ? generateError.message
          : "Не удалось сгенерировать рутину. Попробуйте ещё раз.",
      );
      toast.error("Не удалось сгенерировать рутину.");
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
      setValidationResult(mapValidationResult(response));
      toast.success("Рутина проверена.");
    } catch (validateError) {
      if (validateError instanceof ApiError && (validateError.status === 401 || validateError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }

      toast.error("Не удалось проверить рутину.");
    } finally {
      setIsValidating(false);
    }
  };

  const currentSteps = routine ? routine[selectedTime] : [];
  const tips = routine && routine.notes.length > 0 ? routine.notes : DEFAULT_TIPS;
  const totalTime = currentSteps.reduce((sum, step) => {
    if (!step.duration) return sum;
    const minutes = parseInt(step.duration, 10);
    return sum + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-gray-700" />
                <h1 className="text-3xl font-semibold text-gray-900">Моя рутина</h1>
              </div>
              <p className="text-gray-600">
                Персональный план ухода за кожей, созданный на основе вашего профиля
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleValidate}
                disabled={!routine || isValidating || isGenerating}
              >
                {isValidating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Проверить
                  </>
                )}
              </Button>
              <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Сгенерировать
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {validationResult && (
          <div className="mb-6 space-y-4">
            <AlertBanner
              variant={validationResult.is_valid ? "success" : "warning"}
              title={validationResult.is_valid ? "Рутина валидна" : "Есть предупреждения"}
              message={
                validationResult.conflicts.length > 0
                  ? validationResult.conflicts.join(" ")
                  : validationResult.suggestions.length > 0
                    ? "Мы нашли альтернативы для шагов с конфликтующими активами."
                  : "Ваша рутина выглядит отлично!"
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
                            ? `Текущий продукт: ${suggestion.currentProductName}`
                            : "Для этого шага найдены более мягкие альтернативы."}
                        </p>
                      </div>
                      <Badge className="bg-white border-yellow-300 text-yellow-700">
                        Альтернативы
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
                            <Button
                              variant="ghost"
                              className="px-4 py-2 text-xs"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              Открыть
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Пока нет подходящих альтернатив в каталоге.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isGenerating && !routine ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Создаём вашу персональную рутину...</p>
          </div>
        ) : error && !routine ? (
          <ErrorState
            title="Не удалось загрузить рутину"
            description={error}
            onRetry={handleGenerate}
          />
        ) : !routine ? (
          <EmptyState
            icon={<Clock className="w-12 h-12" />}
            title="Создайте свою рутину"
            description="Сгенерируйте персональный план ухода за кожей на основе вашего профиля и предпочтений."
            action={{
              label: "Сгенерировать рутину",
              onClick: handleGenerate,
            }}
          />
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedTime === "morning" ? "primary" : "secondary"}
                onClick={() => setSelectedTime("morning")}
                className="flex-1"
              >
                🌅 Утренняя
              </Button>
              <Button
                variant={selectedTime === "evening" ? "primary" : "secondary"}
                onClick={() => setSelectedTime("evening")}
                className="flex-1"
              >
                🌙 Вечерняя
              </Button>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Общее время</span>
                <Badge variant="secondary" className="bg-white text-gray-900">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  ~{totalTime} минут
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {currentSteps.map((step, index) => (
                <div
                  key={index}
                  className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full font-semibold">
                      {step.step_number}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{step.action}</h3>
                        {step.duration && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {step.duration}
                          </Badge>
                        )}
                      </div>

                      {step.product_id && step.product_name && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                          {step.product_image && (
                            <div className="w-12 h-12 bg-white rounded-md overflow-hidden border border-gray-200">
                              <img
                                src={step.product_image}
                                alt={step.product_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900 flex-1">
                            {step.product_name}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/product/${step.product_id}`)}
                          >
                            Подробнее
                          </Button>
                        </div>
                      )}

                      {step.notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                          <p>{step.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Советы</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

