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

const CATEGORY_OPTIONS = [
  { value: '', label: 'Все категории' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'haircare', label: 'Haircare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'fragrance', label: 'Fragrance' },
];

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] text-white flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Товары</h1>
            <p className="text-sm text-gray-500 mt-0.5">{count} товаров</p>
          </div>
        </div>
        <Link
          to="/admin/catalog/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать товар
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="relative flex-1 min-w-[200px] max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Поиск по названию, бренду, SKU…"
            className="pl-9 pr-4 h-9 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </form>

        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => {
            setPage(1);
            setBrandFilter(e.target.value ? Number(e.target.value) : '');
          }}
          className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">Все бренды</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 w-16">Фото</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Название</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Бренд</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Категория</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Тип</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Цена</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">На складе</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>
                  Загружаем…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={8}>
                  Товаров не найдено.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/catalog/products/${p.id}`)}
                >
                  <td className="px-5 py-4">
                    {p.image_url_display ? (
                      <img
                        src={p.image_url_display}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="px-4 py-4 text-gray-700">{p.brand || '—'}</td>
                  <td className="px-4 py-4 text-gray-600">{p.category}</td>
                  <td className="px-4 py-4 text-gray-600">{p.product_type || '—'}</td>
                  <td className="px-4 py-4 text-gray-900">
                    {p.price ? `${p.price} ${p.currency || ''}` : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {p.in_stock ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                        Да
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        Нет
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
          <p className="text-gray-500">
            Страница {page} из {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ← Назад
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Вперёд →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
