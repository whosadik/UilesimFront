import { useEffect, useMemo, useState } from 'react';
import { X, ChevronRight, FlaskConical } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { getAdminRecsMetrics } from '../../../shared/api/adminMetrics';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface Experiment {
  id: number;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'draft';
  traffic_pct: number;
  started_at: string;
  description: string;
  variants: { name: string; traffic: number; ctr: string; cr: string }[];
  guardrails: string[];
}

const statusColors: Record<string, string> = {
  running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  draft: 'bg-blue-50 text-blue-700 border-blue-200',
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

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

const toPercent = (value: unknown): string => {
  const num = toNumber(value);
  if (num === null) {
    return '—';
  }
  return `${(num * 100).toFixed(2).replace(/\.00$/, '')}%`;
};

const formatTraffic = (impression: number, total: number): number =>
  total > 0 ? Math.round((impression / total) * 100) : 0;

export default function AdminExperimentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [experimentList, setExperimentList] = useState<Experiment[]>([]);
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    const loadExperiments = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getAdminRecsMetrics();
        if (cancelled) {
          return;
        }

        const payload = asRecord(response) ?? {};
        const experimentsMap = asRecord(payload.experiments) ?? {};

        const mapped = Object.entries(experimentsMap).map(([experimentId, raw], index) => {
          const row = asRecord(raw) ?? {};
          const totals = asRecord(row.totals) ?? {};
          const variantsMap = asRecord(row.variants) ?? {};
          const totalImpressions = toNumber(totals.impression) ?? 0;

          const variants = Object.entries(variantsMap).map(([variantName, variantRaw]) => {
            const variant = asRecord(variantRaw) ?? {};
            const impressions = toNumber(variant.impression) ?? 0;
            return {
              name: variantName,
              traffic: formatTraffic(impressions, totalImpressions),
              ctr: toPercent(variant.ctr),
              cr: toPercent(variant.conversion),
            };
          });

          const trafficPct = formatTraffic(totalImpressions, totalImpressions);
          const defaultName = `Эксперимент ${index + 1}`;

          return {
            id: index + 1,
            name: String(row.experiment_id ?? experimentId ?? defaultName),
            status: 'running',
            traffic_pct: trafficPct,
            started_at: '—',
            description: 'Метрики эксперимента рекомендаций',
            variants,
            guardrails: ['CTR выше базовой версии', 'Конверсия не ниже контрольной группы'],
          } as Experiment;
        });

        setExperimentList(mapped);
        setSelected((current) => {
          if (!current) {
            return null;
          }
          return mapped.find((item) => item.id === current.id) ?? null;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setExperimentList([]);
        setLoadError('Не удалось загрузить эксперименты рекомендаций. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadExperiments();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, reloadKey, user]);

  const hasData = useMemo(() => experimentList.length > 0, [experimentList.length]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Recs Experiments</h1>
            <p className="text-sm text-gray-500 mt-0.5">A/B эксперименты рекомендательной системы</p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16">
            <LoadingSpinner text="Загружаем эксперименты..." />
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-gray-200 bg-white">
            <ErrorState
              title="Не удалось загрузить эксперименты"
              description={loadError}
              onRetry={() => setReloadKey((value) => value + 1)}
            />
          </div>
        ) : !hasData ? (
          <div className="rounded-xl border border-[#EAE6EF] bg-white p-6 text-sm text-[#6B7280]">
            Эксперименты пока не найдены.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Название</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Трафик</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Запущен</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {experimentList.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => setSelected(exp)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selected?.id === exp.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{exp.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 ml-6">{exp.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${statusColors[exp.status]}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-gray-700">{exp.traffic_pct}%</span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{exp.started_at}</td>
                    <td className="px-4 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 h-fit sticky top-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">{selected.name}</h3>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Статус</p>
              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Варианты</p>
              <div className="flex flex-col gap-2">
                {selected.variants.length > 0 ? (
                  selected.variants.map((variant) => (
                    <div key={variant.name} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs font-medium text-gray-900 mb-1.5">{variant.name}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Traffic: <strong>{variant.traffic}%</strong></span>
                        <span>CTR: <strong>{variant.ctr}</strong></span>
                        <span>CR: <strong>{variant.cr}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">Данные по вариантам отсутствуют.</div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Guardrails</p>
              <ul className="flex flex-col gap-1">
                {selected.guardrails.map((guardrail) => (
                  <li key={guardrail} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4DB8] mt-1.5 flex-shrink-0" />
                    {guardrail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
