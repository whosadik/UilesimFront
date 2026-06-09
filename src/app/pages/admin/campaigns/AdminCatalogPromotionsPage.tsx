import { useEffect, useState } from 'react';
import { ChevronRight, Filter, Plus, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import { listCampaigns } from '../../../../shared/api/adminCampaigns';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import { formatCatalogCategoryLabel } from '../../../../shared/catalog/presentation';
import { SpendBar } from './_components';
import { adminCopy, formatAdminMoney } from '../adminI18n';

type Row = {
  id: string;
  name: string;
  active: boolean;
  start: string;
  end: string;
  budget: number;
  spend: number;
  scopeLabel: string;
  offersCount: number;
};

function StatusPill({ active, activeLabel, pausedLabel }: { active: boolean; activeLabel: string; pausedLabel: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      {active ? activeLabel : pausedLabel}
    </span>
  );
}

export default function AdminCatalogPromotionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useI18n();
  const copy = adminCopy[language];
  const [status, setStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

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
        const results = await listCampaigns({
          campaign_type: 'public',
          is_active: status === 'active' ? true : status === 'paused' ? false : undefined,
          ordering: '-id',
        });

        if (cancelled) return;

        setRows(results.map((item) => {
          const categories = Array.isArray(item.allowed_categories) ? item.allowed_categories : [];
          const brands = Array.isArray(item.allowed_brands) ? item.allowed_brands : [];
          const productIds = Array.isArray(item.allowed_product_ids) ? item.allowed_product_ids : [];

          let scopeLabel = copy.campaigns.allProducts;
          if (productIds.length > 0) {
            scopeLabel = copy.campaigns.productsScope(productIds.length);
          } else if (brands.length > 0) {
            scopeLabel = brands.length === 1
              ? copy.campaigns.brandScope(String(brands[0]))
              : copy.campaigns.brandsScope(brands.length);
          } else if (categories.length > 0) {
            const firstCategory = String(categories[0]);
            const categoryLabel = formatCatalogCategoryLabel(firstCategory, language) ?? firstCategory;
            scopeLabel = categories.length === 1
              ? copy.campaigns.categoryScope(categoryLabel)
              : copy.campaigns.categoriesScope(categories.length);
          }

          return {
            id: String(item.id),
            name: String(item.name ?? `Campaign #${item.id}`),
            active: Boolean(item.is_active),
            start: item.start_date ?? '—',
            end: item.end_date ?? '—',
            budget: Number(item.weekly_limit ?? 0),
            spend: Number(item.weekly_spent ?? 0),
            scopeLabel,
            offersCount: Number(item.offers_count ?? 0),
          };
        }));
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
  }, [copy.campaigns, isAuthLoading, language, location.pathname, navigate, status, user]);

  const statusLabel = (value: typeof status) =>
    value === 'all' ? copy.campaigns.all : value === 'active' ? copy.campaigns.active : copy.campaigns.paused;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] text-white flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">{copy.campaigns.catalogTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{copy.campaigns.catalogSubtitle}</p>
          </div>
        </div>
        <Link
          to="/admin/campaigns/catalog/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {copy.campaigns.createPromotion}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['all', 'active', 'paused'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === item
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabel(item)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">{copy.campaigns.name}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.campaigns.status}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.campaigns.period}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.campaigns.scope}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">{copy.campaigns.weeklyBudget}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-48">{copy.campaigns.spend}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>{copy.common.loading}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>{copy.campaigns.catalogEmpty}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{row.name}</p>
                    {row.offersCount === 0 && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        {copy.campaigns.noDiscount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill active={row.active} activeLabel={copy.campaigns.active} pausedLabel={copy.campaigns.paused} />
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">{row.start} → {row.end}</td>
                  <td className="px-4 py-4 text-xs text-gray-700">{row.scopeLabel}</td>
                  <td className="px-4 py-4">
                    <p className="text-gray-900 font-medium">
                      {row.budget > 0 ? formatAdminMoney(row.budget, language) : '—'}
                    </p>
                    <p className="text-xs text-gray-500">{copy.campaigns.spent} {formatAdminMoney(row.spend, language)}</p>
                  </td>
                  <td className="px-4 py-4 w-48">
                    {row.budget > 0 ? (
                      <SpendBar spend={row.spend} budget={row.budget} />
                    ) : (
                      <span className="text-xs text-gray-400">{copy.campaigns.noLimit}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/campaigns/catalog/${row.id}`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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
