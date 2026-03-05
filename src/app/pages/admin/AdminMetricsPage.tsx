import { useEffect, useState } from 'react';
import { Download, Filter, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminMetrics } from '../../../shared/api/adminMetrics';
import { ErrorState } from '../../components/ErrorState';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/metrics
 * Params: { date_from, date_to, category, offer_type, channel }
 * Permission: view_metrics
 * Response: { charts: [...], summary: {...} }
 * Errors: 401, 403, 429 (rate limit), 500
 * Rate limit: 20/min
 * Export: GET /api/admin/metrics/export?format=csv
 */

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

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

export default function AdminMetricsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [dateFrom, setDateFrom] = useState('2026-02-01');
  const [dateTo, setDateTo] = useState('2026-03-03');
  const [category, setCategory] = useState('all');
  const [offerType, setOfferType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<
    Array<{ date: string; pageviews: number; sessions: number; orders: number; revenue: number; ctr: number }>
  >([]);
  const [channels, setChannels] = useState<Array<{ channel: string; users: number; revenue: number }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        date_from: dateFrom,
        date_to: dateTo,
        category: category !== 'all' ? category : undefined,
        offer_type: offerType !== 'all' ? offerType : undefined,
      });

      const payload = asRecord(response) ?? {};
      const rawSeries =
        (Array.isArray(payload.series) && payload.series) ||
        (Array.isArray(payload.trend) && payload.trend) ||
        (Array.isArray(payload.timeseries) && payload.timeseries) ||
        [];

      setData(
        rawSeries.map((item, idx) => {
          const row = asRecord(item) ?? {};
          return {
            date: String(row.date ?? row.day ?? idx + 1),
            pageviews: toNumber(row.pageviews ?? row.views) ?? 0,
            sessions: toNumber(row.sessions) ?? 0,
            orders: toNumber(row.orders) ?? 0,
            revenue: toNumber(row.revenue) ?? 0,
            ctr: toNumber(row.ctr ?? row.ctr_pct) ?? 0,
          };
        }),
      );

      const rawChannels =
        (Array.isArray(payload.channels) && payload.channels) ||
        (Array.isArray(payload.by_channel) && payload.by_channel) ||
        (Array.isArray(payload.channel_breakdown) && payload.channel_breakdown) ||
        [];
      setChannels(
        rawChannels.map((item, idx) => {
          const row = asRecord(item) ?? {};
          return {
            channel: String(row.channel ?? row.name ?? `Канал ${idx + 1}`),
            users: toNumber(row.users ?? row.sessions) ?? 0,
            revenue: toNumber(row.revenue) ?? 0,
          };
        }),
      );

      if (notify) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        setLoadError(error.message);
      } else {
        setLoadError('Не удалось загрузить метрики.');
      }
      setData([]);
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, [dateFrom, dateTo, category, offerType, isAuthLoading, location.pathname, navigate, user]);

  const handleRefresh = () => {
    void loadMetrics(true);
  };

  const handleExport = () => {
    // TODO: GET /api/admin/metrics/export?format=csv
    toast.error('Экспорт CSV пока не доступен в API.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Metrics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Графики и фильтры</p>
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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Filter className="w-4 h-4" />
          Фильтры
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Дата от</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Дата до</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Категория</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
          >
            <option value="all">Все категории</option>
            <option value="face">Уход за лицом</option>
            <option value="makeup">Декоративная</option>
            <option value="body">Уход за телом</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Тип оффера</label>
          <select
            value={offerType}
            onChange={e => setOfferType(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
          >
            <option value="all">Все типы</option>
            <option value="loyalty">Loyalty</option>
            <option value="promo">Promo</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      {loadError ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <ErrorState
            title="Не удалось загрузить метрики"
            description={loadError}
            onRetry={handleRefresh}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Просмотры & Сессии</h3>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="pageviews" stroke="#111827" strokeWidth={2} dot={false} name="Просмотры" />
                  <Line type="monotone" dataKey="sessions" stroke="#FF4DB8" strokeWidth={2} dot={false} name="Сессии" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">В API нет временного ряда для этого графика.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Заказы</h3>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.slice(0, 14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#111827" radius={[4, 4, 0, 0]} name="Заказы" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">В API нет временного ряда для этого графика.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">CTR тренд</h3>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Line type="monotone" dataKey="ctr" stroke="#FF4DB8" strokeWidth={2} dot={false} name="CTR %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">В API нет временного ряда для этого графика.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Пользователи по каналам</h3>
            {channels.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channels} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="users" fill="#111827" radius={[0, 4, 4, 0]} name="Пользователи" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">В API нет разбивки по каналам.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
