import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, ProductCardSkeleton, type ProductCardProps } from './ProductCard';

interface ProductCarouselProps {
  products: ProductCardProps['product'][];
  loading?: boolean;
  onAddToCart?: ProductCardProps['onAddToCart'];
  onEvent?: ProductCardProps['onEvent'];
  onWishlistChange?: ProductCardProps['onWishlistChange'];
  onCartChange?: ProductCardProps['onCartChange'];
}

export function ProductCarousel({
  products,
  loading,
  onAddToCart,
  onEvent,
  onWishlistChange,
  onCartChange,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240; // width of carousel card + gap
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="snap-start flex-shrink-0">
                <ProductCardSkeleton variant="carousel" />
              </div>
            ))}
          </>
        ) : (
          products.map((product) => (
            <div key={product.id} className="snap-start flex-shrink-0">
              <ProductCard
                product={product}
                variant="carousel"
                onAddToCart={onAddToCart}
                onEvent={onEvent}
                onWishlistChange={onWishlistChange}
                onCartChange={onCartChange}
              />
            </div>
          ))
        )}
      </div>

      {/* Scroll Fade Indicators - Mobile */}
      <div className="lg:hidden absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none"></div>

      {/* Navigation Arrows - Desktop Only */}
      <button
        onClick={() => scroll('left')}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-12 h-12 items-center justify-center rounded-full bg-white border border-[#EAE6EF] text-[#111827] shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all duration-200 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-12 h-12 items-center justify-center rounded-full bg-white border border-[#EAE6EF] text-[#111827] shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all duration-200 z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
