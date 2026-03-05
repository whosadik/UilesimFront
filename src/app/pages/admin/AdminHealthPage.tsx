import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminHealth } from '../../../shared/api/adminMetrics';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/health
 * Permission: IsAdminUser
 * Response: { services: [{ name, status, latency_ms, last_check }], overall: "ok"|"degraded"|"down" }
 * Errors: 401, 500
 */

type ServiceStatus = 'ok' | 'degraded' | 'down';

interface Service {
  name: string;
  label: string;
  status: ServiceStatus;
  latency_ms: number;
  detail: string;
  last_check: string;
}

const mockServices: Service[] = [
  { name: 'api', label: 'API Server', status: 'ok', latency_ms: 42, detail: 'All endpoints responding', last_check: new Date().toISOString() },
  { name: 'db', label: 'PostgreSQL', status: 'ok', latency_ms: 8, detail: 'Connection pool healthy (10/20)', last_check: new Date().toISOString() },
  { name: 'cache', label: 'Redis Cache', status: 'ok', latency_ms: 2, detail: 'Hit rate: 94.2%', last_check: new Date().toISOString() },
  { name: 'queue', label: 'Celery Queue', status: 'ok', latency_ms: 12, detail: '3 workers active, 0 tasks stuck', last_check: new Date().toISOString() },
  { name: 'recs', label: 'Recs Engine', status: 'ok', latency_ms: 87, detail: 'Model v2.1.3 loaded', last_check: new Date().toISOString() },
  { name: 'storage', label: 'S3 Storage', status: 'ok', latency_ms: 54, detail: 'Bucket accessible', last_check: new Date().toISOString() },
];

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  ok: { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'OK', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  degraded: { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, label: 'Degraded', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  down: { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Down', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const defaultLabels: Record<string, string> = {
  api: 'API Server',
  db: 'PostgreSQL',
  cache: 'Redis Cache',
  queue: 'Celery Queue',
  recs: 'Recs Engine',
  storage: 'S3 Storage',
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

export default function AdminHealthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [services, setServices] = useState(mockServices);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const loadHealth = async (notify = false) => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    setChecking(true);
    try {
      const response = await getAdminHealth();
      const payload = asRecord(response) ?? {};
      const rawServices = (Array.isArray(payload.services) && payload.services) || [];

      if (rawServices.length > 0) {
        setServices(
          rawServices.map((item, idx) => {
            const row = asRecord(item) ?? {};
            const name = String(row.name ?? mockServices[idx % mockServices.length].name);
            const statusRaw = String(row.status ?? 'ok');
            const status =
              statusRaw === 'ok' || statusRaw === 'degraded' || statusRaw === 'down'
                ? statusRaw
                : 'ok';
            return {
              name,
              label: String(row.label ?? defaultLabels[name] ?? mockServices[idx % mockServices.length].label),
              status,
              latency_ms: Number(row.latency_ms ?? 0) || 0,
              detail: String(row.detail ?? mockServices[idx % mockServices.length].detail),
              last_check: String(row.last_check ?? new Date().toISOString()),
            };
          }),
        );
      }

      setLastChecked(new Date());
      if (notify) {
        toast.success('Health check завершён');
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
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, [isAuthLoading, location.pathname, navigate, user]);

  const handleRecheck = () => {
    void loadHealth(true);
  };

  const overall = services.every(s => s.status === 'ok') ? 'ok' : services.some(s => s.status === 'down') ? 'down' : 'degraded';
  const cfg = statusConfig[overall];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">Последняя проверка: {lastChecked.toLocaleTimeString('ru')}</p>
        </div>
        <button
          onClick={handleRecheck}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          Recheck
        </button>
      </div>

      {/* Overall Status */}
      <div className={`flex items-center gap-4 p-5 rounded-xl border mb-6 ${cfg.bg} ${cfg.border}`}>
        {cfg.icon}
        <div>
          <p className={`font-semibold ${cfg.text}`}>Система {overall === 'ok' ? 'работает нормально' : overall === 'degraded' ? 'работает с ухудшением' : 'не работает'}</p>
          <p className={`text-sm ${cfg.text} opacity-80`}>{services.filter(s => s.status === 'ok').length} из {services.length} сервисов в норме</p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((svc) => {
          const c = statusConfig[svc.status];
          return (
            <div key={svc.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {c.icon}
                  <p className="font-semibold text-gray-900">{svc.label}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                  {c.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{svc.detail}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Latency: <strong className="text-gray-700">{svc.latency_ms}ms</strong></span>
                <span>{new Date(svc.last_check).toLocaleTimeString('ru')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
