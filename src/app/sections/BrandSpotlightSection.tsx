import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { getBrand, listBrands } from '../../shared/api/brands';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { useI18n } from '../../shared/i18n/LanguageContext';

type BrandProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  isNew?: boolean;
  inStock?: boolean;
  pointsEarned?: number;
};

type ApiProduct = Record<string, unknown>;

type BrandData = {
  slug: string;
  name: string;
  description: string;
  productCount: number;
  newProductsCount: number;
  saleProductsCount: number;
  products: BrandProduct[];
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function mapApiProduct(
  item: ApiProduct,
  index: number,
  fallbackProductPrefix: string,
): BrandProduct {
  const id = item.id !== undefined && item.id !== null ? String(item.id) : `product-${index}`;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : `${fallbackProductPrefix} #${id}`;
  const brand = typeof item.brand === 'string' && item.brand.trim() ? item.brand : 'Uilesim';
  const price = toNumber(item.price) ?? 0;
  const originalPrice = toNumber(item.original_price);
  const discount =
    toNumber(item.discount) ??
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : undefined);

  return {
    id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    image:
      (typeof item.image_url === 'string' && item.image_url) ||
      (typeof item.image === 'string' && item.image) ||
      FALLBACK_IMAGE,
    category:
      (typeof item.category === 'string' && item.category) ||
      (typeof item.product_type === 'string' && item.product_type) ||
      'skincare',
    isNew: Boolean(item.is_new),
    inStock: item.in_stock === undefined ? true : Boolean(item.in_stock),
    pointsEarned: toNumber(item.points_earned),
  };
}

function extractItems(payload: unknown): ApiProduct[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)
      ? (payload as { results: unknown[] }).results
      : [];

  return rawItems.filter((item): item is ApiProduct => Boolean(item) && typeof item === 'object');
}

export function BrandSpotlightSection() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const fallbackProductPrefix = messages.productCard.productFallback;
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadBrandData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const brands = await listBrands();
        const featuredBrand = Array.isArray(brands) ? brands[0] : null;

        if (!featuredBrand) {
          if (!cancelled) {
            setBrandData(null);
          }
          return;
        }

        const [brandDetail, productsResponse] = await Promise.all([
          getBrand(featuredBrand.slug),
          listProducts({ brand: featuredBrand.name }),
        ]);

        if (cancelled) {
          return;
        }

        setBrandData({
          slug: brandDetail.slug,
          name: brandDetail.name,
          description: brandDetail.description,
          productCount: brandDetail.product_count,
          newProductsCount: brandDetail.new_products_count,
          saleProductsCount: brandDetail.sale_products_count,
          products: extractItems(productsResponse)
            .slice(0, 4)
            .map((item, index) => mapApiProduct(item, index, fallbackProductPrefix)),
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setBrandData(null);
          return;
        }

        setBrandData(null);
        setError(loadError instanceof Error ? loadError.message : messages.home.brandSpotlight.errorTitle);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBrandData();

    return () => {
      cancelled = true;
    };
  }, [fallbackProductPrefix, messages.home.brandSpotlight.errorTitle, retryKey]);

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
            {messages.home.brandSpotlight.title}
          </h2>
          <ErrorState
            title={messages.home.brandSpotlight.errorTitle}
            description={messages.home.brandSpotlight.errorDescription}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        </div>
      </section>
    );
  }

  if (!isLoading && (!brandData || brandData.products.length === 0)) {
    return (
      <section className="py-12">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
            {messages.home.brandSpotlight.title}
          </h2>
          <EmptyState
            title={messages.home.brandSpotlight.emptyTitle}
            description={messages.home.brandSpotlight.emptyDescription}
            action={{
              label: messages.common.refresh,
              onClick: () => setRetryKey((value) => value + 1),
            }}
          />
        </div>
      </section>
    );
  }

  const brandName = brandData?.name ?? 'Brand';
  const productCount = brandData?.productCount ?? 0;
  const newProductsCount = brandData?.newProductsCount ?? 0;
  const saleProductsCount = brandData?.saleProductsCount ?? 0;
  const products = brandData?.products ?? [];

  const heroProduct = products[0];
  const heroImage = heroProduct?.image;

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4DB8]">
              {messages.home.brandSpotlight.title}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#111827] lg:text-[40px]">
              {brandName}
            </h2>
          </div>
          <button
            onClick={() => {
              if (brandData?.slug) navigate(`/brands/${brandData.slug}`);
            }}
            className="group hidden items-center gap-1 text-sm font-medium text-[#111827] transition-colors hover:text-[#FF4DB8] sm:inline-flex"
          >
            {messages.home.brandSpotlight.viewBrand}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-[#EAE6EF] bg-[#FBF7FA] p-6 sm:p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#FFD6EC] via-[#FFE9F4] to-transparent blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-tr from-[#F1E4FB] via-[#FFE1F2]/60 to-transparent blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(17,24,39,0.5) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <div className="relative">
                <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-[#FF4DB8]/40 via-[#FFB8DC]/30 to-transparent blur-xl" aria-hidden />
                <div className="relative h-32 w-32 overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#3b2a52] to-[#FF4DB8] shadow-[0_24px_60px_-24px_rgba(255,77,184,0.55)] sm:h-36 sm:w-36">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={brandName}
                      className="h-full w-full object-cover opacity-90 mix-blend-luminosity"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-5xl font-semibold text-white drop-shadow-sm sm:text-6xl">
                      {brandName[0]?.toUpperCase() ?? 'B'}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                    aria-hidden
                  />
                </div>
                <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FF4DB8] shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {messages.home.brandSpotlight.featuredProducts}
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-sm leading-relaxed text-[#374151]">
                  {brandData?.description ?? messages.home.brandSpotlight.descriptionFallback}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur">
                  <div>
                    <div className="font-display text-2xl font-semibold text-[#111827]">
                      {productCount}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">
                      {messages.home.brandSpotlight.products}
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold text-[#FF4DB8]">
                      {newProductsCount}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">
                      {messages.home.brandSpotlight.new}
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold text-[#111827]">
                      {saleProductsCount}
                    </div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[#6B7280]">
                      {messages.home.brandSpotlight.onSale}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (brandData?.slug) navigate(`/brands/${brandData.slug}`);
                  }}
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink-500 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-brand-pink-600 hover:shadow-[0_18px_40px_-18px_rgba(255,77,184,0.55)] active:scale-[0.98] sm:w-auto"
                >
                  {messages.home.brandSpotlight.viewBrand}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111827]/60">
              {messages.home.brandSpotlight.featuredProducts}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {isLoading
                ? [...Array(4)].map((_, index) => <ProductCardSkeleton key={index} variant="grid" />)
                : products.map((product) => <ProductCard key={product.id} product={product} variant="grid" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
