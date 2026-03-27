import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ChevronDown, Heart, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProductCarousel } from '../components/ProductCarousel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getProduct } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';
import { bundle as getBundleRecommendations, type BundleRecsResponse, type RecItem } from '../../shared/api/recommendations';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import { useI18n } from '../../shared/i18n/LanguageContext';
import { toBrandSlug } from '../utils/brandSlug';

interface ProductViewModel {
  id: string;
  name: string;
  brand: string;
  brandSlug?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  pointsEarned?: number;
  inStock: boolean;
  images: string[];
  description: string;
  ingredients: string;
  howToUse: string;
}

interface RecommendationCard {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  pointsEarned?: number;
  inStock?: boolean;
  category?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80';
const productPageCopy = {
  ru: {
    fallbackDescription: 'Описание товара пока недоступно.',
    fallbackIngredients: 'Список ингредиентов пока недоступен.',
    fallbackUsage: 'Инструкция по применению пока недоступна.',
    productNotFound: 'Товар не найден.',
    loadProductError: 'Не удалось загрузить данные товара. Попробуйте еще раз.',
    invalidFormat: 'Ответ по товару имеет неверный формат.',
    recommendationsError: 'Не удалось загрузить похожие товары. Попробуйте еще раз.',
    pageError: 'Не удалось загрузить страницу товара. Попробуйте еще раз.',
    addToCartError: 'Не удалось добавить товар в корзину',
    wishlistError: 'Не удалось обновить избранное',
    inStock: 'В наличии',
    loading: 'Загружаем товар...',
    unavailable: 'Товар недоступен.',
    retry: 'Повторить',
    noReviews: 'Отзывов пока нет',
    reviews: (rating: number, reviews: number) => `${rating} (${reviews} отзывов)`,
    bonusPoints: (points: number) => `+${points} бонусных баллов`,
    adding: 'Добавляем...',
    addToCart: 'В корзину',
    ingredients: 'Ингредиенты',
    howToUse: 'Как использовать',
    relatedProducts: 'Похожие товары',
    relatedProductsEmpty: 'Похожие товары пока недоступны.',
  },
  kk: {
    fallbackDescription: 'Тауар сипаттамасы әзірге қолжетімсіз.',
    fallbackIngredients: 'Құрамы әзірге қолжетімсіз.',
    fallbackUsage: 'Қолдану нұсқаулығы әзірге қолжетімсіз.',
    productNotFound: 'Тауар табылмады.',
    loadProductError: 'Тауар деректерін жүктеу мүмкін болмады. Қайта көріңіз.',
    invalidFormat: 'Тауар жауабының пішімі қате.',
    recommendationsError: 'Ұқсас тауарларды жүктеу мүмкін болмады. Қайта көріңіз.',
    pageError: 'Тауар бетін жүктеу мүмкін болмады. Қайта көріңіз.',
    addToCartError: 'Тауарды себетке қосу мүмкін болмады',
    wishlistError: 'Таңдаулыларды жаңарту мүмкін болмады',
    inStock: 'Қоймада бар',
    loading: 'Тауарды жүктеп жатырмыз...',
    unavailable: 'Тауар қолжетімсіз.',
    retry: 'Қайта көру',
    noReviews: 'Пікірлер әлі жоқ',
    reviews: (rating: number, reviews: number) => `${rating} (${reviews} пікір)`,
    bonusPoints: (points: number) => `+${points} бонус ұпайы`,
    adding: 'Қосып жатырмыз...',
    addToCart: 'Себетке',
    ingredients: 'Құрамы',
    howToUse: 'Қолдану тәсілі',
    relatedProducts: 'Ұқсас тауарлар',
    relatedProductsEmpty: 'Ұқсас тауарлар әзірге қолжетімсіз.',
  },
  en: {
    fallbackDescription: 'Product description is not available yet.',
    fallbackIngredients: 'Ingredients list is not available yet.',
    fallbackUsage: 'Usage instructions are not available yet.',
    productNotFound: 'Product not found.',
    loadProductError: 'Could not load product details. Try again.',
    invalidFormat: 'The product response format is invalid.',
    recommendationsError: 'Could not load related products. Try again.',
    pageError: 'Could not load the product page. Try again.',
    addToCartError: 'Could not add item to cart',
    wishlistError: 'Could not update wishlist',
    inStock: 'In stock',
    loading: 'Loading product...',
    unavailable: 'Product is unavailable.',
    retry: 'Retry',
    noReviews: 'No reviews yet',
    reviews: (rating: number, reviews: number) => `${rating} (${reviews} reviews)`,
    bonusPoints: (points: number) => `+${points} bonus points`,
    adding: 'Adding...',
    addToCart: 'Add to cart',
    ingredients: 'Ingredients',
    howToUse: 'How to use',
    relatedProducts: 'Related products',
    relatedProductsEmpty: 'Related products are not available yet.',
  },
} as const;

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const toNumber = (value: unknown): number | undefined => {
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
};

const firstNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = toNumber(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
};

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

const toRoundedNonNegative = (value: number | undefined, fallback = 0): number =>
  Math.max(0, Math.round(value ?? fallback));

const mapApiProductToView = (
  payload: Record<string, unknown>,
  fallbackId: string,
  copy: (typeof productPageCopy)[keyof typeof productPageCopy],
  fallbackProductLabel: (id: string) => string,
): ProductViewModel => {
  const rawMeta = toRecord(payload.raw_meta);
  const attrs = toRecord(payload.attrs);

  const price = toRoundedNonNegative(firstNumber(payload.price), 0);
  const originalPriceRaw = firstNumber(
    payload.original_price,
    rawMeta?.original_price,
    rawMeta?.old_price,
    attrs?.original_price,
  );
  const originalPrice = originalPriceRaw !== undefined ? toRoundedNonNegative(originalPriceRaw) : undefined;

  let discount = firstNumber(payload.discount, rawMeta?.discount, attrs?.discount);
  if (discount === undefined && originalPrice && originalPrice > price) {
    discount = ((originalPrice - price) / originalPrice) * 100;
  }

  const images = [...toStringArray(payload.image_urls), ...toStringArray(payload.images)];
  const singleImage = firstString(payload.image_url, payload.image, rawMeta?.image_url, rawMeta?.image);
  if (singleImage) {
    images.unshift(singleImage);
  }

  const normalizedImages = Array.from(new Set(images)).filter((image) => image.length > 0);

  const ratingRaw = firstNumber(payload.rating, rawMeta?.rating, attrs?.rating);
  const reviewsRaw = firstNumber(
    payload.reviews_count,
    payload.reviews,
    rawMeta?.reviews_count,
    rawMeta?.reviews,
    attrs?.reviews_count,
    attrs?.reviews,
  );
  const pointsEarnedRaw = firstNumber(payload.points_earned, rawMeta?.points_earned, attrs?.points_earned);

  return {
    id: String(payload.id ?? fallbackId),
    name: firstString(payload.name) ?? fallbackProductLabel(fallbackId),
    brand: firstString(payload.brand) ?? 'Uilesim',
    brandSlug: firstString(payload.brand_slug),
    price,
    originalPrice,
    discount: discount !== undefined ? toRoundedNonNegative(discount) : undefined,
    rating: Math.max(0, Math.min(5, Math.round((ratingRaw ?? 0) * 10) / 10)),
    reviews: toRoundedNonNegative(reviewsRaw),
    pointsEarned: pointsEarnedRaw !== undefined ? toRoundedNonNegative(pointsEarnedRaw) : undefined,
    inStock: payload.in_stock === undefined ? true : Boolean(payload.in_stock),
    images: normalizedImages.length > 0 ? normalizedImages : [FALLBACK_IMAGE],
    description: firstString(payload.description) ?? copy.fallbackDescription,
    ingredients: firstString(payload.ingredients_inci, payload.ingredients) ?? copy.fallbackIngredients,
    howToUse: firstString(payload.application_text, payload.how_to_use, payload.howToUse) ?? copy.fallbackUsage,
  };
};

const extractBundleResults = (response: BundleRecsResponse): RecItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  const responseRecord = toRecord(response);
  if (!responseRecord) {
    return [];
  }

  return Array.isArray(responseRecord.results) ? (responseRecord.results as RecItem[]) : [];
};

const mapBundleItemToCard = (item: RecItem, index: number): RecommendationCard => {
  const product = toRecord(item.product) ?? {};
  const rawMeta = toRecord(product.raw_meta);
  const attrs = toRecord(product.attrs);

  const price = toRoundedNonNegative(firstNumber(product.price), 0);
  const originalPriceRaw = firstNumber(
    product.original_price,
    rawMeta?.original_price,
    rawMeta?.old_price,
    attrs?.original_price,
  );
  const originalPrice = originalPriceRaw !== undefined ? toRoundedNonNegative(originalPriceRaw) : undefined;

  let discount = firstNumber(product.discount, rawMeta?.discount, attrs?.discount);
  if (discount === undefined && originalPrice && originalPrice > price) {
    discount = ((originalPrice - price) / originalPrice) * 100;
  }
  const imageUrls = [...toStringArray(product.image_urls), ...toStringArray(rawMeta?.image_urls)];
  const pointsEarnedRaw = firstNumber(product.points_earned, rawMeta?.points_earned, attrs?.points_earned);

  return {
    id: product.id !== undefined && product.id !== null ? String(product.id) : `bundle-${index}`,
    image:
      firstString(product.image_url, product.image, rawMeta?.image_url, rawMeta?.image) ??
      imageUrls[0] ??
      FALLBACK_IMAGE,
    brand: firstString(product.brand) ?? 'Uilesim',
    name: firstString(product.name) ?? `recommended item #${index + 1}`,
    price,
    originalPrice,
    discount: discount !== undefined ? toRoundedNonNegative(discount) : undefined,
    pointsEarned: pointsEarnedRaw !== undefined ? toRoundedNonNegative(pointsEarnedRaw) : undefined,
    inStock: product.in_stock === undefined ? true : Boolean(product.in_stock),
    category: firstString(product.category, product.product_type),
  };
};

const isAuthError = (error: unknown): error is ApiError =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, getCartQuantity, isInWishlist, toggleWishlist } = useCommerce();
  const { language, messages } = useI18n();
  const copy = productPageCopy[language];

  const [product, setProduct] = useState<ProductViewModel | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isCartPending, setIsCartPending] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setError(copy.productNotFound);
      setIsLoading(false);
      setIsRecommendationsLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setIsRecommendationsLoading(true);
      setError(null);
      setRecommendationsError(null);

      const [productResult, recommendationsResult] = await Promise.allSettled([
        getProduct(id),
        getBundleRecommendations({ product_id: id, limit: 8 }),
      ]);

      if (cancelled) {
        return;
      }

      if (productResult.status === 'rejected') {
        setProduct(null);
        setError(copy.loadProductError);
      } else {
        const payload = toRecord(productResult.value);
        if (payload) {
          setProduct(
            mapApiProductToView(
              payload,
              id,
              copy,
              (fallbackId) => `${messages.productCard.productFallback} #${fallbackId}`,
            ),
          );
          setSelectedImage(0);
        } else {
          setProduct(null);
          setError(copy.invalidFormat);
        }
      }

      if (recommendationsResult.status === 'rejected') {
        if (isAuthError(recommendationsResult.reason)) {
          setRecommendations([]);
        } else {
          setRecommendations([]);
          setRecommendationsError(copy.recommendationsError);
        }
      } else {
        const mapped = extractBundleResults(recommendationsResult.value)
          .map((item, index) => mapBundleItemToCard(item, index))
          .filter((item) => item.id !== String(id));
        setRecommendations(mapped);
      }

      setIsLoading(false);
      setIsRecommendationsLoading(false);
    };

    void loadData().catch(() => {
      if (cancelled) {
        return;
      }

      setProduct(null);
      setRecommendations([]);
      setError(copy.pageError);
      setIsLoading(false);
      setIsRecommendationsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [copy, id, retryKey]);

  const cartQuantity = product ? getCartQuantity(product.id) : 0;
  const isProductInWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
      return;
    }
    setQuantity(1);
  }, [cartQuantity]);

  const handleAddToCart = async () => {
    if (!product || isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.addToCartError);
    } finally {
      setIsCartPending(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || isWishlistPending) {
      return;
    }

    setIsWishlistPending(true);
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      toast.error(copy.wishlistError);
    } finally {
      setIsWishlistPending(false);
    }
  };

  const productBadges = useMemo(() => {
    const badges: string[] = [];
    if (product?.discount !== undefined && product.discount > 0) {
      badges.push(`-${product.discount}%`);
    }
    if (product?.inStock) {
      badges.push(copy.inStock);
    }
    return badges;
  }, [copy.inStock, product]);

  if (isLoading && !product) {
    return (
      <div className="page-with-navbar-offset min-h-screen">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <LoadingSpinner size="lg" text={copy.loading} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-with-navbar-offset min-h-screen">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
            <p className="text-sm text-[#B42318]">{error ?? copy.unavailable}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-3 text-sm font-medium text-[#111827] underline underline-offset-2"
            >
              {copy.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = product.images[selectedImage] ?? product.images[0] ?? FALLBACK_IMAGE;
  const brandSlug = product.brandSlug || toBrandSlug(product.brand);

  return (
    <div className="page-with-navbar-offset min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {error && (
          <div className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
            <p className="text-sm text-[#B42318]">{error}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
            >
              {copy.retry}
            </button>
          </div>
        )}

        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: messages.common.home, href: '/' },
              { label: messages.navbar.mainMenu.catalog, href: '/catalog' },
              { label: product.brand, href: `/brands/${brandSlug}` },
              { label: product.name },
            ]}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-white border border-[#EAE6EF] overflow-hidden">
              <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImage === idx ? 'border-[#FF4DB8]' : 'border-[#EAE6EF] hover:border-[#FF4DB8]/50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#6B7280] mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold text-[#111827] mb-3">{product.name}</h1>

              {product.reviews > 0 && product.rating > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#6B7280]">
                    {copy.reviews(product.rating, product.reviews)}
                  </span>
                </div>
              ) : (
                <p className="mb-4 text-sm text-[#6B7280]">{copy.noReviews}</p>
              )}

              <div className="flex items-center gap-2">
                {productBadges.map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#111827]">{product.price} ₸</span>
              {product.originalPrice !== undefined && product.originalPrice > 0 && (
                <span className="text-lg text-[#6B7280] line-through">{product.originalPrice} ₸</span>
              )}
            </div>

            {product.pointsEarned !== undefined && product.pointsEarned > 0 && (
              <p className="text-sm font-medium text-[#FF4DB8]">{copy.bonusPoints(product.pointsEarned)}</p>
            )}

            <p className="text-base text-[#6B7280] leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#EAE6EF] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-[#6B7280] hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-3 font-semibold text-[#111827]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-[#6B7280] hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>

              <Button variant="primary" className="flex-1" onClick={handleAddToCart} disabled={isCartPending}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isCartPending ? copy.adding : copy.addToCart}
              </Button>

              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistPending}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-[#EAE6EF] text-[#6B7280] hover:border-[#FF4DB8] hover:text-[#FF4DB8] transition-colors disabled:opacity-60"
              >
                <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-[#FF4DB8] text-[#FF4DB8]' : ''}`} />
              </button>
            </div>

            <div className="pt-6 border-t border-[#EAE6EF] space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-[#111827] py-3">
                  {copy.ingredients}
                  <ChevronDown className="h-4 w-4 text-[#6B7280] transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-sm text-[#6B7280] mt-2">{product.ingredients}</p>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-[#111827] py-3 border-t border-[#EAE6EF]">
                  {copy.howToUse}
                  <ChevronDown className="h-4 w-4 text-[#6B7280] transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-sm text-[#6B7280] mt-2">{product.howToUse}</p>
              </details>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-[#111827] mb-6">{copy.relatedProducts}</h2>

          {recommendationsError && (
            <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
              <p className="text-sm text-[#B42318]">{recommendationsError}</p>
              <button
                onClick={() => setRetryKey((value) => value + 1)}
                className="mt-2 text-xs font-medium text-[#111827] underline underline-offset-2"
              >
                {copy.retry}
              </button>
            </div>
          )}

          {isRecommendationsLoading ? (
            <ProductCarousel products={[]} loading />
          ) : recommendations.length > 0 ? (
            <ProductCarousel products={recommendations} />
          ) : (
            <p className="text-sm text-[#6B7280]">{copy.relatedProductsEmpty}</p>
          )}
        </section>
      </div>
    </div>
  );
}

