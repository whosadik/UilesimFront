import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Percent } from 'lucide-react';

import { ApiError } from '../../shared/api/ApiError';
import { listProducts } from '../../shared/api/catalog';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

export default function SalePage() {
  const navigate = useNavigate();
  const location = useLocation();

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
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setLoadError('Не удалось загрузить товары со скидкой из API. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSaleProducts();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, reloadKey]);

  const productCount = saleProducts.length;
  const headerSubtitle = useMemo(
    () =>
      productCount > 0
        ? `${productCount} товаров со специальными ценами`
        : 'Актуальные скидки из каталога',
    [productCount],
  );

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Скидки' }]} />
        </div>

        <div className="mb-8 rounded-2xl border border-[#FF4DB8] bg-gradient-to-br from-[#FFE1F2] to-pink-50 p-8 lg:p-12">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4DB8]">
              <Percent className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#111827] lg:text-4xl">Скидки до −50%</h1>
              <p className="text-base text-[#6B7280]">{headerSubtitle}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" text="Загружаем скидки..." />
        ) : loadError ? (
          <ErrorState
            title="Не удалось загрузить скидки"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : productCount > 0 ? (
          <ProductGrid products={saleProducts} columns={4} />
        ) : (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            Сейчас нет доступных товаров со скидкой.
          </div>
        )}
      </div>

      <div className="hidden">{/* Source: GET /api/products/?sale=true */}</div>
    </div>
  );
}
