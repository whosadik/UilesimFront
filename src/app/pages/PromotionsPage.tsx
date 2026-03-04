import { Breadcrumbs } from '../components/Breadcrumbs';
import { PromoBannerCard } from '../components/PromoBannerCard';
import { useState } from 'react';

const promos = [
  { id: '1', title: 'Скидки до −50%', description: 'На избранные товары категории Skincare', badge: 'Скидка' },
  { id: '2', title: '2× баллы на всё', description: 'Удвоенные баллы за каждую покупку в марте', badge: 'Баллы' },
  { id: '3', title: 'Подарок к заказу', description: 'Мини-формат при покупке от 3000 ₽', badge: 'Подарок' },
  { id: '4', title: 'Персональный оффер', description: 'Эксклюзивная скидка 15% на уход', badge: 'Для вас' },
];

export default function PromotionsPage() {
  const [filter, setFilter] = useState<string>('all');

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Акции' }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">Акции</h1>
          <p className="text-base text-[#6B7280]">Специальные предложения и промо</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'discount', 'points', 'gift', 'personal'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'discount' ? 'Скидки' : f === 'points' ? '2× баллы' : f === 'gift' ? 'Подарок' : 'Персональные'}
            </button>
          ))}
        </div>

        {/* Promos Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <PromoBannerCard key={promo.id} {...promo} />
          ))}
        </div>
      </div>

      <div className="hidden">
        {/* API: Part from /api/me/next-offer, part static mock */}
      </div>
    </div>
  );
}
