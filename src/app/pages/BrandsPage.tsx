import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';

import { ApiError } from '../../shared/api/ApiError';
import { listBrands, type BrandSummary } from '../../shared/api/brands';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { BrandCard } from '../components/BrandCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrandsPage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const brandsMessages = messages.pages.brands;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadBrandList = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listBrands();
        if (!cancelled) {
          setBrands(response);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setBrands([]);
          return;
        }

        setBrands([]);
        setLoadError(error instanceof Error ? error.message : brandsMessages.loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBrandList();

    return () => {
      cancelled = true;
    };
  }, [brandsMessages.loadError, reloadKey]);

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) => {
        const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLetter = selectedLetter ? brand.name.toUpperCase().startsWith(selectedLetter) : true;
        return matchesSearch && matchesLetter;
      }),
    [brands, searchQuery, selectedLetter],
  );

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: brandsMessages.breadcrumb }]} />
        </div>

        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold text-[#111827] lg:text-4xl">{brandsMessages.title}</h1>
          <p className="text-base text-[#6B7280]">{brandsMessages.subtitle(brands.length)}</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder={brandsMessages.searchPlaceholder}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-[#EAE6EF] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] placeholder:text-[#6B7280] focus:border-[#FF4DB8] focus:outline-none focus:ring-2 focus:ring-[#FF4DB8]/20"
            />
          </div>
        </div>

        <div className="mb-8 border-b border-[#EAE6EF] pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedLetter === null
                  ? 'bg-[#111827] text-white'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {brandsMessages.all}
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
          <ErrorState
            title={brandsMessages.loadErrorTitle}
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : (
          <>
            {!searchQuery && !selectedLetter && brands.length > 0 ? (
              <div className="mb-12">
                <h2 className="mb-6 text-xl font-bold text-[#111827]">{brandsMessages.popularTitle}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {brands.slice(0, 8).map((brand) => (
                    <BrandCard
                      key={brand.slug}
                      name={brand.name}
                      product_count={brand.product_count}
                      onClick={() => navigate(`/brands/${brand.slug}`)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {searchQuery || selectedLetter ? (
              <>
                <h2 className="mb-6 text-xl font-bold text-[#111827]">{brandsMessages.results(filteredBrands.length)}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredBrands.map((brand) => (
                    <BrandCard
                      key={brand.slug}
                      name={brand.name}
                      product_count={brand.product_count}
                      onClick={() => navigate(`/brands/${brand.slug}`)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {filteredBrands.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#6B7280]">{brandsMessages.empty}</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
