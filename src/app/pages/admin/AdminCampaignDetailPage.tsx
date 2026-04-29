import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { AlertCircle, ChevronLeft, Info, Pencil, Plus, Save, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/auth/AuthContext';
import { ApiError } from '../../../shared/api/ApiError';
import { type Campaign, createCampaign, getCampaign, patchCampaign, publishCampaign, uploadCampaignBanner } from '../../../shared/api/adminCampaigns';
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../../shared/catalog/presentation';
import {
  type Offer,
  type OfferType,
  type TargetScope,
  createOffer,
  deleteOffer,
  listOffers,
  patchOffer,
} from '../../../shared/api/adminOffers';

const CATEGORY_OPTIONS = [
  { value: 'skincare', label: formatCatalogCategoryLabel('skincare', 'ru') ?? 'skincare' },
  { value: 'makeup', label: formatCatalogCategoryLabel('makeup', 'ru') ?? 'makeup' },
  { value: 'haircare', label: formatCatalogCategoryLabel('haircare', 'ru') ?? 'haircare' },
  { value: 'fragrance', label: formatCatalogCategoryLabel('fragrance', 'ru') ?? 'fragrance' },
];

const STEP_OPTIONS = [
  { value: 'cleanser', label: formatCatalogProductTypeLabel('cleanser', 'ru') ?? 'cleanser' },
  { value: 'serum', label: formatCatalogProductTypeLabel('serum', 'ru') ?? 'serum' },
  { value: 'moisturizer', label: formatCatalogProductTypeLabel('moisturizer', 'ru') ?? 'moisturizer' },
  { value: 'spf', label: formatCatalogProductTypeLabel('spf', 'ru') ?? 'spf' },
  { value: 'conditioner', label: formatCatalogProductTypeLabel('conditioner', 'ru') ?? 'conditioner' },
  { value: 'hair_mask', label: formatCatalogProductTypeLabel('hair_mask', 'ru') ?? 'hair_mask' },
  { value: 'lipstick', label: formatCatalogProductTypeLabel('lipstick', 'ru') ?? 'lipstick' },
  { value: 'mascara', label: formatCatalogProductTypeLabel('mascara', 'ru') ?? 'mascara' },
  { value: 'edt', label: formatCatalogProductTypeLabel('edt', 'ru') ?? 'edt' },
  { value: 'body_mist', label: formatCatalogProductTypeLabel('body_mist', 'ru') ?? 'body_mist' },
];

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  discount: 'Скидка (%)',
  points_multiplier: 'Множитель баллов (×N)',
  gift: 'Подарок',
};

const TARGET_SCOPE_LABEL: Record<TargetScope, string> = {
  cart: 'На всю корзину',
  category: 'На категорию',
  product_type: 'На тип товара',
  product_id: 'На конкретный товар',
};

type CampaignFormState = {
  id: string;
  name: string;
  status: 'draft' | 'active';
  start: string;
  end: string;
  budget: string;
  categories: string[];
  productTypes: string[];
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
  const status: CampaignFormState['status'] = isActive ? 'active' : 'draft';

  return {
    id: String(source.id ?? fallbackId ?? DEFAULT_CAMPAIGN_FORM.id),
    name: String(source.name ?? DEFAULT_CAMPAIGN_FORM.name),
    status,
    start: typeof source.start_date === 'string' ? source.start_date : '',
    end: typeof source.end_date === 'string' ? source.end_date : '',
    budget,
    categories: asArrayOfStrings(source.allowed_categories),
    productTypes: asArrayOfStrings(source.allowed_steps),
    promoText: typeof source.promo_text === 'string' ? source.promo_text : '',
    bannerUrl: typeof source.banner_url === 'string' ? source.banner_url : '',
  };
}

function toggleArrayValue(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-gray-500 leading-relaxed">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
      <span>{children}</span>
    </p>
  );
}

type OfferDraft = {
  id?: number;
  name: string;
  offer_type: OfferType;
  value: string;
  target_scope: TargetScope;
  allowed_categories: string[];
  allowed_product_types: string[];
  estimated_cost: string;
  cooldown_days: string;
  expires_in_days: string;
  is_active: boolean;
};

const EMPTY_OFFER: OfferDraft = {
  name: '',
  offer_type: 'discount',
  value: '10',
  target_scope: 'cart',
  allowed_categories: [],
  allowed_product_types: [],
  estimated_cost: '0',
  cooldown_days: '14',
  expires_in_days: '7',
  is_active: true,
};

function offerToDraft(offer: Offer): OfferDraft {
  return {
    id: offer.id,
    name: offer.name,
    offer_type: offer.offer_type,
    value: String(offer.value ?? '0'),
    target_scope: offer.target_scope,
    allowed_categories: asArrayOfStrings(offer.allowed_categories),
    allowed_product_types: asArrayOfStrings(offer.allowed_product_types),
    estimated_cost: String(offer.estimated_cost ?? '0'),
    cooldown_days: String(offer.cooldown_days ?? 14),
    expires_in_days: String(offer.expires_in_days ?? 7),
    is_active: Boolean(offer.is_active),
  };
}

function draftToPayload(draft: OfferDraft, campaignId: number) {
  return {
    campaign: campaignId,
    name: draft.name.trim(),
    offer_type: draft.offer_type,
    value: Number(draft.value) || 0,
    target_scope: draft.target_scope,
    allowed_categories: draft.allowed_categories,
    allowed_product_types: draft.allowed_product_types,
    estimated_cost: Number(draft.estimated_cost) || 0,
    cooldown_days: Number(draft.cooldown_days) || 0,
    expires_in_days: Number(draft.expires_in_days) || 7,
    is_active: draft.is_active,
  };
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

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerDraft, setOfferDraft] = useState<OfferDraft | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const campaignIdNum = useMemo(() => {
    const n = Number(form.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [form.id]);

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
      setOffers([]);
      return;
    }

    let cancelled = false;

    const loadCampaign = async () => {
      setLoading(true);
      setValidationError('');

      try {
        const response = await getCampaign(id);
        if (cancelled) return;
        setForm(parseCampaignPayload(response as Record<string, unknown>, String(id)));

        const list = await listOffers({ campaign_id: id });
        if (cancelled) return;
        setOffers(list);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        toast.error(error instanceof Error ? error.message : 'Failed to load campaign.');
      } finally {
        if (!cancelled) setLoading(false);
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

  const validateForm = () => {
    if (!form.name.trim()) return 'Укажите название кампании.';
    if (!form.budget.trim() || Number.isNaN(Number(form.budget))) return 'Бюджет должен быть числом.';
    if (form.start && form.end && form.end < form.start) return 'Дата окончания раньше даты начала.';
    return '';
  };

  const buildPayload = (): Record<string, unknown> => ({
    name: form.name.trim(),
    is_active: form.status === 'active',
    weekly_limit: String(Number(form.budget) || 0),
    start_date: form.start || null,
    end_date: form.end || null,
    allowed_categories: form.categories,
    allowed_steps: form.productTypes,
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

    try {
      if (!id || id === 'new') {
        const created = await createCampaign(buildPayload());
        const createdForm = parseCampaignPayload(created as Record<string, unknown>);
        toast.success('Кампания создана.');

        if (createdForm.id && createdForm.id !== 'new') {
          navigate(`/admin/campaigns/${createdForm.id}`, { replace: true });
        }
        return;
      }

      const updated = await patchCampaign(id, buildPayload());
      setForm(parseCampaignPayload(updated as Record<string, unknown>, String(id)));
      toast.success('Сохранено.');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const message = error instanceof Error ? error.message : 'Не удалось сохранить.';
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id || id === 'new') {
      toast.error('Сначала сохраните кампанию.');
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      const response = await publishCampaign(id);
      setForm(parseCampaignPayload(response as Record<string, unknown>, String(id)));
      toast.success('Кампания запущена.');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const message = error instanceof Error ? error.message : 'Не удалось запустить кампанию.';
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const refreshOffers = async () => {
    if (!id || id === 'new') return;
    try {
      const list = await listOffers({ campaign_id: id });
      setOffers(list);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleAddOffer = () => {
    setOfferDraft({ ...EMPTY_OFFER });
  };

  const handleEditOffer = (offer: Offer) => {
    setOfferDraft(offerToDraft(offer));
  };

  const handleSaveOffer = async () => {
    if (!offerDraft || !campaignIdNum) return;
    if (!offerDraft.name.trim()) {
      toast.error('Укажите название оффера.');
      return;
    }

    setOfferSaving(true);
    try {
      const payload = draftToPayload(offerDraft, campaignIdNum);
      if (offerDraft.id) {
        await patchOffer(offerDraft.id, payload);
        toast.success('Оффер обновлён.');
      } else {
        await createOffer(payload);
        toast.success('Оффер создан.');
      }
      setOfferDraft(null);
      await refreshOffers();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setOfferSaving(false);
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!confirm(`Удалить оффер «${offer.name}»? Он будет деактивирован.`)) return;
    try {
      await deleteOffer(offer.id);
      toast.success('Оффер удалён.');
      await refreshOffers();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const isNew = !id || id === 'new';

  const handleBannerFile = async (file: File) => {
    if (!campaignIdNum) {
      toast.error('Сохраните кампанию перед загрузкой файла.');
      return;
    }
    setBannerUploading(true);
    try {
      const res = await uploadCampaignBanner(campaignIdNum, file);
      const updated =
        res && typeof res === 'object' && 'campaign' in res && res.campaign
          ? (res.campaign as Campaign)
          : (res as unknown as Campaign);
      const nextUrl = typeof updated?.banner_url === 'string' ? updated.banner_url : '';
      updateField('bannerUrl', nextUrl);
      toast.success('Баннер загружен.');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setBannerUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/campaigns"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-xl truncate">
            {form.name || (isNew ? 'Новая кампания' : `Кампания ${id}`)}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{isNew ? 'Черновик' : `ID: ${id}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || loading || isNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Запустить
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-900 leading-relaxed">
        <p className="font-medium mb-1">Как работает кампания</p>
        <p>
          Кампания — это <b>бюджет + фильтры таргетинга</b>. Сами скидки (процент, множитель баллов или подарок)
          задаются в блоке <b>«Офферы»</b> ниже. Каждому пользователю система подбирает один подходящий оффер из
          активных кампаний и применяет его в чекауте; из бюджета кампании списывается <code>estimated_cost</code>{' '}
          оффера.
        </p>
      </div>

      {validationError ? (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Основное</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">Название</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="например, spring_sale_2026"
              />
              <Hint>
                Внутреннее имя. Для «системных» кампаний важно использовать канонические имена
                (<code>fragrance_crosssell</code>, <code>skincare_retention</code>, <code>makeup_push</code>,{' '}
                <code>default</code>, <code>onboarding_first_order</code>, <code>winback_30d</code>,{' '}
                <code>favorite_category</code>) — они имеют приоритетный роутинг. Любое другое имя работает как
                обычная кампания по приоритету.
              </Hint>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Статус</label>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as CampaignFormState['status'])}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">Черновик</option>
                <option value="active">Активна</option>
              </select>
              <Hint>Только активные кампании участвуют в выдаче офферов пользователям.</Hint>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Недельный бюджет (₸)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <Hint>
                Максимум, который кампания потратит за неделю. Счётчик <code>weekly_spent</code> сбрасывается
                автоматически каждый понедельник.
              </Hint>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Дата начала</label>
              <input
                type="date"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
              <Hint>Пусто = без ограничения. До этой даты кампания не будет выбрана для пользователей.</Hint>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Дата окончания</label>
              <input
                type="date"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
              <Hint>Пусто = без ограничения. После этой даты кампания перестаёт выдаваться.</Hint>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Таргетинг</h2>
          <p className="text-xs text-gray-500 mb-4">
            Фильтры применяются к контексту пользователя (просмотренные товары, рутина). Если контекст пересекается с
            выбранными категориями/шагами — кампания допускается к выдаче. Пусто = без ограничений.
          </p>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">Категории</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                  >
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
              <label className="text-xs text-gray-500 font-medium">Шаги рутины / типы товаров</label>
              <div className="flex flex-wrap gap-2">
                {STEP_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                  >
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
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Креатив (для баннера)</h2>
          <p className="text-xs text-gray-500 mb-4">
            Текст и URL баннера — опциональные поля, используются фронтом для промо-блока (если подключен).
          </p>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Текст промо</label>
              <textarea
                value={form.promoText}
                onChange={(event) => updateField('promoText', event.target.value)}
                rows={3}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">Баннер</label>
              <input
                type="url"
                value={form.bannerUrl}
                onChange={(event) => updateField('bannerUrl', event.target.value)}
                placeholder="https://cdn.example.com/campaigns/banner.jpg"
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <div className="flex items-center gap-3">
                <label
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                    isNew || bannerUploading
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    disabled={isNew || bannerUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) void handleBannerFile(file);
                    }}
                  />
                  {bannerUploading ? 'Загружаем...' : 'Загрузить файл'}
                </label>
                {isNew && (
                  <span className="text-xs text-gray-400">Сохраните кампанию, чтобы загрузить файл.</span>
                )}
                {form.bannerUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('bannerUrl', '')}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Очистить
                  </button>
                )}
              </div>
              {form.bannerUrl && (
                <div className="mt-1 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-xs">
                  <img
                    src={form.bannerUrl}
                    alt="Банер"
                    className="w-full h-32 object-cover"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-gray-400">PNG / JPEG / WebP / GIF, до 5 МБ.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Офферы (скидки)</h2>
            <button
              onClick={handleAddOffer}
              disabled={isNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить оффер
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Каждый оффер — это конкретная скидка/бонус. Пользователю выдаётся <b>один</b> оффер из кампании,
            соответствующий его контексту. Без офферов кампания ничего не даст пользователю.
          </p>

          {isNew ? (
            <div className="text-sm text-gray-500 italic">Сохраните кампанию, чтобы добавить офферы.</div>
          ) : offers.length === 0 ? (
            <div className="text-sm text-gray-500 italic">Офферов пока нет.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="py-2 font-medium">Название</th>
                    <th className="py-2 font-medium">Тип</th>
                    <th className="py-2 font-medium">Значение</th>
                    <th className="py-2 font-medium">Куда</th>
                    <th className="py-2 font-medium">Est. cost</th>
                    <th className="py-2 font-medium">Статус</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-900">{offer.name}</td>
                      <td className="py-2.5 text-gray-700">{OFFER_TYPE_LABEL[offer.offer_type]}</td>
                      <td className="py-2.5 text-gray-700">
                        {offer.offer_type === 'discount'
                          ? `${offer.value}%`
                          : offer.offer_type === 'points_multiplier'
                            ? `×${offer.value}`
                            : String(offer.value)}
                      </td>
                      <td className="py-2.5 text-gray-700">{TARGET_SCOPE_LABEL[offer.target_scope]}</td>
                      <td className="py-2.5 text-gray-700">{offer.estimated_cost} ₸</td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${
                            offer.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {offer.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Редактировать"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer)}
                            className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {offerDraft ? (
        <OfferEditorModal
          draft={offerDraft}
          saving={offerSaving}
          onChange={setOfferDraft}
          onCancel={() => setOfferDraft(null)}
          onSave={handleSaveOffer}
        />
      ) : null}
    </div>
  );
}

function OfferEditorModal({
  draft,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: OfferDraft;
  saving: boolean;
  onChange: (draft: OfferDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const update = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const toggleCat = (value: string) => {
    update('allowed_categories', toggleArrayValue(draft.allowed_categories, value));
  };
  const togglePT = (value: string) => {
    update('allowed_product_types', toggleArrayValue(draft.allowed_product_types, value));
  };

  const showCategoryPicker = draft.target_scope !== 'cart';
  const showProductTypePicker =
    draft.target_scope === 'product_type' || draft.target_scope === 'product_id';

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-xl my-10 shadow-xl">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{draft.id ? 'Редактировать оффер' : 'Новый оффер'}</h3>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Название</label>
            <input
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="например, 10% на парфюм"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Тип</label>
              <select
                value={draft.offer_type}
                onChange={(e) => update('offer_type', e.target.value as OfferType)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="discount">Скидка (%)</option>
                <option value="points_multiplier">Множитель баллов (×N)</option>
                <option value="gift">Подарок</option>
              </select>
              <Hint>
                Скидка = процент от суммы товаров, подпадающих под scope. Множитель баллов — начисление ×N. Подарок
                — чисто флаг, стоимость только в Est. cost.
              </Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {draft.offer_type === 'discount' ? 'Процент скидки' : draft.offer_type === 'points_multiplier' ? 'Множитель' : 'Значение'}
              </label>
              <input
                type="number"
                value={draft.value}
                onChange={(e) => update('value', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">На что применяется (scope)</label>
            <select
              value={draft.target_scope}
              onChange={(e) => update('target_scope', e.target.value as TargetScope)}
              className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="cart">На всю корзину</option>
              <option value="category">На категорию</option>
              <option value="product_type">На тип товара</option>
              <option value="product_id">На конкретный товар (подбирается системой)</option>
            </select>
            <Hint>
              Scope определяет, как скидка применяется в чекауте. Для category/product_type/product_id укажите
              разрешённые категории/типы ниже.
            </Hint>
          </div>

          {showCategoryPicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">Разрешённые категории</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_categories.includes(o.value)}
                      onChange={() => toggleCat(o.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {showProductTypePicker ? (
            <div>
              <label className="text-xs text-gray-500 font-medium">Разрешённые типы товаров</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {STEP_OPTIONS.map((o) => (
                  <label key={o.value} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.allowed_product_types.includes(o.value)}
                      onChange={() => togglePT(o.value)}
                      className="w-4 h-4 rounded accent-gray-900"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Est. cost (₸)</label>
              <input
                type="number"
                value={draft.estimated_cost}
                onChange={(e) => update('estimated_cost', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Сколько списывается из бюджета кампании при выдаче.</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Cooldown (дней)</label>
              <input
                type="number"
                value={draft.cooldown_days}
                onChange={(e) => update('cooldown_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Не выдавать тот же оффер этому пользователю N дней после погашения.</Hint>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Срок жизни (дней)</label>
              <input
                type="number"
                value={draft.expires_in_days}
                onChange={(e) => update('expires_in_days', e.target.value)}
                className="mt-1 w-full h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <Hint>Через сколько дней назначение сгорит, если не погашено.</Hint>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span>Активен</span>
          </label>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
