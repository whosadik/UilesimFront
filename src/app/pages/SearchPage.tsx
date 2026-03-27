import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
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
import { useI18n } from '../../shared/i18n/LanguageContext';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const RECENT_SEARCHES_STORAGE_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 5;
const SEARCH_DEBOUNCE_MS = 2000;

const searchPageCopy = {
  ru: {
    searchPlaceholder: 'Ищите товары или бренды...',
    loading: 'Загружаем товары...',
    errorTitle: 'Не удалось выполнить поиск',
    recentSearches: 'Недавние запросы',
    clear: 'Очистить',
    popularQueries: 'Популярные запросы',
    popularNow: 'Популярно сейчас',
    popularUnavailable: 'Популярные товары пока недоступны.',
    foundCount: (count: number) => `Найдено товаров: ${count}`,
    nothingFound: 'Ничего не найдено',
    resultsFor: 'Результаты по запросу',
    emptyDescription: (query: string) => `По запросу "${query}" ничего не найдено. Попробуйте другой вариант.`,
    clearSearch: 'Очистить поиск',
    loadError: 'Не удалось загрузить результаты поиска. Попробуйте еще раз.',
    suggestedQueries: [
      { label: 'Уход за кожей', value: 'skincare' },
      { label: 'Макияж', value: 'makeup' },
      { label: 'Сыворотка', value: 'serum' },
      { label: 'Помада', value: 'lipstick' },
      { label: 'SPF', value: 'spf' },
    ],
  },
  kk: {
    searchPlaceholder: 'Тауарлар мен брендтерді іздеңіз...',
    loading: 'Тауарларды жүктеп жатырмыз...',
    errorTitle: 'Іздеуді орындау мүмкін болмады',
    recentSearches: 'Соңғы сұраулар',
    clear: 'Тазалау',
    popularQueries: 'Танымал сұраулар',
    popularNow: 'Қазір танымал',
    popularUnavailable: 'Танымал тауарлар әзірге қолжетімсіз.',
    foundCount: (count: number) => `Табылған тауарлар: ${count}`,
    nothingFound: 'Ештеңе табылмады',
    resultsFor: 'Сұрау бойынша нәтижелер',
    emptyDescription: (query: string) => `"${query}" сұрауы бойынша ештеңе табылмады. Басқа нұсқаны қолданып көріңіз.`,
    clearSearch: 'Іздеуді тазалау',
    loadError: 'Іздеу нәтижелерін жүктеу мүмкін болмады. Қайталап көріңіз.',
    suggestedQueries: [
      { label: 'Тері күтімі', value: 'skincare' },
      { label: 'Макияж', value: 'makeup' },
      { label: 'Сарысу', value: 'serum' },
      { label: 'Ерін далабы', value: 'lipstick' },
      { label: 'SPF', value: 'spf' },
    ],
  },
  en: {
    searchPlaceholder: 'Search products or brands...',
    loading: 'Loading products...',
    errorTitle: 'Could not complete the search',
    recentSearches: 'Recent searches',
    clear: 'Clear',
    popularQueries: 'Popular queries',
    popularNow: 'Popular now',
    popularUnavailable: 'Popular products are not available yet.',
    foundCount: (count: number) => `Products found: ${count}`,
    nothingFound: 'Nothing found',
    resultsFor: 'Results for',
    emptyDescription: (query: string) => `Nothing was found for "${query}". Try another query.`,
    clearSearch: 'Clear search',
    loadError: 'Could not load search results. Please try again.',
    suggestedQueries: [
      { label: 'Skincare', value: 'skincare' },
      { label: 'Makeup', value: 'makeup' },
      { label: 'Serum', value: 'serum' },
      { label: 'Lipstick', value: 'lipstick' },
      { label: 'SPF', value: 'spf' },
    ],
  },
} as const;

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
  const { language, messages } = useI18n();
  const copy = searchPageCopy[language];
  const [searchParams, setSearchParams] = useSearchParams();
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
        const response = await listProducts(query ? { search: query } : undefined);
        const mapped = extractProducts(response).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'search-product',
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
  }, [copy.loadError, query, reloadKey]);

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

  const filteredProducts = useMemo(() => products, [products]);
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
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" text={copy.loading} />
          </div>
        ) : loadError ? (
          <ErrorState
            title={copy.errorTitle}
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : !query ? (
          <div className="space-y-8">
            {recentSearches.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{copy.recentSearches}</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {copy.clear}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button key={`${search}-${index}`} type="button" onClick={() => handleSuggestedClick(search)}>
                      <Chip className="gap-2 transition-colors hover:bg-gray-50">
                        <TrendingUp className="h-4 w-4" />
                        <span>{search}</span>
                      </Chip>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">{copy.popularQueries}</h3>
              <div className="flex flex-wrap gap-2">
                {copy.suggestedQueries.map((suggestion) => (
                  <button key={suggestion.value} type="button" onClick={() => handleSuggestedClick(suggestion.value)}>
                    <Chip className="transition-colors hover:bg-gray-50">
                      <span>{suggestion.label}</span>
                    </Chip>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">{copy.popularNow}</h3>
              {popularProducts.length > 0 ? (
                <ProductGrid products={popularProducts} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  {copy.popularUnavailable}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                {filteredProducts.length > 0
                  ? copy.foundCount(filteredProducts.length)
                  : copy.nothingFound}
              </h2>
              <p className="text-gray-600">
                {copy.resultsFor} <span className="font-medium">"{query}"</span>
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="mb-6">
                <FilterBar />
              </div>
            ) : null}

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                icon={<Search className="h-12 w-12" />}
                title={copy.nothingFound}
                description={copy.emptyDescription(query)}
                action={{
                  label: copy.clearSearch,
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
