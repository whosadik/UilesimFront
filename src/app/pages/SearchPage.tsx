import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Search, TrendingUp, X } from 'lucide-react';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { Chip } from '../components/Chip';
import { FilterBar } from '../components/FilterBar';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const RECENT_SEARCHES_STORAGE_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 2000;

const SUGGESTED_QUERIES = [
  'skincare',
  'makeup',
  'serum',
  'lipstick',
  'spf',
] as const;

const matchesQuery = (product: Product, rawQuery: string): boolean => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return (
    product.name.toLowerCase().includes(query) ||
    product.brand.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
};

const readRecentSearches = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
};

const saveRecentSearches = (value: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(value));
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = (searchParams.get('q') || '').trim();

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        let mapped: Product[] = [];

        if (query) {
          const response = await listProducts({ search: query });
          mapped = extractProducts(response).map((item, index) =>
            mapApiProductToGrid(item, index, {
              fallbackIdPrefix: 'search-product',
              fallbackImageUrl: FALLBACK_IMAGE_URL,
            }),
          );

          // Fallback: if backend search returned empty, try local filtering of full catalog.
          if (mapped.length === 0) {
            const fallbackResponse = await listProducts();
            const allProducts = extractProducts(fallbackResponse).map((item, index) =>
              mapApiProductToGrid(item, index, {
                fallbackIdPrefix: 'search-product',
                fallbackImageUrl: FALLBACK_IMAGE_URL,
              }),
            );
            mapped = allProducts.filter((product) => matchesQuery(product, query));
          }
        } else {
          const response = await listProducts();
          mapped = extractProducts(response).map((item, index) =>
            mapApiProductToGrid(item, index, {
              fallbackIdPrefix: 'search-product',
              fallbackImageUrl: FALLBACK_IMAGE_URL,
            }),
          );
        }

        if (!cancelled) {
          setProducts(mapped);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', {
            replace: true,
            state: { from: `${location.pathname}${location.search}` },
          });
          return;
        }

        setProducts([]);
        setLoadError('Не удалось загрузить товары из API. Попробуйте ещё раз.');
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
  }, [location.pathname, location.search, navigate, reloadKey]);

  useEffect(() => {
    setSearchInput(query);
    const recent = readRecentSearches();

    if (!query) {
      setRecentSearches(recent);
      return;
    }

    const updated = [query, ...recent.filter((item) => item !== query)].slice(0, MAX_RECENT_SEARCHES);
    saveRecentSearches(updated);
    setRecentSearches(updated);
  }, [query]);

  useEffect(() => {
    const normalized = searchInput.trim();
    if (normalized === query) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (!normalized) {
        setSearchParams({}, { replace: true });
        return;
      }
      setSearchParams({ q: normalized }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query, searchInput, setSearchParams]);

  const filteredProducts = useMemo(
    () => products.filter((product) => matchesQuery(product, query)),
    [products, query],
  );

  const popularProducts = useMemo(() => products.slice(0, 8), [products]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const normalized = searchInput.trim();
    if (!normalized) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: normalized });
  };

  const handleSuggestedClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearchParams({ q: suggestion });
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const clearRecentSearches = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    }
    setRecentSearches([]);
  };

  return (
    <div className="pt-20 lg:pt-28 min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Поиск товаров, брендов..."
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                autoFocus
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text="Загружаем товары..." />
          </div>
        ) : loadError ? (
          <ErrorState
            title="Не удалось загрузить поиск"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : !query ? (
          <div className="space-y-8">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Недавние поиски</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button key={`${search}-${index}`} type="button" onClick={() => handleSuggestedClick(search)}>
                      <Chip className="gap-2 hover:bg-gray-50 transition-colors">
                        <TrendingUp className="w-4 h-4" />
                        <span>{search}</span>
                      </Chip>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Популярные запросы</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => handleSuggestedClick(suggestion)}>
                    <Chip className="hover:bg-gray-50 transition-colors">
                      <span>{suggestion}</span>
                    </Chip>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Популярное</h3>
              {popularProducts.length > 0 ? (
                <ProductGrid products={popularProducts} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  Популярные товары пока недоступны.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {filteredProducts.length > 0
                  ? `Найдено ${filteredProducts.length} товаров`
                  : 'Ничего не найдено'}
              </h2>
              <p className="text-gray-600">
                Результаты поиска: <span className="font-medium">"{query}"</span>
              </p>
            </div>

            {filteredProducts.length > 0 && (
              <div className="mb-6">
                <FilterBar />
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                icon={<Search className="w-12 h-12" />}
                title="Ничего не найдено"
                description={`По запросу "${query}" ничего не найдено. Попробуйте изменить запрос.`}
                action={{
                  label: 'Очистить поиск',
                  onClick: clearSearch,
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
