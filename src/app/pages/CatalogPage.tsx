import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { SlidersHorizontal, X } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { SortSelect, type SortOption } from '../components/SortSelect';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { formatCatalogProductTypeLabel } from '../../shared/catalog/presentation';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const ACTIVE_QUERY_KEYS = ['category', 'product_type', 'brand', 'in_stock', 'new', 'sale', 'search'] as const;
const SERVER_QUERY_KEYS = ['category', 'product_type', 'brand', 'in_stock', 'new', 'sale', 'search'] as const;
const AVAILABILITY_FILTER_IDS = ['in_stock', 'new', 'sale'] as const;
const DEFAULT_PRICE_RANGE: [number, number] = [0, 10000];

const catalogPageCopy = {
  ru: {
    breadcrumb: 'Каталог',
    title: 'Каталог',
    availableProducts: (count: number) => `Доступно товаров: ${count}`,
    searchPrefix: 'Поиск',
    resetAll: 'Сбросить все',
    hideFilters: 'Скрыть фильтры',
    showFilters: 'Показать фильтры',
    active: (count: number) => `Активно: ${count}`,
    foundProducts: (count: number) => `Найдено ${count} товаров`,
    loading: 'Загружаем товары...',
    loadErrorTitle: 'Не удалось загрузить каталог',
    loadErrorDescription: 'Не удалось загрузить данные каталога. Попробуйте еще раз.',
    showMore: 'Показать еще',
    empty: 'В каталоге пока нет товаров.',
    filterTitles: {
      category: 'Категория',
      productType: 'Тип товара',
      brand: 'Бренд',
      availability: 'Наличие',
      price: 'Цена',
    },
    availability: {
      inStock: 'В наличии',
      new: 'Новинки',
      sale: 'Скидки',
    },
  },
  kk: {
    breadcrumb: 'Каталог',
    title: 'Каталог',
    availableProducts: (count: number) => `Қолжетімді тауарлар: ${count}`,
    searchPrefix: 'Іздеу',
    resetAll: 'Барлығын тазарту',
    hideFilters: 'Сүзгілерді жасыру',
    showFilters: 'Сүзгілерді көрсету',
    active: (count: number) => `Белсенді: ${count}`,
    foundProducts: (count: number) => `${count} тауар табылды`,
    loading: 'Тауарларды жүктеп жатырмыз...',
    loadErrorTitle: 'Каталогты жүктеу мүмкін болмады',
    loadErrorDescription: 'Каталог деректерін жүктеу мүмкін болмады. Қайта көріңіз.',
    showMore: 'Тағы көрсету',
    empty: 'Каталогта әзірге тауар жоқ.',
    filterTitles: {
      category: 'Санат',
      productType: 'Тауар түрі',
      brand: 'Бренд',
      availability: 'Қолжетімділік',
      price: 'Баға',
    },
    availability: {
      inStock: 'Қоймада бар',
      new: 'Жаңалықтар',
      sale: 'Жеңілдіктер',
    },
  },
  en: {
    breadcrumb: 'Catalog',
    title: 'Catalog',
    availableProducts: (count: number) => `Products available: ${count}`,
    searchPrefix: 'Search',
    resetAll: 'Reset all',
    hideFilters: 'Hide filters',
    showFilters: 'Show filters',
    active: (count: number) => `Active: ${count}`,
    foundProducts: (count: number) => `Found ${count} products`,
    loading: 'Loading products...',
    loadErrorTitle: 'Could not load the catalog',
    loadErrorDescription: 'Could not load catalog data. Try again.',
    showMore: 'Show more',
    empty: 'There are no products in the catalog yet.',
    filterTitles: {
      category: 'Category',
      productType: 'Product type',
      brand: 'Brand',
      availability: 'Availability',
      price: 'Price',
    },
    availability: {
      inStock: 'In stock',
      new: 'New',
      sale: 'Sale',
    },
  },
} as const;

type RequestParams = {
  category?: string;
  product_type?: string;
  brand?: string;
  in_stock?: string;
  new?: string;
  sale?: string;
  search?: string;
};

type ActiveFilterChip = {
  key: string;
  label: string;
};

const formatFilterLabel = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  return value
    .split(' ')
    .map((chunk) =>
      chunk
        .split('_')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
        .join(' '),
    )
    .join(' ')
    .trim();
};

const toBrandSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

const parseRequestParams = (search: string): RequestParams => {
  const searchParams = new URLSearchParams(search);
  return {
    category: searchParams.get('category') || undefined,
    product_type: searchParams.get('product_type') || undefined,
    brand: searchParams.get('brand') || undefined,
    in_stock: searchParams.get('in_stock') || undefined,
    new: searchParams.get('new') || undefined,
    sale: searchParams.get('sale') || undefined,
    search: searchParams.get('search') || undefined,
  };
};

const buildSelectedFilters = (params: RequestParams) => ({
  category: params.category ? [params.category] : [],
  product_type: params.product_type ? [params.product_type] : [],
  brand: params.brand ? [params.brand] : [],
  availability: AVAILABILITY_FILTER_IDS.filter((key) => params[key] === 'true'),
});

const buildFilters = (
  items: Product[],
  categoryLabels: Record<string, string>,
  fallbackCategoryOptions: Array<{ id: string; label: string; count: number }>,
  copy: (typeof catalogPageCopy)[keyof typeof catalogPageCopy],
  language: 'ru' | 'kk' | 'en',
) => {
  const categoryCounts = new Map<string, number>();
  const productTypeCounts = new Map<string, number>();
  const brandCounts = new Map<string, { label: string; count: number }>();

  let inStockCount = 0;
  let newCount = 0;
  let saleCount = 0;

  for (const item of items) {
    const category = item.category?.trim() || 'skincare';
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    const productType = item.productType?.trim();
    if (productType) {
      productTypeCounts.set(productType, (productTypeCounts.get(productType) ?? 0) + 1);
    }

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
      label: categoryLabels[id] ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const brandOptions = Array.from(brandCounts.entries())
    .map(([key, value]) => ({
      id: value.label,
      label: value.label,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const productTypeOptions = Array.from(productTypeCounts.entries())
    .map(([id, count]) => ({
      id,
      label: formatCatalogProductTypeLabel(id, language) ?? formatFilterLabel(id) ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return [
    {
      id: 'category',
      title: copy.filterTitles.category,
      options: categoryOptions.length > 0 ? categoryOptions : fallbackCategoryOptions,
    },
    {
      id: 'product_type',
      title: copy.filterTitles.productType,
      options: productTypeOptions,
    },
    {
      id: 'brand',
      title: copy.filterTitles.brand,
      options: brandOptions,
    },
    {
      id: 'availability',
      title: copy.filterTitles.availability,
      options: [
        { id: 'in_stock', label: copy.availability.inStock, count: inStockCount },
        { id: 'new', label: copy.availability.new, count: newCount },
        { id: 'sale', label: copy.availability.sale, count: saleCount },
      ],
    },
    {
      id: 'price',
      title: copy.filterTitles.price,
      type: 'range' as const,
      options: [],
    },
  ];
};

export default function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, messages } = useI18n();
  const copy = catalogPageCopy[language];
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const categoryLabels = useMemo(
    () => ({
      skincare: messages.catalog.categories.skincare,
      makeup: messages.catalog.categories.makeup,
      haircare: messages.catalog.categories.haircare,
      fragrance: messages.catalog.categories.fragrance,
    }),
    [messages.catalog.categories],
  );
  const fallbackCategoryOptions = useMemo(
    () => [
      { id: 'skincare', label: messages.catalog.categories.skincare, count: 0 },
      { id: 'makeup', label: messages.catalog.categories.makeup, count: 0 },
      { id: 'haircare', label: messages.catalog.categories.haircare, count: 0 },
      { id: 'fragrance', label: messages.catalog.categories.fragrance, count: 0 },
    ],
    [messages.catalog.categories],
  );
  const filterChipLabels = useMemo(
    () => ({
      in_stock: copy.availability.inStock,
      new: copy.availability.new,
      sale: copy.availability.sale,
    }),
    [copy.availability.inStock, copy.availability.new, copy.availability.sale],
  );
  const sortOptions = useMemo(
    () => [
      { value: 'popular' as const, label: messages.filterBar.sort.popular },
      { value: 'new' as const, label: messages.filterBar.sort.new },
      { value: 'price_asc' as const, label: messages.filterBar.sort.priceAsc },
      { value: 'price_desc' as const, label: messages.filterBar.sort.priceDesc },
      { value: 'rating' as const, label: 'Rating' },
    ],
    [messages.filterBar.sort],
  );
  const filters = useMemo(
    () => buildFilters(products, categoryLabels, fallbackCategoryOptions, copy, language),
    [categoryLabels, copy, fallbackCategoryOptions, language, products],
  );
  const requestParams = useMemo(() => parseRequestParams(location.search), [location.search]);
  const selectedFilters = useMemo(() => buildSelectedFilters(requestParams), [requestParams]);
  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) {
      return DEFAULT_PRICE_RANGE;
    }

    const prices = products.map((item) => item.price).filter((price) => Number.isFinite(price));
    if (prices.length === 0) {
      return DEFAULT_PRICE_RANGE;
    }

    const min = Math.max(0, Math.floor(Math.min(...prices) / 100) * 100);
    const max = Math.max(min, Math.ceil(Math.max(...prices) / 100) * 100);
    return [min, max];
  }, [products]);
  const activeFilterCount = useMemo(
    () =>
      ACTIVE_QUERY_KEYS.reduce((count, key) => (requestParams[key] ? count + 1 : count), 0) +
      (priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1] ? 1 : 0),
    [priceBounds, priceRange, requestParams],
  );
  const activeFilterLabel = useMemo(() => {
    return (
      formatCatalogProductTypeLabel(requestParams.product_type, language) ||
      (requestParams.category ? categoryLabels[requestParams.category] : null) ||
      formatFilterLabel(requestParams.category) ||
      formatFilterLabel(requestParams.brand) ||
      (requestParams.in_stock === 'true' ? copy.availability.inStock : null) ||
      (requestParams.sale ? copy.availability.sale : null) ||
      (requestParams.new ? copy.availability.new : null) ||
      (requestParams.search ? `${copy.searchPrefix}: ${requestParams.search}` : null)
    );
  }, [categoryLabels, copy.availability.inStock, copy.availability.new, copy.availability.sale, copy.searchPrefix, language, requestParams]);
  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    if (requestParams.category) {
      chips.push({
        key: 'category',
        label: categoryLabels[requestParams.category] ?? formatFilterLabel(requestParams.category) ?? requestParams.category,
      });
    }
    if (requestParams.product_type) {
      chips.push({
        key: 'product_type',
        label:
          formatCatalogProductTypeLabel(requestParams.product_type, language) ??
          formatFilterLabel(requestParams.product_type) ??
          requestParams.product_type,
      });
    }
    if (requestParams.brand) {
      chips.push({ key: 'brand', label: requestParams.brand });
    }
    for (const availabilityKey of AVAILABILITY_FILTER_IDS) {
      if (requestParams[availabilityKey] === 'true') {
        chips.push({ key: availabilityKey, label: filterChipLabels[availabilityKey] });
      }
    }
    if (requestParams.search) {
      chips.push({ key: 'search', label: `${copy.searchPrefix}: ${requestParams.search}` });
    }
    if (priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1]) {
      chips.push({ key: 'price', label: `${priceRange[0]} - ${priceRange[1]} ₸` });
    }
    return chips;
  }, [categoryLabels, copy.searchPrefix, filterChipLabels, language, priceBounds, priceRange, requestParams]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts(requestParams);
        const mapped = extractProducts(response).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'catalog-product',
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
        setLoadError(copy.loadErrorDescription);
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
  }, [copy.loadErrorDescription, reloadKey, requestParams]);

  const displayedProducts = useMemo(() => {
    const filtered = products.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1],
    );

    const sorted = [...filtered];
    switch (sortBy) {
      case 'new':
        sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
        break;
      case 'price_asc':
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => (b.pointsEarned ?? 0) - (a.pointsEarned ?? 0));
        break;
    }

    return sorted;
  }, [priceRange, products, sortBy]);

  const updateSearchParams = (updater: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(location.search);
    updater(nextParams);
    const nextSearch = nextParams.toString();

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: false },
    );
  };

  const handleFilterChange = (filterId: string, value: string[] | [number, number]) => {
    if (filterId === 'price') {
      setPriceRange(value as [number, number]);
      return;
    }

    updateSearchParams((params) => {
      if (filterId === 'availability') {
        const selected = value as string[];
        for (const key of AVAILABILITY_FILTER_IDS) {
          if (selected.includes(key)) {
            params.set(key, 'true');
          } else {
            params.delete(key);
          }
        }
        return;
      }

      const selected = value as string[];
      if (selected.length === 0) {
        params.delete(filterId);
        return;
      }

      params.set(filterId, selected[selected.length - 1]);
    });
  };

  const handleResetFilters = () => {
    setPriceRange(priceBounds);
    updateSearchParams((params) => {
      for (const key of SERVER_QUERY_KEYS) {
        params.delete(key);
      }
    });
  };

  const handleRemoveFilterChip = (key: string) => {
    if (key === 'price') {
      setPriceRange(priceBounds);
      return;
    }

    updateSearchParams((params) => {
      params.delete(key);
    });
  };

  const productsCount = displayedProducts.length;

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="app-page-container py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: copy.breadcrumb }]} />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">{copy.title}</h1>
          <p className="text-base text-[#6B7280]">
            {activeFilterLabel ? `${activeFilterLabel} · ` : ''}
            {copy.availableProducts(productsCount)}
          </p>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleRemoveFilterChip(chip.key)}
                className="inline-flex items-center gap-2 rounded-full border border-[#EAE6EF] bg-white px-3 py-1.5 text-sm text-[#111827] transition-colors hover:border-[#FF4DB8] hover:text-[#FF4DB8]"
              >
                <span>{chip.label}</span>
                <X className="h-3.5 w-3.5" />
              </button>
            ))}

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
            >
              {copy.resetAll}
            </button>
          </div>
        )}

        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setShowFilters((prev) => !prev)}
            className="w-full justify-between lg:w-auto lg:min-w-[220px]"
            aria-expanded={showFilters}
            aria-controls="catalog-filters"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{showFilters ? copy.hideFilters : copy.showFilters}</span>
            </div>
            <span className="text-xs text-[#6B7280]">{copy.active(activeFilterCount)}</span>
          </Button>
        </div>

        <div className={`grid gap-8 ${showFilters ? 'lg:grid-cols-[280px,1fr]' : 'lg:grid-cols-1'}`}>
          <aside id="catalog-filters" className={showFilters ? 'block' : 'hidden'}>
            <FilterSidebar
              filters={filters}
              selectedFilters={selectedFilters}
              priceRange={priceRange}
              initialPriceRange={priceBounds}
              minPrice={priceBounds[0]}
              maxPrice={priceBounds[1]}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6EF]">
              <p className="text-sm text-[#6B7280]">
                <span className="font-semibold text-[#111827]">{copy.foundProducts(productsCount)}</span>
              </p>
              <SortSelect value={sortBy} onChange={setSortBy} options={sortOptions} />
            </div>

            {isLoading ? (
              <LoadingSpinner size="md" text={copy.loading} />
            ) : loadError ? (
              <ErrorState
                title={copy.loadErrorTitle}
                description={loadError}
                onRetry={() => setReloadKey((value) => value + 1)}
              />
            ) : productsCount > 0 ? (
              <>
                <ProductGrid products={displayedProducts} columns={4} />
                <div className="flex justify-center pt-8">
                  <Button variant="ghost">{copy.showMore}</Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                {copy.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

