import { useEffect, useState } from 'react';
import { ChevronRight, Filter, Plus, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import { listCampaigns } from '../../../../shared/api/adminCampaigns';
import { SpendBar, StatusBadge } from './_components';
import { formatMoney } from './_helpers';

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

export default function AdminCatalogPromotionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
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

        const mapped: Row[] = results.map((item) => {
          const cats = Array.isArray(item.allowed_categories) ? item.allowed_categories : [];
          const brands = Array.isArray(item.allowed_brands) ? item.allowed_brands : [];
          const productIds = Array.isArray(item.allowed_product_ids) ? item.allowed_product_ids : [];

          let scopeLabel = 'Все товары';
          if (productIds.length > 0) {
            scopeLabel = `Товары: ${productIds.length}`;
          } else if (brands.length > 0) {
            scopeLabel = brands.length === 1 ? `Бренд: ${brands[0]}` : `Бренды: ${brands.length}`;
          } else if (cats.length > 0) {
            scopeLabel = cats.length === 1 ? `Категория: ${cats[0]}` : `Категории: ${cats.length}`;
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
        });

        setRows(mapped);
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
  }, [isAuthLoading, location.pathname, navigate, status, user]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4DB8] text-white flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Акции на каталог</h1>
            <p className="text-sm text-gray-500 mt-0.5">{rows.length} акций</p>
          </div>
        </div>
        <Link
          to="/admin/campaigns/catalog/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать акцию
        </Link>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4 text-xs text-pink-900 leading-relaxed">
        <b>Акция на каталог</b> — это общая скидка, бонус или подарок, который применяется к любому покупателю, если в
        корзине есть подходящие товары (по бренду, категории или списку SKU). Без персонализации.
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['all', 'active', 'paused'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Все' : s === 'active' ? 'Активные' : 'На паузе'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Название</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Период</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">На что</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Бюджет / неделя</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-48">Расход</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>
                  Загружаем…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm text-gray-500" colSpan={7}>
                  Акций нет. Создайте первую — она появится тут.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.offersCount === 0 && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Нет скидки
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={c.active} />
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">
                    {c.start} → {c.end}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-700">{c.scopeLabel}</td>
                  <td className="px-4 py-4">
                    <p className="text-gray-900 font-medium">{c.budget > 0 ? formatMoney(c.budget) : '—'}</p>
                    <p className="text-xs text-gray-500">потрачено: {formatMoney(c.spend)}</p>
                  </td>
                  <td className="px-4 py-4 w-48">
                    {c.budget > 0 ? (
                      <SpendBar spend={c.spend} budget={c.budget} />
                    ) : (
                      <span className="text-xs text-gray-400">Без лимита</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/admin/campaigns/catalog/${c.id}`}
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
