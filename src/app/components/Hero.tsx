import { Gift, Truck, Sparkles } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { StatMini } from './StatMini';
import { PromoCard } from './PromoCard';
import heroBgImage from '../../assets/bannerimage.jpeg'

export function Hero() {
  return (
    <section className="relative min-h-screen lg:min-h-[100vh] flex items-center overflow-hidden">
      {/* Background with image */}
      <div className="absolute inset-0">
        {/* Hero Image */}
        <img 
          src={heroBgImage} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Soft gradient overlay - stronger for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-[1160px] mx-auto px-6 lg:px-[140px] w-full py-32 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge>Новые поступления</Badge>
              <Badge>Скидки до −50%</Badge>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-[56px] font-bold text-gray-900 leading-[110%] tracking-[-0.01em]">
                Новинки недели
              </h1>
              <p className="text-base text-gray-700 leading-relaxed max-w-lg">
                Уход, косметика, ароматы и товары для дома — свежие релизы и лимитки в одном месте.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary">Смотреть новинки</Button>
              <Button variant="ghost">Открыть каталог</Button>
            </div>

            {/* Mini Stats */}
            <div className="grid sm:grid-cols-3 gap-3 pt-4">
              <StatMini
                icon={<Gift className="w-5 h-5" />}
                title="Бонусы"
                description="до 7%"
              />
              <StatMini
                icon={<Truck className="w-5 h-5" />}
                title="Доставка"
                description="день-в-день"
              />
              <StatMini
                icon={<Sparkles className="w-5 h-5" />}
                title="Подбор"
                description="по типу кожи"
              />
            </div>
          </div>

          {/* Right Promo Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <PromoCard
                title="Персональный оффер"
                description="Ответь на 5 вопросов и получи скидку/множитель баллов под твои предпочтения."
                buttonText="Получить оффер"
                hint="Займёт ~30 секунд"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}