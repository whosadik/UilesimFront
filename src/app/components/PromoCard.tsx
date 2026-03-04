import { ReactNode } from 'react';
import { Button } from './Button';
import { Sparkles, Clock } from 'lucide-react';

interface PromoCardProps {
  title: string;
  description: string;
  buttonText: string;
  hint: string;
}

export function PromoCard({ title, description, buttonText, hint }: PromoCardProps) {
  return (
    <div className="relative rounded-3xl p-8 bg-white/90 backdrop-blur-lg border border-[#EAE6EF] shadow-lg overflow-hidden">
      {/* Pink accent - subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4DB8] to-[#FFE1F2]"></div>
      
      {/* Decorative soft background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFE1F2] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFE1F2] rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Pink accent badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE1F2] border border-[#FF4DB8] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4DB8]" />
          <span className="text-xs font-medium text-[#FF4DB8]">Персонально для вас</span>
        </div>

        <h3 className="text-2xl font-bold text-[#111827] mb-3">{title}</h3>
        <p className="text-sm text-[#6B7280] leading-relaxed mb-6">{description}</p>

        <Button variant="primary">{buttonText}</Button>

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