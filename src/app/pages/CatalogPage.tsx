import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductGrid, Product } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { SortSelect, SortOption } from '../components/SortSelect';
import { SlidersHorizontal } from 'lucide-react';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    category: 'skincare',
    isNew: true,
    discount: 19,
    pointsEarned: 65,
  },
  {
    id: '2',
    name: 'Hyaluronic Acid',
    brand: 'CeraVe',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    category: 'skincare',
    pointsEarned: 45,
  },
  {
    id: '3',
    name: 'Retinol Night Cream',
    brand: 'La Roche-Posay',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80',
    category: 'skincare',
    isNew: true,
    pointsEarned: 125,
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
    pointsEarned: 35,
  },
];

const filters = [
  {
    id: 'category',
    title: 'Категория',
    options: [
      { id: 'skincare', label: 'Уход за кожей', count: 247 },
      { id: 'makeup', label: 'Макияж', count: 189 },
      { id: 'haircare', label: 'Уход за волосами', count: 156 },
      { id: 'fragrance', label: 'Парфюмерия', count: 98 },
    ],
  },
  {
    id: 'brand',
    title: 'Бренд',
    options: [
      { id: 'ordinary', label: 'The Ordinary', count: 42 },
      { id: 'cerave', label: 'CeraVe', count: 38 },
      { id: 'laroche', label: 'La Roche-Posay', count: 56 },
      { id: 'cetaphil', label: 'Cetaphil', count: 29 },
    ],
  },
  {
    id: 'in_stock',
    title: 'Наличие',
    options: [
      { id: 'in_stock', label: 'В наличии', count: 487 },
      { id: 'new', label: 'Новинки', count: 56 },
      { id: 'sale', label: 'Со скидкой', count: 124 },
    ],
  },
  {
    id: 'price',
    title: 'Цена',
    type: 'range' as const,
    options: [],
  },
];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await listProducts();
        const items = Array.isArray(response) ? response : response.results;
        const mapped: Product[] = items.map((item: any) => {
          const price = toNumber(item.price) ?? 0;
          const originalPrice = toNumber(item.original_price);
          return {
            id: String(item.id),
            name: item.name ?? `Product ${item.id}`,
            brand: typeof item.brand === 'string' ? item.brand : 'Uilesim',
            price,
            originalPrice,
            image:
              typeof item.image_url === 'string' && item.image_url
                ? item.image_url
                : typeof item.image === 'string' && item.image
                  ? item.image
                  : mockProducts[0].image,
            category:
              typeof item.category === 'string'
                ? item.category
                : typeof item.product_type === 'string'
                  ? item.product_type
                  : 'skincare',
            isNew: Boolean(item.is_new),
            discount:
              toNumber(item.discount) ??
              (originalPrice && originalPrice > price
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : undefined),
            inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
            pointsEarned: toNumber(item.points_earned),
          };
        });

        if (!cancelled && mapped.length > 0) {
          setProducts(mapped);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true });
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Каталог' },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">
            Каталог
          </h1>
          <p className="text-base text-[#6B7280]">
            247 товаров в наличии
          </p>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Фильтры</span>
            </div>
            <span className="text-xs text-[#6B7280]">3 активных</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <FilterSidebar filters={filters} />
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Sort Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6EF]">
              <p className="text-sm text-[#6B7280]">
                Найдено <span className="font-semibold text-[#111827]">247</span> товаров
              </p>

              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>

            {/* Products Grid */}
            <ProductGrid products={products} columns={3} />

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button variant="ghost">
                Показать ещё
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Note (hidden) */}
      <div className="hidden">
        {/* API: GET /api/products/?category=&product_type=&brand=&in_stock= */}
      </div>
    </div>
  );
}
