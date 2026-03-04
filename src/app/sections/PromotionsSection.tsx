import { useRef } from 'react';
import { Percent, Gift, Sparkles, TrendingUp } from 'lucide-react';
import { CarouselHeader } from '../components/CarouselHeader';
import { PromoBannerCard } from '../components/PromoBannerCard';

export function PromotionsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const promos = [
    {
      id: 1,
      title: 'Скидки до −50%',
      subtitle: 'На избранные позиции по уходу за кожей',
      buttonText: 'Открыть',
      gradient: 'bg-gradient-to-br from-[#FF4DB8] to-[#FF2AA8]',
      icon: <Percent className="w-8 h-8" />,
    },
    {
      id: 2,
      title: '2× баллы на уход',
      subtitle: 'Удвоенные бонусы на всю категорию skincare',
      buttonText: 'Активировать',
      gradient: 'bg-gradient-to-br from-[#111827] to-[#374151]',
      icon: <Sparkles className="w-8 h-8" />,
    },
    {
      id: 3,
      title: 'Подарок за заказ',
      subtitle: 'Миниатюра при покупке от 25 000 ₸',
      buttonText: 'Подробнее',
      gradient: 'bg-gradient-to-br from-[#FF4DB8] via-[#FF2AA8] to-[#FF4DB8]',
      icon: <Gift className="w-8 h-8" />,
    },
    {
      id: 4,
      title: 'Weekend Deals',
      subtitle: 'Специальные предложения выходного дня',
      buttonText: 'Смотреть',
      gradient: 'bg-gradient-to-br from-[#6B7280] to-[#111827]',
      icon: <TrendingUp className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader title="Акции и предложения" />
        
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {promos.map((promo) => (
            <PromoBannerCard key={promo.id} {...promo} />
          ))}
        </div>
        
        {/* Scroll Fade Indicator - Mobile */}
        <div className="lg:hidden relative -mt-4 h-4">
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-pink-50/30 via-pink-50/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}