import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { AlertCircle, ChevronLeft, Save, Send } from 'lucide-react';
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
  createOffer,
  deleteOffer,
  listOffers,
  patchOffer,
} from '../../../../shared/api/adminOffers';
import { useI18n } from '../../../../shared/i18n/LanguageContext';
import {
  DEFAULT_PERSONAL_FORM,
  buildPersonalPayload,
  parsePersonalCampaign,
  type PersonalCampaignForm,
} from './_helpers';
import { BannerUploader } from './_components';
import {
  EMPTY_OFFER,
  OfferEditorModal,
  OffersSection,
  type OfferDraft,
  draftToPayload,
  offerToDraft,
} from './_offers';
import { campaignCopy } from './campaignI18n';

const SYSTEM_NAMES = [
  'fragrance_crosssell',
  'skincare_retention',
  'makeup_push',
  'default',
  'onboarding_first_order',
  'winback_30d',
  'favorite_category',
];

export default function AdminPersonalCampaignDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useI18n();
  const copy = campaignCopy[language];

  const [form, setForm] = useState<PersonalCampaignForm>(DEFAULT_PERSONAL_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerDraft, setOfferDraft] = useState<OfferDraft | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

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
      setForm(DEFAULT_PERSONAL_FORM);
      setOffers([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setValidationError('');
      try {
        const response = await getCampaign(id!);
        if (cancelled) return;
        setForm(parsePersonalCampaign(response as Record<string, unknown>, String(id)));

        const list = await listOffers({ campaign_id: id });
        if (cancelled) return;
        setOffers(list);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        toast.error(error instanceof Error ? error.message : copy.common.campaignLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [copy.common.campaignLoadError, id, isAuthLoading, isNew, location.pathname, navigate, user]);

  const updateField = <K extends keyof PersonalCampaignForm>(key: K, value: PersonalCampaignForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return copy.validation.campaignNameRequired;
    if (!form.budget.trim() || Number.isNaN(Number(form.budget))) return copy.validation.budgetNumber;
    if (!form.priority.trim() || Number.isNaN(Number(form.priority))) return copy.validation.priorityNumber;
    if (form.start && form.end && form.end < form.start) return copy.validation.endBeforeStart;
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
      if (isNew) {
        const created = await createCampaign(buildPersonalPayload(form));
        const createdForm = parsePersonalCampaign(created as Record<string, unknown>);
        toast.success(copy.common.campaignCreated);
        if (createdForm.id && createdForm.id !== 'new') {
          navigate(`/admin/campaigns/personal/${createdForm.id}`, { replace: true });
        }
        return;
      }

      const updated = await patchCampaign(id!, buildPersonalPayload(form));
      setForm(parsePersonalCampaign(updated as Record<string, unknown>, String(id)));
      toast.success(copy.common.saved);
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
      toast.error(copy.common.saveCampaignFirst);
      return;
    }

    setSaving(true);
    setValidationError('');

    try {
      const response = await publishCampaign(id!);
      setForm(parsePersonalCampaign(response as Record<string, unknown>, String(id)));
      toast.success(copy.common.campaignPublished);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      const message = error instanceof Error ? error.message : copy.common.campaignPublishError;
      setValidationError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const refreshOffers = async () => {
    if (isNew) return;
    try {
      const list = await listOffers({ campaign_id: id });
      setOffers(list);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleSaveOffer = async () => {
    if (!offerDraft || !campaignIdNum) return;
    if (!offerDraft.name.trim()) {
      toast.error(copy.validation.offerNameRequired);
      return;
    }
    if (offerDraft.target_scope === 'brand' && offerDraft.allowed_brands.length === 0) {
      toast.error(copy.validation.offerBrandRequired);
      return;
    }

    setOfferSaving(true);
    try {
      const payload = draftToPayload(offerDraft, campaignIdNum);
      if (offerDraft.id) {
        await patchOffer(offerDraft.id, payload);
        toast.success(copy.offers.updated);
      } else {
        await createOffer(payload);
        toast.success(copy.offers.created);
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
    if (!confirm(copy.offers.deleteConfirm(offer.name))) return;
    try {
      await deleteOffer(offer.id);
      toast.success(copy.offers.deleted);
      await refreshOffers();
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleBannerFile = async (file: File) => {
    if (!campaignIdNum) {
      toast.error(copy.common.saveCampaignFirst);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/campaigns/personal"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 text-xl truncate">
            {form.name || (isNew ? copy.personal.newTitle : copy.common.campaignTitle(id!))}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-900 leading-relaxed">
        <p className="font-medium mb-1">{copy.personal.introTitle}</p>
        <p>
          {copy.personal.introPrefix} <code>next-offer</code>. {copy.personal.introAfterCode}{' '}
          <b>{copy.personal.introStrong}</b>. {copy.personal.introSuffix}
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
          <h2 className="font-semibold text-gray-900 mb-4">{copy.personal.mainTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-gray-500 font-medium">{copy.common.name}</label>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder={copy.personal.namePlaceholder}
              />
              <div className="text-xs text-gray-500 leading-relaxed">
                {copy.personal.internalNameHint}{' '}
                <span className="inline-flex flex-wrap gap-1">
                  {SYSTEM_NAMES.map((name) => (
                    <code key={name} className="px-1 rounded bg-gray-100">
                      {name}
                    </code>
                  ))}
                </span>{' '}
                {copy.personal.internalNameHintAfter}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.status}</label>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value as PersonalCampaignForm['status'])}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="draft">{copy.common.draft}</option>
                <option value="active">{copy.common.active}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.personal.priority}</label>
              <input
                type="number"
                value={form.priority}
                onChange={(event) => updateField('priority', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <p className="text-xs text-gray-500">{copy.personal.priorityHint}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{copy.personal.datesBudgetTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.startDate}</label>
              <input
                type="date"
                value={form.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
              <p className="text-xs text-gray-500">{copy.common.emptyDateHint}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.endDate}</label>
              <input
                type="date"
                value={form.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none"
              />
              <p className="text-xs text-gray-500">{copy.common.emptyDateHint}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.weeklyBudgetKzt}</label>
              <input
                type="number"
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <p className="text-xs text-gray-500">{copy.personal.budgetHint}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">{copy.personal.creativeTitle}</h2>
          <p className="text-xs text-gray-500 mb-4">{copy.personal.creativeHint}</p>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{copy.common.promoText}</label>
              <textarea
                value={form.promoText}
                onChange={(event) => updateField('promoText', event.target.value)}
                rows={2}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
                placeholder={copy.personal.promoPlaceholder}
              />
            </div>
            <BannerUploader
              bannerUrl={form.bannerUrl}
              uploading={bannerUploading}
              disabled={isNew}
              disabledHint={copy.common.saveBeforeCampaignBanner}
              onUrlChange={(url) => updateField('bannerUrl', url)}
              onPickFile={(file) => void handleBannerFile(file)}
            />
          </div>
        </div>

        <OffersSection
          offers={offers}
          disabled={isNew}
          disabledHint={copy.personal.saveBeforeOffers}
          onAdd={() => setOfferDraft({ ...EMPTY_OFFER })}
          onEdit={(offer) => setOfferDraft(offerToDraft(offer))}
          onDelete={handleDeleteOffer}
        />
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
