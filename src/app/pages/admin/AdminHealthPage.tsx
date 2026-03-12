import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminHealth } from '../../../shared/api/adminMetrics';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type ServiceStatus = 'ok' | 'degraded' | 'down';

type ServiceHighlight = {
  label: string;
  value: string;
};

type Service = {
  name: string;
  label: string;
  status: ServiceStatus;
  latencyMs: number;
  detail: string;
  lastCheck: string;
  highlights: ServiceHighlight[];
};

type HealthSummary = {
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  totalServices: number;
};

type HealthViewModel = {
  overall: ServiceStatus;
  generatedAt: string;
  uptimeHuman: string;
  summary: HealthSummary;
  services: Service[];
};

const AUTO_REFRESH_MS = 30_000;

const statusConfig: Record<ServiceStatus, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  ok: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    label: 'OK',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  degraded: {
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
    label: 'Degraded',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  down: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    label: 'Down',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const asString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const asStatus = (value: unknown): ServiceStatus => {
  if (value === 'ok' || value === 'degraded' || value === 'down') {
    return value;
  }
  return 'degraded';
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return 'n/a';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'n/a';
  }

  return parsed.toLocaleString('ru');
};

const adaptFallbackServices = (payload: Record<string, unknown>): Service[] => {
  const generatedAt = asString(payload.server_time, new Date().toISOString());
  const db = asRecord(payload.db) ?? {};
  const cache = asRecord(payload.cache) ?? {};
  const counts = asRecord(payload.counts) ?? {};

  const countsSummary = [
    { label: 'Transactions', value: asString(counts.transactions, '0') },
    { label: 'Assignments', value: asString(counts.offer_assignments, '0') },
    { label: 'Offer events', value: asString(counts.offer_events, '0') },
  ];

  return [
    {
      name: 'db',
      label: 'Database',
      status: db.ok === true ? 'ok' : db.ok === false ? 'down' : 'degraded',
      latencyMs: asNumber(db.latency_ms),
      detail: db.error ? `Error: ${asString(db.error)}` : 'Database responds to health checks.',
      lastCheck: generatedAt,
      highlights: [{ label: 'Latency', value: `${asNumber(db.latency_ms)} ms` }],
    },
    {
      name: 'cache',
      label: 'Cache',
      status: cache.ok === true ? 'ok' : cache.ok === false ? 'down' : 'degraded',
      latencyMs: asNumber(cache.latency_ms),
      detail: cache.error ? `Error: ${asString(cache.error)}` : 'Cache round-trip completed.',
      lastCheck: generatedAt,
      highlights: [{ label: 'Latency', value: `${asNumber(cache.latency_ms)} ms` }],
    },
    {
      name: 'counts',
      label: 'System counters',
      status: 'ok',
      latencyMs: 0,
      detail: 'Legacy counter snapshot.',
      lastCheck: generatedAt,
      highlights: countsSummary,
    },
  ];
};

const adaptHealth = (response: unknown): HealthViewModel => {
  const payload = asRecord(response) ?? {};
  const servicesPayload = Array.isArray(payload.services) ? payload.services : [];
  const services: Service[] =
    servicesPayload.length > 0
      ? servicesPayload
          .map((item) => asRecord(item))
          .filter((item): item is Record<string, unknown> => item !== null)
          .map((item) => {
            const highlightsPayload = Array.isArray(item.highlights) ? item.highlights : [];
            const highlights = highlightsPayload
              .map((entry) => asRecord(entry))
              .filter((entry): entry is Record<string, unknown> => entry !== null)
              .map((entry) => ({
                label: asString(entry.label, 'Metric'),
                value: asString(entry.value, 'n/a'),
              }));

            return {
              name: asString(item.name, 'unknown'),
              label: asString(item.label, 'Unknown'),
              status: asStatus(item.status),
              latencyMs: asNumber(item.latency_ms),
              detail: asString(item.detail, 'No details provided.'),
              lastCheck: asString(item.last_check, asString(payload.generated_at, new Date().toISOString())),
              highlights,
            };
          })
      : adaptFallbackServices(payload);

  const derivedOverall = services.some((service) => service.status === 'down')
    ? 'down'
    : services.some((service) => service.status === 'degraded')
      ? 'degraded'
      : 'ok';

  const summaryPayload = asRecord(payload.summary) ?? {};
  const summary: HealthSummary = {
    healthyServices: asNumber(summaryPayload.healthy_services, services.filter((service) => service.status === 'ok').length),
    degradedServices: asNumber(summaryPayload.degraded_services, services.filter((service) => service.status === 'degraded').length),
    downServices: asNumber(summaryPayload.down_services, services.filter((service) => service.status === 'down').length),
    totalServices: asNumber(summaryPayload.total_services, services.length),
  };

  const appPayload = asRecord(payload.app) ?? {};

  return {
    overall: asStatus(payload.overall_status ?? derivedOverall),
    generatedAt: asString(payload.generated_at ?? payload.server_time, new Date().toISOString()),
    uptimeHuman: asString(appPayload.uptime_human, 'n/a'),
    summary,
    services,
  };
};

function SummaryCard(props: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{props.label}</p>
      <p className="text-base font-semibold text-gray-900">{props.value}</p>
    </div>
  );
}

export default function AdminHealthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [health, setHealth] = useState<HealthViewModel | null>(null);
  const [checking, setChecking] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !user) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setReloadKey((value) => value + 1);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [isAuthLoading, user]);

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

        setHealth(adaptHealth(response));
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setHealth(null);
        setLoadError(error instanceof Error ? error.message : 'Failed to load health snapshot.');
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, reloadKey, user]);

  const services = health?.services ?? [];
  const summary = health?.summary ?? {
    healthyServices: 0,
    degradedServices: 0,
    downServices: 0,
    totalServices: services.length,
  };
  const overall = health?.overall ?? 'degraded';
  const cfg = statusConfig[overall];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-semibold text-gray-900 text-xl">Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Last check: {formatDateTime(health?.generatedAt)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Auto refresh: every 30 seconds</p>
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

      {checking && !health ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 mb-6">
          <LoadingSpinner text="Checking live service status..." />
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <ErrorState
            title="Failed to load health metrics"
            description={loadError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </div>
      ) : !health ? (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <ErrorState
            title="No health snapshot"
            description="The backend returned no health payload."
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </div>
      ) : (
        <>
          <div className={`flex items-center gap-4 p-5 rounded-xl border mb-4 ${cfg.bg} ${cfg.border}`}>
            {cfg.icon}
            <div>
              <p className={`font-semibold ${cfg.text}`}>
                Platform status: {cfg.label}
              </p>
              <p className={`text-sm ${cfg.text} opacity-80`}>
                Healthy {summary.healthyServices} of {summary.totalServices} services
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <SummaryCard label="Uptime" value={health.uptimeHuman} />
            <SummaryCard label="Healthy / Total" value={`${summary.healthyServices} / ${summary.totalServices}`} />
            <SummaryCard label="Degraded / Down" value={`${summary.degradedServices} / ${summary.downServices}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {services.map((service) => {
              const status = statusConfig[service.status];
              return (
                <div key={service.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {status.icon}
                      <div>
                        <p className="font-semibold text-gray-900">{service.label}</p>
                        <p className="text-xs text-gray-500">Latency: {service.latencyMs.toFixed(2)} ms</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{service.detail}</p>

                  {service.highlights.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                      {service.highlights.slice(0, 3).map((highlight) => (
                        <div key={`${service.name}-${highlight.label}`} className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">{highlight.label}</p>
                          <p className="text-sm font-medium text-gray-900">{highlight.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Service key: {service.name}</span>
                    <span>{formatDateTime(service.lastCheck)}</span>
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
