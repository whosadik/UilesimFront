import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { ProductGrid, type Product } from "../components/ProductGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { FilterBar } from "../components/FilterBar";
import { ApiError } from "../../shared/api/ApiError";
import { getWishlist, type WishlistItem } from "../../shared/api/wishlist";
import { useI18n } from "../../shared/i18n/LanguageContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80";
const wishlistPageCopy = {
  ru: {
    productFallback: (id: string) => `Товар #${id}`,
    brandFallback: "Uilesim",
    loadError: "Не удалось загрузить избранное из API. Попробуйте ещё раз.",
    title: "Избранное",
    itemsCount: (count: number) => `${count} товаров в вашем списке желаний`,
    emptyShort: "Ваш список желаний пуст",
    retry: "Повторить",
    tip: "Совет",
    tipDescription: "Добавляйте товары в избранное, чтобы не потерять их. Мы уведомим вас о скидках и акциях на товары из вашего списка желаний.",
    emptyDescription: "Добавляйте понравившиеся товары в избранное, чтобы не потерять их. Нажмите на иконку сердечка на карточке товара.",
    toCatalog: "Перейти в каталог",
  },
  kk: {
    productFallback: (id: string) => `Тауар #${id}`,
    brandFallback: "Uilesim",
    loadError: "Таңдаулыларды API-ден жүктеу мүмкін болмады. Қайталап көріңіз.",
    title: "Таңдаулылар",
    itemsCount: (count: number) => `Тілектер тізіміңізде ${count} тауар бар`,
    emptyShort: "Тілектер тізіміңіз бос",
    retry: "Қайталау",
    tip: "Кеңес",
    tipDescription: "Жоғалтып алмау үшін тауарларды таңдаулыларға қосыңыз. Біз тілектер тізіміңіздегі тауарлар бойынша жеңілдіктер мен акциялар туралы хабарлаймыз.",
    emptyDescription: "Жоғалтып алмау үшін ұнаған тауарларды таңдаулыларға қосыңыз. Тауар карточкасындағы жүрек белгісін басыңыз.",
    toCatalog: "Каталогқа өту",
  },
  en: {
    productFallback: (id: string) => `Product #${id}`,
    brandFallback: "Uilesim",
    loadError: "Could not load wishlist from the API. Please try again.",
    title: "Wishlist",
    itemsCount: (count: number) => `${count} items in your wishlist`,
    emptyShort: "Your wishlist is empty",
    retry: "Retry",
    tip: "Tip",
    tipDescription: "Add products to your wishlist so you do not lose them. We will notify you about discounts and promotions for the products in your wishlist.",
    emptyDescription: "Add products you like to your wishlist so you do not lose them. Tap the heart icon on a product card.",
    toCatalog: "Go to catalog",
  },
} as const;

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

const mapWishlistItem = (
  item: WishlistItem,
  index: number,
  copy: (typeof wishlistPageCopy)[keyof typeof wishlistPageCopy],
): Product => {
  const product = item.product ?? {};
  const id = product.id !== undefined && product.id !== null ? String(product.id) : `wishlist-${index}`;
  const price = toNumber(product.price) ?? 0;

  return {
    id,
    name: typeof product.name === "string" && product.name.trim() ? product.name : copy.productFallback(id),
    brand: typeof product.brand === "string" && product.brand.trim() ? product.brand : copy.brandFallback,
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
  const { language } = useI18n();
  const copy = wishlistPageCopy[language];
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
        const mapped = items.map((item, index) => mapWishlistItem(item, index, copy));

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
            : copy.loadError,
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
  }, [copy, location.pathname, navigate, retryKey]);

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
        <div className="app-page-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
          </div>
          <p className="text-gray-600">
            {wishlistProducts.length > 0
              ? copy.itemsCount(wishlistProducts.length)
              : copy.emptyShort}
          </p>
        </div>
      </div>

      <div className="app-page-container py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
            <p className="text-sm text-[#B42318]">{error}</p>
            <button
              onClick={() => setRetryKey((value) => value + 1)}
              className="mt-2 text-xs text-[#111827] font-medium underline underline-offset-2"
            >
              {copy.retry}
            </button>
          </div>
        )}

        {wishlistProducts.length > 0 ? (
          <>

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
              <h3 className="font-semibold text-gray-900 mb-3">{copy.tip}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {copy.tipDescription}
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Heart className="w-12 h-12" />}
            title={copy.emptyShort}
            description={copy.emptyDescription}
            action={{
              label: copy.toCatalog,
              onClick: () => (window.location.href = "/catalog"),
            }}
          />
        )}
      </div>
    </div>
  );
}


