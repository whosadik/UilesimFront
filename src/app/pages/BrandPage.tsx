import { useState } from 'react';
import { useParams } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, Product } from '../components/ProductGrid';
import { Badge } from '../components/Badge';
import * as Tabs from '@radix-ui/react-tabs';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    category: 'skincare',
    isNew: true,
  },
  {
    id: '2',
    name: 'Hyaluronic Acid',
    brand: 'The Ordinary',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    category: 'skincare',
  },
];

export default function BrandPage() {
  const { brand } = useParams();
  const [activeTab, setActiveTab] = useState('hits');

  const brandName = brand?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'The Ordinary';

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      {/* Brand Hero */}
      <div className="relative py-12 lg:py-16 bg-gradient-to-br from-[#FFE1F2] to-pink-50 border-b border-[#FF4DB8]/20">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4DB8]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Бренды', href: '/brands' },
              { label: brandName },
            ]}
          />

          <div className="mt-8 flex items-center gap-6">
            {/* Brand Logo */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white border border-[#EAE6EF] flex items-center justify-center text-3xl font-bold text-[#FF4DB8] flex-shrink-0">
              {brandName.charAt(0)}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-2">
                {brandName}
              </h1>
              <p className="text-base text-[#6B7280] max-w-2xl">
                Эффективная косметика с прозрачными формулами и доступными ценами. Научный подход к уходу за кожей.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge>42 товара</Badge>
                <Badge>Новинки</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs List */}
          <Tabs.List className="flex items-center gap-1 mb-8 pb-4 border-b border-[#EAE6EF]">
            <Tabs.Trigger
              value="hits"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
            >
              Хиты
            </Tabs.Trigger>
            <Tabs.Trigger
              value="new"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
            >
              Новинки
            </Tabs.Trigger>
            <Tabs.Trigger
              value="all"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-[#111827] data-[state=active]:text-white text-[#6B7280] hover:text-[#111827]"
            >
              Все товары
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tabs Content */}
          <Tabs.Content value="hits">
            <ProductGrid products={mockProducts} columns={4} />
          </Tabs.Content>

          <Tabs.Content value="new">
            <ProductGrid products={mockProducts.filter(p => p.isNew)} columns={4} />
          </Tabs.Content>

          <Tabs.Content value="all">
            <ProductGrid products={mockProducts} columns={4} />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Dev Note */}
      <div className="hidden">
        {/* API: GET /api/products/?brand={brand} */}
      </div>
    </div>
  );
}
