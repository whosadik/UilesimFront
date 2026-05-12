import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowUpRight, BadgeCheck, Heart, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import brandBannerImage from '../../assets/Brand1.png';
import { getBrand, listBrands } from '../../shared/api/brands';
import { listProducts } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { useCommerce } from '../../shared/commerce/CommerceContext';
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

const spotlightCopy = {
  ru: {
    badge: 'Создано для кожи, любящей заботу',
    headline: 'Уход, который подчеркивает вашу естественную красоту',
    catalogProducts: 'товаров в каталоге',
    careCategories: 'категорий ухода',
    satisfied: 'покупатели довольны',
  },
  kk: {
    badge: 'Күтімді сүйетін теріге арналған',
    headline: 'Табиғи сұлулығыңызды айқындайтын күтім',
    catalogProducts: 'каталогтағы тауар',
    careCategories: 'күтім санаты',
    satisfied: 'сатып алушылар риза',
  },
  en: {
    badge: 'Made for skin that loves care',
    headline: 'Care that highlights your natural beauty',
    catalogProducts: 'products in catalog',
    careCategories: 'care categories',
    satisfied: 'customers satisfied',
  },
} as const;

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

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
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
  const imageCandidates = [
    typeof item.image_url === 'string' ? item.image_url : '',
    typeof item.image === 'string' ? item.image : '',
    ...toStringArray(item.image_urls),
  ].filter(Boolean);

  return {
    id,
    name,
    brand,
    price,
    originalPrice,
    discount,
    image: imageCandidates[0] ?? FALLBACK_IMAGE,
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

function ProductPreviewCard({ product }: { product: BrandProduct }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages } = useI18n();
  const { addToCart, isInWishlist, toggleWishlist } = useCommerce();
  const [isCartPending, setIsCartPending] = useState(false);
  const [isWishlistPending, setIsWishlistPending] = useState(false);

  const productId = String(product.id);
  const isOutOfStock = product.inStock === false;
  const isWishlisted = isInWishlist(productId);
  const pointsEarned = product.pointsEarned ?? Math.round(product.price * 0.01);

  const openProduct = () => {
    navigate(`/product/${productId}`);
  };

  const redirectToLogin = () => {
    navigate('/login', {
      replace: true,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const handleWishlistToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isWishlistPending) {
      return;
    }

    setIsWishlistPending(true);
    try {
      await toggleWishlist(productId);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        redirectToLogin();
        return;
      }

      toast.error(messages.productCard.wishlistError);
    } finally {
      setIsWishlistPending(false);
    }
  };

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCartPending || isOutOfStock) {
      return;
    }

    setIsCartPending(true);
    try {
      await addToCart(productId, 1);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        redirectToLogin();
        return;
      }

      toast.error(messages.productCard.cartAddError);
    } finally {
      setIsCartPending(false);
    }
  };

  return (
    <article className="group flex min-h-[430px] flex-col overflow-hidden rounded-[18px] border border-[#F1E3EE] bg-white shadow-[0_18px_50px_-38px_rgba(17,24,39,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFB6DD] hover:shadow-[0_24px_70px_-42px_rgba(255,77,184,0.65)]">
      <div className="relative h-[220px] overflow-hidden bg-[linear-gradient(180deg,#FFF9FD_0%,#FFF4FA_56%,#FDFDFD_100%)]">
        <div
          aria-hidden
          className="absolute inset-x-8 bottom-5 h-14 rounded-full bg-[#FF4DB8]/10 blur-2xl"
        />

        {product.isNew || product.discount ? (
          <span className="absolute left-4 top-4 z-20 rounded-full border border-[#FF9ED0]/75 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FF4DB8] backdrop-blur">
            {product.discount ? `-${product.discount}%` : 'NEW'}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistPending}
          aria-label="Toggle wishlist"
          className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#6B7280] shadow-[0_8px_20px_-12px_rgba(17,24,39,0.6)] backdrop-blur transition-all hover:scale-105 hover:text-[#FF4DB8] disabled:opacity-60"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-[#FF4DB8] text-[#FF4DB8]' : ''}`}
          />
        </button>

        <button type="button" onClick={openProduct} className="relative z-10 block h-full w-full text-left">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="relative z-[1] h-full w-full object-contain p-7 transition-transform duration-500 group-hover:scale-105"
          />
        </button>
      </div>

      <button type="button" onClick={openProduct} className="flex flex-1 flex-col p-4 text-left">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
          {product.brand}
        </p>
        <h3 className="mt-1 min-h-[40px] line-clamp-2 text-[15px] font-semibold leading-snug text-[#111827]">
          {product.name}
        </h3>
        <p className="mt-1 min-h-[34px] line-clamp-2 text-xs leading-5 text-[#6B7280]">
          {product.category}
        </p>

        <div className="mt-4">
          <p className="text-xl font-bold tracking-tight text-[#111827]">
            {formatPrice(product.price)}
          </p>
          {product.originalPrice && product.originalPrice > product.price ? (
            <p className="mt-0.5 text-xs text-[#9CA3AF] line-through">
              {formatPrice(product.originalPrice)}
            </p>
          ) : null}
        </div>

        {pointsEarned > 0 ? (
          <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#FF4DB8]">
            <Sparkles className="h-3.5 w-3.5" />
            +{pointsEarned.toLocaleString('ru-RU')} {messages.productCard.pointsForPurchase}
          </p>
        ) : null}
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={isOutOfStock || isCartPending}
          onClick={handleAddToCart}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FF4DB8] px-4 text-sm font-bold text-white shadow-[0_14px_34px_-18px_rgba(255,77,184,0.9)] transition-all hover:bg-[#F02FA5] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#EEF0F4] disabled:text-[#6B7280] disabled:shadow-none"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? messages.productCard.unavailable : messages.productCard.addToCart}
        </button>
      </div>
    </article>
  );
}

function ProductPreviewSkeleton() {
  return (
    <div className="min-h-[430px] overflow-hidden rounded-[18px] border border-[#F1E3EE] bg-white animate-pulse">
      <div className="h-[220px] bg-[#F5EEF4]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export function BrandSpotlightSection() {
  const navigate = useNavigate();
  const { language, messages } = useI18n();
  const fallbackProductPrefix = messages.productCard.productFallback;
  const copy = spotlightCopy[language];
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
            .slice(0, 3)
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
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 lg:text-3xl">
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
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 lg:text-3xl">
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

  const brandName = brandData?.name ?? 'DARLING*';
  const productCount = brandData?.productCount ?? 9;
  const newProductsCount = brandData?.newProductsCount ?? 9;
  const products = brandData?.products ?? [];

  const openBrand = () => {
    if (brandData?.slug) {
      navigate(`/brands/${brandData.slug}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDFE_0%,#FFF8FC_100%)] py-12 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[30px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF4DB8]">
              {messages.home.brandSpotlight.title}
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-[#151923] sm:text-5xl lg:text-[48px]">
              {brandName}
            </h2>
          </div>

          <button
            type="button"
            onClick={openBrand}
            className="group hidden items-center gap-1.5 text-sm font-semibold text-[#151923] transition-colors hover:text-[#FF4DB8] sm:inline-flex"
          >
            {messages.home.brandSpotlight.viewBrand}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[604px_minmax(0,1fr)]">
          <div className="relative min-h-[492px] overflow-hidden rounded-[22px] border border-[#EEDBE9] bg-[#FFF1F8] shadow-[0_28px_90px_-58px_rgba(17,24,39,0.55)]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-95"
              style={{
                backgroundImage: `url(${brandBannerImage})`,
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'auto 100%',
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,244,250,0.02)_0%,rgba(255,244,250,0.22)_34%,rgba(255,250,253,0.76)_52%,rgba(255,255,255,0.96)_100%)]"
            />

            <div className="relative z-10 flex min-h-[492px] flex-col justify-between p-6 sm:p-8">
              <div className="ml-auto w-full max-w-[300px] pt-6">
                <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">
                  <Sparkles className="h-4 w-4 text-[#FF4DB8]" />
                  {copy.badge}
                </div>

                <h3 className="font-display text-[28px] font-semibold leading-[1.16] tracking-tight text-[#151923] sm:text-[31px]">
                  {copy.headline}
                </h3>

                <p className="mt-5 text-[13px] leading-6 text-[#4B5563]">
                  {brandData?.description || messages.home.brandSpotlight.descriptionFallback}
                </p>
              </div>

              <div className="ml-auto w-full max-w-[300px]">
                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/80 bg-white/64 shadow-[0_16px_45px_-34px_rgba(17,24,39,0.6)] backdrop-blur-xl">
                  <div className="px-3 py-3.5 text-center">
                    <BadgeCheck className="mx-auto mb-1.5 h-5 w-5 text-[#FF4DB8]" />
                    <p className="font-display text-xl font-semibold text-[#151923]">{productCount}</p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-[0.06em] text-[#6B7280]">
                      {copy.catalogProducts}
                    </p>
                  </div>
                  <div className="border-x border-white/80 px-3 py-3.5 text-center">
                    <Sparkles className="mx-auto mb-1.5 h-5 w-5 text-[#FF4DB8]" />
                    <p className="font-display text-xl font-semibold text-[#FF4DB8]">
                      {newProductsCount || 9}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-[0.06em] text-[#6B7280]">
                      {copy.careCategories}
                    </p>
                  </div>
                  <div className="px-3 py-3.5 text-center">
                    <Star className="mx-auto mb-1.5 h-5 w-5 fill-[#FF4DB8] text-[#FF4DB8]" />
                    <p className="font-display text-xl font-semibold text-[#151923]">90%</p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-[0.06em] text-[#6B7280]">
                      {copy.satisfied}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openBrand}
                    className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF4DB8] px-5 text-sm font-bold text-white shadow-[0_18px_48px_-24px_rgba(255,77,184,0.95)] transition-all hover:bg-[#F02FA5] active:scale-[0.98]"
                  >
                    {messages.home.brandSpotlight.viewBrand}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>

                  <a
                    href="#brand-recommended-products"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#EDE2EA] bg-white/82 px-4 text-[11px] font-semibold text-[#4B5563] shadow-sm backdrop-blur transition-colors hover:border-[#FFB6DD] hover:text-[#FF4DB8]"
                  >
                    {messages.home.brandSpotlight.featuredProducts}
                    <Sparkles className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="brand-recommended-products" className="pt-2">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FF4DB8]" />
              <h4 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">
                {messages.home.brandSpotlight.featuredProducts}
              </h4>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {isLoading
                ? [...Array(3)].map((_, index) => <ProductPreviewSkeleton key={index} />)
                : products.map((product) => <ProductPreviewCard key={product.id} product={product} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
