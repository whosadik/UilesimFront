import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Clock, History, AlertCircle } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { toast } from "sonner";
import { ApiError } from "../../shared/api/ApiError";
import { useI18n } from "../../shared/i18n/LanguageContext";
import {
  formatCatalogProductTypeLabel,
  formatCatalogTokenLabel,
} from "../../shared/catalog/presentation";
import {
  getRoutineHistory,
  type RoutineHistoryItemApi,
  type RoutineStepApi,
} from "../../shared/api/routines";

const copyByLang = {
  ru: {
    title: "История рутин",
    subtitle: "Последние сгенерированные рутины",
    back: "Вернуться к рутине",
    loadError: "Не удалось загрузить историю рутин.",
    errorTitle: "Ошибка загрузки",
    emptyTitle: "История пуста",
    emptyDescription: "Вы ещё не создавали рутин. Сгенерируйте первую в разделе рутины.",
    emptyAction: "Создать рутину",
    morning: "Утро",
    evening: "Вечер",
    missing: "Пропущено",
    skinType: (value: string) => `Тип кожи: ${value}`,
    noProduct: "— без продукта —",
    generatedAt: (formatted: string) => `Создано ${formatted}`,
  },
  kk: {
    title: "Рутиналар тарихы",
    subtitle: "Соңғы құрастырылған рутиналар",
    back: "Рутинаға оралу",
    loadError: "Рутина тарихын жүктеу мүмкін болмады.",
    errorTitle: "Жүктеу қатесі",
    emptyTitle: "Тарих бос",
    emptyDescription: "Сіз әлі рутина жасаған жоқсыз. Рутина бөлімінен алғашқысын жасаңыз.",
    emptyAction: "Рутина жасау",
    morning: "Таңертең",
    evening: "Кешке",
    missing: "Жоқ",
    skinType: (value: string) => `Тері түрі: ${value}`,
    noProduct: "— өнімсіз —",
    generatedAt: (formatted: string) => `Жасалған: ${formatted}`,
  },
  en: {
    title: "Routine history",
    subtitle: "Recent generated routines",
    back: "Back to routine",
    loadError: "Could not load routine history.",
    errorTitle: "Load error",
    emptyTitle: "History is empty",
    emptyDescription: "You haven't generated any routines yet. Create one from the routine page.",
    emptyAction: "Create routine",
    morning: "Morning",
    evening: "Evening",
    missing: "Missing",
    skinType: (value: string) => `Skin type: ${value}`,
    noProduct: "— no product —",
    generatedAt: (formatted: string) => `Created ${formatted}`,
  },
} as const;

function formatProductName(step: RoutineStepApi, fallback: string): string {
  const product = step.product;
  if (product && typeof product === "object") {
    const name = (product as { name?: unknown }).name;
    if (typeof name === "string" && name.trim().length > 0) {
      return name;
    }
  }
  return fallback;
}

function formatStepLabel(step: RoutineStepApi, language: keyof typeof copyByLang): string {
  if (typeof step.display_step === "string" && step.display_step.trim().length > 0) {
    return step.display_step;
  }
  if (typeof step.step === "string") {
    const catalogLabel = formatCatalogProductTypeLabel(step.step, language);
    if (catalogLabel) {
      return catalogLabel;
    }

    const normalized = step.step.replace(/_/g, " ").trim();
    if (normalized.length > 0) {
      return normalized[0].toUpperCase() + normalized.slice(1);
    }
  }
  return language === "ru" ? "Шаг" : language === "kk" ? "Қадам" : "Step";
}

function formatDate(value: string, locale: string): string {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function RoutineHistoryPage() {
  const { language } = useI18n();
  const copy = copyByLang[language];
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<RoutineHistoryItemApi[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRoutineHistory();
      setItems(response.items ?? []);
    } catch (loadError) {
      if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      setError(copy.loadError);
      toast.error(copy.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <History className="w-8 h-8 text-gray-700" />
                <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
              </div>
              <p className="text-gray-600">{copy.subtitle}</p>
            </div>
            <Link to="/me/routine">
              <Button variant="secondary">{copy.back}</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState title={copy.errorTitle} description={error} onRetry={load} />
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-12 h-12" />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={{
              label: copy.emptyAction,
              onClick: () => navigate("/me/routine"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const am = item.routine?.am ?? [];
              const pm = item.routine?.pm ?? [];
              const missingSteps = (item.missing_steps ?? [])
                .map((step) => formatCatalogProductTypeLabel(step, language) ?? step)
                .filter(Boolean);
              return (
                <div
                  key={item.id}
                  className="p-5 bg-white rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {copy.generatedAt(formatDate(item.created_at, language))}
                      </p>
                      {item.profile_skin_type && (
                        <p className="text-xs text-gray-500 mt-1">
                          {copy.skinType(formatCatalogTokenLabel(item.profile_skin_type, language) ?? item.profile_skin_type)}
                        </p>
                      )}
                    </div>
                    {missingSteps.length > 0 && (
                      <Badge className="bg-yellow-50 border-yellow-200 text-yellow-800">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        {copy.missing}: {missingSteps.join(", ")}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        {copy.morning}
                      </h3>
                      <ul className="space-y-1">
                        {am.map((step, index) => (
                          <li key={`am-${index}`} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-gray-500">{formatStepLabel(step, language)}:</span>
                            <span>{formatProductName(step, copy.noProduct)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        {copy.evening}
                      </h3>
                      <ul className="space-y-1">
                        {pm.map((step, index) => (
                          <li key={`pm-${index}`} className="text-sm text-gray-700 flex gap-2">
                            <span className="text-gray-500">{formatStepLabel(step, language)}:</span>
                            <span>{formatProductName(step, copy.noProduct)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
