import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../shared/i18n/LanguageContext';

interface PromoBannerCardProps {
  title?: string;
  name?: string;
  description?: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  buttonText?: string;
  ctaLabel?: string;
  cta_label?: string;
  onClick?: () => void;
  variant?: 'default' | 'large';
}

const promoBannerFallbackCopy = {
  ru: {
    title: 'Персональное предложение',
    description: 'Предложение доступно для вас прямо сейчас.',
    button: 'Подробнее',
  },
  kk: {
    title: 'Жеке ұсыныс',
    description: 'Бұл ұсыныс сізге дәл қазір қолжетімді.',
    button: 'Толығырақ',
  },
  en: {
    title: 'Personal offer',
    description: 'This offer is available for you right now.',
    button: 'Learn more',
  },
} as const;

export function PromoBannerCard({
  title,
  name,
  description,
  subtitle,
  badge,
  image,
  imageUrl,
  image_url,
  buttonText,
  ctaLabel,
  cta_label,
  onClick,
  variant = 'default',
}: PromoBannerCardProps) {
  const { language } = useI18n();
  const copy = promoBannerFallbackCopy[language];
  const isLarge = variant === 'large';

  const resolvedTitle =
    (typeof title === 'string' && title.trim()) ||
    (typeof name === 'string' && name.trim()) ||
    copy.title;
  const resolvedDescription =
    (typeof description === 'string' && description.trim()) ||
    (typeof subtitle === 'string' && subtitle.trim()) ||
    copy.description;
  const resolvedImage =
    (typeof image === 'string' && image.trim()) ||
    (typeof imageUrl === 'string' && imageUrl.trim()) ||
    (typeof image_url === 'string' && image_url.trim()) ||
    undefined;
  const resolvedButtonText =
    (typeof buttonText === 'string' && buttonText.trim()) ||
    (typeof ctaLabel === 'string' && ctaLabel.trim()) ||
    (typeof cta_label === 'string' && cta_label.trim()) ||
    copy.button;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[#EAE6EF] bg-white text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF4DB8]/30 hover:shadow-[0_18px_40px_-20px_rgba(255,77,184,0.35)] ${
        isLarge
          ? 'w-full lg:min-w-[640px] lg:max-w-[640px]'
          : 'min-w-[280px] md:min-w-[340px] lg:min-w-[360px]'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#FFE1F2] via-[#FFF1F8] to-white ${
          isLarge ? 'h-56 lg:h-64' : 'h-44'
        }`}
      >
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <>
            <div
              className="absolute -top-12 -right-10 h-44 w-44 rounded-full bg-[#FF4DB8]/20 blur-3xl animate-pulse-soft"
              aria-hidden
            />
            <div
              className="absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-amber-200/40 blur-3xl"
              aria-hidden
            />
          </>
        )}

        {badge ? (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            {badge}
          </span>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col justify-between gap-4 p-5 ${isLarge ? 'lg:p-7' : ''}`}>
        <div className="space-y-2">
          <h3
            className={`font-display font-semibold tracking-tight text-[#111827] ${
              isLarge ? 'text-2xl lg:text-3xl' : 'text-lg'
            }`}
          >
            {resolvedTitle}
          </h3>
          <p className={`leading-relaxed text-[#6B7280] ${isLarge ? 'text-base' : 'text-sm'}`}>
            {resolvedDescription}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111827] transition-colors group-hover:text-[#FF4DB8]">
          {resolvedButtonText}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
