import { useEffect, useMemo, useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import {
  type AdminAuditItem,
  buildAdminAuditExportCsvUrl,
  getAdminAudit,
} from '../../../shared/api/adminTools';
import { ErrorState } from '../../components/ErrorState';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  details: Record<string, unknown>;
};

const actionColors: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700',
  publish: 'bg-blue-50 text-blue-700',
  start: 'bg-blue-50 text-blue-700',
  update: 'bg-amber-50 text-amber-700',
  ban: 'bg-red-50 text-red-700',
  invalidate: 'bg-orange-50 text-orange-700',
  retrain: 'bg-purple-50 text-purple-700',
};

function getActionColor(action: string) {
  const verb = action.split('.')[1] || '';
  return actionColors[verb] || 'bg-gray-100 text-gray-600';
}

const toIsoFromDate = (date: string, endOfDay = false): string | undefined => {
  if (!date) {
    return undefined;
  }

  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`;
};

const mapAuditItemToEntry = (item: AdminAuditItem): AuditEntry => ({
  id: String(item.id),
  actor: item.user_id !== null ? `user:${item.user_id}` : 'system',
  action: item.action || 'unknown',
  entity_type: item.entity_type || '—',
  entity_id: item.entity_id || '—',
  timestamp: item.created_at,
  details: item.meta && typeof item.meta === 'object' ? item.meta : {},
});

export default function AdminAuditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [actorId, setActorId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      user_id: actorId.trim() ? Number(actorId.trim()) : undefined,
      entity_type: entityType || undefined,
      entity_id: search.trim() || undefined,
      since: toIsoFromDate(dateFrom),
      until: toIsoFromDate(dateTo, true),
    }),
    [actorId, dateFrom, dateTo, entityType, page, pageSize, search],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    let cancelled = false;

    const loadAudit = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await getAdminAudit(queryParams);
        if (cancelled) {
          return;
        }

        const mapped = Array.isArray(response.results)
          ? response.results.map(mapAuditItemToEntry)
          : [];

        setEntries(mapped);
        setTotalCount(Number(response.count) || 0);
        setSelected((current) => {
          if (!current) {
            return null;
          }
          return mapped.find((item) => item.id === current.id) || null;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        setEntries([]);
        setTotalCount(0);
        setLoadError('Не удалось загрузить журнал аудита. Попробуйте ещё раз.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAudit();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, location.pathname, navigate, queryParams, reloadKey, user]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleExport = () => {
    const url = buildAdminAuditExportCsvUrl(queryParams);
    window.location.href = url;
  };

  const onPageSizeChange = (value: number) => {
    setPage(1);
    setPageSize(value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Audit Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalCount} записей</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            export.csv
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-36">
            <label className="text-xs text-gray-500">Поиск по entity_id</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="entity_id"
                className="pl-8 pr-3 h-9 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">User ID</label>
            <input
              value={actorId}
              onChange={(event) => {
                setActorId(event.target.value.replace(/[^\d]/g, ''));
                setPage(1);
              }}
              placeholder="1"
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-44"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Тип сущности</label>
            <select
              value={entityType}
              onChange={(event) => {
                setEntityType(event.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            >
              <option value="">Все типы</option>
              <option>Campaign</option>
              <option>Cache</option>
              <option>Offer</option>
              <option>Experiment</option>
              <option>Product</option>
              <option>User</option>
              <option>Model</option>
              <option>Transaction</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Дата от</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Дата до</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16">
            <LoadingSpinner text="Загружаем журнал аудита..." />
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-gray-200 bg-white">
            <ErrorState
              title="Не удалось загрузить журнал аудита"
              description={loadError}
              onRetry={() => setReloadKey((value) => value + 1)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelected(entry)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{entry.id}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.actor}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{entry.entity_type}</span>
                        <span className="ml-1.5 text-xs text-gray-400 font-mono">{entry.entity_id}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(entry.timestamp).toLocaleString('ru')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                      По заданным фильтрам записей нет.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                Показывать:
                <select
                  value={pageSize}
                  onChange={(event) => onPageSizeChange(Number(event.target.value))}
                  className="h-7 px-2 border border-gray-200 rounded-md bg-white text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                записей
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-gray-600">Стр. {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 h-fit sticky top-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{selected.action}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{selected.id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Actor</p>
                <p className="text-gray-800 font-medium">{selected.actor}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Entity</p>
                <p className="text-gray-800 font-medium">{selected.entity_type}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Entity ID</p>
                <p className="text-gray-800 font-mono">{selected.entity_id}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Time</p>
                <p className="text-gray-800">{new Date(selected.timestamp).toLocaleString('ru')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Details (JSON)</p>
              <pre className="bg-gray-950 text-emerald-400 text-xs p-3 rounded-lg overflow-auto max-h-64 font-mono leading-relaxed">
                {JSON.stringify(selected.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
