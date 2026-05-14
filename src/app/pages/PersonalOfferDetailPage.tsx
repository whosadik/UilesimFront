import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, CheckCircle2, Clock, Gift, Sparkles, Tag } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { ApiError } from '../../shared/api/ApiError';
import { clickOffer, getMyOffer } from '../../shared/api/offers';
import { useI18n } from '../../shared/i18n/LanguageContext';
import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../../shared/catalog/presentation';
import type { AppLanguage } from '../../shared/i18n/messages';

const copyByLanguage = {
  ru: {
    breadcrumbPromotions: 'Акции',
    back: 'Все акции',
    loading: 'Загружаем персональный оффер...',
    errorTitle: 'Не удалось загрузить оффер',
    notFound: 'Оффер не найден.',
    unavailable: 'Оффер уже недоступен или истек.',
    personalBadge: 'Персональный оффер',
    defaultTitle: 'Персональное предложение',
    defaultDescription: 'Это предложение доступно для вашего аккаунта прямо сейчас.',
    validUntil: 'Действует до',
    assignedAt: 'Назначен',
    offerType: 'Тип оффера',
    discount: 'Скидка',
    points: 'Баллы',
    gift: 'Подарок',
    target: 'Условие',
    targetCart: 'На всю корзину',
    targetCategory: 'На категорию',
    targetProductType: 'На тип продукта',
    targetProduct: 'На конкретный товар',
    campaign: 'Кампания',
    campaignFallback: 'Персональная кампания',
    howTitle: 'Как использовать',
    howDescription: 'Добавьте подходящий товар в корзину. На checkout оффер применится автоматически, если условия совпадут.',
    catalogCta: 'Перейти к товарам',
    cartCta: 'В корзину',
    detailsTitle: 'Детали предложения',
    statusTitle: 'Статус',
    activeStatus: 'Активен',
    categoryLabel: 'Категория',
    productTypeLabel: 'Тип продукта',
    valueLabel: 'Выгода',
    reasonTitle: 'Почему вам',
    reasonFallback: 'Подобрано по вашему профилю, истории покупок и текущим правилам кампании.',
  },
  kk: {
    breadcrumbPromotions: 'Акциялар',
    back: 'Барлық акциялар',
    loading: 'Жеке оффер жүктелуде...',
    errorTitle: 'Офферді жүктеу мүмкін болмады',
    notFound: 'Оффер табылмады.',
    unavailable: 'Оффер енді қолжетімді емес немесе мерзімі өтті.',
    personalBadge: 'Жеке оффер',
    defaultTitle: 'Жеке ұсыныс',
    defaultDescription: 'Бұл ұсыныс дәл қазір аккаунтыңызға қолжетімді.',
    validUntil: 'Дейін жарамды',
    assignedAt: 'Тағайындалды',
    offerType: 'Оффер түрі',
    discount: 'Жеңілдік',
    points: 'Ұпайлар',
    gift: 'Сыйлық',
    target: 'Шарт',
    targetCart: 'Бүкіл себетке',
    targetCategory: 'Санатқа',
    targetProductType: 'Өнім түріне',
    targetProduct: 'Нақты өнімге',
    campaign: 'Науқан',
    campaignFallback: 'Жеке науқан',
    howTitle: 'Қалай қолдану керек',
    howDescription: 'Сәйкес өнімді себетке қосыңыз. Checkout кезінде шарттар сәйкес келсе, оффер автоматты түрде қолданылады.',
    catalogCta: 'Өнімдерге өту',
    cartCta: 'Себетке',
    detailsTitle: 'Ұсыныс мәліметтері',
    statusTitle: 'Күйі',
    activeStatus: 'Белсенді',
    categoryLabel: 'Санат',
    productTypeLabel: 'Өнім түрі',
    valueLabel: 'Пайда',
    reasonTitle: 'Неге сізге',
    reasonFallback: 'Профиліңіз, сатып алу тарихыңыз және науқан ережелері бойынша таңдалды.',
  },
  en: {
    breadcrumbPromotions: 'Promotions',
    back: 'All promotions',
    loading: 'Loading personal offer...',
    errorTitle: 'Could not load offer',
    notFound: 'Offer not found.',
    unavailable: 'This offer is no longer available or has expired.',
    personalBadge: 'Personal offer',
    defaultTitle: 'Personal offer',
    defaultDescription: 'This offer is available for your account right now.',
    validUntil: 'Valid until',
    assignedAt: 'Assigned',
    offerType: 'Offer type',
    discount: 'Discount',
    points: 'Points',
    gift: 'Gift',
    target: 'Condition',
    targetCart: 'Whole cart',
    targetCategory: 'Category',
    targetProductType: 'Product type',
    targetProduct: 'Specific product',
    campaign: 'Campaign',
    campaignFallback: 'Personal campaign',
    howTitle: 'How to use',
    howDescription: 'Add an eligible item to your cart. At checkout, the offer is applied automatically when the conditions match.',
    catalogCta: 'Browse products',
    cartCta: 'Go to cart',
    detailsTitle: 'Offer details',
    statusTitle: 'Status',
    activeStatus: 'Active',
    categoryLabel: 'Category',
    productTypeLabel: 'Product type',
    valueLabel: 'Benefit',
    reasonTitle: 'Why this offer',
    reasonFallback: 'Selected from your profile, purchase history, and current campaign rules.',
  },
} as const;

type OfferDetail = {
  assignmentId: number;
  title: string;
  description: string;
  badge: string;
  imageUrl?: string;
  ctaLabel: string;
  offerName: string;
  offerType: string;
  offerValue?: number;
  expiresAt?: string;
  assignedAt?: string;
  targetScope?: string;
  targetValue?: string;
  targetCategory?: string;
  targetProductType?: string;
  campaignName?: string;
  reasonText?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) {
          return item.trim();
        }
      }
    }
  }
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const formatValue = (offerType: string, value: number | undefined): string => {
  if (value === undefined) {
    return '';
  }
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (offerType === 'discount') {
    return `-${formatted}%`;
  }
  if (offerType === 'points_multiplier') {
    return `x${formatted}`;
  }
  return formatted;
};

const formatDateTime = (value: string | undefined, language: AppLanguage): string | undefined => {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language === 'kk' ? 'kk-KZ' : 'ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const offerReasonCopy = {
  ru: {
    routedBestOffer: 'Мы выбрали лучший доступный оффер из первой подходящей кампании с учетом лимитов, периода ожидания и общей эффективности.',
    bestScore: 'Оффер получил лучшую оценку среди подходящих вариантов с учетом доступности, периода ожидания и бюджета.',
    noActiveCampaigns: 'Сейчас нет активных кампаний для персонального оффера.',
    noEligibleOffers: 'Мы проверили доступные кампании, но подходящих офферов с учетом ограничений пока нет.',
  },
  kk: {
    routedBestOffer: 'Бірінші сәйкес науқаннан лимиттерді, күту мерзімін және жалпы тиімділікті ескере отырып, ең қолайлы оффер таңдалды.',
    bestScore: 'Оффер қолжетімділік, күту мерзімі және бюджет шарттарын ескере отырып, сәйкес нұсқалардың ішінде ең жоғары бағалау алды.',
    noActiveCampaigns: 'Қазір жеке оффер үшін белсенді науқандар жоқ.',
    noEligibleOffers: 'Қолжетімді науқандар тексерілді, бірақ шектеулерге сай келетін оффер әзірге жоқ.',
  },
  en: {
    routedBestOffer: 'We picked the best available offer from the first eligible campaign, accounting for limits, cooldown, and overall effectiveness.',
    bestScore: 'This offer had the best score among eligible options after availability, cooldown, and budget checks.',
    noActiveCampaigns: 'There are no active campaigns for a personal offer right now.',
    noEligibleOffers: 'We checked the available campaigns, but no offer currently matches the constraints.',
  },
} as const;

const localizeOfferReason = (reason: string | undefined, language: AppLanguage): string | undefined => {
  if (!reason) {
    return undefined;
  }

  const normalized = reason.toLowerCase().replace(/\s+/g, ' ').trim();
  const copy = offerReasonCopy[language];

  if (normalized.includes('best offer within first eligible campaign')) {
    return copy.routedBestOffer;
  }
  if (normalized.includes('max(score)')) {
    return copy.bestScore;
  }
  if (normalized === 'no active campaigns') {
    return copy.noActiveCampaigns;
  }
  if (normalized.includes('no eligible offers')) {
    return copy.noEligibleOffers;
  }

  return reason;
};

const parseOfferDetail = (
  payload: unknown,
  language: AppLanguage,
  fallbackTitle: string,
  fallbackDescription: string,
): OfferDetail | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const assignmentId = toNumber(payload.assignment_id);
  const offer = isRecord(payload.offer) ? payload.offer : null;
  if (assignmentId === undefined || !offer) {
    return null;
  }

  const presentation = isRecord(payload.presentation) ? payload.presentation : null;
  const target = isRecord(payload.target) ? payload.target : null;
  const reason = isRecord(payload.reason) ? payload.reason : null;
  const offerType = firstString(offer.type) ?? 'personal';
  const campaign = firstString(reason?.campaign);

  return {
    assignmentId: Math.round(assignmentId),
    title: firstString(presentation?.title, offer.name) ?? fallbackTitle,
    description: firstString(presentation?.description) ?? fallbackDescription,
    badge: firstString(presentation?.badge) ?? fallbackTitle,
    imageUrl: firstString(presentation?.image_url, presentation?.imageUrl),
    ctaLabel: firstString(presentation?.cta_label, presentation?.ctaLabel, presentation?.button_text) ?? '',
    offerName: firstString(offer.name) ?? fallbackTitle,
    offerType,
    offerValue: toNumber(offer.value),
    expiresAt: firstString(payload.expires_at),
    assignedAt: firstString(payload.assigned_at),
    targetScope: firstString(target?.scope),
    targetValue:
      typeof target?.value === 'number' || typeof target?.value === 'string'
        ? String(target.value)
        : undefined,
    targetCategory: firstString(target?.category),
    targetProductType: firstString(target?.product_type),
    campaignName: campaign,
    reasonText: localizeOfferReason(firstString(reason?.picked_because), language),
  };
};

export default function PersonalOfferDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { language, messages } = useI18n();
  const copy = copyByLanguage[language];
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!assignmentId || !Number.isFinite(Number(assignmentId))) {
      setErrorMessage(copy.notFound);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    getMyOffer(assignmentId)
      .then((res) => {
        const parsed = parseOfferDetail(
          res.assignment,
          language,
          copy.defaultTitle,
          copy.defaultDescription,
        );
        if (!cancelled) {
          if (parsed) {
            setOffer(parsed);
          } else {
            setOffer(null);
            setErrorMessage(copy.notFound);
          }
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          navigate('/login', { replace: true, state: { from: `/promotions/offers/${assignmentId}` } });
          return;
        }
        if (error instanceof ApiError && error.status === 410) {
          setErrorMessage(copy.unavailable);
        } else if (error instanceof ApiError && error.status === 404) {
          setErrorMessage(copy.notFound);
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(copy.errorTitle);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId, copy.defaultDescription, copy.defaultTitle, copy.errorTitle, copy.notFound, copy.unavailable, language, navigate, reloadKey]);

  const detailItems = useMemo(() => {
    if (!offer) {
      return [];
    }

    const targetLabel =
      offer.targetScope === 'cart'
        ? copy.targetCart
        : offer.targetScope === 'category'
          ? copy.targetCategory
          : offer.targetScope === 'product_type'
            ? copy.targetProductType
            : offer.targetScope === 'product_id'
              ? copy.targetProduct
              : offer.targetScope;
    const categoryLabel = offer.targetCategory
      ? formatCatalogCategoryLabel(offer.targetCategory, language) ?? offer.targetCategory
      : undefined;
    const productTypeLabel = offer.targetProductType
      ? formatCatalogProductTypeLabel(offer.targetProductType, language) ?? offer.targetProductType
      : undefined;
    const validUntil = formatDateTime(offer.expiresAt, language);
    const assignedAt = formatDateTime(offer.assignedAt, language);
    const benefit = formatValue(offer.offerType, offer.offerValue);
    const typeLabel =
      offer.offerType === 'discount'
        ? copy.discount
        : offer.offerType === 'points_multiplier'
          ? copy.points
          : offer.offerType === 'gift'
            ? copy.gift
            : copy.personalBadge;

    return [
      { key: 'status', label: copy.statusTitle, value: copy.activeStatus },
      { key: 'type', label: copy.offerType, value: typeLabel },
      benefit ? { key: 'value', label: copy.valueLabel, value: benefit } : null,
      targetLabel ? { key: 'target', label: copy.target, value: targetLabel } : null,
      categoryLabel ? { key: 'category', label: copy.categoryLabel, value: categoryLabel } : null,
      productTypeLabel ? { key: 'productType', label: copy.productTypeLabel, value: productTypeLabel } : null,
      validUntil ? { key: 'expires', label: copy.validUntil, value: validUntil } : null,
      assignedAt ? { key: 'assigned', label: copy.assignedAt, value: assignedAt } : null,
      { key: 'campaign', label: copy.campaign, value: offer.campaignName ?? copy.campaignFallback },
    ].filter((item): item is { key: string; label: string; value: string } => Boolean(item));
  }, [copy, language, offer]);

  const catalogHref = useMemo(() => {
    if (!offer) {
      return '/catalog';
    }
    const params = new URLSearchParams();
    if (offer.targetCategory) {
      params.set('category', offer.targetCategory);
    }
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
  }, [offer]);

  const primaryHref =
    offer?.targetScope === 'product_id' && offer.targetValue
      ? `/product/${encodeURIComponent(offer.targetValue)}`
      : catalogHref;

  const handlePrimaryClick = () => {
    if (!offer) {
      return;
    }
    void clickOffer(offer.assignmentId, { source: 'personal_offer_detail' }).catch(() => undefined);
  };

  return (
    <div className="page-with-navbar-offset min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1160px] mx-auto px-6 lg:px-[140px] py-8 lg:py-12">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: messages.common.home, href: '/' },
              { label: copy.breadcrumbPromotions, href: '/promotions' },
              { label: offer?.title ?? '...' },
            ]}
          />
        </div>

        <Link to="/promotions" className="inline-block mb-6 text-sm text-[#6B7280] hover:text-[#111827]">
          ← {copy.back}
        </Link>

        {isLoading ? (
          <LoadingSpinner size="md" text={copy.loading} />
        ) : errorMessage ? (
          <ErrorState
            title={copy.errorTitle}
            description={errorMessage}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : offer ? (
          <>
            <section className="relative overflow-hidden rounded-2xl border border-[#EAE6EF] bg-white shadow-[0_20px_60px_-42px_rgba(13,18,32,0.45)]">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
                <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-[#FFE1F2] via-[#FFF1F8] to-white lg:min-h-[430px]">
                  {offer.imageUrl ? (
                    <img
                      src={offer.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#FF4DB8]/20 blur-3xl" aria-hidden />
                      <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" aria-hidden />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.9),rgba(255,255,255,0.1)_48%,transparent_70%)]" aria-hidden />
                    </>
                  )}
                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF4DB8]" />
                    {offer.badge}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#FFE1F2] bg-[#FFF7FC] px-3 py-1.5 text-xs font-semibold text-[#B83280]">
                    <Gift className="h-3.5 w-3.5" />
                    {copy.personalBadge}
                  </div>
                  <h1 className="font-display text-3xl font-semibold leading-tight text-[#111827] [letter-spacing:0] lg:text-4xl">
                    {offer.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-[#4B5563]">
                    {offer.description}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={primaryHref}
                      onClick={handlePrimaryClick}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-pink-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-600"
                    >
                      {offer.ctaLabel || copy.catalogCta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/cart"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#EAE6EF] bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition-colors hover:border-[#FF4DB8]/40 hover:bg-[#FFF7FC]"
                    >
                      {copy.cartCta}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
              <section className="rounded-2xl border border-[#EAE6EF] bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#FF4DB8]" />
                  <h2 className="text-lg font-semibold text-[#111827]">{copy.detailsTitle}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detailItems.map((item) => (
                    <div key={item.key} className="rounded-xl border border-[#F1EEF5] bg-gray-50/60 p-4">
                      <p className="text-xs text-[#6B7280]">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-[#EAE6EF] bg-white p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-base font-semibold text-[#111827]">{copy.howTitle}</h2>
                  </div>
                  <p className="text-sm leading-6 text-[#4B5563]">{copy.howDescription}</p>
                </section>

                <section className="rounded-2xl border border-[#EAE6EF] bg-white p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6B7280]" />
                    <h2 className="text-base font-semibold text-[#111827]">{copy.reasonTitle}</h2>
                  </div>
                  <p className="text-sm leading-6 text-[#4B5563]">
                    {offer.reasonText ?? copy.reasonFallback}
                  </p>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
