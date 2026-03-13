import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';
const CATEGORY_FILTERS = [
  { id: 'all', label: 'all categories' },
  { id: 'skincare', label: 'skincare' },
  { id: 'makeup', label: 'makeup' },
  { id: 'haircare', label: 'haircare' },
] as const;

type CategoryFilterId = (typeof CATEGORY_FILTERS)[number]['id'];

export default function NewArrivalsPage() {
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
        setLoadError('failed to load new arrivals. please try again.');
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
  }, [reloadKey]);

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
          <Breadcrumbs items={[{ label: 'home', href: '/' }, { label: 'new arrivals' }]} />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#111827]">new arrivals</h1>
            <Badge>{products.length} products</Badge>
          </div>
          <p className="text-base text-[#6B7280]">fresh releases from the current catalog</p>
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EAE6EF]">
          {CATEGORY_FILTERS.map((filter) => (
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
            <span className="text-sm text-[#6B7280]">in stock only</span>
          </label>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text="loading new arrivals..." />
        ) : loadError ? (
          <ErrorState
            title="failed to load new arrivals"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            no products match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

