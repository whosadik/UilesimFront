import { Check, Sparkles, Info } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface RoadmapStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  status: "pending" | "completed" | "current";
  recommendation_score?: number;
  price?: number;
  is_owned?: boolean;
}

interface RoadmapStepCardProps {
  step: RoadmapStep;
  onProductClick?: (productId: string) => void;
  onStepClick?: (stepId: string) => void;
}

export function RoadmapStepCard({ step, onProductClick, onStepClick }: RoadmapStepCardProps) {
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";

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
      {/* Step number badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full text-sm font-semibold shadow-sm">
        {isCompleted ? <Check className="w-4 h-4" /> : step.step_number}
      </div>

      {/* Current indicator */}
      {isCurrent && (
        <div className="absolute -top-3 -right-3">
          <Badge variant="secondary" className="bg-pink-500 text-white border-none">
            <Sparkles className="w-3 h-3 mr-1" />
            Текущий
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
          <p className="text-sm text-gray-600">{step.description}</p>
        </div>

        {/* Product recommendation */}
        {step.product_id && step.product_name && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start gap-3">
              {step.product_image && (
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-md border border-gray-200 overflow-hidden">
                  <img
                    src={step.product_image}
                    alt={step.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {step.product_name}
                </p>
                <div className="flex items-center gap-2">
                  {step.price && (
                    <p className="text-sm font-semibold text-gray-900">
                      {step.price.toLocaleString("ru-RU")} ₽
                    </p>
                  )}
                  {step.recommendation_score && (
                    <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                      {step.recommendation_score}% match
                    </Badge>
                  )}
                  {step.is_owned && (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                      Есть у вас
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!step.is_owned && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3"
                onClick={() => onProductClick && step.product_id && onProductClick(step.product_id)}
              >
                Посмотреть товар
              </Button>
            )}
          </div>
        )}

        {/* Additional info */}
        {!step.product_id && !isCompleted && (
          <button
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => onStepClick && onStepClick(step.id)}
          >
            <Info className="w-4 h-4" />
            <span>Подробнее о шаге</span>
          </button>
        )}
      </div>
    </div>
  );
}
