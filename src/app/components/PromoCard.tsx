import { Button } from './Button';
import { Sparkles, Clock } from 'lucide-react';

interface PromoCardProps {
  title?: string;
  name?: string;
  description?: string;
  subtitle?: string;
  buttonText?: string;
  ctaLabel?: string;
  hint?: string;
  badgeText?: string;
  onAction?: () => void;
  buttonDisabled?: boolean;
}

export function PromoCard({
  title,
  name,
  description,
  subtitle,
  buttonText,
  ctaLabel,
  hint,
  badgeText = 'Персонально для вас',
  onAction,
  buttonDisabled = false,
}: PromoCardProps) {
  const resolvedTitle =
    (typeof title === 'string' && title.trim() && title.trim()) ||
    (typeof name === 'string' && name.trim() && name.trim()) ||
    'Персональный оффер';
  const resolvedDescription =
    (typeof description === 'string' && description.trim() && description.trim()) ||
    (typeof subtitle === 'string' && subtitle.trim() && subtitle.trim()) ||
    'Ответьте на несколько вопросов и получите персональное предложение.';
  const resolvedButtonText =
    (typeof buttonText === 'string' && buttonText.trim() && buttonText.trim()) ||
    (typeof ctaLabel === 'string' && ctaLabel.trim() && ctaLabel.trim()) ||
    'Открыть';

  return (
    <div className="relative rounded-3xl p-8 bg-white/90 backdrop-blur-lg border border-[#EAE6EF] shadow-lg overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4DB8] to-[#FFE1F2]" />

      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFE1F2] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFE1F2] rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE1F2] border border-[#FF4DB8] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
          <span className="text-xs font-medium text-[#FF4DB8]">{badgeText}</span>
        </div>

        <h3 className="text-2xl font-bold text-[#111827] mb-3">{resolvedTitle}</h3>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6">{resolvedDescription}</p>

        <Button variant="primary" onClick={onAction} disabled={buttonDisabled}>
          {resolvedButtonText}
        </Button>

        {hint && (
          <p className="text-xs text-[#6B7280] mt-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
