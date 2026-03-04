import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { mockProducts } from '../data/products';

export function ForYouSection() {
  const products = mockProducts.slice(0, 10).map(p => ({
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
    recommendationScore: Math.floor(Math.random() * 20) + 80, // 80-100
  }));

  return (
    <section className="py-12">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px]">
        <CarouselHeader
          title="Для вас"
          subtitle="Подборка на основе профиля и интересов"
        />
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}