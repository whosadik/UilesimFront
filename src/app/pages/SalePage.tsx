import { useEffect, useMemo, useState } from 'react';
import { Percent } from 'lucide-react';

import { ApiError } from '../../shared/api/ApiError';
import { listProducts } from '../../shared/api/catalog';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

export default function SalePage() {
  const { messages } = useI18n();
  const saleMessages = messages.pages.sale;
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadSaleProducts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await listProducts({ sale: true });
        const mapped = extractProducts(response).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'sale-product',
            fallbackImageUrl: FALLBACK_IMAGE_URL,
          }),
        );

        if (!cancelled) {
          setSaleProducts(mapped);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          setSaleProducts([]);
          return;
        }

        setLoadError(saleMessages.loadErrorDescription);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSaleProducts();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, saleMessages.loadErrorDescription]);

  const productCount = saleProducts.length;
  const headerSubtitle = useMemo(() => saleMessages.subtitle(productCount), [productCount, saleMessages]);

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: messages.common.home, href: '/' }, { label: saleMessages.breadcrumb }]} />
        </div>

        <div className="mb-8 rounded-2xl border border-[#FF4DB8] bg-gradient-to-br from-[#FFE1F2] to-pink-50 p-8 lg:p-12">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4DB8]">
              <Percent className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#111827] lg:text-4xl">{saleMessages.title}</h1>
              <p className="text-base text-[#6B7280]">{headerSubtitle}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text={saleMessages.loading} />
        ) : loadError ? (
          <ErrorState
            title={saleMessages.loadErrorTitle}
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : productCount > 0 ? (
          <ProductGrid products={saleProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            {saleMessages.empty}
          </div>
        )}
      </div>
    </div>
  );
}
