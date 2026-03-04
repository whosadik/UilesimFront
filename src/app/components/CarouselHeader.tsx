import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left: Title & Subtitle */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Right: View All Link & Arrows */}
      <div className="flex items-center gap-3">
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[#FF4DB8] hover:text-[#FF2AA8] font-medium flex items-center gap-1 transition-colors"
          >
            Смотреть все
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {showArrows && (
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#EAE6EF] text-[#111827] hover:bg-gray-50 hover:border-[#FF4DB8]/20 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#EAE6EF] text-[#111827] hover:bg-gray-50 hover:border-[#FF4DB8]/20 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}