import { useEffect, useState } from 'react';
import { Plus, ChevronRight, Filter } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { listCampaigns } from '../../../shared/api/adminCampaigns';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/campaigns
 * Permission: view_metrics
 * Response: { results: [...], count: number }
 * Create: POST /api/admin/campaigns (manage_campaigns)
 * Errors: 401, 403, 500
 */

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  start: string;
  end: string;
  budget: number;
  spend: number;
  category: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  ended: 'bg-gray-100 text-gray-500 border-gray-200',
};

function formatMoney(v: number) {
  return v.toLocaleString('ru') + ' ₸';
}

function SpendBar({ spend, budget }: { spend: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (spend / budget) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function AdminCampaignsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState('all');
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadCampaigns = async () => {
      try {
        const results = await listCampaigns({
          is_active: status === 'active' ? true : undefined,
        });

        if (cancelled) {
          return;
        }

        const mapped = results.map((item) => {
          const budget = Number(item.weekly_limit ?? 0);
          const spend = Number(item.weekly_spent ?? 0);
          return {
            id: String(item.id),
            name: String(item.name ?? `Campaign #${item.id}`),
            status: item.is_active ? 'active' : 'paused',
            start: item.week_start_date ?? '—',
            end: '—',
            budget: Number.isFinite(budget) ? budget : 0,
            spend: Number.isFinite(spend) ? spend : 0,
            category:
              Array.isArray(item.allowed_categories) && item.allowed_categories.length > 0
                ? String(item.allowed_categories[0])
                : 'Все категории',
          } as Campaign;
        });

        setCampaignList(mapped);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    };

    loadCampaigns();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, status, user]);

  const filtered = campaignList.filter(c => status === 'all' || c.status === status);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} кампаний</p>
        </div>
        <Link
          to="/admin/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать кампанию
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'active', 'paused'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Все' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Название</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Сроки</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Бюджет</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-48">Расход</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.category}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-600">
                  {c.start} → {c.end}
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-900 font-medium">{formatMoney(c.budget)}</p>
                  <p className="text-xs text-gray-500">потрачено: {formatMoney(c.spend)}</p>
                </td>
                <td className="px-4 py-4 w-48">
                  <SpendBar spend={c.spend} budget={c.budget} />
                </td>
                <td className="px-4 py-4">
                  <Link to={`/admin/campaigns/${c.id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
