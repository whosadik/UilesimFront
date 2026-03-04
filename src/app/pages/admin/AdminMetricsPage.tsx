import { useState } from 'react';
import { Download, Filter, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';

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

const generateData = (days: number) =>
  Array.from({ length: days }, (_, i) => ({
    date: `${i + 1}`,
    pageviews: Math.floor(Math.random() * 5000 + 8000),
    sessions: Math.floor(Math.random() * 3000 + 5000),
    orders: Math.floor(Math.random() * 200 + 300),
    revenue: Math.floor(Math.random() * 500000 + 800000),
    ctr: +(Math.random() * 3 + 3).toFixed(2),
  }));

const channelData = [
  { channel: 'Organic', users: 4200, revenue: 3800000 },
  { channel: 'Direct', users: 2800, revenue: 2400000 },
  { channel: 'Email', users: 1900, revenue: 1700000 },
  { channel: 'Push', users: 1400, revenue: 1100000 },
  { channel: 'Referral', users: 800, revenue: 650000 },
];

export default function AdminMetricsPage() {
  const [dateFrom, setDateFrom] = useState('2026-02-01');
  const [dateTo, setDateTo] = useState('2026-03-03');
  const [category, setCategory] = useState('all');
  const [offerType, setOfferType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const data = generateData(28);

  const handleRefresh = () => {
    setIsLoading(true);
    // TODO: fetch from /api/admin/metrics
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Данные обновлены');
    }, 1200);
  };

  const handleExport = () => {
    // TODO: GET /api/admin/metrics/export?format=csv
    toast.success('Экспорт CSV запущен');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Metrics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Графики и фильтры · mock data</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Pageviews & Sessions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Просмотры & Сессии</h3>
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
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Заказы</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.slice(0, 14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#111827" radius={[4, 4, 0, 0]} name="Заказы" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CTR Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">CTR тренд</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="ctr" stroke="#FF4DB8" strokeWidth={2} dot={false} name="CTR %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By Channel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Пользователи по каналам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="users" fill="#111827" radius={[0, 4, 4, 0]} name="Пользователи" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
