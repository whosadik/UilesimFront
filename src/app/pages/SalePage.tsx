import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, Product } from '../components/ProductGrid';
import { Percent } from 'lucide-react';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    category: 'skincare',
    discount: 19,
  },
  {
    id: '4',
    name: 'Gentle Cleanser',
    brand: 'Cetaphil',
    price: 699,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    category: 'skincare',
    discount: 22,
  },
];

export default function SalePage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Скидки' }]} />
        </div>

        {/* Hero */}
        <div className="mb-8 p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-[#FFE1F2] to-pink-50 border border-[#FF4DB8]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#FF4DB8] flex items-center justify-center">
              <Percent className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-2">
                Скидки до −50%
              </h1>
              <p className="text-base text-[#6B7280]">
                124 товара со специальными ценами
              </p>
            </div>
          </div>
        </div>

        <ProductGrid products={mockProducts} columns={4} />
      </div>

      <div className="hidden">
        {/* API mock: has_discount=true as frontend filter */}
      </div>
    </div>
  );
}
