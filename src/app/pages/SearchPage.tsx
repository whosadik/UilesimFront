import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, TrendingUp, X } from "lucide-react";
import { ProductGrid } from "../components/ProductGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Chip } from "../components/Chip";
import { FilterBar } from "../components/FilterBar";
import { products } from "../data/products";

/**
 * DEV NOTES:
 * Endpoint: GET /api/products/?search={query}&category=&brand=&in_stock=
 * 
 * До создания search endpoint используется client-side фильтрация
 * После добавления на бэкенде - заменить на API call
 * 
 * События: POST /api/me/recommendations/event
 * Body: { event_type: "search", query: string, results_count: number }
 */

const SUGGESTED_QUERIES = [
  "Увлажняющий крем",
  "Сыворотка с витамином C",
  "SPF крем",
  "Очищающий гель",
  "Тональный крем",
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [searchInput, setSearchInput] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearchInput(query);
    
    if (query) {
      performSearch(query);
      // Add to recent searches
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const updated = [query, ...recent.filter((s: string) => s !== query)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      setRecentSearches(updated);
    } else {
      setFilteredProducts(products);
      // Load recent searches
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      setRecentSearches(recent);
    }
  }, [query]);

  const performSearch = (searchQuery: string) => {
    setIsLoading(true);

    // TODO: Replace with actual API call
    // const response = await fetch(`/api/products/?search=${encodeURIComponent(searchQuery)}`);
    
    // Mock search with client-side filtering
    setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery)
      );
      
      setFilteredProducts(results);
      setIsLoading(false);

      // TODO: Track search event
      // POST /api/me/recommendations/event
      // { event_type: "search", query: searchQuery, results_count: results.length }
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const handleSuggestedClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearchParams({ q: suggestion });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
        {/* Empty state - no query */}
        {!query && (
          <div className="space-y-8">
            {/* Recent searches */}
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
                    <Chip
                      key={index}
                      label={search}
                      onClick={() => handleSuggestedClick(search)}
                      icon={<TrendingUp className="w-4 h-4" />}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested searches */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Популярные запросы</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestedClick(suggestion)}
                  />
                ))}
              </div>
            </div>

            {/* Popular products fallback */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Популярное</h3>
              <ProductGrid products={products.slice(0, 8)} />
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Search results */}
        {!isLoading && query && (
          <>
            {/* Results header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {filteredProducts.length > 0
                  ? `Найдено ${filteredProducts.length} товаров`
                  : "Ничего не найдено"}
              </h2>
              <p className="text-gray-600">
                Результаты поиска: <span className="font-medium">"{query}"</span>
              </p>
            </div>

            {/* Filters */}
            {filteredProducts.length > 0 && (
              <div className="mb-6">
                <FilterBar />
              </div>
            )}

            {/* Results grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                icon={<Search className="w-12 h-12" />}
                title="Ничего не найдено"
                description={`По запросу "${query}" ничего не найдено. Попробуйте изменить запрос или воспользуйтесь фильтрами.`}
                action={{
                  label: "Очистить поиск",
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