import { Heart, ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '../../shared/api/ApiError';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import { Badge } from './Badge';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

type ProductCardModel = {
  id: string | number;
  image?: string;
  image_url?: string;
  image_urls?: string[];
  brand?: string;
  name?: string;
  price: number | string;
  originalPrice?: number | string;
  original_price?: number | string;
  discount?: number | string;
  inStock?: boolean;
  in_stock?: boolean;
  isNew?: boolean;
  is_new?: boolean;
  rating?: number;
  reviewsCount?: number;
  pointsEarned?: number | string;
  points_earned?: number | string;
  pointsMultiplier?: number | string;
  points_multiplier?: number | string;
  recommendationScore?: number | string;
  recommendation_score?: number | string;
  category?: string;
  whyRecommended?: string;
  why_recommended?: string;
};

export interface ProductCardProps {
  product: ProductCardModel;
  variant?: 'grid' | 'carousel' | 'list';
  onAddToCart?: (id: string, quantity: number) => void;
  onEvent?: (eventType: string, data: any) => void;
  onWishlistChange?: (id: string, isWishlisted: boolean) => void;
  onCartChange?: (id: string, quantity: number) => void;
}

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

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

const pickImage = (product: ProductCardModel): string => {
  const candidates: string[] = [];

  if (typeof product.image === 'string' && product.image.trim()) {
    candidates.push(product.image);
  }
  if (typeof product.image_url === 'string' && product.image_url.trim()) {
    candidates.push(product.image_url);
  }
  candidates.push(...toStringArray(product.image_urls));

  return candidates[0] ?? FALLBACK_IMAGE;
};

export function ProductCard({
  product,
  variant = 'grid',
  onAddToCart,
  onEvent,
  onWishlistChange,
  onCartChange,
}: ProductCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, getCartQuantity, isInWishlist, setCartQuantity, toggleWishlist } = useCommerce();
  const [quantity, setQuantity] = useState(1);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isCartPending, setIsCartPending] = useState(false);

  const productId = String(product.id);
  const numericId = toNumber(product.id);
  const eventProductId = numericId !== undefined ? numericId : productId;
  const favorite = isInWishlist(productId);
  const cartQuantity = getCartQuantity(productId);
  const inCart = cartQuantity > 0;

  const productName =
    typeof product.name === 'string' && product.name.trim() ? product.name : `Товар #${productId}`;
  const productBrand =
    typeof product.brand === 'string' && product.brand.trim() ? product.brand : 'Uilesim';
  const productImage = pickImage(product);
  const inStock = product.inStock ?? product.in_stock ?? true;
  const isNew = product.isNew ?? product.is_new ?? false;
  const whyRecommended =
    typeof product.whyRecommended === 'string' && product.whyRecommended.trim()
      ? product.whyRecommended
      : typeof product.why_recommended === 'string' && product.why_recommended.trim()
        ? product.why_recommended
        : undefined;

  const price = Math.max(0, Math.round(toNumber(product.price) ?? 0));
  const originalPriceRaw = toNumber(product.originalPrice ?? product.original_price);
  const originalPrice =
    originalPriceRaw !== undefined ? Math.max(0, Math.round(originalPriceRaw)) : undefined;

  let discount = toNumber(product.discount);
  if (discount === undefined && originalPrice !== undefined && originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  const discountValue = discount !== undefined ? Math.max(0, Math.round(discount)) : undefined;

  const pointsEarnedRaw = toNumber(product.pointsEarned ?? product.points_earned);
  const pointsEarned =
    pointsEarnedRaw !== undefined ? Math.max(0, Math.round(pointsEarnedRaw)) : undefined;

  const pointsMultiplierRaw = toNumber(product.pointsMultiplier ?? product.points_multiplier);
  const pointsMultiplier =
    pointsMultiplierRaw !== undefined ? Math.max(0, Math.round(pointsMultiplierRaw)) : undefined;

  const recommendationScoreRaw = toNumber(product.recommendationScore ?? product.recommendation_score);
  const recommendationScore =
    recommendationScoreRaw !== undefined
      ? Math.max(0, Math.min(100, Math.round(recommendationScoreRaw)))
      : undefined;

  useEffect(() => {
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
      return;
    }
    setQuantity(1);
  }, [cartQuantity]);

  const isAuthError = (error: unknown): error is ApiError =>
    error instanceof ApiError && (error.status === 401 || error.status === 403);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCartPending || inStock === false) {
      return;
    }

    setIsCartPending(true);
    try {
      const nextQuantity = await addToCart(productId, quantity);
      setQuantity(nextQuantity > 0 ? nextQuantity : quantity);
      onAddToCart?.(productId, quantity);
      onCartChange?.(productId, nextQuantity);
      onEvent?.('add_to_cart', { product_id: eventProductId, quantity });
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      toast.error('Не удалось добавить товар в корзину');
    } finally {
      setIsCartPending(false);
    }
  };

  const handleQuantityChange = async (newQty: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCartPending) {
      return;
    }

    setIsCartPending(true);
    try {
      const nextQuantity = await setCartQuantity(productId, newQty);
      setQuantity(nextQuantity > 0 ? nextQuantity : 1);
      if (nextQuantity > 0) {
        onAddToCart?.(productId, nextQuantity);
      }
      onCartChange?.(productId, nextQuantity);
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      toast.error('Не удалось обновить корзину');
    } finally {
      setIsCartPending(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistPending) {
      return;
    }

    setIsWishlistPending(true);
    try {
      const nextWishlisted = await toggleWishlist(productId);
      onWishlistChange?.(productId, nextWishlisted);
      onEvent?.('wishlist_toggle', { product_id: eventProductId, added: nextWishlisted });
    } catch (error) {
      if (isAuthError(error)) {
        navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      toast.error('Не удалось обновить избранное');
    } finally {
      setIsWishlistPending(false);
    }
  };

  if (variant === 'list') {
    return (
      <Link to={`/product/${productId}`}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#EAE6EF] hover:shadow-md transition-all group">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
            {isNew && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5">NEW</Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6B7280] mb-0.5">{productBrand}</p>
            <h3 className="text-sm font-semibold text-[#111827] mb-1 line-clamp-1">{productName}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#111827]">{price} ₸</span>
              {originalPrice && (
                <span className="text-sm text-[#6B7280] line-through">{originalPrice} ₸</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isCartPending}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] text-white hover:bg-[#0B1220] transition-colors disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Link>
    );
  }

  if (variant === 'carousel') {
    return (
      <Link to={`/product/${productId}`} className="block">
        <div className="group relative bg-white rounded-xl overflow-hidden border border-[#EAE6EF] hover:shadow-lg transition-all w-[220px]">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {isNew && <Badge className="text-[10px] px-2 py-0.5">NEW</Badge>}
              {discountValue !== undefined && discountValue > 0 && (
                <Badge className="text-[10px] px-2 py-0.5">−{discountValue}%</Badge>
              )}
              {pointsMultiplier !== undefined && pointsMultiplier > 0 && (
                <Badge className="text-[10px] px-2 py-0.5 bg-[#FF4DB8] text-white border-none">
                  {pointsMultiplier}× баллы
                </Badge>
              )}
            </div>

            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistPending}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all disabled:opacity-60"
            >
              <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'}`} />
            </button>
          </div>

          <div className="p-3">
            <p className="text-[10px] text-[#6B7280] mb-0.5">{productBrand}</p>
            <h3 className="text-xs font-semibold text-[#111827] mb-2 line-clamp-2 min-h-[32px]">
              {productName}
            </h3>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-base font-bold text-[#111827]">{price} ₸</span>
              {originalPrice && (
                <span className="text-xs text-[#6B7280] line-through">{originalPrice} ₸</span>
              )}
            </div>

            {pointsEarned !== undefined && pointsEarned > 0 && (
              <p className="text-[10px] text-[#FF4DB8] mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{pointsEarned} баллов
              </p>
            )}

            <button
              onClick={handleAddToCart}
              disabled={inStock === false || isCartPending}
              className="w-full h-9 flex items-center justify-center rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#0B1220] transition-colors disabled:bg-gray-100 disabled:text-[#6B7280] disabled:cursor-not-allowed"
            >
              {inStock === false ? 'Нет' : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${productId}`} className="block">
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#EAE6EF] hover:shadow-xl transition-all hover:-translate-y-0.5">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">NEW</Badge>
            )}
            {discountValue !== undefined && discountValue > 0 && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">
                −{discountValue}%
              </Badge>
            )}
            {pointsMultiplier !== undefined && pointsMultiplier > 0 && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">
                {pointsMultiplier}× баллы
              </Badge>
            )}
            {inStock === false && (
              <Badge className="text-xs px-2.5 py-1 bg-gray-500 text-white border-none">
                Нет в наличии
              </Badge>
            )}
          </div>

          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistPending}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all disabled:opacity-60"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'
              }`}
            />
          </button>

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center">
            <button className="px-4 py-2 rounded-lg bg-white text-[#111827] text-sm font-medium hover:bg-gray-50 transition-colors">
              Быстрый просмотр
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-[#6B7280] mb-1">{productBrand}</p>

          <h3 className="text-sm font-semibold text-[#111827] mb-2 line-clamp-2 min-h-[40px]">
            {productName}
          </h3>

          {recommendationScore !== undefined && recommendationScore > 0 && (
            <div className="mb-2 text-xs text-[#FF4DB8] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Подходит вам: {recommendationScore}%
            </div>
          )}

          {whyRecommended && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
                ✦ {whyRecommended}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-[#111827]">{price} ₸</span>
            {originalPrice && (
              <span className="text-sm text-[#6B7280] line-through">{originalPrice} ₸</span>
            )}
          </div>

          {pointsEarned !== undefined && pointsEarned > 0 && (
            <p className="text-xs text-[#FF4DB8] mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{pointsEarned} баллов за покупку
            </p>
          )}

          {inStock === false ? (
            <button
              disabled
              className="w-full h-11 rounded-xl bg-gray-100 text-[#6B7280] text-sm font-medium cursor-not-allowed"
            >
              Нет в наличии
            </button>
          ) : inCart ? (
            <div className="flex items-center justify-between h-11 rounded-xl border-2 border-[#111827] overflow-hidden">
              <button
                onClick={(e) => handleQuantityChange(quantity - 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-semibold text-[#111827]">{quantity}</span>
              <button
                onClick={(e) => handleQuantityChange(quantity + 1, e)}
                disabled={isCartPending}
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isCartPending}
              className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-[#0B1220] hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />В корзину
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'carousel' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#EAE6EF] animate-pulse">
        <div className="w-24 h-24 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
      </div>
    );
  }

  const width = variant === 'carousel' ? 'w-[220px]' : '';

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-[#EAE6EF] animate-pulse ${width}`}>
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-5 w-1/2 bg-gray-200 rounded" />
        <div className="h-11 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
