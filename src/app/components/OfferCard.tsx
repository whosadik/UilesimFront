import { Sparkles, Clock, Gift, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface OfferCardProps {
  status: 'active' | 'none' | 'expired';
  title?: string;
  description?: string;
  expiresAt?: string;
  discountType?: 'percentage' | 'points' | 'gift';
  discountValue?: number;
  onApply?: () => void;
}

export function OfferCard({
  status,
  title = 'Персональный оффер',
  description,
  expiresAt,
  discountType = 'percentage',
  discountValue,
  onApply,
}: OfferCardProps) {
  // None state
  if (status === 'none') {
    return (
      <div className="p-6 rounded-2xl bg-gray-50 border border-[#EAE6EF] text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center">
          <Gift className="w-6 h-6 text-[#6B7280]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#111827] mb-1">
            Нет активных офферов
          </p>
          <p className="text-xs text-[#6B7280]">
            Заполните профиль, чтобы получить персональное предложение
          </p>
        </div>
      </div>
    );
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="p-6 rounded-2xl bg-gray-50 border border-[#EAE6EF]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#111827] mb-1">
              {title}
            </p>
            <p className="text-xs text-[#6B7280]">
              Оффер истёк. Новое предложение появится в ближайшее время.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active state
  const icons = {
    percentage: Sparkles,
    points: Sparkles,
    gift: Gift,
  };

  const DiscountIcon = icons[discountType];

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8] overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4DB8]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] flex items-center justify-center flex-shrink-0">
              <DiscountIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className="mb-2">Активен</Badge>
              <h3 className="text-base font-bold text-[#111827] mb-1">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-[#6B7280]">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Discount Value */}
          {discountValue && (
            <div className="text-right">
              <p className="text-2xl font-bold text-[#FF4DB8]">
                {discountType === 'percentage' && '−'}
                {discountValue}
                {discountType === 'percentage' && '%'}
                {discountType === 'points' && '×'}
              </p>
            </div>
          )}
        </div>

        {/* Expiry */}
        {expiresAt && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>Действует до {expiresAt}</span>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="primary"
          onClick={onApply}
          className="w-full"
        >
          Применить в корзине
        </Button>
      </div>
    </div>
  );
}
