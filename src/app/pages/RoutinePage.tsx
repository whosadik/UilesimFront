import { useState } from "react";
import { Clock, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertBanner } from "../components/AlertBanner";
import { Badge } from "../components/Badge";
import { toast } from "sonner";

/**
 * DEV NOTES:
 * Endpoints:
 * - POST /api/routine/generate { profile_id: string }
 * - POST /api/routine/validate { routine_steps: [...] }
 * 
 * Generate response: { ok: true, routine: { morning: [...], evening: [...] } }
 * Validate response: { ok: true, validation: { is_valid: boolean, warnings: [...], suggestions: [...] } }
 * 
 * Rate limit: generate - 3 per day, validate - 10 per day
 */

interface RoutineStep {
  step_number: number;
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
}

const MOCK_ROUTINE: Routine = {
  morning: [
    {
      step_number: 1,
      action: "Очищение",
      product_id: "1",
      product_name: "Гель для умывания",
      product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      duration: "1-2 мин",
      notes: "Массируйте лицо круговыми движениями",
    },
    {
      step_number: 2,
      action: "Тонизирование",
      product_id: "2",
      product_name: "Тоник с гиалуроновой кислотой",
      product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      duration: "30 сек",
    },
    {
      step_number: 3,
      action: "Увлажнение",
      product_id: "3",
      product_name: "Увлажняющий крем",
      product_image: "https://images.unsplash.com/photo-1614098256829-12caee5a0eaa?w=400",
      duration: "1 мин",
    },
    {
      step_number: 4,
      action: "SPF защита",
      product_id: "4",
      product_name: "Солнцезащитный крем SPF 50",
      product_image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400",
      duration: "1 мин",
      notes: "Обязательно каждый день, даже зимой!",
    },
  ],
  evening: [
    {
      step_number: 1,
      action: "Демакияж",
      duration: "2-3 мин",
      notes: "Используйте гидрофильное масло или мицеллярную воду",
    },
    {
      step_number: 2,
      action: "Очищение",
      product_id: "1",
      product_name: "Гель для умывания",
      product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      duration: "1-2 мин",
    },
    {
      step_number: 3,
      action: "Сыворотка",
      product_id: "5",
      product_name: "Сыворотка с витамином C",
      product_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
      duration: "1 мин",
      notes: "2-3 капли на все лицо",
    },
    {
      step_number: 4,
      action: "Увлажнение",
      product_id: "6",
      product_name: "Ночной крем",
      product_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      duration: "1 мин",
    },
  ],
};

export default function RoutinePage() {
  const [routine, setRoutine] = useState<Routine | null>(MOCK_ROUTINE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<"morning" | "evening">("morning");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setValidationResult(null);

    // TODO: API call
    // POST /api/routine/generate { profile_id: user.id }

    setTimeout(() => {
      setRoutine(MOCK_ROUTINE);
      setIsGenerating(false);
      toast.success("Рутина создана на основе вашего профиля!");
    }, 2000);
  };

  const handleValidate = async () => {
    if (!routine) return;

    setIsValidating(true);

    // TODO: API call
    // POST /api/routine/validate { routine_steps: [...] }

    setTimeout(() => {
      const mockValidation = {
        is_valid: true,
        warnings: [],
        suggestions: [
          "Отличная рутина! Не забывайте использовать SPF каждый день.",
          "Рекомендуем добавить эксфолиацию 1-2 раза в неделю.",
        ],
      };

      setValidationResult(mockValidation);
      setIsValidating(false);
      toast.success("Рутина проверена!");
    }, 1500);
  };

  const currentSteps = routine ? routine[selectedTime] : [];
  const totalTime = currentSteps.reduce((sum, step) => {
    if (!step.duration) return sum;
    const minutes = parseInt(step.duration);
    return sum + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                disabled={!routine || isValidating}
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
        {/* Validation result */}
        {validationResult && (
          <div className="mb-6">
            <AlertBanner
              variant={validationResult.is_valid ? "success" : "warning"}
              title={validationResult.is_valid ? "Рутина валидна" : "Есть предупреждения"}
              message={
                validationResult.suggestions.length > 0
                  ? validationResult.suggestions.join(" ")
                  : "Ваша рутина выглядит отлично!"
              }
              dismissible
            />
          </div>
        )}

        {/* Content */}
        {!routine ? (
          <EmptyState
            icon={<Clock className="w-12 h-12" />}
            title="Создайте свою рутину"
            description="Сгенерируйте персональный план ухода за ко��ей на основе вашего профиля и предпочтений."
            action={{
              label: "Сгенерировать рутину",
              onClick: handleGenerate,
            }}
          />
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Создаем вашу персональную рутину...</p>
          </div>
        ) : (
          <>
            {/* Time selector */}
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

            {/* Total time */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Общее время</span>
                <Badge variant="secondary" className="bg-white text-gray-900">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  ~{totalTime} минут
                </Badge>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {currentSteps.map((step, index) => (
                <div
                  key={index}
                  className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex gap-4">
                    {/* Step number */}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full font-semibold">
                      {step.step_number}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{step.action}</h3>
                        {step.duration && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {step.duration}
                          </Badge>
                        )}
                      </div>

                      {/* Product */}
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
                          <Button variant="ghost" size="sm">
                            Подробнее
                          </Button>
                        </div>
                      )}

                      {/* Notes */}
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

            {/* Tips */}
            <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Советы</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Следуйте рутине регулярно для достижения лучших результатов</li>
                <li>• Дайте каждому средству впитаться перед нанесением следующего</li>
                <li>• Рутина создана на основе вашего типа кожи и целей</li>
                <li>• Обновляйте рутину при изменении профиля или покупке новых средств</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
