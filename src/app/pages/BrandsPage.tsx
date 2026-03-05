import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BrandCard } from '../components/BrandCard';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';

type BrandItem = {
  id: string;
  name: string;
  productCount: number;
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const toBrandSlug = (brandName: string): string => {
  return brandName.toLowerCase().trim().replace(/\s+/g, '-');
};

const extractBrandsFromProducts = (payload: unknown): BrandItem[] => {
  const items = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)
      ? (payload as { results: unknown[] }).results
      : [];

  const byBrand = new Map<string, { name: string; productCount: number }>();

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const brandValue = (item as { brand?: unknown }).brand;
    if (typeof brandValue !== 'string') {
      continue;
    }

    const name = brandValue.trim();
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    const current = byBrand.get(key);

    if (current) {
      current.productCount += 1;
    } else {
      byBrand.set(key, { name, productCount: 1 });
    }
  }

  return Array.from(byBrand.values())
    .map((brand) => ({
      id: toBrandSlug(brand.name),
      name: brand.name,
      productCount: brand.productCount,
    }))
    .sort((a, b) => (b.productCount - a.productCount) || a.name.localeCompare(b.name));
};

export default function BrandsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadBrands = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts();
        if (cancelled) {
          return;
        }

        setBrands(extractBrandsFromProducts(response));
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setBrands([]);
        setLoadError(error instanceof Error ? error.message : 'Failed to load brands');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, reloadKey]);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedLetter || brand.name.startsWith(selectedLetter))
  );

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Бренды' },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-3">
            Бренды
          </h1>
          <p className="text-base text-[#6B7280]">
            Более 100 премиум брендов косметики и ухода
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Найти бренд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EAE6EF] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20 focus:border-[#FF4DB8]"
            />
          </div>
        </div>

        {/* Alphabet Index */}
        <div className="mb-8 pb-6 border-b border-[#EAE6EF]">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLetter === null
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Все
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLetter === letter
                    ? 'bg-[#FF4DB8] text-white'
                    : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : loadError ? (
          <ErrorState onRetry={() => setReloadKey((value) => value + 1)} />
        ) : (
          <>
            {/* Popular Brands Section */}
            {!searchQuery && !selectedLetter && brands.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-[#111827] mb-6">
                  Популярные бренды
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brands.slice(0, 8).map((brand) => (
                    <BrandCard
                      key={brand.id}
                      name={brand.name}
                      productCount={brand.productCount}
                      onClick={() => navigate(`/brands/${brand.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Brands Grid */}
            {(searchQuery || selectedLetter) && (
              <>
                <h2 className="text-xl font-bold text-[#111827] mb-6">
                  {filteredBrands.length} {filteredBrands.length === 1 ? 'бренд' : 'брендов'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBrands.map((brand) => (
                    <BrandCard
                      key={brand.id}
                      name={brand.name}
                      productCount={brand.productCount}
                      onClick={() => navigate(`/brands/${brand.id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Empty State */}
            {filteredBrands.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#6B7280]">Бренды не найдены</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dev Note */}
      <div className="hidden">
        {/* Brands list is derived from GET /api/products/ */}
      </div>
    </div>
  );
}
