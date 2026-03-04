import { useState } from 'react';
import { Link } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { OfferCard } from '../components/OfferCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { Button } from '../components/Button';
import { ProfileWizard } from '../components/ProfileWizard';
import { Sparkles, Heart, Calendar, ChevronRight, Package, Receipt, Map, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const mockRecommendations = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    category: 'skincare',
    pointsEarned: 65,
    recommendationScore: 94,
  },
  {
    id: '2',
    name: 'Hyaluronic Acid',
    brand: 'CeraVe',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    category: 'skincare',
    pointsEarned: 45,
    recommendationScore: 89,
  },
];

export default function ProfilePage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  const mockProfile = {
    name: 'Анна',
    initials: 'А',
    completionPercentage: 75,
  };

  const mockLoyalty = {
    tier: 'gold' as const,
    points: 1247,
  };

  const mockFavoriteCategory = {
    category: 'Skincare',
    totalSpent: 12450,
    productsBought: 18,
    explain: 'На основе ваших покупок за последние 6 месяцев',
  };

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Мой профиль' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">
            Мой профиль
          </h1>
          <p className="text-base text-[#6B7280]">
            Ваши данные, предпочтения и персональные предложения
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Profile Summary */}
          <div className="lg:col-span-2">
            <ProfileSummaryCard
              profile={mockProfile}
              loyalty={mockLoyalty}
              onUpdateProfile={() => setWizardOpen(true)}
            />
          </div>

          {/* Favorite Category */}
          <div className="p-6 rounded-2xl bg-white border border-[#EAE6EF]">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#FF4DB8]" />
              <h3 className="text-base font-bold text-[#111827]">
                Любимая категория
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-[#FF4DB8]">
                {mockFavoriteCategory.category}
              </p>
              <div className="space-y-1 text-sm text-[#6B7280]">
                <p>{mockFavoriteCategory.productsBought} покупок</p>
                <p>{mockFavoriteCategory.totalSpent.toLocaleString()} ₽ потрачено</p>
              </div>
              <details className="text-xs text-[#6B7280] pt-2 border-t border-[#EAE6EF]">
                <summary className="cursor-pointer hover:text-[#FF4DB8] transition-colors">
                  Как мы считаем?
                </summary>
                <p className="mt-2">{mockFavoriteCategory.explain}</p>
              </details>
            </div>
          </div>
        </div>

        {/* Your Offer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Ваш персональный оффер</h2>
          <OfferCard
            status="active"
            title="Скидка 15% на уход"
            description="Действует на все товары категории Skincare"
            expiresAt="15 марта"
            discountType="percentage"
            discountValue={15}
          />
        </section>

        {/* Recommendations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE1F2] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FF4DB8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">
                  Специально для вас
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Рекомендации на основе вашего профиля
                </p>
              </div>
            </div>
            <Button variant="ghost">Смотреть всё</Button>
          </div>
          <ProductCarousel products={mockRecommendations} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-[#111827] mb-6">Управление</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Routine */}
            <Link 
              to="/me/routine"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#FF4DB8]" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">
                Моя рутина
              </h3>
              <p className="text-sm text-[#6B7280]">
                Персональный план ухода на основе вашего профиля
              </p>
            </Link>

            {/* Roadmap */}
            <Link 
              to="/me/roadmap"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Map className="w-6 h-6 text-purple-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">
                Roadmap
              </h3>
              <p className="text-sm text-[#6B7280]">
                Пошаговый план построения идеальной бьюти-рутины
              </p>
            </Link>

            {/* Owned Products */}
            <Link 
              to="/me/owned"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">
                Мои товары
              </h3>
              <p className="text-sm text-[#6B7280]">
                Управление купленными товарами и заметки
              </p>
            </Link>

            {/* Transactions */}
            <Link 
              to="/me/transactions"
              className="p-6 rounded-2xl bg-white border border-[#EAE6EF] hover:border-[#FF4DB8]/30 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-[#111827]" />
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B7280] group-hover:text-[#FF4DB8] transition-colors" />
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">
                История транзакций
              </h3>
              <p className="text-sm text-[#6B7280]">
                Ваши покупки и начисления баллов
              </p>
            </Link>
          </div>
        </section>
      </div>

      {/* Profile Wizard Dialog */}
      <Dialog.Root open={wizardOpen} onOpenChange={setWizardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
          <Dialog.Content 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Анкета профиля</Dialog.Title>
            <ProfileWizard
              onComplete={() => {
                setWizardOpen(false);
              }}
              onClose={() => setWizardOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dev Notes */}
      <div className="hidden">
        {/* 
          API:
          - GET /api/me/profile
          - PUT /api/me/profile (partial=True)
          - GET /api/me/loyalty
          - GET /api/me/favorite-category
          - GET /api/me/next-offer
          - POST /api/offers/click
          - GET /api/me/recommendations/home
          - POST /api/routine/generate
          - GET /api/me/roadmap?category=
          - POST /api/me/roadmap/refresh
        */}
      </div>
    </div>
  );
}