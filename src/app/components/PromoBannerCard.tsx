import { Badge } from './Badge';
import { Button } from './Button';

interface PromoBannerCardProps {
  title: string;
  description: string;
  badge?: string;
  image?: string;
  buttonText?: string;
  onClick?: () => void;
  variant?: 'default' | 'large';
}

export function PromoBannerCard({
  title,
  description,
  badge,
  image,
  buttonText = 'Подробнее',
  onClick,
  variant = 'default',
}: PromoBannerCardProps) {
  const isLarge = variant === 'large';

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20 hover:shadow-xl transition-all cursor-pointer ${
        isLarge ? 'p-8 lg:p-10' : 'p-6'
      }`}
      onClick={onClick}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4DB8]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {badge && (
          <Badge>{badge}</Badge>
        )}

        <div className="space-y-2">
          <h3 className={`font-bold text-[#111827] ${isLarge ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>
            {title}
          </h3>
          <p className={`text-[#6B7280] leading-relaxed ${isLarge ? 'text-base' : 'text-sm'}`}>
            {description}
          </p>
        </div>

        <Button
          variant="primary"
          className="group-hover:scale-105 transition-transform"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
