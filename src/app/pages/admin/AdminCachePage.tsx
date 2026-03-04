import { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../../components/ConfirmModal';

/**
 * DEV NOTES:
 * Endpoint: POST /api/admin/cache/invalidate
 * Permission: invalidate_cache
 * Body: { scope: "product"|"user"|"recs"|"all", key?: string }
 * Response: { ok: true, invalidated_keys: number }
 * Errors: 401, 403, 500
 */

interface LogEntry {
  id: number;
  scope: string;
  key: string;
  status: 'success' | 'error';
  message: string;
  time: string;
}

const scopeOptions = [
  { value: 'product', label: 'Product catalog' },
  { value: 'user', label: 'User profiles' },
  { value: 'recs', label: 'Recommendations' },
  { value: 'offers', label: 'Offers' },
  { value: 'all', label: 'All caches' },
];

export default function AdminCachePage() {
  const [scope, setScope] = useState('product');
  const [key, setKey] = useState('');
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const handleInvalidate = () => {
    setIsInvalidating(true);
    setShowConfirm(false);
    // TODO: POST /api/admin/cache/invalidate
    setTimeout(() => {
      setIsInvalidating(false);
      const success = Math.random() > 0.15;
      const entry: LogEntry = {
        id: Date.now(),
        scope,
        key: key || '(все ключи)',
        status: success ? 'success' : 'error',
        message: success ? `Инвалидировано: ${Math.floor(Math.random() * 500 + 50)} ключей` : 'Internal server error (500)',
        time: new Date().toLocaleTimeString('ru'),
      };
      setLog(l => [entry, ...l]);
      if (success) {
        toast.success(`Cache ${scope} инвалидирован`);
      } else {
        toast.error('Ошибка инвалидации кэша');
      }
    }, 1200);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-semibold text-gray-900 text-xl">Cache Invalidation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Управление кэшем платформы</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Параметры инвалидации</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Scope</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {scopeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScope(opt.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                    scope === opt.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Конкретный ключ <span className="text-gray-400">(необязательно)</span>
            </label>
            <input
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="e.g. product:441, user:3312"
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 font-mono"
            />
          </div>

          {scope === 'all' && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Инвалидация всего кэша может временно снизить производительность платформы.
            </div>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isInvalidating}
            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isInvalidating ? 'Инвалидация...' : 'Инвалидировать'}
          </button>
        </div>
      </div>

      {/* Result Log */}
      {log.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Лог результатов</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {log.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                {entry.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-mono font-medium">{entry.scope}</span>
                    {' · '}
                    <span className="text-gray-500 font-mono text-xs">{entry.key}</span>
                  </p>
                  <p className={`text-xs ${entry.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {entry.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={scope === 'all' ? 'Инвалидировать весь кэш?' : `Инвалидировать cache: ${scope}?`}
        description={
          scope === 'all'
            ? 'Это удалит все кэшированные данные. Производительность может временно снизиться.'
            : `Будет инвалидирован scope "${scope}"${key ? ` по ключу "${key}"` : ''}.`
        }
        confirmLabel="Инвалидировать"
        cancelLabel="Отмена"
        onConfirm={handleInvalidate}
        variant="danger"
        isLoading={isInvalidating}
      />
    </div>
  );
}
