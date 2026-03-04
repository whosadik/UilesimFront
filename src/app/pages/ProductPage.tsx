import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProductCarousel } from '../components/ProductCarousel';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { getProduct } from '../../shared/api/catalog';
import { ApiError } from '../../shared/api/ApiError';

const mockProduct = {
  id: '1',
  name: 'Vitamin C Serum',
  brand: 'The Ordinary',
  price: 1299,
  originalPrice: 1599,
  discount: 19,
  rating: 4.8,
  reviews: 247,
  inStock: true,
  images: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  ],
  description: 'Концентрированная сыворотка с витамином C для сияния кожи и выравнивания тона. Подходит для всех типов кожи.',
  ingredients: 'Аскорбиновая кислота, гиалуроновая кислота, витамин E, экстракт зелёного чая',
  howToUse: 'Наносите 2-3 капли на очищенную кожу лица утром и вечером. Избегайте области вокруг глаз.',
};

const recommendations = [
  {
    id: '2',
    name: 'Hyaluronic Acid',
    brand: 'CeraVe',
    price: 899,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    category: 'skincare',
  },
];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      try {
        const response = await getProduct(id);

        const price = toNumber(response.price) ?? mockProduct.price;
        const originalPrice = toNumber(response.original_price);
        const discount =
          toNumber(response.discount) ??
          (originalPrice && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : undefined);

        const images = Array.isArray(response.images)
          ? response.images.filter((img: unknown): img is string => typeof img === 'string' && img.length > 0)
          : [];

        if (!cancelled) {
          setProduct({
            id: String(response.id ?? id),
            name: typeof response.name === 'string' ? response.name : mockProduct.name,
            brand: typeof response.brand === 'string' ? response.brand : mockProduct.brand,
            price,
            originalPrice,
            discount,
            rating: toNumber(response.rating) ?? mockProduct.rating,
            reviews: toNumber(response.reviews) ?? toNumber(response.reviews_count) ?? mockProduct.reviews,
            inStock: response.in_stock === undefined ? mockProduct.inStock : Boolean(response.in_stock),
            images: images.length > 0 ? images : mockProduct.images,
            description:
              typeof response.description === 'string' ? response.description : mockProduct.description,
            ingredients:
              typeof response.ingredients === 'string' ? response.ingredients : mockProduct.ingredients,
            howToUse:
              typeof response.how_to_use === 'string'
                ? response.how_to_use
                : typeof response.howToUse === 'string'
                  ? response.howToUse
                  : mockProduct.howToUse,
          });
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true });
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleAddToCart = () => {
    // Mock add to cart
    navigate('/cart');
  };

  return (
    <div className="pt-20 lg:pt-28 min-h-screen">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Каталог', href: '/catalog' },
              { label: product.brand, href: `/brands/${product.brand.toLowerCase().replace(/\s+/g, '-')}` },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-white border border-[#EAE6EF] overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImage === idx ? 'border-[#FF4DB8]' : 'border-[#EAE6EF] hover:border-[#FF4DB8]/50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-[#6B7280] mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold text-[#111827] mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#6B7280]">
                  {product.rating} ({product.reviews} отзывов)
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                {product.discount && <Badge>−{product.discount}%</Badge>}
                {product.inStock && <Badge>В наличии</Badge>}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#111827]">{product.price} ₽</span>
              {product.originalPrice && (
                <span className="text-lg text-[#6B7280] line-through">{product.originalPrice} ₽</span>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-[#6B7280] leading-relaxed">{product.description}</p>

            {/* Quantity & CTA */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#EAE6EF] rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-[#6B7280] hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-3 font-semibold text-[#111827]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-[#6B7280] hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>

              <Button variant="primary" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                В корзину
              </Button>

              <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-[#EAE6EF] text-[#6B7280] hover:border-[#FF4DB8] hover:text-[#FF4DB8] transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Details Accordion */}
            <div className="pt-6 border-t border-[#EAE6EF] space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-[#111827] py-3">
                  Состав
                  <span className="text-[#6B7280] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-[#6B7280] mt-2">{product.ingredients}</p>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-[#111827] py-3 border-t border-[#EAE6EF]">
                  Как использовать
                  <span className="text-[#6B7280] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-[#6B7280] mt-2">{product.howToUse}</p>
              </details>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-bold text-[#111827] mb-6">С этим товаром покупают</h2>
          <ProductCarousel products={recommendations} />
        </section>
      </div>

      {/* Dev Notes */}
      <div className="hidden">
        {/* 
          API:
          - GET /api/products/{id}/
          - GET /api/me/recommendations/bundle?product_id={id}
        */}
      </div>
    </div>
  );
}
