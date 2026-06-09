import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import {
  DEFAULT_CATALOG_FORM,
  buildCatalogCampaignPayload,
  buildCatalogOfferPayload,
  parseCatalogPromotion,
  removeBrand,
  toggleArrayValue,
  type CatalogPromotionForm,
  type PickerKind,
} from './_helpers';
import { BannerUploader, Hint, SelectionField, SelectionPickerModal } from './_components';
import {
  campaignCopy,
  getCampaignCategoryOptions,
  getCampaignProductTypeOptions,
} from './campaignI18n';

const TARGET_SCOPE_ORDER: TargetScope[] = ['cart', 'category', 'brand', 'product_type', 'product_id'];

export default function AdminCatalogPromotionDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useI18n();
  const copy = campaignCopy[language];

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

  const benefitOptions = useMemo<Array<{ value: OfferType; label: string; description: string; icon: ReactNode }>>(
    () => [
      {
        value: 'discount',
        label: copy.benefits.discount.label,
        description: copy.benefits.discount.description,
        icon: <Percent className="w-4 h-4" />,
      },
      {
        value: 'points_multiplier',
        label: copy.benefits.points_multiplier.label,
        description: copy.benefits.points_multiplier.description,
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        value: 'gift',
        label: copy.benefits.gift.label,
        description: copy.benefits.gift.description,
        icon: <Gift className="w-4 h-4" />,
      },
    ],
    [copy.benefits],
  );

  const scopeOptions = useMemo(
    () =>
      TARGET_SCOPE_ORDER.map((value) => ({
        value,
        label: copy.targetScopes[value].label,
        hint: copy.targetScopes[value].hint,
      })),
    [copy.targetScopes],
  );

  const categoryOptions = useMemo(() => getCampaignCategoryOptions(language), [language]);
  const productTypeOptions = useMemo(() => getCampaignProductTypeOptions(language), [language]);

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

        const active = offers.find((offer) => offer.is_active) ?? offers[0] ?? null;
        setPrimaryOfferId(active?.id ?? null);
        setForm(parseCatalogPromotion(response as Record<string, unknown>, String(id), active));
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        toast.error(error instanceof Error ? error.message : copy.common.promotionLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [copy.common.promotionLoadError, id, isAuthLoading, isNew, location.pathname, navigate, user]);

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
    if (!form.name.trim()) return copy.validation.promotionNameRequired;
    if (form.start && form.end && form.end < form.start) return copy.validation.endBeforeStart;
    if (form.offerType !== 'gift' && (!form.offerValue.trim() || Number.isNaN(Number(form.offerValue)))) {
      return copy.validation.offerValueRequired;
    }
    if (form.offerType === 'discount') {
      const value = Number(form.offerValue);
      if (value <= 0 || value > 100) return copy.validation.discountRange;
    }
    if (form.targetScope === 'brand' && form.brands.length === 0) {
      return copy.validation.brandScopeRequired;
    }
    if (form.targetScope === 'product_id' && form.productIds.length === 0) {
      return copy.validation.productScopeRequired;
    }
    if (form.targetScope === 'category' && form.categories.length === 0) {
      return copy.validation.categoryScopeRequired;
    }
    if (form.targetScope === 'product_type' && form.productTypes.length === 0) {
      return copy.validation.productTypeScopeRequired;
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
        throw new Error(copy.common.invalidPromotionId);
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
      toast.success(isNew ? copy.common.promotionCreated : copy.common.saved);

      if (isNew) {
        navigate(`/admin/campaigns/catalog/${savedCampaignId}`, { replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      const message = error instanceof Error ? error.message : copy.common.saveError;
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isNew) {
      toast.error(copy.common.savePromotionFirst);
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
      const active = offers.find((offer) => offer.is_active) ?? offers[0] ?? null;
      setPrimaryOfferId(active?.id ?? null);
      setForm(parseCatalogPromotion(campaign, String(id), active));
      toast.success(copy.common.promotionPublished);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      const message = error instanceof Error ? error.message : copy.common.promotionPublishError;
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBannerFile = async (file: File) => {
    if (!campaignIdNum) {
      toast.error(copy.common.savePromotionFirst);
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
      toast.success(copy.common.bannerUploaded);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setBannerUploading(false);
    }
  };

  const benefitLabel =
    form.offerType === 'discount'
      ? copy.catalog.discountValueLabel
      : form.offerType === 'points_multiplier'
        ? copy.catalog.pointsValueLabel
        : copy.catalog.giftValueLabel;

  const benefitPlaceholder = form.offerType === 'discount' ? '10' : form.offerType === 'points_multiplier' ? '2' : '1';

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
            {form.name || (isNew ? copy.catalog.newTitle : copy.common.promotionTitle(id!))}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{isNew ? copy.common.draft : copy.common.id(id!)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? copy.common.saving : copy.common.save}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || loading || isNew || form.status === 'active'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {copy.common.publish}
          </button>
        </div>
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4 text-sm text-pink-900 leading-relaxed">
        <p className="font-medium mb-1">{copy.catalog.introTitle}</p>
        <p>
          {copy.catalog.introPrefix} <b>{copy.catalog.introStrong}</b>. {copy.catalog.introSuffix}
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
          <h2 className="font-semibold text-gray-900 mb-4">{copy.catalog.mainTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">{copy.common.name}</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder={copy.catalog.namePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.startDate}</label>
              <input
                type="date"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.endDate}</label>
              <input
                type="date"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">{copy.catalog.scopeTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{copy.catalog.scopeHint}</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {scopeOptions.map((option) => {
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
          <Hint>{scopeOptions.find((option) => option.value === form.targetScope)?.hint}</Hint>

          {showCategoryToggles && (
            <div className="mt-4">
              <label className="text-xs text-gray-500 font-medium">{copy.catalog.categories}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
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
              <label className="text-xs text-gray-500 font-medium">{copy.catalog.productTypes}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {productTypeOptions.map((option) => (
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
                label={copy.catalog.brands}
                buttonLabel={copy.catalog.selectBrands}
                items={form.brands.map((brand) => ({ key: brand, label: brand }))}
                emptyLabel={copy.catalog.brandsEmpty}
                onOpen={() => setSelectorKind('brands')}
                onRemove={(brand) => updateField('brands', removeBrand(form.brands, brand))}
              />
            </div>
          )}

          {showProductPicker && (
            <div className="mt-4">
              <SelectionField
                label={copy.catalog.products}
                buttonLabel={copy.catalog.selectProducts}
                items={form.productIds.map((productId) => ({ key: String(productId), label: `ID ${productId}` }))}
                emptyLabel={copy.catalog.productsEmpty}
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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">{copy.catalog.buyerBenefitTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{copy.catalog.buyerBenefitHint}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {benefitOptions.map((option) => {
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
              {form.offerType === 'discount' && <Hint>{copy.catalog.discountHint}</Hint>}
              {form.offerType === 'points_multiplier' && <Hint>{copy.catalog.pointsHint}</Hint>}
              {form.offerType === 'gift' && <Hint>{copy.catalog.giftHint}</Hint>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.catalog.minSpendLabel}</label>
              <input
                type="number"
                value={form.minTotalSpend90d}
                onChange={(event) => updateField('minTotalSpend90d', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <Hint>{copy.catalog.minSpendHint}</Hint>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">{copy.catalog.budgetStatusTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{copy.catalog.budgetStatusHint}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.weeklyBudgetKzt}</label>
              <input
                type="number"
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
                placeholder={copy.catalog.budgetPlaceholder}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <Hint>{copy.catalog.budgetLimitHint}</Hint>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.status}</label>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as CatalogPromotionForm['status'])}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">{copy.common.draft}</option>
                <option value="active">{copy.common.active}</option>
              </select>
              <Hint>{copy.catalog.statusHint}</Hint>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">{copy.catalog.creativeTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{copy.catalog.creativeHint}</p>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.promoText}</label>
              <textarea
                value={form.promoText}
                onChange={(event) => updateField('promoText', event.target.value)}
                rows={2}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                placeholder={copy.catalog.promoPlaceholder}
              />
            </div>
            <BannerUploader
              bannerUrl={form.bannerUrl}
              uploading={bannerUploading}
              disabled={isNew}
              disabledHint={copy.common.saveBeforePromotionBanner}
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
