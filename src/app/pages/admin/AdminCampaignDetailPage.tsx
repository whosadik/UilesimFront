import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router';
import { ChevronLeft, Save, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { createCampaign, getCampaign, patchCampaign } from '../../../shared/api/adminCampaigns';

/**
 * DEV NOTES:
 * Endpoint: GET /api/admin/campaigns/{id}
 * Update: PATCH /api/admin/campaigns/{id} (manage_campaigns)
 * Publish: POST /api/admin/campaigns/{id}/publish (manage_campaigns)
 * Body: { name, budget, start, end, targeting, promo_text, banner_url }
 * Response: { ok: true, campaign: {...} }
 * Errors: 401, 403, 404, 422 (validation), 500
 */

const DEFAULT_CAMPAIGN_FORM = {
  id: 'new',
  name: '',
  status: 'draft',
  start: '',
  end: '',
  budget: '0',
  categories: [] as string[],
  product_types: [] as string[],
  tiers: [] as string[],
  promo_text: '',
};

export default function AdminCampaignDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [form, setForm] = useState(DEFAULT_CAMPAIGN_FORM);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  const parseCampaign = (
    response: Record<string, unknown> | { ok?: boolean; campaign?: Record<string, unknown> },
  ) => {
    const source =
      response && typeof response === 'object' && 'campaign' in response
        ? ((response as { campaign?: Record<string, unknown> }).campaign ?? {})
        : response;

    const budget = Number((source as Record<string, unknown>).weekly_limit ?? 0);
    const categories = (source as Record<string, unknown>).allowed_categories;
    const steps = (source as Record<string, unknown>).allowed_steps;

    return {
      id: String((source as Record<string, unknown>).id ?? id ?? DEFAULT_CAMPAIGN_FORM.id),
      name: String((source as Record<string, unknown>).name ?? DEFAULT_CAMPAIGN_FORM.name),
      status: (source as Record<string, unknown>).is_active ? 'active' : 'draft',
      start: String((source as Record<string, unknown>).week_start_date ?? DEFAULT_CAMPAIGN_FORM.start),
      end: DEFAULT_CAMPAIGN_FORM.end,
      budget: String(Number.isFinite(budget) ? budget : 0),
      categories: Array.isArray(categories) ? categories.map((item) => String(item)) : DEFAULT_CAMPAIGN_FORM.categories,
      product_types: Array.isArray(steps) ? steps.map((item) => String(item)) : DEFAULT_CAMPAIGN_FORM.product_types,
      tiers: DEFAULT_CAMPAIGN_FORM.tiers,
      promo_text:
        typeof (source as Record<string, unknown>).promo_text === 'string'
          ? ((source as Record<string, unknown>).promo_text as string)
          : DEFAULT_CAMPAIGN_FORM.promo_text,
    };
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    if (!id || id === 'new') {
      return;
    }

    let cancelled = false;

    const loadCampaign = async () => {
      try {
        const response = await getCampaign(id);
        if (cancelled) {
          return;
        }
        if (response && typeof response === 'object') {
          setForm(parseCampaign(response as Record<string, unknown>));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    };

    loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthLoading, location.pathname, navigate, user]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setValidationError('Название кампании обязательно');
      return;
    }
    if (!form.budget || isNaN(+form.budget)) {
      setValidationError('Введите корректный бюджет');
      return;
    }
    setValidationError('');
    setSaving(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      is_active: form.status === 'active',
      weekly_limit: String(form.budget),
      week_start_date: form.start || null,
      allowed_categories: form.categories,
      allowed_steps: form.product_types,
    };

    try {
      if (!id || id === 'new') {
        const created = await createCampaign(payload);
        toast.success('Кампания сохранена');

        if (created && typeof created === 'object') {
          const createdCampaign =
            'campaign' in created
              ? (created as { campaign?: { id?: number | string } }).campaign
              : (created as { id?: number | string });

          const createdId = createdCampaign?.id;
          if (createdId !== undefined && createdId !== null) {
            navigate(`/admin/campaigns/${createdId}`, { replace: true });
          }
        }
        return;
      }

      const updated = await patchCampaign(id, payload);
      if (updated && typeof updated === 'object') {
        setForm(parseCampaign(updated as Record<string, unknown>));
      }
      toast.success('Кампания сохранена');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      if (error instanceof Error) {
        setValidationError(error.message);
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    toast.error('Публикация пока не доступна в API.');
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/campaigns" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900 text-xl">{form.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Опубликовать
          </button>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Название</label>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Статус</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Начало</label>
              <input type="date" value={form.start} onChange={e => update('start', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Конец</label>
              <input type="date" value={form.end} onChange={e => update('end', e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-gray-500 font-medium">Бюджет (₸)</label>
              <input
                type="number"
                value={form.budget}
                onChange={e => update('budget', e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Targeting</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Категория</label>
              <select className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
                <option value="all">Все категории</option>
                <option value="face">Уход за лицом</option>
                <option value="makeup">Декоративная</option>
                <option value="body">Уход за телом</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Тир лояльности</label>
              <div className="flex items-center gap-2 flex-wrap">
                {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
                  <label key={tier} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={form.tiers.includes(tier)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span className="text-sm text-gray-700">{tier}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Creative */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Creative</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Promo Text</label>
              <textarea
                value={form.promo_text}
                onChange={e => update('promo_text', e.target.value)}
                rows={3}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Banner</label>
              <div className="h-28 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400">
                Загрузить баннер (mock)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
