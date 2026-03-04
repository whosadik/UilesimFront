import { CarouselHeader } from '../components/CarouselHeader';
import { ProductCarousel } from '../components/ProductCarousel';
import { mockProducts } from '../data/products';

export function NewArrivalsSection() {
  const products = mockProducts.slice(1, 11).map(p => ({
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
        <CarouselHeader
          title="Новинки"
          subtitle="Свежие релизы недели"
        />
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}