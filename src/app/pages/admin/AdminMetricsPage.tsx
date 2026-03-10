import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, RefreshCw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminMetrics } from '../../../shared/api/adminMetrics';
import { ErrorState } from '../../components/ErrorState';

type Summary = {
  assignmentsTotal: number | null;
  redemptionsTotal: number | null;
  redemptionRatePct: number | null;
  promoEfficiency: number | null;
  budgetLeft: number | null;
  earnedPointsTotal: number | null;
};

type RetentionRow = {
  window: string;
  repeatRatePct: number;
  activeUsers: number;
  repeatUsers: number;
};

type OfferEventRow = {
  window: string;
  exposed: number;
  clicked: number;
  redeemed: number;
  ctrPct: number;
  redemptionRatePct: number;
};

type TierRow = {
  tier: string;
  users: number;
};

type SegmentRow = {
  segment: string;
  count: number;
};

type RoutineRow = {
  step: string;
  count: number;
};

type CampaignRow = {
  campaign: string;
  assignments: number;
  redemptions: number;
  redemptionRatePct: number;
};

type RecsAlgoRow = {
  algo: string;
  impressions: number;
  clicks: number;
  purchases: number;
  ctrPct: number;
  conversionPct: number;
};

type MetricsViewModel = {
  summary: Summary;
  retention: RetentionRow[];
  offerEvents: OfferEventRow[];
  tiers: TierRow[];
  segments: SegmentRow[];
  routines: RoutineRow[];
  campaigns: CampaignRow[];
  recsByAlgo: RecsAlgoRow[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asRecordArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== null)
    : [];

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

const toPercent = (ratio: unknown): number | null => {
  const value = toNumber(ratio);
  return value === null ? null : value * 100;
};

const formatCount = (value: number | null): string =>
  value === null ? 'нет данных' : Math.round(value).toLocaleString('ru');

const formatPercent = (value: number | null): string =>
  value === null ? 'нет данных' : `${value.toFixed(2)}%`;

const formatMoney = (value: number | null): string =>
  value === null ? 'нет данных' : `${Math.round(value).toLocaleString('ru')} ₸`;

const formatMultiplier = (value: number | null): string =>
  value === null ? 'нет данных' : `${value.toFixed(2)}x`;

const adaptMetrics = (response: unknown): MetricsViewModel => {
  const payload = asRecord(response) ?? {};

  const offers = asRecord(payload.offers) ?? {};
  const budget = asRecord(payload.budget) ?? {};
  const loyalty = asRecord(payload.loyalty) ?? {};
  const retention = asRecord(payload.retention) ?? {};
  const routines = asRecord(payload.routines) ?? {};
  const segments = asRecord(payload.segments) ?? {};
  const campaigns = asRecord(payload.campaigns) ?? {};
  const recs = asRecord(payload.recs) ?? {};

  const eventsKpis = asRecord(offers.events_kpis) ?? {};
  const promoEfficiency = asRecord(offers.promo_efficiency_30d) ?? {};
  const tierDistribution = asRecord(loyalty.tier_distribution) ?? {};
  const recsByAlgo = asRecord(recs.by_algo) ?? {};

  const retentionRows: RetentionRow[] = [
    {
      window: '30d',
      repeatRatePct: toPercent(retention.repeat_purchase_rate_30d) ?? 0,
      activeUsers: toNumber(retention.active_users_30d) ?? 0,
      repeatUsers: toNumber(retention.repeat_users_30d) ?? 0,
    },
    {
      window: '60d',
      repeatRatePct: toPercent(retention.repeat_purchase_rate_60d) ?? 0,
      activeUsers: toNumber(retention.active_users_60d) ?? 0,
      repeatUsers: toNumber(retention.repeat_users_60d) ?? 0,
    },
    {
      window: '90d',
      repeatRatePct: toPercent(retention.repeat_purchase_rate_90d) ?? 0,
      activeUsers: toNumber(retention.active_users_90d) ?? 0,
      repeatUsers: toNumber(retention.repeat_users_90d) ?? 0,
    },
  ].filter((row) => row.activeUsers > 0 || row.repeatUsers > 0 || row.repeatRatePct > 0);

  const offerEvents: OfferEventRow[] = [
    {
      window: '7d',
      exposed: toNumber(eventsKpis.exposed_7d) ?? 0,
      clicked: toNumber(eventsKpis.clicked_7d) ?? 0,
      redeemed: toNumber(eventsKpis.redeemed_7d) ?? 0,
      ctrPct: toPercent(eventsKpis.ctr_clicks_exposed_7d) ?? 0,
      redemptionRatePct: toPercent(eventsKpis.redemption_rate_exposed_7d) ?? 0,
    },
    {
      window: '30d',
      exposed: toNumber(eventsKpis.exposed_30d) ?? 0,
      clicked: toNumber(eventsKpis.clicked_30d) ?? 0,
      redeemed: toNumber(eventsKpis.redeemed_30d) ?? 0,
      ctrPct: toPercent(eventsKpis.ctr_clicks_exposed_30d) ?? 0,
      redemptionRatePct: toPercent(eventsKpis.redemption_rate_exposed_30d) ?? 0,
    },
  ].filter((row) => row.exposed > 0 || row.clicked > 0 || row.redeemed > 0);

  const tiers: TierRow[] = Object.entries(tierDistribution)
    .map(([tier, count]) => ({
      tier,
      users: toNumber(count) ?? 0,
    }))
    .filter((row) => row.users > 0)
    .sort((a, b) => b.users - a.users);

  const segmentRows: SegmentRow[] = asRecordArray(segments.distribution_30d)
    .map((row) => ({
      segment: String(row.segment ?? 'неизвестно'),
      count: toNumber(row.count) ?? 0,
    }))
    .filter((row) => row.count > 0);

  const routineRows: RoutineRow[] = asRecordArray(routines.top_missing_steps_30d)
    .map((row) => ({
      step: String(row.step ?? 'неизвестно'),
      count: toNumber(row.count) ?? 0,
    }))
    .filter((row) => row.count > 0);

  const campaignRows: CampaignRow[] = asRecordArray(campaigns.last_30d)
    .map((row) => ({
      campaign: String(row.campaign ?? 'неизвестно'),
      assignments: toNumber(row.assignments_30d) ?? 0,
      redemptions: toNumber(row.redemptions_30d) ?? 0,
      redemptionRatePct: toPercent(row.redemption_rate) ?? 0,
    }))
    .filter((row) => row.assignments > 0 || row.redemptions > 0)
    .slice(0, 10);

  const recsAlgoRowsMapped: RecsAlgoRow[] = Object.entries(recsByAlgo)
    .map(([algo, raw]) => {
      const row = asRecord(raw) ?? {};
      return {
        algo,
        impressions: toNumber(row.impression) ?? 0,
        clicks: toNumber(row.click) ?? 0,
        purchases: toNumber(row.purchase_attributed) ?? 0,
        ctrPct: toPercent(row.ctr) ?? 0,
        conversionPct: toPercent(row.conversion) ?? 0,
      };
    })
    .filter((row) => row.impressions > 0 || row.clicks > 0 || row.purchases > 0);

  return {
    summary: {
      assignmentsTotal: toNumber(offers.assignments_total),
      redemptionsTotal: toNumber(offers.redemptions_total),
      redemptionRatePct: toPercent(offers.redemption_rate),
      promoEfficiency: toNumber(promoEfficiency.promo_efficiency),
      budgetLeft: toNumber(budget.weekly_left),
      earnedPointsTotal: toNumber(loyalty.earned_points_total),
    },
    retention: retentionRows,
    offerEvents,
    tiers,
    segments: segmentRows,
    routines: routineRows,
    campaigns: campaignRows,
    recsByAlgo: recsAlgoRowsMapped,
  };
};

function MetricsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="bg-white rounded-xl border border-gray-200 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="bg-white rounded-xl border border-gray-200 h-64" />
        ))}
      </div>
    </div>
  );
}

export default function AdminMetricsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [offerType, setOfferType] = useState('');
  const [channel, setChannel] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [metrics, setMetrics] = useState<MetricsViewModel | null>(null);

  const loadMetrics = async (notify = false) => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getAdminMetrics({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        category: category || undefined,
        offer_type: offerType || undefined,
        channel: channel || undefined,
      });
      setMetrics(adaptMetrics(response));

      if (notify) {
        toast.success('Метрики обновлены');
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      setMetrics(null);
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить метрики.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, [category, channel, dateFrom, dateTo, isAuthLoading, location.pathname, navigate, offerType, retryKey, user]);

  const hasData = useMemo(() => {
    if (!metrics) {
      return false;
    }

    const summary = metrics.summary;
    return (
      summary.assignmentsTotal !== null ||
      summary.redemptionsTotal !== null ||
      summary.redemptionRatePct !== null ||
      summary.promoEfficiency !== null ||
      summary.budgetLeft !== null ||
      summary.earnedPointsTotal !== null ||
      metrics.retention.length > 0 ||
      metrics.offerEvents.length > 0 ||
      metrics.tiers.length > 0 ||
      metrics.segments.length > 0 ||
      metrics.routines.length > 0 ||
      metrics.campaigns.length > 0 ||
      metrics.recsByAlgo.length > 0
    );
  }, [metrics]);

  const handleRefresh = () => {
    void loadMetrics(true);
  };

  const handleExport = () => {
    toast.error('Экспорт CSV недоступен в текущем API.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Метрики</h1>
          <p className="text-sm text-gray-500 mt-0.5">Графики и аналитика (текущая структура ответа бэкенда)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3">
          <Filter className="w-4 h-4" />
          Фильтры
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700"
          >
            <option value="">Категория</option>
            <option value="skincare">Skincare</option>
            <option value="makeup">Makeup</option>
            <option value="haircare">Haircare</option>
            <option value="fragrance">Fragrance</option>
          </select>
          <select
            value={offerType}
            onChange={(event) => setOfferType(event.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700"
          >
            <option value="">Тип оффера</option>
            <option value="discount">Discount</option>
            <option value="points_multiplier">Points multiplier</option>
            <option value="gift">Gift</option>
          </select>
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-700"
          >
            <option value="">Канал</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="import_synthetic">Synthetic import</option>
          </select>
        </div>
        <p className="text-xs text-gray-500">
          Фильтры применяются на сервере к <code>/api/admin/metrics</code>.
        </p>
      </div>

      {isAuthLoading || isLoading ? (
        <MetricsSkeleton />
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <ErrorState
            title="Не удалось загрузить метрики"
            description={loadError}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        </div>
      ) : !hasData || !metrics ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Нет данных по метрикам</h2>
          <p className="text-sm text-gray-500 mb-4">Бэкенд вернул пустой ответ для отображаемых секций.</p>
          <button
            onClick={() => setRetryKey((value) => value + 1)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Повторить
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Назначения всего</p>
              <p className="text-xl font-semibold text-gray-900">{formatCount(metrics.summary.assignmentsTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Погашения всего</p>
              <p className="text-xl font-semibold text-gray-900">{formatCount(metrics.summary.redemptionsTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Доля погашений</p>
              <p className="text-xl font-semibold text-gray-900">{formatPercent(metrics.summary.redemptionRatePct)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Эффективность промо (30д)</p>
              <p className="text-xl font-semibold text-gray-900">{formatMultiplier(metrics.summary.promoEfficiency)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Повторные покупки</h3>
              {metrics.retention.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={metrics.retention}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="window" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="repeatRatePct" stroke="#111827" strokeWidth={2} dot={false} name="Повторные покупки %" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет данных по повторным покупкам.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Воронка офферов (7д/30д)</h3>
              {metrics.offerEvents.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.offerEvents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="window" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="exposed" fill="#111827" name="Показы" />
                    <Bar dataKey="clicked" fill="#FF4DB8" name="Клики" />
                    <Bar dataKey="redeemed" fill="#0ea5e9" name="Погашения" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет данных по событиям офферов.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Распределение по тиру лояльности</h3>
              {metrics.tiers.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.tiers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="tier" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="users" fill="#111827" radius={[0, 4, 4, 0]} name="Пользователи" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет распределения по тирам.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Распределение сегментов (30д)</h3>
              {metrics.segments.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.segments.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#111827" radius={[4, 4, 0, 0]} name="Пользователи" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет распределения сегментов.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Топ пропущенных шагов рутины (30д)</h3>
              {metrics.routines.length > 0 ? (
                <ul className="space-y-2">
                  {metrics.routines.slice(0, 8).map((item) => (
                    <li key={item.step} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.step}</span>
                      <span className="font-medium text-gray-900">{item.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет данных по рутине.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Рекомендации по алгоритмам (30д)</h3>
              {metrics.recsByAlgo.length > 0 ? (
                <div className="space-y-2">
                  {metrics.recsByAlgo.slice(0, 8).map((item) => (
                    <div key={item.algo} className="grid grid-cols-4 gap-2 text-sm border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-700">{item.algo}</span>
                      <span className="text-gray-600">показы: {item.impressions}</span>
                      <span className="text-gray-600">CTR: {item.ctrPct.toFixed(2)}%</span>
                      <span className="text-gray-600">CVR: {item.conversionPct.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">В ответе API нет данных по рекомендациям.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Эффективность кампаний (30д)</h3>
            {metrics.campaigns.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Кампания</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Назначения</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Погашения</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Доля погашений</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.campaigns.map((row) => (
                    <tr key={row.campaign} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-900">{row.campaign}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{row.assignments}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{row.redemptions}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{row.redemptionRatePct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">В ответе API нет данных по кампаниям.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Остаток бюджета (неделя)</p>
              <p className="text-xl font-semibold text-gray-900">{formatMoney(metrics.summary.budgetLeft)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Начислено баллов всего</p>
              <p className="text-xl font-semibold text-gray-900">{formatCount(metrics.summary.earnedPointsTotal)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
