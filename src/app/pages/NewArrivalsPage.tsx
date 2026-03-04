import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, Product } from '../components/ProductGrid';
import { Badge } from '../components/Badge';

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
    brand: 'CeraVe',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    category: 'skincare',
    isNew: true,
  },
];

export default function NewArrivalsPage() {
  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Новинки' },
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#111827]">
              Новинки
            </h1>
            <Badge>56 товаров</Badge>
          </div>
          <p className="text-base text-[#6B7280]">
            Свежие релизы последних недель
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EAE6EF]">
          <button className="px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-medium">
            Все категории
          </button>
          <button className="px-4 py-2 rounded-xl bg-gray-50 text-[#6B7280] text-sm font-medium hover:bg-gray-100 transition-colors">
            Skincare
          </button>
          <button className="px-4 py-2 rounded-xl bg-gray-50 text-[#6B7280] text-sm font-medium hover:bg-gray-100 transition-colors">
            Makeup
          </button>
          <button className="px-4 py-2 rounded-xl bg-gray-50 text-[#6B7280] text-sm font-medium hover:bg-gray-100 transition-colors">
            Haircare
          </button>
          <label className="flex items-center gap-2 ml-auto">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-[#6B7280]">В наличии</span>
          </label>
        </div>

        {/* Products */}
        <ProductGrid products={mockProducts} columns={4} />
      </div>

      {/* Dev Note */}
      <div className="hidden">
        {/* Temporarily mock "new" sort, later will be backend field; currently using frontend sort */}
      </div>
    </div>
  );
}
