import { Heart, ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ApiError } from '../../shared/api/ApiError';
import { useCommerce } from '../../shared/commerce/CommerceContext';
import { localizeRecommendationReason } from '../../shared/catalog/presentation';
import { useI18n } from '../../shared/i18n/LanguageContext';
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
  const { language, messages } = useI18n();
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
    typeof product.name === 'string' && product.name.trim()
      ? product.name
      : `${messages.productCard.productFallback} #${productId}`;
  const productBrand =
    typeof product.brand === 'string' && product.brand.trim() ? product.brand : 'Uilesim';
  const productImage = pickImage(product);
  const inStock = product.inStock ?? product.in_stock ?? true;
  const isNew = product.isNew ?? product.is_new ?? false;
  const rawWhyRecommended =
    typeof product.whyRecommended === 'string' && product.whyRecommended.trim()
      ? product.whyRecommended
      : typeof product.why_recommended === 'string' && product.why_recommended.trim()
        ? product.why_recommended
        : undefined;
  const whyRecommended =
    rawWhyRecommended !== undefined
      ? localizeRecommendationReason(rawWhyRecommended, language) ?? rawWhyRecommended
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

  const handleProductClick = () => {
    onEvent?.('click', { product_id: eventProductId });
  };

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

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
      toast.error(messages.productCard.cartAddError);
    } finally {
      setIsCartPending(false);
    }
  };

  const handleQuantityChange = async (newQty: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

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
      toast.error(messages.productCard.cartUpdateError);
    } finally {
      setIsCartPending(false);
    }
  };

  const handleWishlistToggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

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
      toast.error(messages.productCard.wishlistError);
    } finally {
      setIsWishlistPending(false);
    }
  };

  if (variant === 'list') {
    return (
      <Link to={`/product/${productId}`} onClick={handleProductClick}>
        <div className="group flex items-center gap-4 rounded-xl border border-[#EAE6EF] bg-white p-4 transition-all hover:shadow-md">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50">
            <img src={productImage} alt={productName} className="h-full w-full object-cover" />
            {isNew ? <Badge className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px]">NEW</Badge> : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs text-[#6B7280]">{productBrand}</p>
            <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-[#111827]">{productName}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#111827]">{price} ₸</span>
              {originalPrice ? (
                <span className="text-sm text-[#6B7280] line-through">{originalPrice} ₸</span>
              ) : null}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isCartPending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-pink-500 text-white transition-colors hover:bg-brand-pink-600 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Link>
    );
  }

  if (variant === 'carousel') {
    return (
      <Link to={`/product/${productId}`} className="block" onClick={handleProductClick}>
        <div className="group relative w-[220px] overflow-hidden rounded-xl border border-[#EAE6EF] bg-white transition-all hover:shadow-lg">
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={productImage}
              alt={productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isNew ? (
                <Badge className="border-none bg-[#111827] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  NEW
                </Badge>
              ) : discountValue !== undefined && discountValue > 0 ? (
                <Badge className="border-none bg-[#111827] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  −{discountValue}%
                </Badge>
              ) : null}
              {pointsMultiplier !== undefined && pointsMultiplier > 0 ? (
                <Badge className="border-none bg-[#FFE1F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B4185B]">
                  {pointsMultiplier}× {messages.productCard.points}
                </Badge>
              ) : null}
            </div>

            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistPending}
              aria-label="Toggle wishlist"
              className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white disabled:opacity-60"
            >
              <Heart
                className={`h-4 w-4 ${
                  favorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'
                }`}
              />
            </button>
          </div>

          <div className="p-3">
            <p className="mb-0.5 text-[10px] text-[#6B7280]">{productBrand}</p>
            <h3 className="mb-2 min-h-[32px] line-clamp-2 text-xs font-semibold text-[#111827]">
              {productName}
            </h3>

            <div className="mb-2 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#111827]">{price} ₸</span>
              {originalPrice ? (
                <span className="text-xs text-[#6B7280] line-through">{originalPrice} ₸</span>
              ) : null}
            </div>

            {pointsEarned !== undefined && pointsEarned > 0 ? (
              <p className="mb-2 flex items-center gap-1 text-[10px] text-[#FF4DB8]">
                <Sparkles className="h-3 w-3" />
                +{pointsEarned} {messages.productCard.points}
              </p>
            ) : null}

            <button
              onClick={handleAddToCart}
              disabled={inStock === false || isCartPending}
              className="flex h-9 w-full items-center justify-center rounded-lg bg-brand-pink-500 text-xs font-medium text-white transition-colors hover:bg-brand-pink-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-[#6B7280]"
            >
              {inStock === false ? messages.productCard.unavailable : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${productId}`} className="block" onClick={handleProductClick}>
      <div className="group relative overflow-hidden rounded-2xl border border-[#EAE6EF] bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={productImage}
            alt={productName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew ? (
              <Badge className="border-none bg-[#111827] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                NEW
              </Badge>
            ) : discountValue !== undefined && discountValue > 0 ? (
              <Badge className="border-none bg-[#111827] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                −{discountValue}%
              </Badge>
            ) : null}
            {pointsMultiplier !== undefined && pointsMultiplier > 0 ? (
              <Badge className="border-none bg-[#FFE1F2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B4185B]">
                {pointsMultiplier}× {messages.productCard.points}
              </Badge>
            ) : null}
            {inStock === false ? (
              <Badge className="border-none bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280] backdrop-blur">
                {messages.productCard.unavailable}
              </Badge>
            ) : null}
          </div>

          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistPending}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white disabled:opacity-60"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                favorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'
              }`}
            />
          </button>

          <div className="absolute inset-0 hidden items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-gray-50">
              {messages.productCard.quickView}
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-1 text-xs text-[#6B7280]">{productBrand}</p>

          <h3 className="mb-2 min-h-[40px] line-clamp-2 text-sm font-semibold text-[#111827]">
            {productName}
          </h3>

          {recommendationScore !== undefined && recommendationScore > 0 ? (
            <div className="mb-2 flex items-center gap-1 text-xs text-[#FF4DB8]">
              <Sparkles className="h-3 w-3" />
              {messages.productCard.matchPrefix}: {recommendationScore}%
            </div>
          ) : null}

          {whyRecommended ? (
            <div className="mb-2">
              <span className="inline-flex items-center rounded-full bg-[#FFE1F2] px-2 py-0.5 text-[10px] font-medium text-[#FF4DB8]">
                {whyRecommended}
              </span>
            </div>
          ) : null}

          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#111827]">{price} ₸</span>
            {originalPrice ? (
              <span className="text-sm text-[#6B7280] line-through">{originalPrice} ₸</span>
            ) : null}
          </div>

          {pointsEarned !== undefined && pointsEarned > 0 ? (
            <p className="mb-3 flex items-center gap-1 text-xs text-[#FF4DB8]">
              <Sparkles className="h-3.5 w-3.5" />
              +{pointsEarned} {messages.productCard.pointsForPurchase}
            </p>
          ) : null}

          {inStock === false ? (
            <button
              disabled
              className="h-11 w-full cursor-not-allowed rounded-xl bg-gray-100 text-sm font-medium text-[#6B7280]"
            >
              {messages.productCard.unavailable}
            </button>
          ) : inCart ? (
            <div className="flex h-11 items-center justify-between overflow-hidden rounded-xl border-2 border-brand-pink-500">
              <button
                onClick={(event) => handleQuantityChange(quantity - 1, event)}
                disabled={isCartPending}
                className="flex h-full flex-1 items-center justify-center text-brand-pink-500 transition-colors hover:bg-brand-pink-100/60 disabled:opacity-60"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 font-semibold text-brand-pink-500">{quantity}</span>
              <button
                onClick={(event) => handleQuantityChange(quantity + 1, event)}
                disabled={isCartPending}
                className="flex h-full flex-1 items-center justify-center text-brand-pink-500 transition-colors hover:bg-brand-pink-100/60 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isCartPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-pink-500 text-sm font-medium text-white transition-all hover:bg-brand-pink-600 hover:shadow-md active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" />
              {messages.productCard.addToCart}
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
      <div className="flex items-center gap-4 rounded-xl border border-[#EAE6EF] bg-white p-4 animate-pulse">
        <div className="h-24 w-24 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
      </div>
    );
  }

  const width = variant === 'carousel' ? 'w-[220px]' : '';

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#EAE6EF] bg-white animate-pulse ${width}`}>
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-5 w-1/2 rounded bg-gray-200" />
        <div className="h-11 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
