import { useState } from "react";
import { Heart } from "lucide-react";
import { ProductGrid } from "../components/ProductGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FilterBar } from "../components/FilterBar";
import { products } from "../data/products";
import { toast } from "sonner";

/**
 * DEV NOTES:
 * Endpoint: GET /api/me/wishlist/
 * Response: { ok: true, items: Product[] }
 * 
 * Remove: DELETE /api/me/wishlist/{product_id}/
 * Add: POST /api/me/wishlist/ { product_id: string }
 * 
 * События: POST /api/me/recommendations/event
 * { event_type: "wishlist_view" | "remove_from_wishlist", product_id: string }
 */

export default function WishlistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistProducts] = useState(products.slice(0, 6)); // Mock wishlist

  // TODO: Load wishlist from API
  // useEffect(() => {
  //   fetchWishlist();
  // }, []);

  // const fetchWishlist = async () => {
  //   setIsLoading(true);
  //   const response = await fetch('/api/me/wishlist/', { credentials: 'include' });
  //   const data = await response.json();
  //   if (data.ok) setWishlistProducts(data.items);
  //   setIsLoading(false);
  // };

  const handleRemoveFromWishlist = (productId: string) => {
    // TODO: API call to remove
    // DELETE /api/me/wishlist/{productId}/
    
    toast.success("Товар удален из избранного");
    
    // Track event
    // POST /api/me/recommendations/event
    // { event_type: "remove_from_wishlist", product_id: productId }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-semibold text-gray-900">Избранное</h1>
          </div>
          <p className="text-gray-600">
            {wishlistProducts.length > 0
              ? `${wishlistProducts.length} товаров в вашем списке желаний`
              : "Ваш список желаний пуст"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistProducts.length > 0 ? (
          <>
            {/* Filters */}
            <div className="mb-6">
              <FilterBar />
            </div>

            {/* Products grid */}
            <ProductGrid products={wishlistProducts} />

            {/* Wishlist tips */}
            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">💡 Совет</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Добавляйте товары в избранное, чтобы не потерять их! Мы уведомим вас о скидках и
                акциях на товары из вашего списка желаний.
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Heart className="w-12 h-12" />}
            title="Ваш список желаний пуст"
            description="Добавляйте понравившиеся товары в избранное, чтобы не потерять их. Нажмите на иконку сердечка на карточке товара."
            action={{
              label: "Перейти в каталог",
              onClick: () => (window.location.href = "/catalog"),
            }}
          />
        )}
      </div>
    </div>
  );
}