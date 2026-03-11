import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SlidersHorizontal } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { SortSelect, type SortOption } from '../components/SortSelect';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const CATEGORY_LABELS: Record<string, string> = {
  skincare: 'Уход за кожей',
  makeup: 'Макияж',
  haircare: 'Уход за волосами',
  fragrance: 'Парфюмерия',
};

const FALLBACK_CATEGORY_OPTIONS = [
  { id: 'skincare', label: 'Уход за кожей', count: 0 },
  { id: 'makeup', label: 'Макияж', count: 0 },
  { id: 'haircare', label: 'Уход за волосами', count: 0 },
  { id: 'fragrance', label: 'Парфюмерия', count: 0 },
];

const toBrandSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

const buildFilters = (items: Product[]) => {
  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, { label: string; count: number }>();

  let inStockCount = 0;
  let newCount = 0;
  let saleCount = 0;

  for (const item of items) {
    const category = item.category?.trim() || 'skincare';
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);

    const brand = item.brand?.trim();
    if (brand) {
      const key = brand.toLowerCase();
      const existing = brandCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        brandCounts.set(key, { label: brand, count: 1 });
      }
    }

    if (item.inStock !== false) {
      inStockCount += 1;
    }
    if (item.isNew) {
      newCount += 1;
    }
    if ((item.discount ?? 0) > 0) {
      saleCount += 1;
    }
  }

  const categoryOptions = Array.from(categoryCounts.entries())
    .map(([id, count]) => ({
      id,
      label: CATEGORY_LABELS[id] ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const brandOptions = Array.from(brandCounts.entries())
    .map(([key, value]) => ({
      id: toBrandSlug(key),
      label: value.label,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return [
    {
      id: 'category',
      title: 'Категория',
      options: categoryOptions.length > 0 ? categoryOptions : FALLBACK_CATEGORY_OPTIONS,
    },
    {
      id: 'brand',
      title: 'Бренд',
      options: brandOptions,
    },
    {
      id: 'in_stock',
      title: 'Наличие',
      options: [
        { id: 'in_stock', label: 'В наличии', count: inStockCount },
        { id: 'new', label: 'Новинки', count: newCount },
        { id: 'sale', label: 'Со скидкой', count: saleCount },
      ],
    },
    {
      id: 'price',
      title: 'Цена',
      type: 'range' as const,
      options: [],
    },
  ];
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const filters = useMemo(() => buildFilters(products), [products]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts();
        const mapped = extractProducts(response).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'catalog-product',
            fallbackImageUrl: FALLBACK_IMAGE_URL,
          }),
        );

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setProducts([]);
        setLoadError('Не удалось загрузить каталог из API. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, reloadKey]);

  const productsCount = products.length;

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
            {productsCount} товаров в наличии
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
                Найдено <span className="font-semibold text-[#111827]">{productsCount}</span> товаров
              </p>

              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>

            {isLoading ? (
              <LoadingSpinner size="md" text="Загружаем товары..." />
            ) : loadError ? (
              <ErrorState
                title="Не удалось загрузить каталог"
                description={loadError}
                onRetry={() => setReloadKey((value) => value + 1)}
              />
            ) : productsCount > 0 ? (
              <>
                {/* Products Grid */}
                <ProductGrid products={products} columns={3} />

                {/* Load More */}
                <div className="flex justify-center pt-8">
                  <Button variant="ghost">
                    Показать ещё
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                В каталоге пока нет товаров.
              </div>
            )}
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
