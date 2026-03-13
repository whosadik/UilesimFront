import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { ProductGrid, type Product } from "../components/ProductGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FilterBar } from "../components/FilterBar";
import { ApiError } from "../../shared/api/ApiError";
import { getWishlist, type WishlistItem } from "../../shared/api/wishlist";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const mapWishlistItem = (item: WishlistItem, index: number): Product => {
  const product = item.product ?? {};
  const id = product.id !== undefined && product.id !== null ? String(product.id) : `wishlist-${index}`;
  const price = toNumber(product.price) ?? 0;

  return {
    id,
    name: typeof product.name === "string" && product.name.trim() ? product.name : `Товар #${id}`,
    brand: typeof product.brand === "string" && product.brand.trim() ? product.brand : "Uilesim",
    price,
    originalPrice: undefined,
    image:
      (typeof product.image_url === "string" && product.image_url) ||
      (Array.isArray(product.image_urls) && typeof product.image_urls[0] === "string" && product.image_urls[0]) ||
      FALLBACK_IMAGE,
    category:
      (typeof product.category === "string" && product.category) ||
      (typeof product.product_type === "string" && product.product_type) ||
      "skincare",
    discount: undefined,
    isNew: false,
    inStock: product.in_stock === undefined ? true : Boolean(product.in_stock),
    pointsEarned: toNumber(product.points_earned),
  };
};

export default function WishlistPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchWishlistCards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getWishlist();
        const items = Array.isArray(response.items) ? response.items : [];
        const mapped = items.map((item, index) => mapWishlistItem(item, index));

        if (!cancelled) {
          setWishlistProducts(mapped);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
          return;
        }

        setWishlistProducts([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить избранное из API. Попробуйте ещё раз.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchWishlistCards();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, retryKey]);

  if (isLoading) {
    return (
      <div className="page-centered-with-navbar-offset bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gray-50">
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
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
            <p className="text-sm text-[#B42318]">{error}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs text-[#111827] font-medium underline underline-offset-2"
            >
              Повторить
            </button>
          </div>
        )}

        {wishlistProducts.length > 0 ? (
          <>
            <div className="mb-6">
              <FilterBar />
            </div>

            <ProductGrid
              products={wishlistProducts}
              onWishlistChange={(productId, isWishlisted) => {
                if (isWishlisted) {
                  return;
                }
                setWishlistProducts((current) =>
                  current.filter((product) => String(product.id) !== String(productId)),
                );
              }}
            />

            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Совет</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Добавляйте товары в избранное, чтобы не потерять их. Мы уведомим вас о скидках и акциях на товары из
                вашего списка желаний.
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


