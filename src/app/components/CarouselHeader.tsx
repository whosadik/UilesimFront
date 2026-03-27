import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useI18n } from '../../shared/i18n/LanguageContext';

interface CarouselHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  showArrows?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function CarouselHeader({
  title,
  subtitle,
  showViewAll = true,
  onViewAll,
  showArrows = false,
  onPrevious,
  onNext,
}: CarouselHeaderProps) {
  const { messages } = useI18n();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="mb-1 text-2xl font-bold text-gray-900 lg:text-3xl">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        {showViewAll ? (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm font-medium text-[#FF4DB8] transition-colors hover:text-[#FF2AA8]"
          >
            {messages.common.viewAll}
            <ChevronRight className="h-4 w-4" />
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
