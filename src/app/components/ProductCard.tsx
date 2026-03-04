import { Heart, ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Badge } from './Badge';

export interface ProductCardProps {
  product: {
    id: string;
    image: string;
    brand: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    inStock?: boolean;
    isNew?: boolean;
    rating?: number;
    reviewsCount?: number;
    pointsEarned?: number;
    pointsMultiplier?: number;
    recommendationScore?: number;
    category?: string;
    whyRecommended?: string;
  };
  variant?: 'grid' | 'carousel' | 'list';
  onAddToCart?: (id: string, quantity: number) => void;
  onEvent?: (eventType: string, data: any) => void;
}

export function ProductCard({ 
  product, 
  variant = 'grid',
  onAddToCart,
  onEvent,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInCart(true);
    onAddToCart?.(product.id, quantity);
    onEvent?.('add_to_cart', { product_id: product.id, quantity });
  };

  const handleQuantityChange = (newQty: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newQty === 0) {
      setInCart(false);
      setQuantity(1);
    } else {
      setQuantity(newQty);
      onAddToCart?.(product.id, newQty);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onEvent?.('wishlist_toggle', { product_id: product.id, added: !isFavorite });
  };

  // List variant
  if (variant === 'list') {
    return (
      <Link to={`/product/${product.id}`}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#EAE6EF] hover:shadow-md transition-all group">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.isNew && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5">NEW</Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6B7280] mb-0.5">{product.brand}</p>
            <h3 className="text-sm font-semibold text-[#111827] mb-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#111827]">{product.price} ₽</span>
              {product.originalPrice && (
                <span className="text-sm text-[#6B7280] line-through">{product.originalPrice} ₽</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] text-white hover:bg-[#0B1220] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Link>
    );
  }

  // Carousel variant (compact)
  if (variant === 'carousel') {
    return (
      <Link to={`/product/${product.id}`} className="block">
        <div className="group relative bg-white rounded-xl overflow-hidden border border-[#EAE6EF] hover:shadow-lg transition-all w-[220px]">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {product.isNew && <Badge className="text-[10px] px-2 py-0.5">NEW</Badge>}
              {product.discount && <Badge className="text-[10px] px-2 py-0.5">−{product.discount}%</Badge>}
              {product.pointsMultiplier && (
                <Badge className="text-[10px] px-2 py-0.5 bg-[#FF4DB8] text-white border-none">
                  {product.pointsMultiplier}× баллы
                </Badge>
              )}
            </div>

            {/* Favorite */}
            <button
              onClick={toggleFavorite}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            <p className="text-[10px] text-[#6B7280] mb-0.5">{product.brand}</p>
            <h3 className="text-xs font-semibold text-[#111827] mb-2 line-clamp-2 min-h-[32px]">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-base font-bold text-[#111827]">{product.price} ₽</span>
              {product.originalPrice && (
                <span className="text-xs text-[#6B7280] line-through">{product.originalPrice} ₽</span>
              )}
            </div>

            {product.pointsEarned && (
              <p className="text-[10px] text-[#FF4DB8] mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{product.pointsEarned} баллов
              </p>
            )}

            {/* Quick Add */}
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="w-full h-9 flex items-center justify-center rounded-lg bg-[#111827] text-white text-xs font-medium hover:bg-[#0B1220] transition-colors disabled:bg-gray-100 disabled:text-[#6B7280] disabled:cursor-not-allowed"
            >
              {product.inStock === false ? 'Нет' : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default, main)
  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#EAE6EF] hover:shadow-xl transition-all hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">NEW</Badge>
            )}
            {product.discount && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">
                −{product.discount}%
              </Badge>
            )}
            {product.pointsMultiplier && (
              <Badge className="text-xs px-2.5 py-1 bg-[#FF4DB8] text-white border-none">
                {product.pointsMultiplier}× баллы
              </Badge>
            )}
            {product.inStock === false && (
              <Badge className="text-xs px-2.5 py-1 bg-gray-500 text-white border-none">
                Нет в наличии
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-[#FF4DB8] text-[#FF4DB8]' : 'text-[#6B7280]'
              }`}
            />
          </button>

          {/* Quick View on Hover (Desktop) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center">
            <button className="px-4 py-2 rounded-lg bg-white text-[#111827] text-sm font-medium hover:bg-gray-50 transition-colors">
              Быстрый просмотр
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-[#6B7280] mb-1">{product.brand}</p>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[#111827] mb-2 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          {/* Recommendation Score */}
          {product.recommendationScore && (
            <div className="mb-2 text-xs text-[#FF4DB8] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Подходит вам: {product.recommendationScore}%
            </div>
          )}

          {/* Why Recommended */}
          {product.whyRecommended && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE1F2] text-[#FF4DB8] text-[10px] font-medium">
                ✦ {product.whyRecommended}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-[#111827]">{product.price} ₽</span>
            {product.originalPrice && (
              <span className="text-sm text-[#6B7280] line-through">{product.originalPrice} ₽</span>
            )}
          </div>

          {/* Loyalty Points */}
          {product.pointsEarned && (
            <p className="text-xs text-[#FF4DB8] mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{product.pointsEarned} баллов за покупку
            </p>
          )}

          {/* CTA Button or Stepper */}
          {product.inStock === false ? (
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
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-semibold text-[#111827]">{quantity}</span>
              <button
                onClick={(e) => handleQuantityChange(quantity + 1, e)}
                className="flex-1 h-full flex items-center justify-center text-[#111827] hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full h-11 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-[#0B1220] hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              В корзину
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton variant
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