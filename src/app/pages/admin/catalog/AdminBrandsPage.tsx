import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ChevronRight, Plus, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import { listAdminBrands, type AdminBrand } from '../../../../shared/api/adminCatalog';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import { adminCopy } from '../adminI18n';

export default function AdminBrandsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useI18n();
  const copy = adminCopy[language];
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        const data = await listAdminBrands();
        if (!cancelled) setBrands(data);
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
  }, [isAuthLoading, location.pathname, navigate, user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (brand) => brand.name.toLowerCase().includes(q) || brand.slug.toLowerCase().includes(q),
    );
  }, [brands, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">{copy.catalog.brands}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{copy.catalog.brandCount(brands.length)}</p>
          </div>
        </div>
        <Link
          to="/admin/catalog/brands/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {copy.catalog.createBrand}
        </Link>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={copy.catalog.searchBrands}
          className="pl-9 pr-4 h-9 text-sm bg-white border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 w-16">Logo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.name}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.catalog.products}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.campaigns.status}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={6}>
                  {copy.common.loading}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={6}>
                  {copy.catalog.brandsEmpty}
                </td>
              </tr>
            ) : (
              filtered.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/catalog/brands/${brand.id}`)}
                >
                  <td className="px-5 py-4">
                    {brand.logo_image_url ? (
                      <img
                        src={brand.logo_image_url}
                        alt={brand.name}
                        className="w-10 h-10 object-contain rounded-lg border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {brand.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">{brand.name}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 font-mono">{brand.slug}</td>
                  <td className="px-4 py-4 text-gray-700">{brand.product_count}</td>
                  <td className="px-4 py-4">
                    {brand.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        Hidden
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
    </div>
  );
}
