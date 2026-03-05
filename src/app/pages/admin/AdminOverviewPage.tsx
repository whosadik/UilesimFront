import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, Percent, Repeat,
  ArrowUpRight, AlertTriangle, Info, XCircle, ChevronRight, Zap, X,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminOverview } from '../../../shared/api/adminMetrics';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/overview
 * Permission: view_metrics
 * Response: { kpis: {...}, top_offers: [...], top_categories: [...], alerts: [...] }
 * Errors: 401, 403, 500
 * Rate limit: 30/min
 */

// ─── Mock data ────────────────────────────────────────────────────────────────

const sparkData = [
  [40, 55, 48, 62, 58, 70, 65, 80],
  [30, 28, 35, 32, 40, 38, 45, 42],
  [10, 12, 11, 15, 14, 18, 16, 20],
  [60, 65, 62, 70, 68, 75, 72, 78],
];

const trendData = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 1}`,
  ctr: +(Math.random() * 5 + 3).toFixed(2),
  cr: +(Math.random() * 2 + 1).toFixed(2),
  users: Math.floor(Math.random() * 300 + 700),
}));

const topOffers = [
  { id: 1, name: 'Welcome Bonus', type: 'Loyalty', cr: '4.2%' },
  { id: 2, name: 'Summer Sale −30%', type: 'Promo', cr: '3.8%' },
  { id: 3, name: 'Skin Care Bundle', type: 'Bundle', cr: '2.9%' },
  { id: 4, name: 'Birthday Offer', type: 'Personal', cr: '5.1%' },
  { id: 5, name: 'VIP Exclusive', type: 'Loyalty', cr: '6.4%' },
];

const topCategories = [
  { name: 'Уход за лицом', revenue: '4 823 000 ₸', growth: '+12%', up: true },
  { name: 'Декоративная косметика', revenue: '3 102 000 ₸', growth: '+8%', up: true },
  { name: 'Уход за телом', revenue: '1 980 000 ₸', growth: '+3%', up: true },
  { name: 'Парфюмерия', revenue: '2 450 000 ₸', growth: '-2%', up: false },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

interface AdminAlert {
  id: string;
  level: 'warning' | 'error' | 'info';
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

const ALERTS: AdminAlert[] = [
  {
    id: 'a1',
    level: 'warning',
    title: 'Promo Redemption снизился на 1.2%',
    detail: 'Ниже целевого показателя 20% уже 5 дней подряд.',
    action: { label: 'Создать кампанию', href: '/admin/campaigns/new' },
  },
  {
    id: 'a2',
    level: 'warning',
    title: 'CTR в категории "Парфюмерия" ниже нормы',
    detail: 'CTR 2.1% против среднего 4.7%. Рекомендуем пересмотреть рекомендации.',
    action: { label: 'Посмотреть метрики', href: '/admin/metrics' },
  },
  {
    id: 'a3',
    level: 'info',
    title: 'Эксперимент "Loyalty Points Display" достиг p-value',
    detail: 'Treatment показывает +24% CTR. Можно принять решение о победителе.',
    action: { label: 'Открыть эксперимент', href: '/admin/experiments' },
  },
  {
    id: 'a4',
    level: 'error',
    title: 'Retention proxy ниже baseline на 8%',
    detail: 'Активных пользователей на 7-й день меньше ожидаемого.',
    action: { label: 'Audit log', href: '/admin/audit' },
  },
];

const RECOMMENDED_ACTIONS = [
  { id: 1, priority: 'high', title: 'Создать кампанию для Platinum-пользователей', reason: 'Promo Redemption снизился', href: '/admin/campaigns/new' },
  { id: 2, priority: 'high', title: 'Завершить эксп. "Loyalty Points Display"', reason: 'p-value достигнут, результат +24% CTR', href: '/admin/experiments' },
  { id: 3, priority: 'medium', title: 'Обновить рекомендации в "Парфюмерия"', reason: 'CTR 2.1% против нормы 4.7%', href: '/admin/metrics' },
  { id: 4, priority: 'low', title: 'Инвалидировать кэш рекомендаций', reason: 'Модель v2.1.3 обновлена 2 дня назад', href: '/admin/cache' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const alertStyles: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> },
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> },
};

const DEFAULT_KPIS = {
  ctr: { value: '4.7%', delta: '+0.8%', up: true },
  cr: { value: '2.1%', delta: '+0.3%', up: true },
  users: { value: '12 430', delta: '+5.2%', up: true },
  promo: { value: '18.4%', delta: '-1.2%', up: false },
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const formatPercent = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim()) {
    return value.includes('%') ? value : `${value}%`;
  }

  const numberValue = toNumber(value);
  if (numberValue === null) {
    return fallback;
  }

  return `${numberValue}%`;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ReactNode;
  sparkIdx: number;
}

function KpiCard({ label, value, delta, up, icon, sparkIdx }: KpiCardProps) {
  const data = sparkData[sparkIdx].map((v, i) => ({ i, v }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {delta} vs. прошлая неделя
        </span>
        <LineChart width={64} height={28} data={data}>
          <Line type="monotone" dataKey="v" stroke={up ? '#10b981' : '#ef4444'} strokeWidth={1.5} dot={false} />
        </LineChart>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [trendSeries, setTrendSeries] = useState(trendData);
  const [offers, setOffers] = useState(topOffers);
  const [categories, setCategories] = useState(topCategories);
  const [alerts, setAlerts] = useState(ALERTS);
  const [recommendedActions, setRecommendedActions] = useState(RECOMMENDED_ACTIONS);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadOverview = async () => {
      try {
        const response = await getAdminOverview();
        if (cancelled) {
          return;
        }

        const payload = asRecord(response) ?? {};
        const metrics = asRecord(payload.kpis) ?? payload;

        setKpis((prev) => ({
          ctr: {
            value: formatPercent(metrics.ctr ?? metrics.ctr_pct, prev.ctr.value),
            delta: formatPercent(metrics.ctr_delta, prev.ctr.delta),
            up: toNumber(metrics.ctr_delta) !== null ? (toNumber(metrics.ctr_delta) ?? 0) >= 0 : prev.ctr.up,
          },
          cr: {
            value: formatPercent(metrics.cr ?? metrics.conversion_rate, prev.cr.value),
            delta: formatPercent(metrics.cr_delta ?? metrics.conversion_rate_delta, prev.cr.delta),
            up: toNumber(metrics.cr_delta ?? metrics.conversion_rate_delta) !== null
              ? (toNumber(metrics.cr_delta ?? metrics.conversion_rate_delta) ?? 0) >= 0
              : prev.cr.up,
          },
          users: {
            value:
              toNumber(metrics.active_users ?? metrics.users_active ?? metrics.users) !== null
                ? (toNumber(metrics.active_users ?? metrics.users_active ?? metrics.users) ?? 0).toLocaleString('ru')
                : prev.users.value,
            delta: formatPercent(metrics.active_users_delta ?? metrics.users_delta, prev.users.delta),
            up: toNumber(metrics.active_users_delta ?? metrics.users_delta) !== null
              ? (toNumber(metrics.active_users_delta ?? metrics.users_delta) ?? 0) >= 0
              : prev.users.up,
          },
          promo: {
            value: formatPercent(metrics.promo_redemption ?? metrics.redemption, prev.promo.value),
            delta: formatPercent(metrics.promo_redemption_delta ?? metrics.redemption_delta, prev.promo.delta),
            up: toNumber(metrics.promo_redemption_delta ?? metrics.redemption_delta) !== null
              ? (toNumber(metrics.promo_redemption_delta ?? metrics.redemption_delta) ?? 0) >= 0
              : prev.promo.up,
          },
        }));

        const rawTrend =
          (Array.isArray(payload.trend) && payload.trend) ||
          (Array.isArray(payload.trends) && payload.trends) ||
          (Array.isArray(payload.series) && payload.series) ||
          [];
        if (rawTrend.length > 0) {
          setTrendSeries(
            rawTrend.map((item, idx) => {
              const row = asRecord(item) ?? {};
              return {
                day: String(row.day ?? row.date ?? idx + 1),
                ctr: toNumber(row.ctr ?? row.ctr_pct) ?? 0,
                cr: toNumber(row.cr ?? row.conversion_rate) ?? 0,
                users: toNumber(row.users ?? row.active_users) ?? 0,
              };
            }),
          );
        }

        const rawOffers =
          (Array.isArray(payload.top_offers) && payload.top_offers) ||
          (Array.isArray(payload.offers) && payload.offers) ||
          [];
        if (rawOffers.length > 0) {
          setOffers(
            rawOffers.map((item, idx) => {
              const row = asRecord(item) ?? {};
              return {
                id: Number(row.id ?? idx + 1),
                name: String(row.name ?? topOffers[idx % topOffers.length].name),
                type: String(row.type ?? row.offer_type ?? topOffers[idx % topOffers.length].type),
                cr: formatPercent(row.cr ?? row.conversion_rate, topOffers[idx % topOffers.length].cr),
              };
            }),
          );
        }

        const rawCategories =
          (Array.isArray(payload.top_categories) && payload.top_categories) ||
          (Array.isArray(payload.categories) && payload.categories) ||
          [];
        if (rawCategories.length > 0) {
          setCategories(
            rawCategories.map((item, idx) => {
              const row = asRecord(item) ?? {};
              const growth = formatPercent(row.growth ?? row.delta, topCategories[idx % topCategories.length].growth);
              return {
                name: String(row.name ?? row.category ?? topCategories[idx % topCategories.length].name),
                revenue:
                  toNumber(row.revenue) !== null
                    ? `${(toNumber(row.revenue) ?? 0).toLocaleString('ru')} ₸`
                    : String(row.revenue ?? topCategories[idx % topCategories.length].revenue),
                growth,
                up: growth.trim().startsWith('-') ? false : topCategories[idx % topCategories.length].up,
              };
            }),
          );
        }

        const rawAlerts = (Array.isArray(payload.alerts) && payload.alerts) || [];
        if (rawAlerts.length > 0) {
          setAlerts(
            rawAlerts.map((item, idx) => {
              const row = asRecord(item) ?? {};
              const level = String(row.level ?? 'info');
              return {
                id: String(row.id ?? `a${idx + 1}`),
                level: level === 'warning' || level === 'error' || level === 'info' ? level : 'info',
                title: String(row.title ?? ALERTS[idx % ALERTS.length].title),
                detail: String(row.detail ?? row.reason ?? ALERTS[idx % ALERTS.length].detail),
                action:
                  row.action && asRecord(row.action)
                    ? {
                        label: String((asRecord(row.action) as Record<string, unknown>).label ?? 'Открыть'),
                        href: String((asRecord(row.action) as Record<string, unknown>).href ?? '/admin'),
                      }
                    : ALERTS[idx % ALERTS.length].action,
              };
            }),
          );
        }

        const rawActions =
          (Array.isArray(payload.recommended_actions) && payload.recommended_actions) ||
          (Array.isArray(payload.actions) && payload.actions) ||
          [];
        if (rawActions.length > 0) {
          setRecommendedActions(
            rawActions.map((item, idx) => {
              const row = asRecord(item) ?? {};
              return {
                id: Number(row.id ?? idx + 1),
                priority: String(row.priority ?? RECOMMENDED_ACTIONS[idx % RECOMMENDED_ACTIONS.length].priority),
                title: String(row.title ?? RECOMMENDED_ACTIONS[idx % RECOMMENDED_ACTIONS.length].title),
                reason: String(row.reason ?? RECOMMENDED_ACTIONS[idx % RECOMMENDED_ACTIONS.length].reason),
                href: String(row.href ?? RECOMMENDED_ACTIONS[idx % RECOMMENDED_ACTIONS.length].href),
              };
            }),
          );
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (error instanceof ApiError && error.status === 403) {
          toast.error('Нет доступа');
          return;
        }

        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    };

    loadOverview();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, period, user]);

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">KPI dashboard · mock data</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Alerts ─────────────────────────────────────────────────── */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-gray-900">
              Требует внимания
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {visibleAlerts.length}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {visibleAlerts.map(alert => {
              const s = alertStyles[alert.level];
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
                  {s.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.detail}</p>
                    {alert.action && (
                      <Link
                        to={alert.action.href}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-gray-900 hover:underline"
                      >
                        {alert.action.label} <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => setDismissedAlerts(prev => new Set([...prev, alert.id]))}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 text-gray-400 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="CTR" value={kpis.ctr.value} delta={kpis.ctr.delta} up={kpis.ctr.up} sparkIdx={0} icon={<Percent className="w-4 h-4" />} />
        <KpiCard label="Конверсия (CR)" value={kpis.cr.value} delta={kpis.cr.delta} up={kpis.cr.up} sparkIdx={1} icon={<ShoppingBag className="w-4 h-4" />} />
        <KpiCard label="Активные пользователи" value={kpis.users.value} delta={kpis.users.delta} up={kpis.users.up} sparkIdx={3} icon={<Users className="w-4 h-4" />} />
        <KpiCard label="Promo Redemption" value={kpis.promo.value} delta={kpis.promo.delta} up={kpis.promo.up} sparkIdx={2} icon={<Repeat className="w-4 h-4" />} />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">CTR & CR — тренд</h2>
          <span className="text-xs text-gray-400">mock data</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#e5e7eb" />
            <YAxis tick={{ fontSize: 11 }} stroke="#e5e7eb" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Line type="monotone" dataKey="ctr" stroke="#111827" strokeWidth={2} dot={false} name="CTR %" />
            <Line type="monotone" dataKey="cr" stroke="#FF4DB8" strokeWidth={2} dot={false} name="CR %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Recommended Actions + Tables ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Actions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Zap className="w-4 h-4 text-[#FF4DB8]" />
            <h2 className="font-semibold text-gray-900">Рекомендуемые действия</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recommendedActions.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <span className={`flex-shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityColors[action.priority]}`}>
                  {action.priority === 'high' ? 'HIGH' : action.priority === 'medium' ? 'MED' : 'LOW'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.reason}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Top Offers */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Offers</h2>
            <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              Все <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Оффер</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Тип</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">CR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{o.name}</td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{o.type}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">{o.cr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Categories</h2>
            <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              Все <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Категория</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">Выручка</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Рост</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-3 py-3 text-right text-gray-600">{c.revenue}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs font-medium ${c.up ? 'text-emerald-600' : 'text-red-500'}`}>{c.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
