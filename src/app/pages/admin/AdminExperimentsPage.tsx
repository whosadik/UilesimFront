import { useState } from 'react';
import { X, ChevronRight, FlaskConical } from 'lucide-react';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/recs/experiments
 * Permission: view_metrics
 * Response: { experiments: [{ id, name, status, traffic_pct, started_at, variants: [...] }] }
 * Errors: 401, 403, 500
 */

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

const experiments: Experiment[] = [
  {
    id: 1,
    name: 'Personalized Recs v2',
    status: 'running',
    traffic_pct: 50,
    started_at: '2026-02-15',
    description: 'Тест новой модели персонализированных рекомендаций',
    variants: [
      { name: 'Control', traffic: 50, ctr: '3.8%', cr: '1.9%' },
      { name: 'Treatment (v2)', traffic: 50, ctr: '4.6%', cr: '2.4%' },
    ],
    guardrails: ['Session length ≥ baseline', 'Bounce rate ≤ +5%', 'Revenue per user ≥ baseline'],
  },
  {
    id: 2,
    name: 'Loyalty Points Display',
    status: 'running',
    traffic_pct: 30,
    started_at: '2026-02-20',
    description: 'Показ начисляемых баллов на карточке товара',
    variants: [
      { name: 'Control (no badge)', traffic: 70, ctr: '4.1%', cr: '2.0%' },
      { name: 'Treatment (badge)', traffic: 30, ctr: '4.9%', cr: '2.5%' },
    ],
    guardrails: ['CTR ≥ baseline', 'No increase in returns'],
  },
  {
    id: 3,
    name: 'Offer Countdown Timer',
    status: 'completed',
    traffic_pct: 100,
    started_at: '2026-01-10',
    description: 'Таймер обратного отсчёта на странице оффера',
    variants: [
      { name: 'Control', traffic: 50, ctr: '3.5%', cr: '1.7%' },
      { name: 'Treatment (timer)', traffic: 50, ctr: '5.2%', cr: '2.8%' },
    ],
    guardrails: ['CTR ≥ baseline'],
  },
  {
    id: 4,
    name: 'Category Filter UX',
    status: 'draft',
    traffic_pct: 0,
    started_at: '—',
    description: 'Тест нового дизайна фильтров в каталоге',
    variants: [
      { name: 'Control', traffic: 50, ctr: '—', cr: '—' },
      { name: 'Treatment', traffic: 50, ctr: '—', cr: '—' },
    ],
    guardrails: ['Conversion ≥ baseline'],
  },
];

const statusColors: Record<string, string> = {
  running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  draft: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function AdminExperimentsPage() {
  const [selected, setSelected] = useState<Experiment | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6">
      {/* Table */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-semibold text-gray-900 text-xl">Recs Experiments</h1>
            <p className="text-sm text-gray-500 mt-0.5">A/B эксперименты рекомендательной системы</p>
          </div>
        </div>

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
              {experiments.map((exp) => (
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
      </div>

      {/* Detail Drawer */}
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
            {/* Status */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Статус</p>
              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${statusColors[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            {/* Variants */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Варианты</p>
              <div className="flex flex-col gap-2">
                {selected.variants.map((v) => (
                  <div key={v.name} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs font-medium text-gray-900 mb-1.5">{v.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Traffic: <strong>{v.traffic}%</strong></span>
                      <span>CTR: <strong>{v.ctr}</strong></span>
                      <span>CR: <strong>{v.cr}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardrails */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Guardrails</p>
              <ul className="flex flex-col gap-1">
                {selected.guardrails.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4DB8] mt-1.5 flex-shrink-0" />
                    {g}
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
