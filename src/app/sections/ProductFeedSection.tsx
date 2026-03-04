import { useState } from 'react';
import { FilterBar } from '../components/FilterBar';
import { ProductGrid } from '../components/ProductGrid';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { generateProducts } from '../data/products';

export function ProductFeedSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const mockProductsData = generateProducts(24);
  const [products] = useState(mockProductsData.map(p => ({
    id: p.id,
    name: p.title,
    brand: p.brand,
    price: p.price,
    originalPrice: p.oldPrice,
    discount: p.discount,
    image: p.image,
    category: 'skincare',
    isNew: p.isNew,
    inStock: !p.outOfStock,
    pointsEarned: Math.floor(p.price * 0.05),
  })));
  const [showEmpty, setShowEmpty] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  if (showEmpty) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Все товары
          </h2>
          <FilterBar />
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте изменить фильтры или поисковый запрос"
            action={{
              label: 'Сбросить фильтры',
              onClick: () => setShowEmpty(false),
            }}
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Все товары
          </h2>
          <FilterBar />
          <ErrorState
            title="Не удалось загрузить данные"
            description="Произошла ошибка при загрузке товаров. Пожалуйста, попробуйте еще раз."
            onRetry={() => setError(false)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
          Все товары
        </h2>

        <FilterBar />

        {/* Product Grid */}
        <ProductGrid products={products} columns={4} />

        {/* Loading Skeletons */}
        {loading && (
          <div className="mt-6">
            <ProductGrid products={[]} columns={4} loading={true} />
          </div>
        )}

        {/* Load More */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-sm text-gray-600">
            Показано {products.length} из 1,247 товаров
          </div>
          <Button onClick={handleLoadMore} variant="ghost">
            Показать ещё
          </Button>
        </div>
      </div>
    </section>
  );
}