import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';
import { useI18n } from '../../shared/i18n/LanguageContext';

const newArrivalsPageCopy = {
  ru: {
    allCategories: 'Все категории',
    skincare: 'Уход за кожей',
    makeup: 'Макияж',
    haircare: 'Уход за волосами',
    loadError: 'Не удалось загрузить новинки. Попробуйте еще раз.',
    title: 'Новинки',
    itemsCount: (count: number) => `${count} товаров`,
    subtitle: 'Свежие поступления из текущего каталога',
    inStockOnly: 'Только в наличии',
    loading: 'Загружаем новинки...',
    errorTitle: 'Не удалось загрузить новинки',
    empty: 'Нет товаров, подходящих под выбранные фильтры.',
  },
  kk: {
    allCategories: 'Барлық санаттар',
    skincare: 'Тері күтімі',
    makeup: 'Макияж',
    haircare: 'Шаш күтімі',
    loadError: 'Жаңалықтарды жүктеу мүмкін болмады. Қайталап көріңіз.',
    title: 'Жаңалықтар',
    itemsCount: (count: number) => `${count} тауар`,
    subtitle: 'Ағымдағы каталогтағы жаңа түсімдер',
    inStockOnly: 'Тек қолда барлары',
    loading: 'Жаңалықтарды жүктеп жатырмыз...',
    errorTitle: 'Жаңалықтарды жүктеу мүмкін болмады',
    empty: 'Таңдалған сүзгілерге сай тауарлар жоқ.',
  },
  en: {
    allCategories: 'All categories',
    skincare: 'Skincare',
    makeup: 'Makeup',
    haircare: 'Haircare',
    loadError: 'Could not load new arrivals. Please try again.',
    title: 'New arrivals',
    itemsCount: (count: number) => `${count} items`,
    subtitle: 'Fresh additions from the current catalog',
    inStockOnly: 'In stock only',
    loading: 'Loading new arrivals...',
    errorTitle: 'Could not load new arrivals',
    empty: 'No products match the selected filters.',
  },
} as const;

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

type CategoryFilterId = 'all' | 'skincare' | 'makeup' | 'haircare';

export default function NewArrivalsPage() {
  const { language, messages } = useI18n();
  const copy = newArrivalsPageCopy[language];
  const categoryFilters = [
    { id: 'all' as const, label: copy.allCategories },
    { id: 'skincare' as const, label: copy.skincare },
    { id: 'makeup' as const, label: copy.makeup },
    { id: 'haircare' as const, label: copy.haircare },
  ];
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterId>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts({ new: true });
        const mapped = extractProducts(response).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'new-product',
            fallbackImageUrl: FALLBACK_IMAGE_URL,
            fallbackProductLabel: (id) => `${messages.productCard.productFallback} #${id}`,
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
          setProducts([]);
          return;
        }

        setProducts([]);
        setLoadError(copy.loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [copy.loadError, reloadKey]);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatched =
          selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
        const stockMatched = !onlyInStock || product.inStock !== false;
        return categoryMatched && stockMatched;
      }),
    [products, onlyInStock, selectedCategory],
  );

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.title }]} />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#111827]">{copy.title}</h1>
            <Badge>{copy.itemsCount(products.length)}</Badge>
          </div>
          <p className="text-base text-[#6B7280]">{copy.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EAE6EF]">
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === filter.id
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <label className="flex items-center gap-2 ml-auto">
            <input
              type="checkbox"
              className="rounded"
              checked={onlyInStock}
              onChange={(event) => setOnlyInStock(event.target.checked)}
            />
            <span className="text-sm text-[#6B7280]">{copy.inStockOnly}</span>
          </label>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text={copy.loading} />
        ) : loadError ? (
          <ErrorState
            title={copy.errorTitle}
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            {copy.empty}
          </div>
        )}
      </div>
    </div>
  );
}

