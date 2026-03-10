import { ProductCard, ProductCardSkeleton, type ProductCardProps } from './ProductCard';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  discount?: number;
  rating?: number;
  inStock?: boolean;
  pointsEarned?: number;
  pointsMultiplier?: number;
  recommendationScore?: number;
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  onWishlistChange?: ProductCardProps['onWishlistChange'];
  onCartChange?: ProductCardProps['onCartChange'];
}

export function ProductGrid({ products, columns = 4, loading, onWishlistChange, onCartChange }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-4 lg:gap-6`}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} variant="grid" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4 lg:gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="grid"
          onWishlistChange={onWishlistChange}
          onCartChange={onCartChange}
        />
      ))}
    </div>
  );
}
