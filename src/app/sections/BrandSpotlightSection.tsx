import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../data/products';

export function BrandSpotlightSection() {
  const brandProducts = mockProducts.slice(0, 4).map(p => ({
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
  }));

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
          Бренд недели
        </h2>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Brand Banner */}
          <div className="relative rounded-3xl p-6 md:p-8 lg:p-10 bg-gradient-to-br from-[#FFE1F2] via-pink-50 to-rose-50 border border-[#FFE1F2] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-200/40 to-pink-200/40 rounded-full blur-2xl"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Brand Logo Placeholder */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#FF4DB8] to-[#FF2AA8] flex items-center justify-center mb-4 md:mb-6 shadow-lg">
                <span className="text-white font-bold text-2xl md:text-3xl">D</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#111827] mb-2 md:mb-3">
                Drunk Elephant
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6 md:mb-8 max-w-md">
                Безопасная, нетоксичная косметика с биосовместимыми ингредиентами. 
                Философия clean beauty в каждом продукте.
              </p>

              <Button variant="primary" className="w-full sm:w-auto">Смотреть бренд</Button>

              {/* Stats */}
              <div className="mt-6 md:mt-8 pt-6 border-t border-pink-200/50 flex gap-6 md:gap-8">
                <div>
                  <div className="text-xl md:text-2xl font-bold text-[#111827]">127</div>
                  <div className="text-xs text-[#6B7280]">Продуктов</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-[#111827]">4.8</div>
                  <div className="text-xs text-[#6B7280]">Рейтинг</div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Hits - Grid */}
          <div>
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Хиты бренда
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {brandProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="grid" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}