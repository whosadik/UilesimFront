import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { AlertCircle, ChevronLeft, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { type Campaign, createCampaign, getCampaign, patchCampaign, publishCampaign } from '../../../shared/api/adminCampaigns';

const CATEGORY_OPTIONS = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'haircare', label: 'Haircare' },
  { value: 'fragrance', label: 'Fragrance' },
];

const STEP_OPTIONS = [
  { value: 'cleanser', label: 'Cleanser' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturizer' },
  { value: 'spf', label: 'SPF' },
  { value: 'conditioner', label: 'Conditioner' },
  { value: 'hair_mask', label: 'Hair mask' },
  { value: 'lipstick', label: 'Lipstick' },
  { value: 'mascara', label: 'Mascara' },
  { value: 'edt', label: 'EDT' },
  { value: 'body_mist', label: 'Body mist' },
];

const TIER_OPTIONS = ['Bronze', 'Silver', 'Gold', 'Platinum'];

type CampaignFormState = {
  id: string;
  name: string;
  status: 'draft' | 'active';
  start: string;
  end: string;
  budget: string;
  categories: string[];
  productTypes: string[];
  tiers: string[];
  promoText: string;
  bannerUrl: string;
};

const DEFAULT_CAMPAIGN_FORM: CampaignFormState = {
  id: 'new',
  name: '',
  status: 'draft',
  start: '',
  end: '',
  budget: '0',
  categories: [],
  productTypes: [],
  tiers: [],
  promoText: '',
  bannerUrl: '',
};

function asArrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function parseCampaignPayload(
  response: Record<string, unknown> | { ok?: boolean; campaign?: Campaign } | Campaign,
  fallbackId?: string,
): CampaignFormState {
  const source =
    response && typeof response === 'object' && 'campaign' in response
      ? (((response as { campaign?: Campaign }).campaign ?? {}) as Record<string, unknown>)
      : (response as Record<string, unknown>);

  const budgetRaw = source.weekly_limit;
  const budget = typeof budgetRaw === 'number' || typeof budgetRaw === 'string' ? String(budgetRaw) : '0';
  const isActive = Boolean(source.is_active);
  const priority = Number(source.priority ?? 100);
  const status: CampaignFormState['status'] = isActive ? 'active' : 'draft';

  return {
    id: String(source.id ?? fallbackId ?? DEFAULT_CAMPAIGN_FORM.id),
    name: String(source.name ?? DEFAULT_CAMPAIGN_FORM.name),
    status,
    start: typeof source.week_start_date === 'string' ? source.week_start_date : '',
    end: typeof source.end_date === 'string' ? source.end_date : '',
    budget,
    categories: asArrayOfStrings(source.allowed_categories),
    productTypes: asArrayOfStrings(source.allowed_steps),
    tiers: asArrayOfStrings(source.tiers),
    promoText: typeof source.promo_text === 'string' ? source.promo_text : '',
    bannerUrl: typeof source.banner_url === 'string' ? source.banner_url : '',
  };
}

function toggleArrayValue(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export default function AdminCampaignDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [form, setForm] = useState<CampaignFormState>(DEFAULT_CAMPAIGN_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    if (!id || id === 'new') {
      setForm(DEFAULT_CAMPAIGN_FORM);
      return;
    }

    let cancelled = false;

    const loadCampaign = async () => {
      setLoading(true);
      setValidationError('');

      try {
        const response = await getCampaign(id);
        if (!cancelled) {
          setForm(parseCampaignPayload(response as Record<string, unknown>, String(id)));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        toast.error(error instanceof Error ? error.message : 'Failed to load campaign.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthLoading, location.pathname, navigate, user]);

  const updateField = <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCategory = (value: string) => {
    setForm((current) => ({ ...current, categories: toggleArrayValue(current.categories, value) }));
  };

  const toggleProductType = (value: string) => {
    setForm((current) => ({ ...current, productTypes: toggleArrayValue(current.productTypes, value) }));
  };

  const toggleTier = (value: string) => {
    setForm((current) => ({ ...current, tiers: toggleArrayValue(current.tiers, value) }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return 'Campaign name is required.';
    }

    if (!form.budget.trim() || Number.isNaN(Number(form.budget))) {
      return 'Budget must be a valid number.';
    }

    if (form.start && form.end && form.end < form.start) {
      return 'End date cannot be earlier than start date.';
    }

    return '';
  };

  const buildPayload = (): Record<string, unknown> => ({
    name: form.name.trim(),
    is_active: form.status === 'active',
    weekly_limit: String(Number(form.budget) || 0),
    week_start_date: form.start || null,
    end_date: form.end || null,
    allowed_categories: form.categories,
    allowed_steps: form.productTypes,
    tiers: form.tiers,
    promo_text: form.promoText.trim(),
    banner_url: form.bannerUrl.trim(),
  });

  const handleSave = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      setValidationError(errorMessage);
      return;
    }

    setSaving(true);
    setValidationError('');
    const payload = buildPayload();

    try {
      if (!id || id === 'new') {
        const created = await createCampaign(payload);
        const createdForm = parseCampaignPayload(created as Record<string, unknown>);
        toast.success('Campaign saved.');

        if (createdForm.id && createdForm.id !== 'new') {
          navigate(`/admin/campaigns/${createdForm.id}`, { replace: true });
        }
        return;
      }

      const updated = await patchCampaign(id, payload);
      setForm(parseCampaignPayload(updated as Record<string, unknown>, String(id)));
      toast.success('Campaign saved.');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to save campaign.';
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id || id === 'new') {
      toast.error('Save the campaign before publishing it.');
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      const response = await publishCampaign(id);
      setForm(parseCampaignPayload(response as Record<string, unknown>, String(id)));
      toast.success('Campaign published.');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to publish campaign.';
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/campaigns"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-xl truncate">
            {form.name || (id === 'new' || !id ? 'New Campaign' : `Campaign ${id}`)}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{id ?? 'new'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      {validationError ? (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Name</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as CampaignFormState['status'])}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Start date</label>
              <input
                type="date"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">End date</label>
              <input
                type="date"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">Weekly budget (KZT)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Targeting</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.categories.includes(option.value)}
                      onChange={() => toggleCategory(option.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">Product types / steps</label>
              <div className="flex flex-wrap gap-2">
                {STEP_OPTIONS.map((option) => (
                  <label key={option.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.productTypes.includes(option.value)}
                      onChange={() => toggleProductType(option.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">Loyalty tiers</label>
              <div className="flex flex-wrap gap-2">
                {TIER_OPTIONS.map((tier) => (
                  <label key={tier} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.tiers.includes(tier)}
                      onChange={() => toggleTier(tier)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{tier}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Creative</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Promo text</label>
              <textarea
                value={form.promoText}
                onChange={(event) => updateField('promoText', event.target.value)}
                rows={3}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Banner URL</label>
              <input
                type="url"
                value={form.bannerUrl}
                onChange={(event) => updateField('bannerUrl', event.target.value)}
                placeholder="https://cdn.example.com/campaigns/banner.jpg"
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
            <div className="h-28 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center px-4 text-center text-sm text-gray-500">
              {form.bannerUrl.trim() ? form.bannerUrl : 'Banner preview uses the URL from the API. Upload is not implemented.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
