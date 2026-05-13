import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { AlertCircle, ChevronLeft, Gift, Percent, Save, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../shared/auth/AuthContext';
import { ApiError } from '../../../../shared/api/ApiError';
import {
  type Campaign,
  createCampaign,
  getCampaign,
  patchCampaign,
  publishCampaign,
  uploadCampaignBanner,
} from '../../../../shared/api/adminCampaigns';
import {
  type Offer,
  type OfferType,
  type TargetScope,
  createOffer,
  listOffers,
  patchOffer,
} from '../../../../shared/api/adminOffers';
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATALOG_FORM,
  STEP_OPTIONS,
  buildCatalogCampaignPayload,
  buildCatalogOfferPayload,
  parseCatalogPromotion,
  removeBrand,
  toggleArrayValue,
  type CatalogPromotionForm,
  type PickerKind,
} from './_helpers';
import { BannerUploader, Hint, SelectionField, SelectionPickerModal } from './_components';

const BENEFIT_OPTIONS: { value: OfferType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'discount',
    label: 'Скидка',
    description: 'Процент скидки на товары из акции.',
    icon: <Percent className="w-4 h-4" />,
  },
  {
    value: 'points_multiplier',
    label: 'Бонусы x N',
    description: 'Множитель начисления баллов лояльности.',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: 'gift',
    label: 'Подарок',
    description: 'Подарок к покупке.',
    icon: <Gift className="w-4 h-4" />,
  },
];

const SCOPE_OPTIONS: { value: TargetScope; label: string; hint: string }[] = [
  { value: 'cart', label: 'Вся корзина', hint: 'Применяется ко всем товарам без фильтра.' },
  { value: 'category', label: 'Категория', hint: 'Только товары из выбранных категорий.' },
  { value: 'brand', label: 'Бренд', hint: 'Только товары выбранных брендов.' },
  { value: 'product_type', label: 'Тип товара', hint: 'Только товары определённых типов (тушь, помада, …).' },
  { value: 'product_id', label: 'Конкретные товары', hint: 'Точечный список SKU.' },
];

export default function AdminCatalogPromotionDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [form, setForm] = useState<CatalogPromotionForm>(DEFAULT_CATALOG_FORM);
  const [primaryOfferId, setPrimaryOfferId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [selectorKind, setSelectorKind] = useState<PickerKind | null>(null);

  const isNew = !id || id === 'new';

  const campaignIdNum = useMemo(() => {
    const n = Number(form.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [form.id]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    if (isNew) {
      setForm(DEFAULT_CATALOG_FORM);
      setPrimaryOfferId(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setValidationError('');
      try {
        const response = await getCampaign(id!);
        if (cancelled) return;

        const offers = await listOffers({ campaign_id: id });
        if (cancelled) return;

        const active = offers.find((o) => o.is_active) ?? offers[0] ?? null;
        setPrimaryOfferId(active?.id ?? null);
        setForm(parseCatalogPromotion(response as Record<string, unknown>, String(id), active));
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        toast.error(error instanceof Error ? error.message : 'Не удалось загрузить акцию.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthLoading, isNew, location.pathname, navigate, user]);

  const updateField = <K extends keyof CatalogPromotionForm>(key: K, value: CatalogPromotionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCategory = (value: string) => {
    setForm((current) => ({ ...current, categories: toggleArrayValue(current.categories, value) }));
  };

  const toggleProductType = (value: string) => {
    setForm((current) => ({ ...current, productTypes: toggleArrayValue(current.productTypes, value) }));
  };

  const validate = (): string => {
    if (!form.name.trim()) return 'Укажите название акции.';
    if (form.start && form.end && form.end < form.start) return 'Дата окончания раньше даты начала.';
    if (form.offerType !== 'gift' && (!form.offerValue.trim() || Number.isNaN(Number(form.offerValue)))) {
      return 'Укажите значение скидки / множителя.';
    }
    if (form.offerType === 'discount') {
      const v = Number(form.offerValue);
      if (v <= 0 || v > 100) return 'Скидка должна быть от 1 до 100%.';
    }
    if (form.targetScope === 'brand' && form.brands.length === 0) {
      return 'Для scope «Бренд» выберите хотя бы один бренд.';
    }
    if (form.targetScope === 'product_id' && form.productIds.length === 0) {
      return 'Для scope «Конкретные товары» выберите хотя бы один товар.';
    }
    if (form.targetScope === 'category' && form.categories.length === 0) {
      return 'Для scope «Категория» выберите хотя бы одну категорию.';
    }
    if (form.targetScope === 'product_type' && form.productTypes.length === 0) {
      return 'Для scope «Тип товара» выберите хотя бы один тип.';
    }
    return '';
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      let savedCampaign: Campaign;
      let savedCampaignId: number;

      if (isNew) {
        const created = await createCampaign(buildCatalogCampaignPayload(form));
        savedCampaign =
          created && typeof created === 'object' && 'campaign' in created && created.campaign
            ? (created.campaign as Campaign)
            : (created as unknown as Campaign);
        savedCampaignId = Number(savedCampaign.id);
      } else {
        const updated = await patchCampaign(id!, buildCatalogCampaignPayload(form));
        savedCampaign =
          updated && typeof updated === 'object' && 'campaign' in updated && updated.campaign
            ? (updated.campaign as Campaign)
            : (updated as unknown as Campaign);
        savedCampaignId = Number(savedCampaign.id) || Number(id);
      }

      if (!Number.isFinite(savedCampaignId) || savedCampaignId <= 0) {
        throw new Error('Не удалось определить ID акции.');
      }

      const offerPayload = buildCatalogOfferPayload(form, savedCampaignId);
      let savedOffer: Offer;
      if (primaryOfferId) {
        savedOffer = await patchOffer(primaryOfferId, offerPayload);
      } else {
        savedOffer = await createOffer(offerPayload as Partial<Offer> & { campaign: number });
        setPrimaryOfferId(savedOffer.id);
      }

      setForm(parseCatalogPromotion(savedCampaign, String(savedCampaignId), savedOffer));
      toast.success(isNew ? 'Акция создана.' : 'Сохранено.');

      if (isNew) {
        navigate(`/admin/campaigns/catalog/${savedCampaignId}`, { replace: true });
      }
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
    if (isNew) {
      toast.error('Сначала сохраните акцию.');
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      const response = await publishCampaign(id!);
      const campaign =
        response && typeof response === 'object' && 'campaign' in response && response.campaign
          ? (response.campaign as Campaign)
          : (response as unknown as Campaign);

      if (primaryOfferId) {
        try {
          await patchOffer(primaryOfferId, { is_active: true });
        } catch {
          /* offer activation is best-effort */
        }
      }

      const offers = await listOffers({ campaign_id: id });
      const active = offers.find((o) => o.is_active) ?? offers[0] ?? null;
      setPrimaryOfferId(active?.id ?? null);
      setForm(parseCatalogPromotion(campaign, String(id), active));
      toast.success('Акция запущена.');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      const message = error instanceof Error ? error.message : 'Не удалось запустить акцию.';
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerFile = async (file: File) => {
    if (!campaignIdNum) {
      toast.error('Сохраните акцию перед загрузкой файла.');
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

  const benefitLabel =
    form.offerType === 'discount'
      ? 'Размер скидки, %'
      : form.offerType === 'points_multiplier'
        ? 'Множитель баллов (×N)'
        : 'Описание подарка';

  const benefitPlaceholder =
    form.offerType === 'discount' ? '10' : form.offerType === 'points_multiplier' ? '2' : '1';

  const showCategoryToggles = form.targetScope === 'category' || form.targetScope === 'product_type';
  const showProductTypeToggles = form.targetScope === 'product_type';
  const showBrandPicker = form.targetScope === 'brand';
  const showProductPicker = form.targetScope === 'product_id';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/campaigns/catalog"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-xl truncate">
            {form.name || (isNew ? 'Новая акция на каталог' : `Акция ${id}`)}
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
            disabled={saving || loading || isNew || form.status === 'active'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Запустить
          </button>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4 text-sm text-pink-900 leading-relaxed">
        <p className="font-medium mb-1">Как работает каталожная акция</p>
        <p>
          Применяется ко всем покупателям, если корзина подходит под <b>scope</b> акции (бренд / категория / товары).
          Без персонализации, без cooldown — просто общая выгода.
        </p>
      </div>

      {validationError ? (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {validationError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {/* 1. Основное */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">1. Основное</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">Название</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="например, Весна-2026"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Дата начала</label>
              <input
                type="date"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Дата окончания</label>
              <input
                type="date"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. На что распространяется */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">2. На что распространяется</h2>
          <p className="text-xs text-gray-500 mb-4">
            Выберите, какие товары попадают под акцию. Если выбрать «Вся корзина» — акция применится к любому заказу.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {SCOPE_OPTIONS.map((option) => {
              const active = form.targetScope === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('targetScope', option.value)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border text-center transition-colors ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <Hint>{SCOPE_OPTIONS.find((o) => o.value === form.targetScope)?.hint}</Hint>

          {showCategoryToggles && (
            <div className="mt-4">
              <label className="text-xs text-gray-500 font-medium">Категории</label>
              <div className="mt-2 flex flex-wrap gap-2">
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
          )}

          {showProductTypeToggles && (
            <div className="mt-4">
              <label className="text-xs text-gray-500 font-medium">Типы товаров</label>
              <div className="mt-2 flex flex-wrap gap-2">
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
          )}

          {showBrandPicker && (
            <div className="mt-4">
              <SelectionField
                label="Бренды"
                buttonLabel="Выбрать бренды"
                items={form.brands.map((brand) => ({ key: brand, label: brand }))}
                emptyLabel="Бренды не выбраны"
                onOpen={() => setSelectorKind('brands')}
                onRemove={(brand) => updateField('brands', removeBrand(form.brands, brand))}
              />
            </div>
          )}

          {showProductPicker && (
            <div className="mt-4">
              <SelectionField
                label="Товары"
                buttonLabel="Выбрать товары"
                items={form.productIds.map((productId) => ({ key: String(productId), label: `ID ${productId}` }))}
                emptyLabel="Товары не выбраны"
                onOpen={() => setSelectorKind('products')}
                onRemove={(productId) =>
                  updateField(
                    'productIds',
                    form.productIds.filter((item) => item !== Number(productId)),
                  )
                }
              />
            </div>
          )}
        </div>

        {/* 3. Что даёт */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">3. Что даёт покупателю</h2>
          <p className="text-xs text-gray-500 mb-4">Выберите тип выгоды и значение.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {BENEFIT_OPTIONS.map((option) => {
              const active = form.offerType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('offerType', option.value)}
                  className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                  <p className={`mt-1 text-xs ${active ? 'text-gray-200' : 'text-gray-500'}`}>{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{benefitLabel}</label>
              <input
                type={form.offerType === 'gift' ? 'text' : 'number'}
                value={form.offerValue}
                onChange={(event) => updateField('offerValue', event.target.value)}
                placeholder={benefitPlaceholder}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {form.offerType === 'discount' && <Hint>От 1 до 100%.</Hint>}
              {form.offerType === 'points_multiplier' && <Hint>Например, 2 = ×2 баллов за покупку.</Hint>}
              {form.offerType === 'gift' && <Hint>Краткое описание подарка. Деталь — в тексте промо.</Hint>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Мин. сумма покупок (₸)</label>
              <input
                type="number"
                value={form.minTotalSpend90d}
                onChange={(event) => updateField('minTotalSpend90d', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <Hint>Сумма покупок пользователя за 90 дней, чтобы получить акцию. 0 = всем.</Hint>
            </div>
          </div>
        </div>

        {/* 4. Условия и бюджет */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">4. Бюджет и статус</h2>
          <p className="text-xs text-gray-500 mb-4">Бюджет — опциональный. Без бюджета акция работает без лимита.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Недельный бюджет (₸)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
                placeholder="оставьте пустым = без лимита"
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <Hint>Если указан, акция перестанет применяться при достижении лимита (сброс каждый понедельник).</Hint>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Статус</label>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as CatalogPromotionForm['status'])}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">Черновик</option>
                <option value="active">Активна</option>
              </select>
              <Hint>Только активные акции применяются в чекауте.</Hint>
            </div>
          </div>
        </div>

        {/* 5. Креатив */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">5. Креатив (для баннера)</h2>
          <p className="text-xs text-gray-500 mb-4">Опционально. Используется в промо-блоках в приложении.</p>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Текст промо</label>
              <textarea
                value={form.promoText}
                onChange={(event) => updateField('promoText', event.target.value)}
                rows={2}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                placeholder="например, Скидка 20% на ароматы до 8 марта"
              />
            </div>
            <BannerUploader
              bannerUrl={form.bannerUrl}
              uploading={bannerUploading}
              disabled={isNew}
              disabledHint="Сохраните акцию, чтобы загрузить файл."
              onUrlChange={(url) => updateField('bannerUrl', url)}
              onPickFile={(file) => void handleBannerFile(file)}
            />
          </div>
        </div>
      </div>

      {selectorKind ? (
        <SelectionPickerModal
          kind={selectorKind}
          selectedBrands={form.brands}
          selectedProductIds={form.productIds}
          onApplyBrands={(brands) => updateField('brands', brands)}
          onApplyProductIds={(productIds) => updateField('productIds', productIds)}
          onClose={() => setSelectorKind(null)}
        />
      ) : null}
    </div>
  );
}
