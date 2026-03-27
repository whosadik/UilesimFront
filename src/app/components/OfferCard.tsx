import { Sparkles, Clock, Gift, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useI18n } from '../../shared/i18n/LanguageContext';

type OfferStatus = 'active' | 'none' | 'expired';
type OfferType = 'percentage' | 'points' | 'gift';
type OfferTypeInput = OfferType | 'discount' | 'points_multiplier' | string;

interface OfferCardProps {
  status: OfferStatus;
  title?: string;
  description?: string;
  expiresAt?: string;
  discountType?: OfferTypeInput;
  discountValue?: number | string | null;
  onApply?: () => void;
}

const offerCardCopy = {
  ru: {
    title: 'Персональный оффер',
    noneTitle: 'Нет активных офферов',
    noneDescription: 'Заполните профиль, чтобы получить персональное предложение.',
    expiredDescription: 'Срок действия этого оффера истек. Новый появится немного позже.',
    active: 'Активен',
    validUntil: (value: string) => `Действует до ${value}`,
    apply: 'Применить в корзине',
  },
  kk: {
    title: 'Жеке оффер',
    noneTitle: 'Белсенді оффер жоқ',
    noneDescription: 'Жеке ұсыныс алу үшін профильді толтырыңыз.',
    expiredDescription: 'Бұл оффердің мерзімі аяқталды. Жаңа ұсыныс жақында пайда болады.',
    active: 'Белсенді',
    validUntil: (value: string) => `${value} дейін жарамды`,
    apply: 'Себетте қолдану',
  },
  en: {
    title: 'Personal offer',
    noneTitle: 'No active offers',
    noneDescription: 'Complete your profile to receive a personal offer.',
    expiredDescription: 'This offer has expired. A new one will appear soon.',
    active: 'Active',
    validUntil: (value: string) => `Valid until ${value}`,
    apply: 'Apply in cart',
  },
} as const;

function normalizeDiscountType(value?: OfferTypeInput): OfferType {
  if (value === 'points' || value === 'points_multiplier') return 'points';
  if (value === 'gift') return 'gift';
  return 'percentage';
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function OfferCard({
  status,
  title,
  description,
  expiresAt,
  discountType = 'percentage',
  discountValue,
  onApply,
}: OfferCardProps) {
  const { language } = useI18n();
  const copy = offerCardCopy[language];

  if (status === 'none') {
    return (
      <div className="p-6 rounded-2xl bg-gray-50 border border-[#EAE6EF] text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center">
          <Gift className="w-6 h-6 text-[#6B7280]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#111827] mb-1">{copy.noneTitle}</p>
          <p className="text-xs text-[#6B7280]">{copy.noneDescription}</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="p-6 rounded-2xl bg-gray-50 border border-[#EAE6EF]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#111827] mb-1">{title ?? copy.title}</p>
            <p className="text-xs text-[#6B7280]">{copy.expiredDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  const normalizedType = normalizeDiscountType(discountType);
  const value = toNumber(discountValue);
  const roundedValue = value !== undefined ? Math.max(0, Math.round(value)) : undefined;
  const showDiscountValue = roundedValue !== undefined && roundedValue > 0;

  const icons: Record<OfferType, typeof Sparkles> = { percentage: Sparkles, points: Sparkles, gift: Gift };
  const DiscountIcon = icons[normalizedType];

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8] overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4DB8]/10 rounded-full blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] flex items-center justify-center flex-shrink-0">
              <DiscountIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className="mb-2">{copy.active}</Badge>
              <h3 className="text-base font-bold text-[#111827] mb-1">{title ?? copy.title}</h3>
              {description && <p className="text-sm text-[#6B7280]">{description}</p>}
            </div>
          </div>
          {showDiscountValue && (
            <div className="text-right">
              <p className="text-2xl font-bold text-[#FF4DB8]">
                {normalizedType === 'percentage' && '-'}
                {roundedValue}
                {normalizedType === 'percentage' && '%'}
                {normalizedType === 'points' && 'x'}
              </p>
            </div>
          )}
        </div>

        {expiresAt && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>{copy.validUntil(expiresAt)}</span>
          </div>
        )}

        <Button variant="primary" onClick={onApply} className="w-full">{copy.apply}</Button>
      </div>
    </div>
  );
}
