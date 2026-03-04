import { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/audit
 * Params: { page, page_size, date_from, date_to, actor, action, entity_type, search_id }
 * Permission: view_audit
 * Response: { results: [...], count: number, next, previous }
 * Export: GET /api/admin/audit/export.csv
 * Errors: 401, 403, 429, 500
 */

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  details: Record<string, unknown>;
}

const mockEntries: AuditEntry[] = [
  {
    id: 'aud_001',
    actor: 'admin@uilesim.kz',
    action: 'campaign.create',
    entity_type: 'Campaign',
    entity_id: 'cmp_112',
    timestamp: '2026-03-03T12:43:11Z',
    details: { name: 'Spring Launch', budget: 500000, status: 'draft' },
  },
  {
    id: 'aud_002',
    actor: 'moderator@uilesim.kz',
    action: 'cache.invalidate',
    entity_type: 'Cache',
    entity_id: 'product_catalog',
    timestamp: '2026-03-03T11:22:08Z',
    details: { scope: 'product', key: 'product_catalog', success: true },
  },
  {
    id: 'aud_003',
    actor: 'admin@uilesim.kz',
    action: 'offer.publish',
    entity_type: 'Offer',
    entity_id: 'off_089',
    timestamp: '2026-03-03T10:05:33Z',
    details: { offer_name: 'VIP Exclusive', discount: 30, expires_at: '2026-04-01' },
  },
  {
    id: 'aud_004',
    actor: 'admin@uilesim.kz',
    action: 'experiment.start',
    entity_type: 'Experiment',
    entity_id: 'exp_002',
    timestamp: '2026-03-02T16:41:00Z',
    details: { experiment_name: 'Loyalty Points Display', traffic_pct: 30 },
  },
  {
    id: 'aud_005',
    actor: 'moderator@uilesim.kz',
    action: 'product.update',
    entity_type: 'Product',
    entity_id: 'prd_441',
    timestamp: '2026-03-02T14:18:55Z',
    details: { field: 'price', old_value: 12000, new_value: 10800 },
  },
  {
    id: 'aud_006',
    actor: 'admin@uilesim.kz',
    action: 'user.ban',
    entity_type: 'User',
    entity_id: 'usr_3312',
    timestamp: '2026-03-02T09:07:22Z',
    details: { reason: 'Abuse of loyalty points', duration_days: 30 },
  },
  {
    id: 'aud_007',
    actor: 'system',
    action: 'recs.retrain',
    entity_type: 'Model',
    entity_id: 'model_v2',
    timestamp: '2026-03-01T03:00:00Z',
    details: { model_version: 'v2.1.3', samples: 120000, duration_sec: 847 },
  },
];

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

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const filtered = mockEntries.filter((e) => {
    if (actor && !e.actor.includes(actor)) return false;
    if (entityType && e.entity_type !== entityType) return false;
    if (search && !e.entity_id.includes(search) && !e.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Audit Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} записей</p>
          </div>
          <button
            onClick={() => toast.success('Экспорт запущен')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            export.csv
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-36">
            <label className="text-xs text-gray-500">Поиск по ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="entity_id или aud_id"
                className="pl-8 pr-3 h-9 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Actor</label>
            <input
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="admin@..."
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-44"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Тип сущности</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
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
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Дата от</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Дата до</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
          </div>
        </div>

        {/* Table */}
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
              {filtered.slice(0, pageSize).map((entry) => (
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
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              Показывать:
              <select
                value={pageSize}
                onChange={e => setPageSize(+e.target.value)}
                className="h-7 px-2 border border-gray-200 rounded-md bg-white text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              записей
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-600">Стр. {page}</span>
              <button onClick={() => setPage(p => p + 1)} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel - JSON Detail */}
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
