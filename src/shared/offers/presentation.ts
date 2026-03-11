export type OfferPromotionType = 'discount' | 'points' | 'gift' | 'personal';

export type OfferPromotionCard = {
  id: string;
  assignmentId?: number;
  title: string;
  description: string;
  badge: string;
  type: OfferPromotionType;
  buttonText: string;
};

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

const formatLabel = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }

  const prepared = value.trim().replace(/_/g, ' ');
  return prepared[0].toUpperCase() + prepared.slice(1);
};

const toPromotionType = (offerType: unknown): OfferPromotionType => {
  if (offerType === 'discount') {
    return 'discount';
  }
  if (offerType === 'points_multiplier') {
    return 'points';
  }
  if (offerType === 'gift') {
    return 'gift';
  }
  return 'personal';
};

const toBadge = (type: OfferPromotionType): string => {
  if (type === 'discount') {
    return 'Скидка';
  }
  if (type === 'points') {
    return 'Баллы';
  }
  if (type === 'gift') {
    return 'Подарок';
  }
  return 'Для вас';
};

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const buildTitle = (
  type: OfferPromotionType,
  offerName: string | undefined,
  offerValue: number | undefined,
  target: Record<string, unknown> | null,
): string => {
  const categoryLabel = formatLabel(target?.category);
  const productTypeLabel = formatLabel(target?.product_type);

  if (type === 'discount' && offerValue !== undefined) {
    const discount = formatValue(offerValue);
    if (productTypeLabel) {
      return `Скидка ${discount}% на ${productTypeLabel.toLowerCase()}`;
    }
    if (categoryLabel) {
      return `Скидка ${discount}% на ${categoryLabel.toLowerCase()}`;
    }
    return `Скидка ${discount}% для вас`;
  }

  if (type === 'points' && offerValue !== undefined) {
    return `x${formatValue(offerValue)} баллы на покупку`;
  }

  if (type === 'gift') {
    return offerName ?? 'Подарок к заказу';
  }

  return offerName ?? 'Персональное предложение';
};

const buildDescription = (
  type: OfferPromotionType,
  target: Record<string, unknown> | null,
  reason: Record<string, unknown> | null,
  offerValue: number | undefined,
): string => {
  const scope = firstString(target?.scope);
  const categoryLabel = formatLabel(target?.category);
  const productTypeLabel = formatLabel(target?.product_type);
  const minBasketAmount = toNumber(
    target?.min_basket_amount,
  );
  const roadmapReason = isRecord(reason?.roadmap) ? reason.roadmap : null;

  if (scope === 'cart' && minBasketAmount !== undefined) {
    return `Применяется автоматически к корзине от ${minBasketAmount.toLocaleString('ru')} ₸.`;
  }

  if (scope === 'category' && categoryLabel) {
    return `Предложение действует на категорию «${categoryLabel}».`;
  }

  if (scope === 'product_type' && productTypeLabel) {
    return `Предложение действует на товары типа «${productTypeLabel}».`;
  }

  if (scope === 'product_id' && productTypeLabel) {
    return `Предложение привязано к рекомендованному товару типа «${productTypeLabel}».`;
  }

  if (roadmapReason) {
    return 'Оффер связан с вашим текущим шагом roadmap и подобран под следующий шаг покупки.';
  }

  if (type === 'points' && offerValue !== undefined) {
    return `Баллы будут начислены с повышенным коэффициентом x${formatValue(offerValue)}.`;
  }

  if (type === 'gift') {
    return 'Подарок добавится автоматически при выполнении условий предложения.';
  }

  return 'Персональное предложение доступно для вас прямо сейчас.';
};

export const mapOfferPayloadToPromotion = (payload: unknown): OfferPromotionCard | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const assignmentId = toNumber(payload.assignment_id);
  const offer = isRecord(payload.offer) ? payload.offer : null;
  if (!offer || assignmentId === undefined) {
    return null;
  }

  const reason = isRecord(payload.reason) ? payload.reason : null;
  const target = isRecord(payload.target) ? payload.target : null;
  const type = toPromotionType(offer.type);
  const offerValue = toNumber(offer.value);
  const offerName = firstString(offer.name);

  return {
    id: `offer-${Math.round(assignmentId)}`,
    assignmentId: Math.round(assignmentId),
    title: buildTitle(type, offerName, offerValue, target),
    description: buildDescription(type, target, reason, offerValue),
    badge: toBadge(type),
    type,
    buttonText: 'Подробнее',
  };
};

export const mapOfferPayloadsToPromotions = (payload: unknown): OfferPromotionCard[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => mapOfferPayloadToPromotion(item))
      .filter((item): item is OfferPromotionCard => Boolean(item));
  }

  const single = mapOfferPayloadToPromotion(payload);
  return single ? [single] : [];
};
