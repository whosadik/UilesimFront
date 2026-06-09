import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ChevronRight, Package, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import {
  listAdminBrands,
  listAdminProducts,
  type AdminBrand,
  type AdminProduct,
} from '../../../../shared/api/adminCatalog';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../../../shared/catalog/presentation';
import { adminCopy } from '../adminI18n';

const CATEGORY_VALUES = ['', 'skincare', 'haircare', 'makeup', 'fragrance'] as const;
const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useI18n();
  const copy = adminCopy[language];

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');
  const [brands, setBrands] = useState<AdminBrand[]>([]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    listAdminBrands().then(setBrands).catch(() => {});
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listAdminProducts({
          search: search || undefined,
          category: category || undefined,
          brand_ref: brandFilter === '' ? undefined : brandFilter,
          page,
          page_size: PAGE_SIZE,
        });
        if (cancelled) return;
        setProducts(data.results);
        setCount(data.count);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (error instanceof Error) toast.error(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [brandFilter, category, isAuthLoading, location.pathname, navigate, page, search, user]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const categoryOptions = CATEGORY_VALUES.map((value) => ({
    value,
    label: value
      ? formatCatalogCategoryLabel(value, language) ?? value
      : copy.catalog.allCategories,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] text-white flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">{copy.catalog.products}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{copy.catalog.productCount(count)}</p>
          </div>
        </div>
        <Link
          to="/admin/catalog/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {copy.catalog.createProduct}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="relative flex-1 min-w-[200px] max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={copy.catalog.searchProducts}
            className="pl-9 pr-4 h-9 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </form>

        <select
          value={category}
          onChange={(event) => {
            setPage(1);
            setCategory(event.target.value);
          }}
          className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(event) => {
            setPage(1);
            setBrandFilter(event.target.value ? Number(event.target.value) : '');
          }}
          className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">{copy.catalog.allBrands}</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 w-16">{copy.catalog.photo}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.name}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.brand}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.category}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.type}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.price}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.stock}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>
                  {copy.common.loading}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>
                  {copy.catalog.productsEmpty}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/catalog/products/${product.id}`)}
                >
                  <td className="px-5 py-4">
                    {product.image_url_display ? (
                      <img
                        src={product.image_url_display}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 max-w-xs truncate">
                    {product.name}
                  </td>
                  <td className="px-4 py-4 text-gray-700">{product.brand || '—'}</td>
                  <td className="px-4 py-4 text-gray-600">
                    {formatCatalogCategoryLabel(product.category, language) ?? product.category}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {formatCatalogProductTypeLabel(product.product_type, language) ?? (product.product_type || '—')}
                  </td>
                  <td className="px-4 py-4 text-gray-900">
                    {product.price ? `${product.price} ${product.currency || ''}` : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {product.in_stock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                        <span>{copy.common.yes}</span>
                        <span className="text-green-600/70">· {product.stock_quantity}</span>
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        {copy.common.no}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500">{copy.common.page(page, totalPages)}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ← {copy.common.back}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {copy.common.next} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
