import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';

interface CarouselHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  live?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  showArrows?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function CarouselHeader({
  title,
  subtitle,
  eyebrow,
  live = false,
  showViewAll = true,
  onViewAll,
  showArrows = false,
  onPrevious,
  onNext,
}: CarouselHeaderProps) {
  const { messages } = useI18n();

  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow || live ? (
          <div className="mb-2 flex items-center gap-2">
            {live ? (
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4DB8] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF4DB8]" />
              </span>
            ) : null}
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4DB8]">
                {eyebrow}
              </p>
            ) : null}
          </div>
        ) : null}
        <h2 className="font-display mb-1 text-3xl font-semibold tracking-tight text-[#111827] lg:text-[36px]">
          {title}
        </h2>
        {subtitle ? <p className="text-sm text-[#6B7280]">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        {showViewAll ? (
          <button
            onClick={onViewAll}
            className="group flex items-center gap-1 text-sm font-medium text-[#111827] transition-colors hover:text-[#FF4DB8]"
          >
            {messages.common.viewAll}
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        ) : null}

        {showArrows ? (
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={onPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAE6EF] bg-white text-[#111827] transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAE6EF] bg-white text-[#111827] transition-all duration-200 hover:border-[#FF4DB8]/20 hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
