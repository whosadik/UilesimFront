import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import * as Tabs from '@radix-ui/react-tabs';

import { ApiError } from '../../shared/api/ApiError';
import { getBrand, type BrandDetail } from '../../shared/api/brands';
import { listProducts } from '../../shared/api/catalog';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProductGrid, type Product } from '../components/ProductGrid';
import { fromBrandSlugToLabel } from '../utils/brandSlug';
import { extractProducts, mapApiProductToGrid } from '../utils/productGridMapping';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80';

const categoryLabels: Record<string, string> = {
  skincare: 'skincare',
  haircare: 'haircare',
  makeup: 'makeup',
  fragrance: 'fragrance',
};

export default function BrandPage() {
  const { brand } = useParams();

  const [activeTab, setActiveTab] = useState('hits');
  const [products, setProducts] = useState<Product[]>([]);
  const [brandDetails, setBrandDetails] = useState<BrandDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!brand) {
      setBrandDetails(null);
      setProducts([]);
      setError('brand not found.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadBrandPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const brandResponse = await getBrand(brand);
        const productsResponse = await listProducts({ brand: brandResponse.name });

        if (cancelled) {
          return;
        }

        const mappedProducts = extractProducts(productsResponse).map((item, index) =>
          mapApiProductToGrid(item, index, {
            fallbackIdPrefix: 'brand-product',
            fallbackImageUrl: FALLBACK_IMAGE,
          }),
        );

        setBrandDetails(brandResponse);
        setProducts(mappedProducts);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && (loadError.status === 401 || loadError.status === 403)) {
          setBrandDetails(null);
          setProducts([]);
          return;
        }

        setBrandDetails(null);
        setProducts([]);
        setError(
          loadError instanceof ApiError && loadError.status === 404
            ? 'brand not found.'
            : 'failed to load brand page. please try again.',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadBrandPage();

    return () => {
      cancelled = true;
    };
  }, [brand, retryKey]);

  const brandName = brandDetails?.name ?? (brand ? fromBrandSlugToLabel(brand) || 'brand' : 'brand');
  const newProducts = useMemo(() => products.filter((product) => product.isNew), [products]);
  const hitsProducts = useMemo(() => products.slice(0, 8), [products]);
  const tabProducts = activeTab === 'new' ? newProducts : activeTab === 'all' ? products : hitsProducts;

  return (
    <div className="min-h-screen pt-20 lg:pt-28">
      <div className="relative border-b border-[#FF4DB8]/20 bg-gradient-to-br from-[#FFE1F2] to-pink-50 py-12 lg:py-16">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FF4DB8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1160px] px-6 lg:px-[140px]">
          <Breadcrumbs
            items={[
              { label: 'home', href: '/' },
              { label: 'brands', href: '/brands' },
              { label: brandName },
            ]}
          />

          <div className="mt-8 flex items-center gap-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-[#EAE6EF] bg-white text-3xl font-bold text-[#FF4DB8] lg:h-24 lg:w-24">
              {brandDetails?.logo_letter ?? brandName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-[#111827] lg:text-4xl">{brandName}</h1>
              <p className="max-w-2xl text-base text-[#6B7280]">
                {brandDetails?.description ?? 'brand description is not available yet.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{brandDetails?.product_count ?? products.length} products</Badge>
                {(brandDetails?.new_products_count ?? newProducts.length) > 0 && (
                  <Badge>{brandDetails?.new_products_count ?? newProducts.length} new</Badge>
                )}
                {(brandDetails?.sale_products_count ?? 0) > 0 && (
                  <Badge>{brandDetails?.sale_products_count} on sale</Badge>
                )}
                {brandDetails?.categories.slice(0, 2).map((category) => (
                  <Badge key={category}>{categoryLabels[category] ?? category}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-6 py-8 lg:px-[140px] lg:py-12">
        {isLoading ? (
          <LoadingSpinner size="lg" text="loading brand products..." />
        ) : error ? (
          <ErrorState
            title="failed to load brand"
            description={error}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : (
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="mb-8 flex items-center gap-1 border-b border-[#EAE6EF] pb-4">
              <Tabs.Trigger
                value="hits"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                bestsellers
              </Tabs.Trigger>
              <Tabs.Trigger
                value="new"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                new
              </Tabs.Trigger>
              <Tabs.Trigger
                value="all"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827] data-[state=active]:bg-[#111827] data-[state=active]:text-white"
              >
                all products
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              {tabProducts.length > 0 ? (
                <ProductGrid products={tabProducts} columns={4} />
              ) : (
                <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
                  no products found for this tab yet.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </div>
  );
}
