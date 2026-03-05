import { Badge } from './Badge';
import { Button } from './Button';

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
  const isLarge = variant === 'large';

  const resolvedTitle =
    (typeof title === 'string' && title.trim() && title.trim()) ||
    (typeof name === 'string' && name.trim() && name.trim()) ||
    'Персональное предложение';
  const resolvedDescription =
    (typeof description === 'string' && description.trim() && description.trim()) ||
    (typeof subtitle === 'string' && subtitle.trim() && subtitle.trim()) ||
    'Предложение доступно для вас прямо сейчас.';
  const resolvedImage =
    (typeof image === 'string' && image.trim() && image.trim()) ||
    (typeof imageUrl === 'string' && imageUrl.trim() && imageUrl.trim()) ||
    (typeof image_url === 'string' && image_url.trim() && image_url.trim()) ||
    undefined;
  const resolvedButtonText =
    (typeof buttonText === 'string' && buttonText.trim() && buttonText.trim()) ||
    (typeof ctaLabel === 'string' && ctaLabel.trim() && ctaLabel.trim()) ||
    (typeof cta_label === 'string' && cta_label.trim() && cta_label.trim()) ||
    'Подробнее';

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]/20 hover:shadow-xl transition-all cursor-pointer ${
        isLarge ? 'p-8 lg:p-10' : 'p-6'
      }`}
      onClick={onClick}
    >
      {resolvedImage && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <img src={resolvedImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4DB8]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl" />

      <div className="relative z-10 space-y-4">
        {badge && <Badge>{badge}</Badge>}

        <div className="space-y-2">
          <h3 className={`font-bold text-[#111827] ${isLarge ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>
            {resolvedTitle}
          </h3>
          <p className={`text-[#6B7280] leading-relaxed ${isLarge ? 'text-base' : 'text-sm'}`}>
            {resolvedDescription}
          </p>
        </div>

        <Button variant="primary" className="group-hover:scale-105 transition-transform">
          {resolvedButtonText}
        </Button>
      </div>
    </div>
  );
}
