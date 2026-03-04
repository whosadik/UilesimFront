import { useState } from "react";
import { useNavigate } from "react-router";
import { Map, RefreshCw, Sparkles, ChevronRight, Star } from "lucide-react";
import { RoadmapStepCard, RoadmapStep } from "../components/RoadmapStepCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/Button";
import { AlertBanner } from "../components/AlertBanner";
import { toast } from "sonner";

/**
 * DEV NOTES:
 * Endpoints:
 * - GET /api/me/roadmap?category={category}
 * - POST /api/me/roadmap/refresh { category: string }
 * - PATCH /api/me/roadmap/steps/{step_id} { status: "completed" }
 * - POST /api/me/roadmap/steps/{step_id}/click (track event)
 * 
 * Response: { ok: true, roadmap: { category, steps: [...], updated_at } }
 * 
 * Rate limit: refresh - 1 per hour per category
 */

const CATEGORIES = [
  { id: "skincare", label: "Уход за кожей", icon: "✨" },
  { id: "makeup", label: "Макияж", icon: "💄" },
  { id: "hair", label: "Уход за волосами", icon: "💇" },
  { id: "fragrance", label: "Парфюмерия", icon: "🌸" },
];

const MOCK_STEPS: RoadmapStep[] = [
  {
    id: "s1",
    step_number: 1,
    title: "Очищение",
    description: "Начните с мягкого очищающего средства для вашего типа кожи",
    product_id: "1",
    product_name: "Гель для умывания La Roche-Posay",
    product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    status: "completed",
    recommendation_score: 95,
    price: 1200,
    is_owned: true,
  },
  {
    id: "s2",
    step_number: 2,
    title: "Тонизирование",
    description: "Восстановите pH баланс кожи с помощью тоника",
    product_id: "2",
    product_name: "Тоник The Ordinary",
    product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    status: "current",
    recommendation_score: 92,
    price: 890,
  },
  {
    id: "s3",
    step_number: 3,
    title: "Увлажнение",
    description: "Выберите крем соответствующий вашему типу кожи",
    status: "pending",
  },
  {
    id: "s4",
    step_number: 4,
    title: "Защита SPF",
    description: "Завершите утренний уход солнцезащитным кремом",
    status: "pending",
  },
  {
    id: "s5",
    step_number: 5,
    title: "Специальный уход",
    description: "Добавьте сыворотку или маску для усиления эффекта",
    status: "pending",
  },
];

// Points and explainability per step
const STEP_META: Record<string, { points: number; why: string; improves: string; benefit: string }> = {
  s1: { points: 120, why: "Основа любой рутины для жирной кожи", improves: "Очищение пор и уменьшение сальности", benefit: "Результат через 3–5 дней" },
  s2: { points: 89, why: "pH-баланс критичен для жирной кожи", improves: "Сужение пор и текстура", benefit: "Кожа матовее через 1 неделю" },
  s3: { points: 145, why: "Увлажнение нужно даже жирной коже", improves: "Барьерная функция и эластичность", benefit: "Меньше шелушений через 5–7 дней" },
  s4: { points: 190, why: "SPF — защита от пигментации", improves: "Профилактика пятен и старения", benefit: "Долгосрочный эффект" },
  s5: { points: 220, why: "Усиливает действие базовой рутины", improves: "Прицельная работа на конкретную проблему", benefit: "Видимый эффект через 4–6 недель" },
};

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("skincare");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [steps, setSteps] = useState<RoadmapStep[]>(MOCK_STEPS);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Roadmap обновлен с учетом ваших предпочтений");
    }, 1500);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleStepClick = (stepId: string) => {
    toast.info("Подробная информация о шаге");
  };

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progressPercent = (completedCount / steps.length) * 100;
  const totalPointsAvailable = Object.values(STEP_META).reduce((s, m) => s + m.points, 0);
  const earnedPoints = steps
    .filter(s => s.status === "completed")
    .reduce((sum, s) => sum + (STEP_META[s.id]?.points || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            Пошаговый план построения идеальной бьюти-рутины на основе вашего профиля
          </p>

          {/* Progress bar + loyalty summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Прогресс рутины</span>
                <span className="text-sm font-bold text-gray-900">
                  {completedCount}/{steps.length} шагов
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
                  style={{ width: `${totalPointsAvailable > 0 ? (earnedPoints / totalPointsAvailable) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-[#6B7280] mt-1.5">
                Завершите все шаги → получите {totalPointsAvailable - earnedPoints} баллов
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category selector */}
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

        {/* Info banner */}
        <div className="mb-6">
          <AlertBanner
            variant="info"
            message="Roadmap создан на основе вашего профиля. Рекомендации обновляются автоматически при изменении профиля или покупке товаров."
          />
        </div>

        {/* Steps with meta */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step) => {
              const meta = STEP_META[step.id];
              return (
                <div key={step.id} className="relative">
                  <RoadmapStepCard
                    step={step}
                    onProductClick={handleProductClick}
                    onStepClick={handleStepClick}
                  />
                  {/* Explainability + loyalty overlay */}
                  {meta && step.status !== "completed" && (
                    <div className={`mt-1 mx-1 px-4 py-3 rounded-b-xl border border-t-0 bg-gray-50 border-gray-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${
                      step.status === "current" ? "border-[#FF4DB8]/20 bg-[#FFE1F2]/30" : ""
                    }`}>
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
                  )}
                  {meta && step.status === "completed" && (
                    <div className="mt-1 mx-1 px-4 py-2 rounded-b-xl border border-t-0 bg-emerald-50 border-emerald-100 flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">+{meta.points} баллов начислено</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Completion state */}
            {completedCount === steps.length && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Поздравляем! Вы завершили все шаги!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы построили свою идеальную рутину и заработали {totalPointsAvailable} баллов.
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
            description="Завершите свой профиль, чтобы получить персональные рекомендации."
            action={{ label: "Заполнить профиль", onClick: () => navigate("/me") }}
          />
        )}
      </div>
    </div>
  );
}