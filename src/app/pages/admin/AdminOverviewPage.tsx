import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Info,
  Percent,
  Repeat,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminOverview } from '../../../shared/api/adminMetrics';
import { formatCatalogCategoryLabel } from '../../../shared/catalog/presentation';
import { ErrorState } from '../../components/ErrorState';

type Period = '7d' | '30d' | '90d';

type AlertLevel = 'warning' | 'error' | 'info';

type AdminAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  action?: { label: string; href: string };
};

type RecommendedAction = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  href: string;
};

type OfferRow = {
  id: string;
  name: string;
  type: string;
  cr: number | null;
};

type CategoryRow = {
  name: string;
  revenue: number | null;
  growth: number | null;
};

type TxnWindow = {
  uniqueBuyers: number | null;
};

type RecsWindow = {
  ctr: number | null;
  cr: number | null;
};

type OffersWindow = {
  redemptionRateExposed: number | null;
};

type Retention = {
  activeUsers90d: number | null;
};

type TrendPoint = {
  day: string;
  ctr: number;
  cr: number;
  users: number;
};

type KpiWindow = {
  ctr: number | null;
  cr: number | null;
  uniqueBuyers: number | null;
  promoRedemption: number | null;
  activeUsers: number | null;
};

type OverviewData = {
  generatedAt: string | null;
  transactions: Record<'7d' | '30d', TxnWindow | null>;
  recs: Record<'7d' | '30d', RecsWindow | null>;
  offers: Record<'7d' | '30d', OffersWindow | null>;
  retention: Retention;
  kpis: Record<'7d' | '30d' | '90d', KpiWindow>;
  trend: TrendPoint[];
  topOffers: OfferRow[];
  topCategories: CategoryRow[];
  alerts: AdminAlert[];
  actions: RecommendedAction[];
};

type KpiItem = {
  id: 'ctr' | 'cr' | 'users' | 'promo';
  label: string;
  value: string;
  up: boolean | null;
  note: string;
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

const toPercent = (ratio: number | null): number | null =>
  ratio === null ? null : ratio * 100;

const formatPercent = (ratio: number | null): string =>
  ratio === null ? 'нет данных' : `${(ratio * 100).toFixed(2)}%`;

const formatCount = (value: number | null): string =>
  value === null ? 'нет данных' : Math.round(value).toLocaleString('ru');

const formatMoney = (value: number | null): string =>
  value === null ? 'нет данных' : `${Math.round(value).toLocaleString('ru')} тг`;

const parseAlertLevel = (value: unknown): AlertLevel => {
  const level = String(value ?? '').toLowerCase();
  if (level === 'warning' || level === 'error' || level === 'info') {
    return level;
  }
  return 'info';
};

const parsePriority = (value: unknown): 'high' | 'medium' | 'low' => {
  const priority = String(value ?? '').toLowerCase();
  if (priority === 'high' || priority === 'medium' || priority === 'low') {
    return priority;
  }
  return 'low';
};

const parseTxnWindow = (value: unknown): TxnWindow | null => {
  const row = asRecord(value);
  if (!row) {
    return null;
  }

  return {
    uniqueBuyers: toNumber(row.unique_buyers),
  };
};

const parseRecsWindow = (value: unknown): RecsWindow | null => {
  const row = asRecord(value);
  if (!row) {
    return null;
  }

  return {
    ctr: toNumber(row.ctr),
    cr: toNumber(row.cr),
  };
};

const parseOffersWindow = (value: unknown): OffersWindow | null => {
  const row = asRecord(value);
  if (!row) {
    return null;
  }

  return {
    redemptionRateExposed: toNumber(row.redemption_rate_exposed),
  };
};

const parseTrendPoint = (value: unknown): TrendPoint | null => {
  const row = asRecord(value);
  if (!row) {
    return null;
  }

  const day = String(row.day ?? '').trim();
  if (!day) {
    return null;
  }

  return {
    day,
    ctr: toNumber(row.ctr) ?? 0,
    cr: toNumber(row.cr) ?? 0,
    users: toNumber(row.users) ?? 0,
  };
};

const adaptOverview = (response: unknown): OverviewData => {
  const payload = asRecord(response) ?? {};

  const transactions = asRecord(payload.transactions) ?? {};
  const recs = asRecord(payload.recs) ?? {};
  const offers = asRecord(payload.offers) ?? {};
  const retention = asRecord(payload.retention) ?? {};
  const kpisPayload = asRecord(payload.kpis) ?? {};

  const tx7 = parseTxnWindow(transactions['7d']);
  const tx30 = parseTxnWindow(transactions['30d']);

  const recs7 = parseRecsWindow(recs['7d']);
  const recs30 = parseRecsWindow(recs['30d']);

  const offers7 = parseOffersWindow(offers['7d']);
  const offers30 = parseOffersWindow(offers['30d']);

  const eventsKpis = asRecord(offers.events_kpis) ?? {};
  const byCampaign30d = asRecordArray(eventsKpis.by_campaign_30d).map((row, index) => ({
    id: String(row.campaign_name ?? index + 1),
    name: String(row.campaign_name ?? `Campaign ${index + 1}`),
    type: 'campaign',
    cr: toNumber(row.redemption_rate_exposed),
  }));
  const serverTopOffers = asRecordArray(payload.top_offers).map((row, index) => ({
    id: String(row.id ?? row.campaign_name ?? index + 1),
    name: String(row.name ?? row.campaign_name ?? `Campaign ${index + 1}`),
    type: String(row.type ?? 'campaign'),
    cr: toNumber(row.cr ?? row.redemption_rate_exposed),
  }));

  const topCategories = asRecordArray(payload.top_categories).map((row, index) => {
    const rawName = row.name ?? row.category;
    const name =
      typeof rawName === 'string' && rawName.trim()
        ? formatCatalogCategoryLabel(rawName, 'ru') ?? rawName
        : `Категория ${index + 1}`;

    return {
      name,
      revenue: toNumber(row.revenue),
      growth: toNumber(row.growth ?? row.delta),
    };
  });

  const alerts = asRecordArray(payload.alerts).map((row, index) => {
    const action = asRecord(row.action);
    return {
      id: String(row.id ?? `alert-${index + 1}`),
      level: parseAlertLevel(row.level),
      title: String(row.title ?? 'Системное уведомление'),
      detail: String(row.detail ?? row.reason ?? ''),
      action:
        action && action.href
          ? {
              label: String(action.label ?? 'Открыть'),
              href: String(action.href),
            }
          : undefined,
    } satisfies AdminAlert;
  });

  const actions = asRecordArray(payload.recommended_actions).map((row, index) => ({
    id: String(row.id ?? `action-${index + 1}`),
    priority: parsePriority(row.priority),
    title: String(row.title ?? 'Рекомендация'),
    reason: String(row.reason ?? ''),
    href: String(row.href ?? '/admin'),
  }));

  const trend = asRecordArray(payload.trend)
    .map((row) => parseTrendPoint(row))
    .filter((row): row is TrendPoint => row !== null);
  const fallbackTrend: TrendPoint[] = [];
  if (!trend.length && (recs7 || tx7)) {
    fallbackTrend.push({
      day: '7d',
      ctr: toPercent(recs7?.ctr ?? null) ?? 0,
      cr: toPercent(recs7?.cr ?? null) ?? 0,
      users: tx7?.uniqueBuyers ?? 0,
    });
  }
  if (!trend.length && (recs30 || tx30)) {
    fallbackTrend.push({
      day: '30d',
      ctr: toPercent(recs30?.ctr ?? null) ?? 0,
      cr: toPercent(recs30?.cr ?? null) ?? 0,
      users: tx30?.uniqueBuyers ?? 0,
    });
  }

  const kpis7 = asRecord(kpisPayload['7d']);
  const kpis30 = asRecord(kpisPayload['30d']);
  const kpis90 = asRecord(kpisPayload['90d']);

  return {
    generatedAt: typeof payload.generated_at === 'string' ? payload.generated_at : null,
    transactions: {
      '7d': tx7,
      '30d': tx30,
    },
    recs: {
      '7d': recs7,
      '30d': recs30,
    },
    offers: {
      '7d': offers7,
      '30d': offers30,
    },
    retention: {
      activeUsers90d: toNumber(retention.active_users_90d),
    },
    kpis: {
      '7d': {
        ctr: toNumber(kpis7?.ctr) ?? recs7?.ctr ?? null,
        cr: toNumber(kpis7?.cr) ?? recs7?.cr ?? null,
        uniqueBuyers: toNumber(kpis7?.unique_buyers) ?? tx7?.uniqueBuyers ?? null,
        promoRedemption: toNumber(kpis7?.promo_redemption) ?? offers7?.redemptionRateExposed ?? null,
        activeUsers: null,
      },
      '30d': {
        ctr: toNumber(kpis30?.ctr) ?? recs30?.ctr ?? null,
        cr: toNumber(kpis30?.cr) ?? recs30?.cr ?? null,
        uniqueBuyers: toNumber(kpis30?.unique_buyers) ?? tx30?.uniqueBuyers ?? null,
        promoRedemption: toNumber(kpis30?.promo_redemption) ?? offers30?.redemptionRateExposed ?? null,
        activeUsers: null,
      },
      '90d': {
        ctr: null,
        cr: null,
        uniqueBuyers: null,
        promoRedemption: null,
        activeUsers: toNumber(kpis90?.active_users) ?? toNumber(retention.active_users_90d),
      },
    },
    trend: trend.length > 0 ? trend : fallbackTrend,
    topOffers: serverTopOffers.length > 0 ? serverTopOffers : byCampaign30d,
    topCategories,
    alerts,
    actions,
  };
};

const priorityColors: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityLabels: Record<'high' | 'medium' | 'low', string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const offerTypeLabels: Record<string, string> = {
  campaign: 'Кампания',
  discount: 'Скидка',
  points_multiplier: 'Множитель баллов',
  gift: 'Подарок',
};

const alertStyles: Record<AlertLevel, { bg: string; border: string; icon: React.ReactNode }> = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />,
  },
};

function KpiCard({
  label,
  value,
  note,
  up,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  up: boolean | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium">
        {up === null ? (
          <span className="text-gray-500">{note}</span>
        ) : (
          <>
            {up ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={up ? 'text-emerald-600' : 'text-red-500'}>{note}</span>
          </>
        )}
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="bg-white rounded-xl border border-gray-200 p-5 h-[124px]" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 h-[290px]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((id) => (
          <div key={id} className="bg-white rounded-xl border border-gray-200 h-[260px]" />
        ))}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [period, setPeriod] = useState<Period>('7d');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

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
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getAdminOverview();
        if (cancelled) {
          return;
        }

        setOverview(adaptOverview(response));
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setOverview(null);
        setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить overview.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, retryKey, user]);

  const kpis = useMemo<KpiItem[]>(() => {
    if (!overview) {
      return [
        { id: 'ctr', label: 'CTR', value: 'нет данных', up: null, note: 'Ожидание данных API' },
        { id: 'cr', label: 'Конверсия (CR)', value: 'нет данных', up: null, note: 'Ожидание данных API' },
        { id: 'users', label: 'Уникальные покупатели', value: 'нет данных', up: null, note: 'Ожидание данных API' },
        { id: 'promo', label: 'Promo Redemption', value: 'нет данных', up: null, note: 'Ожидание данных API' },
      ];
    }

    const ctrRatio = period === '90d' ? null : overview.kpis[period].ctr;
    const crRatio = period === '90d' ? null : overview.kpis[period].cr;
    const usersValue = period === '90d' ? overview.kpis['90d'].activeUsers : overview.kpis[period].uniqueBuyers;
    const promoRatio = period === '90d' ? null : overview.kpis[period].promoRedemption;

    const ctrUp =
      overview.kpis['7d'].ctr !== null && overview.kpis['30d'].ctr !== null
        ? (overview.kpis['7d'].ctr ?? 0) >= (overview.kpis['30d'].ctr ?? 0)
        : null;

    const crUp =
      overview.kpis['7d'].cr !== null && overview.kpis['30d'].cr !== null
        ? (overview.kpis['7d'].cr ?? 0) >= (overview.kpis['30d'].cr ?? 0)
        : null;

    const usersUp =
      overview.kpis['7d'].uniqueBuyers !== null && overview.kpis['30d'].uniqueBuyers !== null
        ? (overview.kpis['7d'].uniqueBuyers ?? 0) >= (overview.kpis['30d'].uniqueBuyers ?? 0)
        : null;

    const promoUp =
      overview.kpis['7d'].promoRedemption !== null && overview.kpis['30d'].promoRedemption !== null
        ? (overview.kpis['7d'].promoRedemption ?? 0) >= (overview.kpis['30d'].promoRedemption ?? 0)
        : null;

    return [
      {
        id: 'ctr',
        label: 'CTR',
        value: formatPercent(ctrRatio),
        up: ctrUp,
        note: ctrUp === null ? 'Сравнение недоступно' : 'Сравнение 7d к 30d',
      },
      {
        id: 'cr',
        label: 'Конверсия (CR)',
        value: formatPercent(crRatio),
        up: crUp,
        note: crUp === null ? 'Сравнение недоступно' : 'Сравнение 7d к 30d',
      },
      {
        id: 'users',
        label: period === '90d' ? 'Активные пользователи (90d)' : 'Уникальные покупатели',
        value: formatCount(usersValue),
        up: period === '90d' ? null : usersUp,
        note: period === '90d' ? 'Значение за 90 дней' : usersUp === null ? 'Сравнение недоступно' : 'Сравнение 7d к 30d',
      },
      {
        id: 'promo',
        label: 'Promo Redemption',
        value: formatPercent(promoRatio),
        up: promoUp,
        note:
          period === '90d'
            ? 'Promo redemption доступен для окон 7d и 30d'
            : promoUp === null
              ? 'Сравнение недоступно'
              : 'Сравнение 7d к 30d',
      },
    ];
  }, [overview, period]);

  const visibleAlerts = useMemo(() => {
    if (!overview) {
      return [];
    }
    return overview.alerts.filter((item) => !dismissedAlerts.has(item.id));
  }, [dismissedAlerts, overview]);

  const hasAnyData = useMemo(() => {
    if (!overview) {
      return false;
    }

    return (
      overview.trend.length > 0 ||
      overview.topOffers.length > 0 ||
      overview.topCategories.length > 0 ||
      overview.actions.length > 0 ||
      overview.alerts.length > 0 ||
      overview.transactions['7d'] !== null ||
      overview.transactions['30d'] !== null ||
      overview.recs['7d'] !== null ||
      overview.recs['30d'] !== null ||
      overview.offers['7d'] !== null ||
      overview.offers['30d'] !== null ||
      overview.retention.activeUsers90d !== null
    );
  }, [overview]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live snapshot from /api/admin/overview</p>
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

      {isAuthLoading || isLoading ? (
        <OverviewSkeleton />
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <ErrorState
            title="Не удалось загрузить overview"
            description={loadError}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        </div>
      ) : !hasAnyData ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Нет данных для overview</h2>
          <p className="text-sm text-gray-500 mb-4">Бэкенд ответил без метрик для отображения.</p>
          <button
            onClick={() => setRetryKey((value) => value + 1)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Повторить
          </button>
        </div>
      ) : (
        <>
          {visibleAlerts.length > 0 ? (
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
                {visibleAlerts.map((alert) => {
                  const style = alertStyles[alert.level];
                  return (
                    <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border}`}>
                      {style.icon}
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
                        onClick={() => setDismissedAlerts((prev) => new Set([...prev, alert.id]))}
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 text-gray-400 flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-500">
              Сейчас активных alert-ов нет.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label={kpis[0].label}
              value={kpis[0].value}
              note={kpis[0].note}
              up={kpis[0].up}
              icon={<Percent className="w-4 h-4" />}
            />
            <KpiCard
              label={kpis[1].label}
              value={kpis[1].value}
              note={kpis[1].note}
              up={kpis[1].up}
              icon={<ShoppingBag className="w-4 h-4" />}
            />
            <KpiCard
              label={kpis[2].label}
              value={kpis[2].value}
              note={kpis[2].note}
              up={kpis[2].up}
              icon={<Users className="w-4 h-4" />}
            />
            <KpiCard
              label={kpis[3].label}
              value={kpis[3].value}
              note={kpis[3].note}
              up={kpis[3].up}
              icon={<Repeat className="w-4 h-4" />}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">CTR / CR / Users (7d vs 30d)</h2>
              <span className="text-xs text-gray-400">
                {overview?.generatedAt ? `generated_at: ${overview.generatedAt}` : 'live data'}
              </span>
            </div>
            {overview && overview.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={overview.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#e5e7eb" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#e5e7eb" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Line type="monotone" dataKey="ctr" stroke="#111827" strokeWidth={2} dot={false} name="CTR %" />
                  <Line type="monotone" dataKey="cr" stroke="#FF4DB8" strokeWidth={2} dot={false} name="CR %" />
                  <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Пользователи" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">Пока недостаточно данных для графика.</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                <Zap className="w-4 h-4 text-[#FF4DB8]" />
                <h2 className="font-semibold text-gray-900">Рекомендуемые действия</h2>
              </div>
              {overview && overview.actions.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {overview.actions.map((action) => (
                    <Link
                      key={action.id}
                      to={action.href}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityColors[action.priority]}`}
                      >
                        {priorityLabels[action.priority]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{action.reason}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-sm text-gray-500">Сейчас нет приоритетных действий для команды.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Лучшие офферы</h2>
                <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  Все <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              {overview && overview.topOffers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Кампания</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500">Тип</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">CR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {overview.topOffers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{offer.name}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            {offerTypeLabels[offer.type] ?? offer.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-700">{formatPercent(offer.cr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-5 text-sm text-gray-500">Пока нет данных по кампаниям для блока Top Offers.</div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Top Categories</h2>
                <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  Все <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              {overview && overview.topCategories.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Категория</th>
                      <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">Выручка</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Рост</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {overview.topCategories.map((category) => {
                      const growthText = category.growth === null ? 'нет данных' : `${category.growth}%`;
                      const isUp = category.growth === null ? null : category.growth >= 0;
                      return (
                        <tr key={category.name} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-900">{category.name}</td>
                          <td className="px-3 py-3 text-right text-gray-600">{formatMoney(category.revenue)}</td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={`text-xs font-medium ${
                                isUp === null ? 'text-gray-500' : isUp ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {growthText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-5 text-sm text-gray-500">Пока нет данных по категориям за 30 дней.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
