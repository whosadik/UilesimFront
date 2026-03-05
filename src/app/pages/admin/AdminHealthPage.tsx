import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminHealth } from '../../../shared/api/adminMetrics';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type ServiceStatus = 'ok' | 'degraded' | 'down';

interface Service {
  name: string;
  label: string;
  status: ServiceStatus;
  latency_ms: number;
  detail: string;
  last_check: string;
}

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  ok: { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'OK', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  degraded: { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, label: 'Degraded', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  down: { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Down', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const toServiceStatus = (okValue: unknown): ServiceStatus => {
  if (okValue === true) {
    return 'ok';
  }
  if (okValue === false) {
    return 'down';
  }
  return 'degraded';
};

const buildServices = (payload: Record<string, unknown>): Service[] => {
  const serverTime = String(payload.server_time ?? new Date().toISOString());

  const db = asRecord(payload.db) ?? {};
  const cache = asRecord(payload.cache) ?? {};
  const counts = asRecord(payload.counts) ?? {};

  const countsSummary = [
    `Транзакции: ${Number(counts.transactions ?? 0)}`,
    `Офферы: ${Number(counts.offer_assignments ?? 0)}`,
    `События офферов: ${Number(counts.offer_events ?? 0)}`,
    `Аудит: ${Number(counts.audit_events ?? 0)}`,
  ].join(', ');

  return [
    {
      name: 'db',
      label: 'База данных',
      status: toServiceStatus(db.ok),
      latency_ms: 0,
      detail: db.error ? `Ошибка: ${String(db.error)}` : 'Подключение работает',
      last_check: serverTime,
    },
    {
      name: 'cache',
      label: 'Кэш',
      status: toServiceStatus(cache.ok),
      latency_ms: 0,
      detail: cache.error ? `Ошибка: ${String(cache.error)}` : 'Кэш доступен',
      last_check: serverTime,
    },
    {
      name: 'counts',
      label: 'Системные счётчики',
      status: 'ok',
      latency_ms: 0,
      detail: countsSummary,
      last_check: serverTime,
    },
  ];
};

export default function AdminHealthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadHealth = async () => {
      setChecking(true);
      setLoadError(null);

      try {
        const response = await getAdminHealth();
        if (cancelled) {
          return;
        }

        const payload = asRecord(response) ?? {};
        setServices(buildServices(payload));
        setLastChecked(new Date());
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setServices([]);
        setLoadError(
          error instanceof Error ? error.message : 'Не удалось загрузить состояние сервисов.',
        );
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, reloadKey, user]);

  const overall = useMemo<ServiceStatus>(() => {
    if (services.length === 0) {
      return 'degraded';
    }
    if (services.every((service) => service.status === 'ok')) {
      return 'ok';
    }
    if (services.some((service) => service.status === 'down')) {
      return 'down';
    }
    return 'degraded';
  }, [services]);

  const cfg = statusConfig[overall];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Последняя проверка: {lastChecked ? lastChecked.toLocaleTimeString('ru') : '—'}
          </p>
        </div>
        <button
          onClick={() => setReloadKey((value) => value + 1)}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          Recheck
        </button>
      </div>

      {checking && services.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 mb-6">
          <LoadingSpinner text="Проверяем состояние сервисов..." />
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <ErrorState
            title="Не удалось загрузить health-метрики"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </div>
      ) : (
        <>
          <div className={`flex items-center gap-4 p-5 rounded-xl border mb-6 ${cfg.bg} ${cfg.border}`}>
            {cfg.icon}
            <div>
              <p className={`font-semibold ${cfg.text}`}>
                Система {overall === 'ok' ? 'работает нормально' : overall === 'degraded' ? 'работает с ухудшением' : 'не работает'}
              </p>
              <p className={`text-sm ${cfg.text} opacity-80`}>
                {services.filter((service) => service.status === 'ok').length} из {services.length} сервисов в норме
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => {
              const status = statusConfig[service.status];
              return (
                <div key={service.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {status.icon}
                      <p className="font-semibold text-gray-900">{service.label}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{service.detail}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Latency: <strong className="text-gray-700">{service.latency_ms}ms</strong></span>
                    <span>{new Date(service.last_check).toLocaleTimeString('ru')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
