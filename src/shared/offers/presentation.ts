import {
  formatCatalogCategoryLabel,
  formatCatalogProductTypeLabel,
} from '../catalog/presentation';

export type OfferLanguage = 'ru' | 'kk' | 'en';
export type OfferPromotionType = 'discount' | 'points' | 'gift' | 'personal';

export type OfferPromotionCard = {
  id: string;
  assignmentId?: number;
  title: string;
  description: string;
  badge: string;
  type: OfferPromotionType;
  buttonText: string;
  imageUrl?: string;
};

const offerCopy = {
  ru: {
    discount: 'Скидка',
    points: 'Баллы',
    gift: 'Подарок',
    personal: 'Для вас',
    discountOnType: (discount: string, label: string) => `Скидка ${discount}% на ${label.toLowerCase()}`,
    discountOnCategory: (discount: string, label: string) => `Скидка ${discount}% на ${label.toLowerCase()}`,
    discountForYou: (discount: string) => `Скидка ${discount}% для вас`,
    pointsOnPurchase: (value: string) => `x${value} баллов на покупку`,
    giftWithOrder: 'Подарок к заказу',
    personalOffer: 'Персональное предложение',
    cartScope: (amount: number) => `Применяется автоматически к корзине от ${amount.toLocaleString('ru-RU')} ₸.`,
    categoryScope: (label: string) => `Предложение действует на категорию «${label}».`,
    typeScope: (label: string) => `Предложение действует на товары типа «${label}».`,
    productScope: (label: string) => `Предложение связано с рекомендованным товаром типа «${label}».`,
    roadmapScope: 'Оффер связан с вашим текущим шагом roadmap и подобран под следующий шаг покупки.',
    pointsBoost: (value: string) => `Баллы будут начислены с повышенным коэффициентом x${value}.`,
    autoGift: 'Подарок добавится автоматически при выполнении условий предложения.',
    availableNow: 'Персональное предложение доступно для вас прямо сейчас.',
    details: 'Подробнее',
  },
  kk: {
    discount: 'Жеңілдік',
    points: 'Ұпайлар',
    gift: 'Сыйлық',
    personal: 'Сізге',
    discountOnType: (discount: string, label: string) => `${label.toLowerCase()} үшін ${discount}% жеңілдік`,
    discountOnCategory: (discount: string, label: string) => `${label.toLowerCase()} санатына ${discount}% жеңілдік`,
    discountForYou: (discount: string) => `Сізге ${discount}% жеңілдік`,
    pointsOnPurchase: (value: string) => `Сатып алуға x${value} ұпай`,
    giftWithOrder: 'Тапсырысқа сыйлық',
    personalOffer: 'Жеке ұсыныс',
    cartScope: (amount: number) => `${amount.toLocaleString('kk-KZ')} ₸ бастап себетке автоматты түрде қолданылады.`,
    categoryScope: (label: string) => `Ұсыныс «${label}» санатына қолданылады.`,
    typeScope: (label: string) => `Ұсыныс «${label}» түріндегі тауарларға қолданылады.`,
    productScope: (label: string) => `Ұсыныс «${label}» түріндегі ұсынылған тауармен байланысты.`,
    roadmapScope: 'Ұсыныс ағымдағы roadmap қадамыңызбен байланысты және келесі сатып алу қадамына сай таңдалған.',
    pointsBoost: (value: string) => `Ұпайлар x${value} көбейткішімен есептеледі.`,
    autoGift: 'Ұсыныс шарттары орындалғанда сыйлық автоматты түрде қосылады.',
    availableNow: 'Жеке ұсыныс дәл қазір сізге қолжетімді.',
    details: 'Толығырақ',
  },
  en: {
    discount: 'Discount',
    points: 'Points',
    gift: 'Gift',
    personal: 'For you',
    discountOnType: (discount: string, label: string) => `${discount}% off ${label.toLowerCase()}`,
    discountOnCategory: (discount: string, label: string) => `${discount}% off ${label.toLowerCase()}`,
    discountForYou: (discount: string) => `${discount}% off for you`,
    pointsOnPurchase: (value: string) => `x${value} points on purchase`,
    giftWithOrder: 'Gift with order',
    personalOffer: 'Personal offer',
    cartScope: (amount: number) => `Applied automatically to carts from ${amount.toLocaleString('en-US')} ₸.`,
    categoryScope: (label: string) => `The offer applies to the "${label}" category.`,
    typeScope: (label: string) => `The offer applies to "${label}" products.`,
    productScope: (label: string) => `The offer is linked to a recommended "${label}" product.`,
    roadmapScope: 'This offer is tied to your current roadmap step and selected for the next purchase step.',
    pointsBoost: (value: string) => `Points will be credited with an x${value} multiplier.`,
    autoGift: 'A gift will be added automatically when the offer conditions are met.',
    availableNow: 'A personal offer is available for you right now.',
    details: 'Learn more',
  },
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

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

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim().length > 0) {
          return item.trim();
        }
      }
    }
  }

  return undefined;
};

const toPromotionType = (offerType: unknown): OfferPromotionType => {
  if (offerType === 'discount') return 'discount';
  if (offerType === 'points_multiplier') return 'points';
  if (offerType === 'gift') return 'gift';
  return 'personal';
};

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const formatCategoryLabel = (value: unknown, language: OfferLanguage): string | undefined => {
  return formatCatalogCategoryLabel(value, language);
};

const formatProductTypeLabel = (value: unknown, language: OfferLanguage): string | undefined => {
  return formatCatalogProductTypeLabel(value, language);
};

const buildTitle = (
  type: OfferPromotionType,
  offerName: string | undefined,
  offerValue: number | undefined,
  target: Record<string, unknown> | null,
  language: OfferLanguage,
): string => {
  const copy = offerCopy[language];
  const categoryLabel = formatCategoryLabel(target?.category, language);
  const productTypeLabel = formatProductTypeLabel(target?.product_type, language);

  if (type === 'discount' && offerValue !== undefined) {
    const discount = formatValue(offerValue);
    if (productTypeLabel) return copy.discountOnType(discount, productTypeLabel);
    if (categoryLabel) return copy.discountOnCategory(discount, categoryLabel);
    return copy.discountForYou(discount);
  }

  if (type === 'points' && offerValue !== undefined) {
    return copy.pointsOnPurchase(formatValue(offerValue));
  }

  if (type === 'gift') {
    return offerName ?? copy.giftWithOrder;
  }

  return offerName ?? copy.personalOffer;
};

const buildDescription = (
  type: OfferPromotionType,
  target: Record<string, unknown> | null,
  reason: Record<string, unknown> | null,
  offerValue: number | undefined,
  language: OfferLanguage,
): string => {
  const copy = offerCopy[language];
  const scope = firstString(target?.scope);
  const categoryLabel = formatCategoryLabel(target?.category, language);
  const productTypeLabel = formatProductTypeLabel(target?.product_type, language);
  const minBasketAmount = toNumber(target?.min_basket_amount);
  const roadmapReason = isRecord(reason?.roadmap) ? reason.roadmap : null;

  if (scope === 'cart' && minBasketAmount !== undefined) return copy.cartScope(minBasketAmount);
  if (scope === 'category' && categoryLabel) return copy.categoryScope(categoryLabel);
  if (scope === 'product_type' && productTypeLabel) return copy.typeScope(productTypeLabel);
  if (scope === 'product_id' && productTypeLabel) return copy.productScope(productTypeLabel);
  if (roadmapReason) return copy.roadmapScope;
  if (type === 'points' && offerValue !== undefined) return copy.pointsBoost(formatValue(offerValue));
  if (type === 'gift') return copy.autoGift;
  return copy.availableNow;
};

export const mapOfferPayloadToPromotion = (
  payload: unknown,
  language: OfferLanguage = 'ru',
): OfferPromotionCard | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const assignmentId = toNumber(payload.assignment_id);
  const offer = isRecord(payload.offer) ? payload.offer : null;
  const presentation = isRecord(payload.presentation) ? payload.presentation : null;
  if (!offer || assignmentId === undefined) {
    return null;
  }

  const copy = offerCopy[language];
  const reason = isRecord(payload.reason) ? payload.reason : null;
  const target = isRecord(payload.target) ? payload.target : null;
  const type = toPromotionType(offer.type);
  const offerValue = toNumber(offer.value);
  const offerName = firstString(offer.name);

  return {
    id: `offer-${Math.round(assignmentId)}`,
    assignmentId: Math.round(assignmentId),
    title: firstString(presentation?.title) ?? buildTitle(type, offerName, offerValue, target, language),
    description: firstString(presentation?.description) ?? buildDescription(type, target, reason, offerValue, language),
    badge:
      firstString(presentation?.badge) ??
      (type === 'discount' ? copy.discount : type === 'points' ? copy.points : type === 'gift' ? copy.gift : copy.personal),
    type,
    buttonText:
      firstString(presentation?.cta_label, presentation?.ctaLabel, presentation?.button_text) ?? copy.details,
    imageUrl: firstString(presentation?.image_url, presentation?.imageUrl),
  };
};

export const mapOfferPayloadsToPromotions = (
  payload: unknown,
  language: OfferLanguage = 'ru',
): OfferPromotionCard[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => mapOfferPayloadToPromotion(item, language))
      .filter((item): item is OfferPromotionCard => Boolean(item));
  }

  const single = mapOfferPayloadToPromotion(payload, language);
  return single ? [single] : [];
};
